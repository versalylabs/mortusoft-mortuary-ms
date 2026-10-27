import { createServer } from "node:http";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash, randomBytes, randomUUID, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import QRCode from "qrcode";

const projectDir = fileURLToPath(new URL(".", import.meta.url));
const publicDir = resolve(projectDir, "preview");
const dataDir = resolve(projectDir, "data");
const dataFile = resolve(dataDir, "mortusoft-local.json");
const documentsDir = resolve(dataDir, "documents");
const publicAppUrl = (process.env.MORTUSOFT_PUBLIC_URL || "http://localhost:3000").replace(/\/$/, "");
const types = { ".html":"text/html; charset=utf-8", ".js":"text/javascript; charset=utf-8", ".css":"text/css; charset=utf-8", ".svg":"image/svg+xml" };
const scrypt = promisify(scryptCallback);
let store = { users: [], invitations: [], facility: null, sessions: [] };
const attempts = new Map();
const permissionRoles = Object.freeze({
  "facility.manage": ["Facility administrator", "Super administrator"],
  "team.manage": ["Facility administrator", "Super administrator"],
  "audit.read": ["Facility administrator", "Super administrator", "Auditor / read-only"],
  "case.write": ["Facility administrator", "Super administrator", "Mortuary manager", "Mortuary attendant", "Embalming / preservation staff", "Reception / front desk", "Funeral coordinator"],
  "case.close": ["Facility administrator", "Super administrator", "Mortuary manager"],
  "billing.write": ["Facility administrator", "Super administrator", "Mortuary manager", "Finance officer"],
  "release.manage": ["Facility administrator", "Super administrator", "Mortuary manager"],
  "communications.manage": ["Facility administrator", "Super administrator", "Mortuary manager", "Reception / front desk", "Funeral coordinator"],
  "storage.manage": ["Facility administrator", "Super administrator"]
});
const releaseCheckDefinitions = [
  { key: "identityVerified", label: "Identity verified", canWaive: false },
  { key: "documentsComplete", label: "Required supporting documents complete", canWaive: false },
  { key: "authorityClearance", label: "Authority / postmortem clearance", canWaive: true },
  { key: "familyAuthorization", label: "Family authorization", canWaive: true },
  { key: "financialClearance", label: "Financial requirements checked per facility policy", canWaive: true },
  { key: "recipientVerified", label: "Recipient identity verified", canWaive: false },
  { key: "releaseFormComplete", label: "Release form completed and attached", canWaive: false },
  { key: "finalAuthorization", label: "Final release authorization", canWaive: false },
];

await mkdir(dataDir, { recursive: true });
await mkdir(documentsDir, { recursive: true });
try { store = { ...store, ...JSON.parse(await readFile(dataFile, "utf8")) }; }
catch (error) { if (error.code !== "ENOENT") throw error; }
store.cases ||= [];
store.audit ||= [];
store.storageRooms ||= [];
store.movements ||= [];
store.documents ||= [];
store.invoices ||= [];
store.payments ||= [];
store.messages ||= [];

async function persist() {
  const tempFile = `${dataFile}.${randomUUID()}.tmp`;
  await writeFile(tempFile, JSON.stringify(store, null, 2), { encoding: "utf8", mode: 0o600 });
  await rename(tempFile, dataFile);
}
function reply(response, status, body, extra = {}) {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...extra });
  response.end(JSON.stringify(body));
}
function hash(value) { return createHash("sha256").update(value).digest("hex"); }
function cookieValue(request, key) {
  return (request.headers.cookie || "").split(";").map(s => s.trim()).find(s => s.startsWith(`${key}=`))?.slice(key.length + 1) || "";
}
function safeUser(user) { return { id: user.id, name: user.name, email: user.email, role: user.role, status: user.status }; }
function getReleaseChecks(record) {
  return releaseCheckDefinitions.map(definition => ({ ...definition, ...(record.releaseChecks?.[definition.key] || { state: "Pending", reason: "" }) }));
}
function getReleaseBlockers(record) {
  const blockers = getReleaseChecks(record).filter(check => check.state !== "Complete" && !(check.canWaive && check.state === "Not applicable" && check.reason?.trim().length >= 4)).map(check => check.label);
  if (!store.documents.some(document => document.caseId === record.id && document.category === "Release form")) blockers.push("Attach a document categorized as Release form");
  return blockers;
}
async function readJson(request, maxBytes = 32_768) {
  let data = "";
  for await (const chunk of request) {
    data += chunk;
    if (data.length > maxBytes) throw Object.assign(new Error("Request is too large."), { status: 413 });
  }
  try { return JSON.parse(data || "{}"); }
  catch { throw Object.assign(new Error("Request body must be valid JSON."), { status: 400 }); }
}
async function currentUser(request) {
  const raw = cookieValue(request, "mortusoft_session");
  if (!raw) return null;
  const session = store.sessions.find(s => s.tokenHash === hash(raw) && s.expiresAt > Date.now());
  if (!session) return null;
  return store.users.find(user => user.id === session.userId && user.status === "Active") || null;
}
function hasPermission(user, permission) { return Boolean(user && permissionRoles[permission]?.includes(user.role)); }
function requirePermission(response, user, permission) {
  if (!user) { reply(response, 401, { error: "Sign in required." }); return false; }
  if (!hasPermission(user, permission)) { reply(response, 403, { error: `Your role does not allow ${permission.replaceAll(".", " ")}.` }); return false; }
  return true;
}
function adminOnly(response, user) { return requirePermission(response, user, "facility.manage"); }
function secureCookie(request, raw, maxAge) {
  const secure = request.headers["x-forwarded-proto"] === "https" ? "; Secure" : "";
  return `mortusoft_session=${raw}; HttpOnly; Path=/; SameSite=Strict; Max-Age=${maxAge}${secure}`;
}
async function api(request, response, url) {
  if (request.method !== "GET" && request.headers.origin) {
    const expected = `http://${request.headers.host}`;
    if (request.headers.origin !== expected && request.headers.origin !== `https://${request.headers.host}`) {
      reply(response, 403, { error: "Cross-origin request rejected." }); return true;
    }
  }
  const path = url.pathname;
  if (path === "/api/auth/register" && request.method === "POST") {
    if (store.users.length) { reply(response, 409, { error: "A facility administrator account already exists." }); return true; }
    const input = await readJson(request);
    const name = String(input.name || "").trim().slice(0, 100);
    const email = String(input.email || "").trim().toLowerCase();
    const password = String(input.password || "");
    const facilityName = String(input.facilityName || "").trim().slice(0, 120);
    const type = String(input.type || "Private mortuary").trim().slice(0, 80);
    const county = String(input.county || "Nairobi").trim().slice(0, 80);
    if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 12 || !facilityName) {
      reply(response, 400, { error: "Enter your name, a valid email, a facility name, and a password of at least 12 characters." }); return true;
    }
    const salt = randomBytes(16).toString("base64url");
    const derived = await scrypt(password, salt, 64, { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 });
    const user = { id: randomUUID(), name, email, role: "Facility administrator", status: "Active", passwordHash: `${salt}.${Buffer.from(derived).toString("base64url")}`, createdAt: new Date().toISOString() };
    store.users.push(user);
    store.facility = { id: randomUUID(), name: facilityName, type, county, email, phone: "", timezone: "Africa/Nairobi", prefix: "MRT", createdAt: new Date().toISOString() };
    const token = randomBytes(32).toString("base64url");
    store.sessions.push({ tokenHash: hash(token), userId: user.id, expiresAt: Date.now() + 12 * 60 * 60 * 1000 });
    await persist();
    reply(response, 201, { user: safeUser(user), facility: store.facility }, { "Set-Cookie": secureCookie(request, token, 12 * 60 * 60) }); return true;
  }
  const invitationLookup = path.match(/^\/api\/invitations\/([A-Za-z0-9_-]+)$/);
  if (invitationLookup && request.method === "GET") {
    const invitation = store.invitations.find(item => item.tokenHash === hash(invitationLookup[1]) && item.expiresAt > Date.now());
    if (!invitation) reply(response, 404, { error: "This invitation is invalid or has expired." });
    else reply(response, 200, { email: invitation.email, role: invitation.role, facilityName: store.facility?.name });
    return true;
  }
  if (path === "/api/auth/accept-invite" && request.method === "POST") {
    const input = await readJson(request);
    const token = String(input.token || "");
    const invitationIndex = store.invitations.findIndex(item => item.tokenHash === hash(token) && item.expiresAt > Date.now());
    if (invitationIndex < 0) { reply(response, 400, { error: "This invitation is invalid or has expired." }); return true; }
    const invitation = store.invitations[invitationIndex];
    const name = String(input.name || "").trim().slice(0, 100);
    const password = String(input.password || "");
    if (name.length < 2 || password.length < 12) { reply(response, 400, { error: "Enter your name and a password of at least 12 characters." }); return true; }
    const salt = randomBytes(16).toString("base64url");
    const derived = await scrypt(password, salt, 64, { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 });
    const user = { id: randomUUID(), name, email: invitation.email, role: invitation.role, status: "Active", passwordHash: `${salt}.${Buffer.from(derived).toString("base64url")}`, createdAt: new Date().toISOString() };
    store.users.push(user); store.invitations.splice(invitationIndex, 1);
    const sessionToken = randomBytes(32).toString("base64url");
    store.sessions.push({ tokenHash: hash(sessionToken), userId: user.id, expiresAt: Date.now() + 12 * 60 * 60 * 1000 });
    await persist();
    reply(response, 201, { user: safeUser(user), facility: store.facility }, { "Set-Cookie": secureCookie(request, sessionToken, 12 * 60 * 60) }); return true;
  }
  if (path === "/api/auth/login" && request.method === "POST") {
    const input = await readJson(request);
    const email = String(input.email || "").trim().toLowerCase();
    const password = String(input.password || "");
    const ip = request.socket.remoteAddress || "local";
    const key = `${ip}:${email}`;
    const record = attempts.get(key) || { count: 0, until: 0 };
    if (record.until > Date.now()) { reply(response, 429, { error: "Too many sign-in attempts. Try again in 15 minutes." }); return true; }
    const user = store.users.find(x => x.email === email && x.status === "Active");
    let valid = false;
    if (user) {
      const [salt, expected] = user.passwordHash.split(".");
      const actual = Buffer.from(await scrypt(password, salt, 64, { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 }));
      const expectedBytes = Buffer.from(expected, "base64url");
      valid = actual.length === expectedBytes.length && timingSafeEqual(actual, expectedBytes);
    }
    if (!valid) {
      record.count++;
      if (record.count >= 5) { record.count = 0; record.until = Date.now() + 15 * 60 * 1000; }
      attempts.set(key, record);
      reply(response, 401, { error: "Email or password is incorrect." }); return true;
    }
    attempts.delete(key);
    const token = randomBytes(32).toString("base64url");
    store.sessions = store.sessions.filter(s => s.expiresAt > Date.now());
    store.sessions.push({ tokenHash: hash(token), userId: user.id, expiresAt: Date.now() + 12 * 60 * 60 * 1000 });
    await persist();
    reply(response, 200, { user: safeUser(user), facility: store.facility }, { "Set-Cookie": secureCookie(request, token, 12 * 60 * 60) }); return true;
  }
  if (path === "/api/auth/logout" && request.method === "POST") {
    const token = cookieValue(request, "mortusoft_session");
    store.sessions = store.sessions.filter(s => s.tokenHash !== hash(token));
    await persist();
    reply(response, 200, { ok: true }, { "Set-Cookie": secureCookie(request, "", 0) }); return true;
  }
  const user = await currentUser(request);
  if (path === "/api/audit" && request.method === "GET") {
    if (!requirePermission(response, user, "audit.read")) return true;
    const from = url.searchParams.get("from") || ""; const to = url.searchParams.get("to") || "";
    const query = (url.searchParams.get("q") || "").trim().toLowerCase().slice(0, 120);
    const action = (url.searchParams.get("action") || "").trim().slice(0, 100);
    if ((from && !/^\d{4}-\d{2}-\d{2}$/.test(from)) || (to && !/^\d{4}-\d{2}-\d{2}$/.test(to)) || (from && to && from > to)) { reply(response, 400, { error: "Choose a valid audit date range." }); return true; }
    const filtered = store.audit.filter(event => (!from || event.at?.slice(0, 10) >= from) && (!to || event.at?.slice(0, 10) <= to) && (!action || event.action === action) && (!query || `${event.action} ${event.caseNumber || ""} ${event.detail || ""} ${store.users.find(member => member.id === event.by)?.name || ""}`.toLowerCase().includes(query)));
    const limit = Math.max(1, Math.min(1000, Number(url.searchParams.get("limit")) || 250));
    const events = filtered.slice(-limit).reverse().map(event => ({ id: event.id, at: event.at, action: event.action, caseNumber: event.caseNumber || "", detail: event.detail || "", actor: store.users.find(member => member.id === event.by)?.name || "Former team member" }));
    if (url.searchParams.get("format") === "csv") {
      const cell = value => `"${String(value ?? "").replaceAll('"', '""')}"`;
      const csv = [ ["Timestamp", "Action", "Case", "Actor", "Detail"], ...events.map(event => [event.at, event.action, event.caseNumber, event.actor, event.detail]) ].map(row => row.map(cell).join(",")).join("\r\n");
      store.audit.push({ id: randomUUID(), action: "audit.csv_exported", by: user.id, at: new Date().toISOString(), detail: `Filtered audit CSV exported (${events.length} events)` });
      await persist();
      response.writeHead(200, { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="mortusoft-audit.csv"', "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" }); response.end(csv); return true;
    }
    reply(response, 200, { events, total: filtered.length, limit }); return true;
  }
  if (path === "/api/permissions" && request.method === "GET") {
    if (!user) { reply(response, 401, { error: "Sign in required." }); return true; }
    reply(response, 200, { permissions: permissionRoles }); return true;
  }
  const caseQrRoute = path.match(/^\/api\/cases\/([0-9a-f-]+)\/qr\.svg$/i);
  if (caseQrRoute && request.method === "GET") {
    if (!user) { reply(response, 401, { error: "Sign in required." }); return true; }
    const record = store.cases.find(item => item.id === caseQrRoute[1]);
    if (!record) { reply(response, 404, { error: "Case not found." }); return true; }
    const svg = await QRCode.toString(`${publicAppUrl}/?case=${encodeURIComponent(record.id)}`, { type: "svg", errorCorrectionLevel: "M", margin: 1, width: 240, color: { dark: "#202927", light: "#ffffff" } });
    response.writeHead(200, { "Content-Type": "image/svg+xml; charset=utf-8", "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff", "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; sandbox" });
    response.end(svg); return true;
  }
  const caseLabelPrintRoute = path.match(/^\/api\/cases\/([0-9a-f-]+)\/label-print$/i);
  if (caseLabelPrintRoute && request.method === "POST") {
    if (!user) { reply(response, 401, { error: "Sign in required." }); return true; }
    if (!hasPermission(user, "case.write")) { reply(response, 403, { error: "Your role does not allow case label printing." }); return true; }
    const record = store.cases.find(item => item.id === caseLabelPrintRoute[1]);
    if (!record) { reply(response, 404, { error: "Case not found." }); return true; }
    const now = new Date().toISOString();
    record.history ||= []; record.history.push({ action: "Case identification label printed", at: now, by: user.id, detail: "Opaque QR identifier; no personal details encoded" });
    store.audit.push({ id: randomUUID(), action: "case.identification_label_printed", caseId: record.id, caseNumber: record.caseNumber, by: user.id, at: now });
    await persist(); reply(response, 200, { ok: true }); return true;
  }
  if (path === "/api/reports" && request.method === "GET") {
    if (!user) { reply(response, 401, { error: "Sign in required." }); return true; }
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;
    const from = url.searchParams.get("from") || new Date(Date.now() - 29 * 86400000).toISOString().slice(0, 10);
    const to = url.searchParams.get("to") || new Date().toISOString().slice(0, 10);
    const fromTime = Date.parse(`${from}T00:00:00Z`); const toTime = Date.parse(`${to}T00:00:00Z`);
    if (!datePattern.test(from) || !datePattern.test(to) || Number.isNaN(fromTime) || Number.isNaN(toTime) || from > to || (toTime - fromTime) / 86400000 > 366) { reply(response, 400, { error: "Choose a valid date range of up to 367 days." }); return true; }
    const inRange = value => Boolean(value && value.slice(0, 10) >= from && value.slice(0, 10) <= to);
    const cases = store.cases;
    const admissions = cases.filter(item => inRange(item.admissionAt));
    const releases = cases.filter(item => item.release && inRange(item.release.releasedAt));
    const movements = store.movements.filter(item => inRange(item.movedAt));
    const invoices = store.invoices;
    const periodInvoices = invoices.filter(item => inRange(item.createdAt));
    const payments = store.payments.filter(item => inRange(item.paidAt));
    const billed = periodInvoices.reduce((sum, item) => sum + Number(item.total || 0), 0);
    const collected = payments.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const totalOutstanding = invoices.reduce((sum, invoice) => sum + Math.max(0, Number(invoice.total || 0) - store.payments.filter(payment => payment.invoiceId === invoice.id).reduce((paid, payment) => paid + Number(payment.amount || 0), 0)), 0);
    const storageTotal = store.storageRooms.reduce((sum, room) => sum + room.slots.length, 0);
    const occupied = cases.filter(item => item.status === "Active" && item.storageSlotId).length;
    const days = new Map();
    const bump = (date, key) => { if (!inRange(date)) return; const day = date.slice(0, 10); const value = days.get(day) || { date: day, admissions: 0, releases: 0, movements: 0 }; value[key]++; days.set(day, value); };
    admissions.forEach(item => bump(item.admissionAt, "admissions")); releases.forEach(item => bump(item.release.releasedAt, "releases")); movements.forEach(item => bump(item.movedAt, "movements"));
    const categoryCounts = {};
    periodInvoices.flatMap(invoice => invoice.lines || []).forEach(line => { const label = String(line.description || "Other").trim().slice(0, 80) || "Other"; categoryCounts[label] = (categoryCounts[label] || 0) + Number(line.amount || 0); });
    reply(response, 200, { range: { from, to }, metrics: { totalCases: cases.length, activeCases: cases.filter(item => item.status === "Active").length, admissions: admissions.length, releases: releases.length, movements: movements.length, unassignedActive: cases.filter(item => item.status === "Active" && !item.storageSlotId).length, storageTotal, occupied, utilization: storageTotal ? Math.round(occupied / storageTotal * 100) : 0, billed, collected, totalOutstanding }, statuses: ["Active", "Released", "Closed"].map(status => ({ status, count: cases.filter(item => item.status === status).length })), daily: [...days.values()].sort((a, b) => a.date.localeCompare(b.date)), services: Object.entries(categoryCounts).map(([name, amount]) => ({ name, amount })).sort((a, b) => b.amount - a.amount).slice(0, 8) }); return true;
  }
  if (path === "/api/auth/session" && request.method === "GET") {
    if (!user) { reply(response, 200, { user: null, facility: null }); return true; }
    reply(response, 200, { user: safeUser(user), facility: store.facility }); return true;
  }
  if (path === "/api/facility" && request.method === "GET") {
    if (!user) reply(response, 401, { error: "Sign in required." });
    else reply(response, 200, { facility: store.facility });
    return true;
  }
  if (path === "/api/facility" && request.method === "PUT") {
    if (!adminOnly(response, user)) return true;
    const input = await readJson(request);
    const fields = ["name", "type", "county", "email", "phone", "timezone", "prefix"];
    for (const field of fields) if (typeof input[field] === "string") store.facility[field] = input[field].trim().slice(0, field === "name" ? 120 : 150);
    if (!store.facility.name || !/^[A-Z0-9]{1,6}$/.test(store.facility.prefix)) { reply(response, 400, { error: "Facility name and a 1–6 character uppercase case prefix are required." }); return true; }
    await persist(); reply(response, 200, { facility: store.facility }); return true;
  }
  if (path === "/api/cases" && request.method === "GET") {
    if (!user) { reply(response, 401, { error: "Sign in required." }); return true; }
    const query = (url.searchParams.get("q") || "").trim().toLowerCase();
    const status = url.searchParams.get("status") || "";
    const cases = [...store.cases].filter(item => (!status || item.status === status) && (!query || [item.caseNumber, item.personName, item.nextOfKin?.name, item.nextOfKin?.phone, item.source].some(value => String(value || "").toLowerCase().includes(query)))).sort((a,b) => b.createdAt.localeCompare(a.createdAt));
    reply(response, 200, { cases }); return true;
  }
  if (path === "/api/cases" && request.method === "POST") {
    if (!requirePermission(response, user, "case.write")) return true;
    const input = await readJson(request);
    const personName = String(input.personName || "").trim().slice(0, 160);
    const isUnknown = input.identificationStatus === "Unidentified";
    const kinName = String(input.nextOfKin?.name || "").trim().slice(0, 120);
    const kinPhone = String(input.nextOfKin?.phone || "").trim().slice(0, 40);
    const admissionAt = String(input.admissionAt || "");
    if ((!personName && !isUnknown) || !admissionAt || Number.isNaN(Date.parse(admissionAt)) || (!isUnknown && !kinName) || (kinPhone && !/^[+0-9() -]{7,40}$/.test(kinPhone))) {
      reply(response, 400, { error: "Enter the deceased person's name (or mark Unidentified), admission date and time, and next-of-kin name for identified cases." }); return true;
    }
    const prefix = store.facility?.prefix || "MRT";
    const year = new Date(admissionAt).getFullYear();
    const sequence = store.cases.filter(item => item.caseNumber.startsWith(`${prefix}-${year}-`)).length + 1;
    const now = new Date().toISOString();
    const record = { id: randomUUID(), caseNumber: `${prefix}-${year}-${String(sequence).padStart(5,"0")}`, personName: personName || "Unidentified person", identificationStatus: isUnknown ? "Unidentified" : "Identified", sex: String(input.sex || "Not recorded"), estimatedAge: String(input.estimatedAge || "").trim().slice(0,30), nextOfKin: { name: kinName, relationship: String(input.nextOfKin?.relationship || "").trim().slice(0,80), phone: kinPhone }, source: String(input.source || "").trim().slice(0,160), admissionAt: new Date(admissionAt).toISOString(), status: "Active", notes: String(input.notes || "").trim().slice(0,2000), createdAt: now, createdBy: user.id, updatedAt: now, history: [{ action: "Case admitted", at: now, by: user.id, detail: "Admission record created" }] };
    store.cases.push(record); store.audit.push({ id: randomUUID(), action: "case.admitted", caseId: record.id, caseNumber: record.caseNumber, by: user.id, at: now });
    await persist(); reply(response, 201, { case: record }); return true;
  }
  const caseRoute = path.match(/^\/api\/cases\/([0-9a-f-]+)$/i);
  if (caseRoute && request.method === "GET") {
    if (!user) { reply(response, 401, { error: "Sign in required." }); return true; }
    const record = store.cases.find(item => item.id === caseRoute[1]);
    if (!record) reply(response, 404, { error: "Case not found." }); else reply(response, 200, { case: record });
    return true;
  }
  const caseCloseRoute = path.match(/^\/api\/cases\/([0-9a-f-]+)\/close$/i);
  if (caseCloseRoute && request.method === "POST") {
    if (!requirePermission(response, user, "case.close")) return true;
    const record = store.cases.find(item => item.id === caseCloseRoute[1]);
    if (!record || record.status !== "Released" || !record.release) { reply(response, 409, { error: "Only a released case with a completed handover can be closed." }); return true; }
    const input = await readJson(request); const reason = String(input.reason || "").trim().slice(0, 300);
    if (reason.length < 4) { reply(response, 400, { error: "Enter a closure reason of at least 4 characters." }); return true; }
    const now = new Date().toISOString();
    record.status = "Closed"; record.closedAt = now; record.closedBy = { id: user.id, name: user.name, role: user.role }; record.closureReason = reason; record.updatedAt = now;
    record.history ||= []; record.history.push({ action: "Case closed", at: now, by: user.id, detail: reason });
    store.audit.push({ id: randomUUID(), action: "case.closed", caseId: record.id, caseNumber: record.caseNumber, by: user.id, at: now, detail: reason });
    await persist(); reply(response, 200, { case: record }); return true;
  }
  const caseDocumentsRoute = path.match(/^\/api\/cases\/([0-9a-f-]+)\/documents$/i);
  if (caseDocumentsRoute && request.method === "GET") {
    if (!user) { reply(response, 401, { error: "Sign in required." }); return true; }
    const record = store.cases.find(item => item.id === caseDocumentsRoute[1]);
    if (!record) { reply(response, 404, { error: "Case not found." }); return true; }
    const documents = store.documents.filter(item => item.caseId === record.id).sort((a,b) => b.uploadedAt.localeCompare(a.uploadedAt)).map(({ id, name, category, mimeType, size, uploadedAt, uploadedBy }) => ({ id, name, category, mimeType, size, uploadedAt, uploadedBy }));
    reply(response, 200, { documents }); return true;
  }
  if (caseDocumentsRoute && request.method === "POST") {
    if (!requirePermission(response, user, "case.write")) return true;
    const record = store.cases.find(item => item.id === caseDocumentsRoute[1]);
    if (!record) { reply(response, 404, { error: "Case not found." }); return true; }
    const input = await readJson(request, 7_100_000);
    const name = String(input.name || "").replace(/[\u0000-\u001f\\/:*?"<>|]/g, " ").trim().slice(0, 120);
    const category = String(input.category || "");
    const allowedCategories = ["Admission form", "Identity document", "Authority / police", "Family authorization", "Medical / postmortem", "Release form", "Other"];
    const encoded = String(input.data || "");
    if (!name || !allowedCategories.includes(category) || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(encoded)) { reply(response, 400, { error: "Choose a document category and provide a valid file." }); return true; }
    const bytes = Buffer.from(encoded, "base64");
    if (!bytes.length || bytes.length > 5 * 1024 * 1024 || bytes.toString("base64") !== encoded) { reply(response, 413, { error: "Documents must be smaller than 5 MB." }); return true; }
    let mimeType = "", extension = "";
    if (bytes.subarray(0, 5).toString() === "%PDF-") { mimeType = "application/pdf"; extension = "pdf"; }
    else if (bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) { mimeType = "image/png"; extension = "png"; }
    else if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) { mimeType = "image/jpeg"; extension = "jpg"; }
    if (!mimeType || (input.mimeType && input.mimeType !== mimeType)) { reply(response, 415, { error: "Only PDF, PNG, and JPEG files are accepted. Check the file contents and try again." }); return true; }
    const id = randomUUID();
    const storedFile = `${id}.${extension}`;
    const filePath = resolve(documentsDir, storedFile);
    await writeFile(filePath, bytes, { flag: "wx", mode: 0o600 });
    const now = new Date().toISOString();
    const document = { id, caseId: record.id, caseNumber: record.caseNumber, name, category, mimeType, size: bytes.length, uploadedAt: now, uploadedBy: { id: user.id, name: user.name, role: user.role }, storedFile };
    store.documents.push(document);
    record.history ||= []; record.history.push({ action: "Document attached", at: now, by: user.id, detail: `${category}: ${name}` });
    store.audit.push({ id: randomUUID(), action: "case.document_attached", caseId: record.id, caseNumber: record.caseNumber, by: user.id, at: now, detail: category });
    await persist();
    const { storedFile: _storedFile, ...safeDocument } = document;
    reply(response, 201, { document: safeDocument }); return true;
  }
  const documentRoute = path.match(/^\/api\/documents\/([0-9a-f-]+)$/i);
  if (documentRoute && request.method === "GET") {
    if (!user) { reply(response, 401, { error: "Sign in required." }); return true; }
    const document = store.documents.find(item => item.id === documentRoute[1]);
    if (!document) { reply(response, 404, { error: "Document not found." }); return true; }
    try {
      const bytes = await readFile(resolve(documentsDir, document.storedFile));
      response.writeHead(200, { "Content-Type": document.mimeType, "Content-Length": bytes.length, "Content-Disposition": `inline; filename="case-document.${document.mimeType === "application/pdf" ? "pdf" : document.mimeType === "image/png" ? "png" : "jpg"}"`, "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff", "Content-Security-Policy": "default-src 'none'; sandbox" });
      response.end(bytes);
    } catch { reply(response, 404, { error: "The stored document file is unavailable." }); }
    return true;
  }
  const caseBillingRoute = path.match(/^\/api\/cases\/([0-9a-f-]+)\/billing$/i);
  if (caseBillingRoute && request.method === "GET") {
    if (!user) { reply(response, 401, { error: "Sign in required." }); return true; }
    const record = store.cases.find(item => item.id === caseBillingRoute[1]);
    if (!record) { reply(response, 404, { error: "Case not found." }); return true; }
    const invoices = store.invoices.filter(item => item.caseId === record.id).sort((a,b) => b.createdAt.localeCompare(a.createdAt)).map(invoice => {
      const payments = store.payments.filter(payment => payment.invoiceId === invoice.id).sort((a,b) => a.paidAt.localeCompare(b.paidAt));
      const paid = payments.reduce((sum, payment) => sum + payment.amount, 0);
      return { ...invoice, payments, paid, balance: invoice.total - paid, status: paid >= invoice.total ? "Paid" : paid > 0 ? "Partially paid" : "Unpaid" };
    });
    reply(response, 200, { invoices, summary: { billed: invoices.reduce((sum, invoice) => sum + invoice.total, 0), paid: invoices.reduce((sum, invoice) => sum + invoice.paid, 0), balance: invoices.reduce((sum, invoice) => sum + invoice.balance, 0) } }); return true;
  }
  if (caseBillingRoute && request.method === "POST") {
    if (!user) { reply(response, 401, { error: "Sign in required." }); return true; }
    if (!requirePermission(response, user, "billing.write")) return true;
    const record = store.cases.find(item => item.id === caseBillingRoute[1]);
    if (!record) { reply(response, 404, { error: "Case not found." }); return true; }
    const input = await readJson(request);
    const lines = Array.isArray(input.lines) ? input.lines.slice(0, 30).map(line => ({ description: String(line.description || "").trim().slice(0, 120), amount: Number(line.amount) })) : [];
    const total = lines.reduce((sum, line) => sum + line.amount, 0);
    if (!lines.length || lines.some(line => !line.description || !Number.isSafeInteger(line.amount) || line.amount < 1 || line.amount > 100_000_000) || !Number.isSafeInteger(total) || total > 250_000_000) { reply(response, 400, { error: "Add one or more services with a description and whole KSh amount. Invoice total must not exceed KSh 250,000,000." }); return true; }
    const year = new Date().getFullYear();
    const sequence = store.invoices.filter(invoice => invoice.invoiceNumber.startsWith(`INV-${year}-`)).length + 1;
    const now = new Date().toISOString();
    const invoice = { id: randomUUID(), invoiceNumber: `INV-${year}-${String(sequence).padStart(5, "0")}`, caseId: record.id, caseNumber: record.caseNumber, lines, total, currency: "KES", createdAt: now, createdBy: { id: user.id, name: user.name, role: user.role } };
    store.invoices.push(invoice);
    record.history ||= []; record.history.push({ action: "Invoice created", at: now, by: user.id, detail: `${invoice.invoiceNumber} · KSh ${total.toLocaleString("en-KE")}` });
    store.audit.push({ id: randomUUID(), action: "billing.invoice_created", caseId: record.id, caseNumber: record.caseNumber, by: user.id, at: now, detail: invoice.invoiceNumber });
    await persist(); reply(response, 201, { invoice: { ...invoice, payments: [], paid: 0, balance: total, status: "Unpaid" } }); return true;
  }
  const invoicePaymentsRoute = path.match(/^\/api\/invoices\/([0-9a-f-]+)\/payments$/i);
  if (invoicePaymentsRoute && request.method === "POST") {
    if (!user) { reply(response, 401, { error: "Sign in required." }); return true; }
    if (!requirePermission(response, user, "billing.write")) return true;
    const invoice = store.invoices.find(item => item.id === invoicePaymentsRoute[1]);
    if (!invoice) { reply(response, 404, { error: "Invoice not found." }); return true; }
    const input = await readJson(request);
    const amount = Number(input.amount);
    const method = String(input.method || "");
    const allowedMethods = ["Cash", "M-Pesa", "Bank transfer", "Card", "Other"];
    const reference = String(input.reference || "").trim().slice(0, 120);
    const paid = store.payments.filter(payment => payment.invoiceId === invoice.id).reduce((sum, payment) => sum + payment.amount, 0);
    const balance = invoice.total - paid;
    if (!Number.isSafeInteger(amount) || amount < 1 || amount > balance || !allowedMethods.includes(method)) { reply(response, 400, { error: `Enter a whole KSh amount between 1 and the outstanding balance of KSh ${balance.toLocaleString("en-KE")}, and select a payment method.` }); return true; }
    if (["M-Pesa", "Bank transfer"].includes(method) && reference.length < 3) { reply(response, 400, { error: "Enter the transaction reference for M-Pesa or bank payments." }); return true; }
    const now = new Date().toISOString();
    const payment = { id: randomUUID(), invoiceId: invoice.id, invoiceNumber: invoice.invoiceNumber, caseId: invoice.caseId, caseNumber: invoice.caseNumber, amount, currency: "KES", method, reference, paidAt: now, recordedBy: { id: user.id, name: user.name, role: user.role } };
    store.payments.push(payment);
    const record = store.cases.find(item => item.id === invoice.caseId);
    record.history ||= []; record.history.push({ action: "Payment recorded", at: now, by: user.id, detail: `KSh ${amount.toLocaleString("en-KE")} · ${method}${reference ? ` · ${reference}` : ""}` });
    store.audit.push({ id: randomUUID(), action: "billing.payment_recorded", caseId: invoice.caseId, caseNumber: invoice.caseNumber, by: user.id, at: now, detail: invoice.invoiceNumber });
    await persist(); reply(response, 201, { payment, balance: balance - amount }); return true;
  }
  const caseReleaseRoute = path.match(/^\/api\/cases\/([0-9a-f-]+)\/release-clearance$/i);
  if (caseReleaseRoute && request.method === "GET") {
    if (!user) { reply(response, 401, { error: "Sign in required." }); return true; }
    const record = store.cases.find(item => item.id === caseReleaseRoute[1]);
    if (!record) { reply(response, 404, { error: "Case not found." }); return true; }
    reply(response, 200, { checks: getReleaseChecks(record), blockers: getReleaseBlockers(record), release: record.release || null, canAuthorize: hasPermission(user, "release.manage") }); return true;
  }
  if (caseReleaseRoute && request.method === "PUT") {
    if (!user) { reply(response, 401, { error: "Sign in required." }); return true; }
    if (!requirePermission(response, user, "release.manage")) return true;
    const record = store.cases.find(item => item.id === caseReleaseRoute[1]);
    if (!record || record.status !== "Active") { reply(response, 404, { error: "Active case not found." }); return true; }
    const input = await readJson(request);
    if (!input.checks || typeof input.checks !== "object" || Array.isArray(input.checks)) { reply(response, 400, { error: "Provide release clearance checklist states." }); return true; }
    const current = Object.fromEntries(getReleaseChecks(record).map(check => [check.key, check]));
    const now = new Date().toISOString();
    for (const [key, value] of Object.entries(input.checks)) {
      const definition = releaseCheckDefinitions.find(check => check.key === key);
      if (!definition || !value || !["Pending", "Complete", "Not applicable"].includes(value.state) || (value.state === "Not applicable" && (!definition.canWaive || String(value.reason || "").trim().length < 4))) {
        reply(response, 400, { error: "A checklist item or not-applicable reason is invalid." }); return true;
      }
      current[key] = { ...definition, state: value.state, reason: String(value.reason || "").trim().slice(0, 300), updatedAt: now, updatedBy: { id: user.id, name: user.name, role: user.role } };
    }
    record.releaseChecks = Object.fromEntries(Object.entries(current).map(([key, check]) => [key, { state: check.state, reason: check.reason || "", updatedAt: check.updatedAt || null, updatedBy: check.updatedBy || null }]));
    record.updatedAt = now;
    record.history ||= []; record.history.push({ action: "Release clearance updated", at: now, by: user.id, detail: "Checklist reviewed by facility manager" });
    store.audit.push({ id: randomUUID(), action: "case.release_clearance_updated", caseId: record.id, caseNumber: record.caseNumber, by: user.id, at: now });
    await persist(); reply(response, 200, { checks: getReleaseChecks(record), blockers: getReleaseBlockers(record) }); return true;
  }
  const caseReleaseAuthorizeRoute = path.match(/^\/api\/cases\/([0-9a-f-]+)\/release$/i);
  if (caseReleaseAuthorizeRoute && request.method === "POST") {
    if (!user) { reply(response, 401, { error: "Sign in required." }); return true; }
    if (!requirePermission(response, user, "release.manage")) return true;
    const record = store.cases.find(item => item.id === caseReleaseAuthorizeRoute[1]);
    if (!record || record.status !== "Active") { reply(response, 409, { error: "Only an active case can be released." }); return true; }
    const input = await readJson(request);
    const recipientName = String(input.recipientName || "").trim().slice(0, 120);
    const relationship = String(input.relationship || "").trim().slice(0, 80);
    const phone = String(input.phone || "").trim().slice(0, 40);
    if (recipientName.length < 2 || relationship.length < 2 || !/^[+0-9() -]{7,40}$/.test(phone) || phone.replace(/\D/g, "").length < 7) { reply(response, 400, { error: "Enter the verified recipient's name, relationship, and a valid contact number." }); return true; }
    const blockers = getReleaseBlockers(record);
    if (blockers.length) { reply(response, 409, { error: "Release is blocked. Complete all required clearances and attach the release form.", blockers }); return true; }
    const now = new Date().toISOString();
    record.release = { recipientName, relationship, phone, releasedAt: now, authorizedBy: { id: user.id, name: user.name, role: user.role } };
    const from = record.currentLocation || "Facility";
    record.status = "Released"; record.storageSlotId = ""; record.currentLocation = "Released"; record.updatedAt = now;
    record.history ||= []; record.history.push({ action: "Case released", at: now, by: user.id, detail: "Handover completed to verified recipient" });
    store.movements.push({ id: randomUUID(), caseId: record.id, caseNumber: record.caseNumber, from, to: "Released to authorized recipient", reason: "Release clearance completed", movedAt: now, movedBy: { id: user.id, name: user.name, role: user.role } });
    store.audit.push({ id: randomUUID(), action: "case.released", caseId: record.id, caseNumber: record.caseNumber, by: user.id, at: now });
    await persist(); reply(response, 200, { case: record }); return true;
  }
  const caseCommunicationsRoute = path.match(/^\/api\/cases\/([0-9a-f-]+)\/communications$/i);
  if (caseCommunicationsRoute && request.method === "GET") {
    if (!user) { reply(response, 401, { error: "Sign in required." }); return true; }
    const record = store.cases.find(item => item.id === caseCommunicationsRoute[1]);
    if (!record) { reply(response, 404, { error: "Case not found." }); return true; }
    const preferences = record.communicationPreferences || { preferredChannel: "SMS", consentStatus: "Not recorded", consentChannel: "", consentMethod: "", consentAt: null, consentBy: null, consentNote: "" };
    reply(response, 200, { contact: { name: record.nextOfKin?.name || "", relationship: record.nextOfKin?.relationship || "", phone: record.nextOfKin?.phone || "", email: record.nextOfKin?.email || "", ...preferences, consentBy: preferences.consentBy?.name || "" }, messages: store.messages.filter(message => message.caseId === record.id).sort((a,b) => b.queuedAt.localeCompare(a.queuedAt)) }); return true;
  }
  const caseContactRoute = path.match(/^\/api\/cases\/([0-9a-f-]+)\/communications\/contact$/i);
  if (caseContactRoute && request.method === "PUT") {
    if (!user) { reply(response, 401, { error: "Sign in required." }); return true; }
    if (!requirePermission(response, user, "communications.manage")) return true;
    const record = store.cases.find(item => item.id === caseContactRoute[1]);
    if (!record) { reply(response, 404, { error: "Case not found." }); return true; }
    const input = await readJson(request);
    const email = String(input.email || "").trim().toLowerCase().slice(0, 180);
    const phone = String(input.phone || "").trim().slice(0, 40);
    const preferredChannel = String(input.preferredChannel || "");
    const channelChanged = Boolean(record.communicationPreferences?.preferredChannel && record.communicationPreferences.preferredChannel !== preferredChannel);
    const consentStatus = channelChanged ? "Not recorded" : String(input.consentStatus || "");
    const consentMethod = channelChanged ? "" : String(input.consentMethod || "");
    const consentNote = String(input.consentNote || "").trim().slice(0, 240);
    const allowedChannels = ["SMS", "Email"];
    const allowedConsent = ["Not recorded", "Granted", "Declined"];
    const allowedMethods = ["In person", "Phone", "Written authorization", "Other"];
    if ((email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) || (phone && (!/^[+0-9() -]{7,40}$/.test(phone) || phone.replace(/\D/g, "").length < 7)) || !allowedChannels.includes(preferredChannel) || !allowedConsent.includes(consentStatus)) { reply(response, 400, { error: "Enter a valid email or phone number, preferred channel, and consent status." }); return true; }
    if (consentStatus === "Granted" && (!allowedMethods.includes(consentMethod) || (preferredChannel === "SMS" && !phone) || (preferredChannel === "Email" && !email))) { reply(response, 400, { error: "Record how consent was obtained and provide a contact address for the chosen channel." }); return true; }
    const now = new Date().toISOString();
    record.nextOfKin ||= { name: "", relationship: "", phone: "" };
    record.nextOfKin.name = String(input.name || "").trim().slice(0, 120); record.nextOfKin.relationship = String(input.relationship || "").trim().slice(0, 80); record.nextOfKin.phone = phone; record.nextOfKin.email = email;
    record.communicationPreferences = { preferredChannel, consentStatus, consentChannel: consentStatus === "Granted" ? preferredChannel : "", consentMethod: consentStatus === "Granted" ? consentMethod : "", consentAt: consentStatus === "Not recorded" ? null : now, consentBy: consentStatus === "Not recorded" ? null : { id: user.id, name: user.name, role: user.role }, consentNote: consentStatus === "Granted" ? consentNote : "", updatedAt: now, updatedBy: { id: user.id, name: user.name, role: user.role } };
    record.updatedAt = now;
    record.history ||= []; record.history.push({ action: "Family contact preferences updated", at: now, by: user.id, detail: `Consent ${consentStatus.toLowerCase()} for ${preferredChannel}` });
    store.audit.push({ id: randomUUID(), action: "case.communication_preferences_updated", caseId: record.id, caseNumber: record.caseNumber, by: user.id, at: now, detail: consentStatus });
    await persist(); reply(response, 200, { ok: true }); return true;
  }
  const caseMessageRoute = path.match(/^\/api\/cases\/([0-9a-f-]+)\/communications\/messages$/i);
  if (caseMessageRoute && request.method === "POST") {
    if (!user) { reply(response, 401, { error: "Sign in required." }); return true; }
    if (!requirePermission(response, user, "communications.manage")) return true;
    const record = store.cases.find(item => item.id === caseMessageRoute[1]);
    if (!record) { reply(response, 404, { error: "Case not found." }); return true; }
    const preferences = record.communicationPreferences || {};
    if (preferences.consentStatus !== "Granted" || preferences.consentChannel !== preferences.preferredChannel) { reply(response, 403, { error: "Do not queue messages until current consent is recorded for the selected channel." }); return true; }
    const input = await readJson(request);
    const template = String(input.template || "");
    const templates = {
      "Facility update": "has an update regarding your facility reference.",
      "Document follow-up": "would like you to contact the facility about documents for your reference.",
      "Appointment coordination": "would like you to contact the facility to coordinate an appointment for your reference."
    };
    if (!Object.hasOwn(templates, template)) { reply(response, 400, { error: "Choose an available family communication template." }); return true; }
    const address = preferences.preferredChannel === "SMS" ? record.nextOfKin?.phone : record.nextOfKin?.email;
    if (!address) { reply(response, 400, { error: "A contact address is required for the consented channel." }); return true; }
    const recipient = record.nextOfKin?.name || "authorized family contact";
    const facilityName = store.facility?.name || "the facility";
    const facilityPhone = store.facility?.phone || "the facility office";
    const body = `Hello ${recipient}, ${facilityName} ${templates[template]} Reference ${record.caseNumber}. Please contact ${facilityPhone}.`;
    const now = new Date().toISOString();
    const messageRecord = { id: randomUUID(), caseId: record.id, caseNumber: record.caseNumber, recipientName: recipient, recipientAddress: address, channel: preferences.preferredChannel, template, body, status: "Queued locally · not sent", queuedAt: now, queuedBy: { id: user.id, name: user.name, role: user.role } };
    store.messages.push(messageRecord);
    record.history ||= []; record.history.push({ action: "Family message prepared", at: now, by: user.id, detail: `${preferences.preferredChannel} · ${template} · local draft only` });
    store.audit.push({ id: randomUUID(), action: "case.family_message_queued_locally", caseId: record.id, caseNumber: record.caseNumber, by: user.id, at: now, detail: preferences.preferredChannel });
    await persist(); reply(response, 201, { message: messageRecord }); return true;
  }
  if (path === "/api/storage" && request.method === "GET") {
    if (!user) { reply(response, 401, { error: "Sign in required." }); return true; }
    const occupiedIds = new Set(store.cases.filter(item => item.storageSlotId && item.status === "Active").map(item => item.storageSlotId));
    const rooms = store.storageRooms.map(room => ({ ...room, slots: room.slots.map(slot => ({ ...slot, status: occupiedIds.has(slot.id) ? "Occupied" : "Available", caseId: store.cases.find(item => item.storageSlotId === slot.id && item.status === "Active")?.id || null })) }));
    const slots = rooms.flatMap(room => room.slots);
    reply(response, 200, { rooms, occupancy: { total: slots.length, occupied: slots.filter(slot => slot.status === "Occupied").length, available: slots.filter(slot => slot.status === "Available").length } }); return true;
  }
  if (path === "/api/storage/rooms" && request.method === "POST") {
    if (!adminOnly(response, user)) return true;
    const input = await readJson(request);
    const name = String(input.name || "").trim().slice(0, 80);
    const capacity = Number(input.capacity);
    if (name.length < 2 || !Number.isInteger(capacity) || capacity < 1 || capacity > 250 || store.storageRooms.some(room => room.name.toLowerCase() === name.toLowerCase())) { reply(response, 400, { error: "Enter a unique room name and a capacity from 1 to 250 slots." }); return true; }
    const room = { id: randomUUID(), name, capacity, createdAt: new Date().toISOString(), slots: Array.from({ length: capacity }, (_, index) => ({ id: randomUUID(), label: String(index + 1).padStart(2, "0") })) };
    store.storageRooms.push(room); await persist(); reply(response, 201, { room }); return true;
  }
  const roomRoute = path.match(/^\/api\/storage\/rooms\/([0-9a-f-]+)$/i);
  if (roomRoute && request.method === "DELETE") {
    if (!adminOnly(response, user)) return true;
    const index = store.storageRooms.findIndex(room => room.id === roomRoute[1]);
    if (index < 0) { reply(response, 404, { error: "Storage room not found." }); return true; }
    const slotIds = new Set(store.storageRooms[index].slots.map(slot => slot.id));
    if (store.cases.some(item => slotIds.has(item.storageSlotId) && item.status === "Active")) { reply(response, 409, { error: "This room still has assigned cases. Move them before removing the room." }); return true; }
    store.storageRooms.splice(index, 1); await persist(); reply(response, 200, { ok: true }); return true;
  }
  const caseStorageRoute = path.match(/^\/api\/cases\/([0-9a-f-]+)\/storage$/i);
  const caseMovementsRoute = path.match(/^\/api\/cases\/([0-9a-f-]+)\/movements$/i);
  if (caseMovementsRoute && request.method === "GET") {
    if (!user) { reply(response, 401, { error: "Sign in required." }); return true; }
    const record = store.cases.find(item => item.id === caseMovementsRoute[1]);
    if (!record) { reply(response, 404, { error: "Case not found." }); return true; }
    reply(response, 200, { movements: store.movements.filter(item => item.caseId === record.id).sort((a,b) => a.movedAt.localeCompare(b.movedAt)) }); return true;
  }
  if (caseMovementsRoute && request.method === "POST") {
    if (!requirePermission(response, user, "case.write")) return true;
    const record = store.cases.find(item => item.id === caseMovementsRoute[1]);
    if (!record || record.status !== "Active") { reply(response, 404, { error: "Active case not found." }); return true; }
    const input = await readJson(request);
    const allowed = ["Cold room", "Embalming room", "Examination room", "Preparation room", "Family viewing room", "Transfer area", "Other"];
    const destinationType = String(input.destination || "");
    const reason = String(input.reason || "").trim().slice(0, 500);
    if (!allowed.includes(destinationType) || reason.length < 3) { reply(response, 400, { error: "Select a destination and provide a movement reason." }); return true; }
    let destination = destinationType;
    let slotId = "";
    if (destinationType === "Cold room") {
      slotId = String(input.slotId || "");
      const slot = store.storageRooms.flatMap(room => room.slots.map(value => ({ ...value, room }))).find(value => value.id === slotId);
      const occupied = store.cases.find(item => item.id !== record.id && item.status === "Active" && item.storageSlotId === slotId);
      if (!slot || occupied) { reply(response, 409, { error: "Choose an available cold-room slot." }); return true; }
      destination = `${slot.room.name} · ${slot.label}`;
    } else if (destinationType === "Other") {
      destination = String(input.destinationDetails || "").trim().slice(0, 160);
      if (destination.length < 2) { reply(response, 400, { error: "Enter the movement destination." }); return true; }
    }
    const from = record.currentLocation || "Unassigned";
    if (from === destination) { reply(response, 400, { error: "The case is already at this destination." }); return true; }
    const now = new Date().toISOString();
    const movement = { id: randomUUID(), caseId: record.id, caseNumber: record.caseNumber, from, to: destination, reason, movedAt: now, movedBy: { id: user.id, name: user.name, role: user.role } };
    store.movements.push(movement);
    record.currentLocation = destination; record.storageSlotId = slotId || ""; record.updatedAt = now;
    record.history ||= []; record.history.push({ action: "Case moved", at: now, by: user.id, detail: `${from} → ${destination}. ${reason}` });
    store.audit.push({ id: randomUUID(), action: "case.moved", caseId: record.id, caseNumber: record.caseNumber, by: user.id, at: now, detail: `${from} → ${destination}` });
    await persist(); reply(response, 201, { movement, case: record }); return true;
  }
  if (caseStorageRoute && request.method === "POST") {
    if (!requirePermission(response, user, "case.write")) return true;
    const record = store.cases.find(item => item.id === caseStorageRoute[1]);
    if (!record || record.status !== "Active") { reply(response, 404, { error: "Active case not found." }); return true; }
    const input = await readJson(request);
    const slotId = String(input.slotId || "");
    const slot = store.storageRooms.flatMap(room => room.slots.map(value => ({ ...value, room }))).find(value => value.id === slotId);
    if (!slot) { reply(response, 400, { error: "Select an available storage slot." }); return true; }
    if (record.storageSlotId === slotId) { reply(response, 400, { error: "This case is already assigned to that slot." }); return true; }
    const occupied = store.cases.find(item => item.id !== record.id && item.status === "Active" && item.storageSlotId === slotId);
    if (occupied) { reply(response, 409, { error: "That slot has already been assigned. Refresh and choose another." }); return true; }
    const previous = record.currentLocation || "Unassigned";
    const location = `${slot.room.name} · ${slot.label}`;
    const now = new Date().toISOString();
    record.storageSlotId = slotId; record.currentLocation = location; record.updatedAt = now;
    record.history ||= []; record.history.push({ action: previous === "Unassigned" ? "Storage assigned" : "Storage moved", at: now, by: user.id, detail: `${previous} → ${location}` });
    store.movements.push({ id: randomUUID(), caseId: record.id, caseNumber: record.caseNumber, from: previous, to: location, reason: previous === "Unassigned" ? "Storage assignment" : "Storage transfer", movedAt: now, movedBy: { id: user.id, name: user.name, role: user.role } });
    store.audit.push({ id: randomUUID(), action: previous === "Unassigned" ? "case.storage_assigned" : "case.storage_moved", caseId: record.id, caseNumber: record.caseNumber, by: user.id, at: now, detail: `${previous} → ${location}` });
    await persist(); reply(response, 200, { case: record }); return true;
  }
  if (path === "/api/team" && request.method === "GET") {
    if (!adminOnly(response, user)) return true;
    reply(response, 200, { members: store.users.map(safeUser), invitations: store.invitations }); return true;
  }
  if (path === "/api/team/invitations" && request.method === "POST") {
    if (!adminOnly(response, user)) return true;
    const input = await readJson(request);
    const email = String(input.email || "").trim().toLowerCase();
    const role = String(input.role || "");
    const allowedRoles = ["Mortuary manager", "Mortuary attendant", "Embalming / preservation staff", "Reception / front desk", "Finance officer", "Funeral coordinator", "Driver", "Auditor / read-only"];
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !allowedRoles.includes(role)) { reply(response, 400, { error: "Enter a valid email and select an available facility role." }); return true; }
    if (store.users.some(x => x.email === email) || store.invitations.some(x => x.email === email && x.status === "Invited")) { reply(response, 409, { error: "That email already has an account or invitation." }); return true; }
    const token = randomBytes(32).toString("base64url");
    const invitation = { id: randomUUID(), email, role, status: "Invited", createdAt: new Date().toISOString(), expiresAt: Date.now() + 48 * 60 * 60 * 1000, tokenHash: hash(token), invitedBy: user.id };
    store.invitations.push(invitation); await persist(); reply(response, 201, { invitation: { id: invitation.id, email, role, status: invitation.status, expiresAt: invitation.expiresAt }, token }); return true;
  }
  const invitationRoute = path.match(/^\/api\/team\/invitations\/([0-9a-f-]+)$/i);
  if (invitationRoute && request.method === "DELETE") {
    if (!adminOnly(response, user)) return true;
    const before = store.invitations.length;
    store.invitations = store.invitations.filter(item => item.id !== invitationRoute[1]);
    if (before === store.invitations.length) { reply(response, 404, { error: "Invitation not found." }); return true; }
    await persist(); reply(response, 200, { ok: true }); return true;
  }
  const memberRoute = path.match(/^\/api\/team\/members\/([0-9a-f-]+)$/i);
  if (memberRoute && request.method === "PATCH") {
    if (!adminOnly(response, user)) return true;
    const member = store.users.find(x => x.id === memberRoute[1]);
    const input = await readJson(request);
    const allowedRoles = ["Facility administrator", "Mortuary manager", "Mortuary attendant", "Embalming / preservation staff", "Reception / front desk", "Finance officer", "Funeral coordinator", "Driver", "Auditor / read-only"];
    if (!member || !allowedRoles.includes(input.role)) { reply(response, 400, { error: "Member or role is invalid." }); return true; }
    if (member.id === user.id && input.role !== user.role) { reply(response, 400, { error: "You cannot change your own administrator role." }); return true; }
    member.role = input.role; await persist(); reply(response, 200, { member: safeUser(member) }); return true;
  }
  if (memberRoute && request.method === "DELETE") {
    if (!adminOnly(response, user)) return true;
    if (memberRoute[1] === user.id) { reply(response, 400, { error: "You cannot remove your own account." }); return true; }
    const before = store.users.length;
    store.users = store.users.filter(x => x.id !== memberRoute[1]);
    store.sessions = store.sessions.filter(s => s.userId !== memberRoute[1]);
    if (store.users.length === before) { reply(response, 404, { error: "Member not found." }); return true; }
    await persist(); reply(response, 200, { ok: true }); return true;
  }
  reply(response, 404, { error: "API route not found." }); return true;
}

const server = createServer(async (request, response) => {
  try {
  const url = new URL(request.url ?? "/", "http://localhost");
  if (url.pathname.startsWith("/api/")) { await api(request, response, url); return; }
  let base = publicDir;
  let path = decodeURIComponent(url.pathname);
  if (path.startsWith("/src/app/")) { base = resolve(projectDir, "src/app"); path = path.slice("/src/app".length); }
  const file = resolve(base, path === "/" ? "index.html" : `.${path}`);
  if (file !== base && !file.startsWith(base + sep)) { response.writeHead(403).end("Forbidden"); return; }
  try {
    const body = await readFile(file);
    const extension = file.slice(file.lastIndexOf("."));
    response.writeHead(200, { "Content-Type": types[extension] ?? "application/octet-stream", "Cache-Control":"no-store" });
    response.end(body);
  } catch {
    response.writeHead(404, { "Content-Type":"text/plain; charset=utf-8" }).end("Not found");
  }
  } catch (error) {
    reply(response, error.status || 500, { error: error.status ? error.message : "Local server error." });
    if (!error.status) console.error("Request failed:", error.message);
  }
});
const port = Number(process.env.PORT || 3000);
server.listen(port, "0.0.0.0", () => console.log(`Mortusoft local preview running at http://localhost:${port}`));
