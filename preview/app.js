const byId = (id) => document.getElementById(id);
const views = ["signin", "dashboard", "setup", "team", "cases", "new-case", "case-detail", "storage", "reports", "audit"];
const roles = ["Facility administrator", "Mortuary manager", "Mortuary attendant", "Embalming / preservation staff", "Reception / front desk", "Finance officer", "Funeral coordinator", "Driver", "Auditor / read-only"];
let setupStep = 0;
let current = null;
let facility = null;
let members = [];
let invitations = [];
const invitationToken = new URLSearchParams(window.location.search).get("invite");
const caseLookupToken = new URLSearchParams(window.location.search).get("case");

// Persistent workspace navigation: one shared shell for every page after sign-in.
const workspaceStyle = document.createElement("style");
workspaceStyle.textContent = `
  #mortusoft-sidebar {
    position: fixed;
    z-index: 30;
    inset: 0 auto 0 0;
    width: 260px;
    padding: 24px 16px 20px;
    background: #EAE3DA;
    color: #071739;
    display: flex;
    flex-direction: column;
    box-shadow: 2px 0 18px rgba(7, 23, 57, 0.03);
    border-right: 1px solid #DDD5CB;
    font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
  }
  #mortusoft-sidebar[hidden] { display: none !important; }
  .ms-side-brand {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 4px 10px 24px;
    font: 800 20px 'Plus Jakarta Sans', sans-serif;
    letter-spacing: -0.8px;
    color: #071739;
  }
  .ms-side-brand .brand-mark {
    background: linear-gradient(135deg, #071739 0%, #4B6382 100%);
    box-shadow: 0 4px 14px rgba(7, 23, 57, 0.25);
  }
  .ms-side-brand .brand-mark i:nth-child(1) { background: #E3C39D; }
  .ms-side-brand .brand-mark i:nth-child(2) { background: #FFFFFF; }
  .ms-side-brand .brand-mark i:nth-child(3) { background: #E3C39D; }
  .ms-side-facility {
    margin: 0 4px 22px;
    padding: 12px 14px;
    border: 1px solid rgba(225, 217, 209, 0.8);
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.65);
    box-shadow: 0 2px 8px rgba(7, 23, 57, 0.03);
  }
  .ms-side-facility small {
    display: block;
    color: #7D8B9B;
    font-size: 10.5px;
    font-weight: 700;
    letter-spacing: 1.2px;
    text-transform: uppercase;
  }
  .ms-side-facility strong {
    display: block;
    margin-top: 5px;
    font-size: 13.5px;
    font-weight: 700;
    color: #071739;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .ms-side-label {
    margin: 4px 14px 8px;
    color: #7D8B9B;
    font-size: 10.5px;
    font-weight: 800;
    letter-spacing: 1.2px;
    text-transform: uppercase;
  }
  .ms-side-nav {
    display: grid;
    gap: 4px;
  }
  .ms-side-nav button {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    padding: 10px 14px;
    border: 0;
    border-radius: 10px;
    background: transparent;
    color: #4B6382;
    text-align: left;
    font: 600 13.5px 'Plus Jakarta Sans', sans-serif;
    cursor: pointer;
    transition: all 0.16s ease;
  }
  .ms-side-nav button:hover {
    background: rgba(255, 255, 255, 0.65);
    color: #071739;
  }
  /* Overview pill style in steel blue */
  .ms-side-nav button[aria-current=page] {
    background: #4B6382;
    color: #ffffff;
    font-weight: 700;
    box-shadow: 0 4px 14px rgba(75, 99, 130, 0.3);
  }
  .ms-side-nav button span {
    width: 20px;
    text-align: center;
    font-size: 16px;
  }
  .ms-side-bottom {
    margin-top: auto;
    padding: 16px 8px 4px;
    border-top: 1px solid #DDD5CB;
  }
  .ms-side-bottom small {
    display: block;
    color: #6B7B8C;
    font-size: 11.5px;
    line-height: 1.6;
  }
  .ms-side-bottom button {
    margin-top: 12px;
    padding: 7px 14px;
    border: 1px solid #DDD5CB;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.7);
    color: #4B6382;
    font-size: 12.5px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s ease;
  }
  .ms-side-bottom button:hover {
    background: #ffffff;
    color: #071739;
    border-color: #CDD5DB;
  }
  body.ms-workspace #dashboard,
  body.ms-workspace .workspace-page {
    margin-left: 260px;
    width: calc(100% - 260px);
    min-height: 100vh;
    background: #F4EFEA;
  }
  body.ms-workspace .preview-head {
    padding-left: 36px;
  }
  body.ms-workspace .preview-body {
    max-width: 1280px;
  }
  @media(max-width: 760px) {
    #mortusoft-sidebar {
      width: 68px;
      padding: 20px 8px 14px;
    }
    .ms-side-brand {
      justify-content: center;
      padding: 4px 0 20px;
      font-size: 0;
    }
    .ms-side-brand .brand-mark { flex: none; }
    .ms-side-facility, .ms-side-label, .ms-side-nav button b, .ms-side-bottom small, .ms-side-bottom button {
      display: none;
    }
    .ms-side-nav button {
      justify-content: center;
      padding: 12px 6px;
    }
    .ms-side-nav button span { font-size: 18px; }
    body.ms-workspace #dashboard, body.ms-workspace .workspace-page {
      margin-left: 68px;
      width: calc(100% - 68px);
    }
  }
`;
document.head.appendChild(workspaceStyle);
document.body.insertAdjacentHTML("afterbegin", `<aside id="mortusoft-sidebar" hidden aria-label="Workspace navigation"><div class="ms-side-brand"><span class="brand-mark"><i></i><i></i><i></i></span> mortusoft<span style="color:#A68868">.</span></div><div class="ms-side-facility"><small>Current facility</small><strong id="ms-sidebar-facility">Facility workspace</strong></div><p class="ms-side-label">Workspace</p><nav class="ms-side-nav"><button data-open="dashboard"><span>⌂</span><b>Overview</b></button><button data-open="cases"><span>⌕</span><b>Case register</b></button><button data-open="new-case"><span>＋</span><b>New admission</b></button><button data-open="storage"><span>▦</span><b>Storage</b></button><button data-open="reports"><span>◷</span><b>Reports</b></button><button data-open="audit"><span>◷</span><b>Audit log</b></button><button data-open="team"><span>♙</span><b>People & access</b></button><button data-open="setup"><span>⚙</span><b>Facility settings</b></button></nav><div class="ms-side-bottom"><small>Mortusoft · Local workspace<br>Designed for calm, clear operations.</small><button id="ms-sidebar-signout">↗ &nbsp; Sign out</button></div></aside>`);
byId("ms-sidebar-signout").addEventListener("click", () => byId("signout").click());

async function request(path, options = {}) {
  const response = await fetch(path, { credentials: "same-origin", ...options, headers: { "Content-Type": "application/json", ...(options.headers || {}) } });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || "The request could not be completed.");
  return result;
}
function show(view) {
  views.forEach(id => byId(id).hidden = id !== view);
  const signedIn = view !== "signin";
  byId("mortusoft-sidebar").hidden = !signedIn;
  document.body.classList.toggle("ms-workspace", signedIn);
  document.querySelectorAll("#mortusoft-sidebar [data-open]").forEach(button => {
    if (button.dataset.open === view || (view === "case-detail" && button.dataset.open === "cases")) button.setAttribute("aria-current", "page");
    else button.removeAttribute("aria-current");
  });
  if (view === "setup") renderSetup();
  if (view === "team") renderTeam();
  if (view === "cases") renderCases();
  if (view === "new-case") prepareAdmission();
  if (view === "storage") renderStorage();
  if (view === "reports") renderReports();
  if (view === "audit") renderAudit();
}
function message(id, text) { const node = byId(id); node.textContent = text; node.hidden = false; }
function hideMessage(id) { byId(id).hidden = true; }
function firstName() { return current?.name?.trim().split(/\s+/)[0] || "there"; }
function enterWorkspace(result) {
  current = result.user;
  facility = result.facility;
  byId("welcome-name").textContent = firstName();
  byId("facility-name").textContent = facility?.name || "Facility workspace";
  byId("ms-sidebar-facility").textContent = facility?.name || "Facility workspace";
  refreshDashboard();
  if (caseLookupToken) { history.replaceState({}, "", "/"); renderCaseDetail(caseLookupToken); }
  else show("dashboard");
}

async function refreshDashboard() {
  try {
    const { cases } = await request("/api/cases");
    const now = new Date();
    byId("active-case-count").textContent = cases.filter(item => item.status === "Active").length;
    byId("month-case-count").textContent = cases.filter(item => { const d = new Date(item.admissionAt); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); }).length;
    const from = localDateInput(new Date(now.getFullYear(), now.getMonth(), 1));
    const to = localDateInput(now);
    const report = await request(`/api/reports?from=${from}&to=${to}`);
    byId("month-release-count").textContent = report.metrics.releases;
    byId("storage-utilization-count").textContent = `${report.metrics.utilization}%`;
    byId("month-collections-count").textContent = kesReport(report.metrics.collected);
  } catch {}
}

byId("register-open").addEventListener("click", () => { byId("login-panel").hidden = true; byId("register-panel").hidden = false; });
byId("login-back").addEventListener("click", () => { byId("register-panel").hidden = true; byId("login-panel").hidden = false; });
byId("login-form").addEventListener("submit", async event => {
  event.preventDefault(); hideMessage("login-message");
  try {
    const result = await request("/api/auth/login", { method: "POST", body: JSON.stringify({ email: byId("login-email").value, password: byId("login-password").value }) });
    enterWorkspace(result);
  } catch (error) { message("login-message", error.message); }
});
byId("register-form").addEventListener("submit", async event => {
  event.preventDefault(); hideMessage("register-message");
  const input = { name: byId("register-name").value, email: byId("register-email").value, password: byId("register-password").value, facilityName: byId("register-facility").value, type: byId("register-type").value, county: byId("register-county").value };
  try {
    const path = invitationToken ? "/api/auth/accept-invite" : "/api/auth/register";
    const result = await request(path, { method: "POST", body: JSON.stringify(invitationToken ? { token: invitationToken, name: input.name, password: input.password } : input) });
    if (invitationToken) history.replaceState({}, "", "/");
    enterWorkspace(result);
  } catch (error) { message("register-message", error.message); }
});
byId("signout").addEventListener("click", async () => {
  try { await request("/api/auth/logout", { method: "POST", body: "{}" }); } catch {}
  current = null; show("signin");
});

document.querySelectorAll("[data-open]").forEach(button => button.addEventListener("click", () => show(button.dataset.open)));
document.querySelectorAll(".preview-action").forEach(button => button.addEventListener("click", () => show(button.dataset.open)));
const storageShortcut = document.createElement("button");
storageShortcut.className = "preview-action"; storageShortcut.innerHTML = '<span class="preview-chip">⌂</span><b>Storage & cold rooms</b><small>Configure chambers, see available capacity, and assign cases to slots.</small>';
storageShortcut.addEventListener("click", () => show("storage"));
byId("dashboard").querySelector(".preview-actions").appendChild(storageShortcut);
const reportsShortcut = document.createElement("button");
reportsShortcut.className = "preview-action"; reportsShortcut.innerHTML = '<span class="preview-chip">▤</span><b>Operational reports</b><small>Review case flow, capacity, movement, and financial activity for a selected period.</small>';
reportsShortcut.addEventListener("click", () => show("reports"));
byId("dashboard").querySelector(".preview-actions").appendChild(reportsShortcut);
const auditShortcut = document.createElement("button");
auditShortcut.className = "preview-action"; auditShortcut.innerHTML = '<span class="preview-chip">◷</span><b>Audit log</b><small>Review who changed case records and export a filtered activity register.</small>';
auditShortcut.addEventListener("click", () => show("audit"));
byId("dashboard").querySelector(".preview-actions").appendChild(auditShortcut);
byId("dashboard").querySelector(".preview-cards").insertAdjacentHTML("beforeend", '<article class="preview-card"><small>Releases this month</small><strong id="month-release-count">0</strong><span>Cases handed over</span></article><article class="preview-card"><small>Storage utilization</small><strong id="storage-utilization-count">0%</strong><span>Current cold-room occupancy</span></article><article class="preview-card"><small>Collections this month</small><strong id="month-collections-count">KSh 0</strong><span>Payments received</span></article>');
function localDateInput(date) { return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10); }
function kesReport(value) { return `KSh ${Number(value || 0).toLocaleString("en-KE", { maximumFractionDigits: 0 })}`; }
async function renderAudit() {
  const canView = ["Facility administrator", "Super administrator", "Auditor / read-only"].includes(current?.role);
  if (!canView) { byId("audit-rows").innerHTML = '<p class="movement-empty">Your role does not have audit access.</p>'; return; }
  const load = async () => {
    const params = new URLSearchParams();
    for (const key of ["from", "to", "q", "action"]) { const value = byId(`audit-${key}`).value.trim(); if (value) params.set(key, value); }
    try {
      const result = await request(`/api/audit?${params}`);
      byId("audit-result-count").textContent = `${result.total} event${result.total === 1 ? "" : "s"}`;
      byId("audit-rows").innerHTML = result.events.length ? result.events.map(event => `<article class="audit-row"><time>${new Date(event.at).toLocaleString("en-KE")}</time><b>${esc(event.action)}</b><span>${esc(event.caseNumber || "Facility")}</span><span>${esc(event.actor)}</span><small>${esc(event.detail || "—")}</small></article>`).join("") : '<p class="movement-empty">No events match these filters.</p>';
    } catch (error) { byId("audit-rows").textContent = error.message; }
  };
  try {
    const { permissions } = await request("/api/permissions");
    let matrix = byId("permission-matrix");
    if (!matrix) { matrix = document.createElement("section"); matrix.id = "permission-matrix"; matrix.className = "permission-matrix"; byId("audit").querySelector(".audit-wrap").appendChild(matrix); }
    matrix.innerHTML = '<p class="form-eyebrow">ROLE REFERENCE</p><h2>Permission matrix</h2>' + Object.entries(permissions).map(([key, allowed]) => `<div class="permission-line"><b>${esc(key.replaceAll(".", " "))}</b><span>${allowed.map(esc).join(" · ")}</span></div>`).join("");
  } catch {}
  byId("audit-filter-form").onsubmit = event => { event.preventDefault(); load(); };
  byId("audit-export").onclick = () => { const params = new URLSearchParams(); for (const key of ["from", "to", "q", "action"]) { const value = byId(`audit-${key}`).value.trim(); if (value) params.set(key, value); } params.set("format", "csv"); window.location.href = `/api/audit?${params}`; };
  await load();
}
async function renderReports() {
  const today = new Date(); const defaultFrom = new Date(today); defaultFrom.setDate(defaultFrom.getDate() - 29);
  if (!byId("report-from").value) byId("report-from").value = localDateInput(defaultFrom);
  if (!byId("report-to").value) byId("report-to").value = localDateInput(today);
  byId("report-range-form").onsubmit = async event => { event.preventDefault(); await loadReports(); };
  byId("reports-refresh").onclick = loadReports; await loadReports();
}
async function loadReports() {
  const root = byId("report-metrics"); root.classList.add("report-refreshing"); byId("report-message").hidden = true;
  try {
    const report = await request(`/api/reports?${new URLSearchParams({ from: byId("report-from").value, to: byId("report-to").value })}`); const m = report.metrics;
    byId("report-range-label").textContent = `${report.range.from} — ${report.range.to}`;
    const cards = [["Admissions", m.admissions, "Cases admitted in this period"], ["Releases", m.releases, "Cases handed over in this period"], ["Active cases", m.activeCases, `${m.unassignedActive} without a storage slot`], ["Storage utilization", `${m.utilization}%`, `${m.occupied} of ${m.storageTotal} configured slots`], ["Movements", m.movements, "Custody movements in this period"], ["Billed", kesReport(m.billed), "Invoices issued in this period"], ["Collected", kesReport(m.collected), "Payments recorded in this period"], ["Outstanding", kesReport(m.totalOutstanding), "Current open invoice balance"]];
    root.innerHTML = cards.map(([label, value, detail]) => `<article class="report-metric"><small>${esc(label)}</small><b>${esc(value)}</b><span>${esc(detail)}</span></article>`).join("");
    const daily = report.daily.slice(-18); const maxActivity = Math.max(1, ...daily.map(day => day.admissions + day.releases + day.movements));
    byId("report-daily").innerHTML = daily.length ? daily.map(day => `<div class="report-day"><span>${esc(day.date.slice(5))}</span><div class="report-day-bars"><i style="width:${day.admissions ? Math.max(3, day.admissions / maxActivity * 100) : 0}%"></i><i style="width:${day.releases ? Math.max(3, day.releases / maxActivity * 100) : 0}%"></i><i style="width:${day.movements ? Math.max(3, day.movements / maxActivity * 100) : 0}%"></i></div><b class="report-day-count">${day.admissions + day.releases + day.movements} events</b></div>`).join("") + '<div class="report-legend"><span>Admissions</span><span>Releases</span><span>Movements</span></div>' : '<p class="report-empty">No operational activity in this period.</p>';
    const maxStatus = Math.max(1, ...report.statuses.map(item => item.count));
    byId("report-status").innerHTML = report.statuses.map(item => `<div class="report-status-row"><span>${esc(item.status)}</span><div class="report-status-track"><i style="width:${item.count ? Math.max(3, item.count / maxStatus * 100) : 0}%"></i></div><b>${item.count}</b></div>`).join("");
    const maxService = Math.max(1, ...report.services.map(item => item.amount));
    byId("report-services").innerHTML = report.services.length ? report.services.map(item => `<div class="report-service-row"><span>${esc(item.name)}</span><div class="report-service-track"><i style="width:${Math.max(3, item.amount / maxService * 100)}%"></i></div><b>${kesReport(item.amount)}</b></div>`).join("") : '<p class="report-empty">No invoice line items in this period.</p>';
  } catch (error) { message("report-message", error.message); }
  finally { root.classList.remove("report-refreshing"); }
}
async function renderCases() {
  const root = byId("case-rows");
  const query = byId("case-search").value.trim();
  const status = byId("case-status-filter").value;
  try {
    const params = new URLSearchParams(); if (query) params.set("q", query); if (status) params.set("status", status);
    const result = await request(`/api/cases?${params}`);
    root.replaceChildren();
    byId("case-result-count").textContent = `${result.cases.length} ${result.cases.length === 1 ? "CASE" : "CASES"}`;
    byId("case-empty").hidden = result.cases.length > 0;
    result.cases.forEach(item => {
      const row = document.createElement("button"); row.type = "button"; row.className = "case-row"; row.dataset.caseId = item.id;
      const date = new Date(item.admissionAt);
      row.innerHTML = `<span class="case-person"><b>${esc(item.caseNumber)}</b><small>${esc(item.personName)}</small></span><span class="case-date">${date.toLocaleDateString("en-KE", { day:"numeric", month:"short", year:"numeric" })}<small>${date.toLocaleTimeString("en-KE", { hour:"2-digit", minute:"2-digit" })}</small></span><span class="case-id-status ${item.identificationStatus === "Unidentified" ? "case-id-unknown" : ""}"><i></i>${esc(item.identificationStatus)}</span><span class="case-status-pill case-status-${item.status.toLowerCase()}">${esc(item.status)}</span><span class="case-chevron" title="Open case record" aria-label="Open case record">→</span>`;
      row.addEventListener("click", () => renderCaseDetail(item.id));
      root.appendChild(row);
    });
  } catch (error) { message("case-list-notice", error.message); }
}
byId("case-search").addEventListener("input", () => { clearTimeout(window.caseSearchTimer); window.caseSearchTimer = setTimeout(renderCases, 180); });
byId("case-status-filter").addEventListener("change", renderCases);
byId("case-rows").addEventListener("click", event => { const row = event.target.closest("[data-case-id]"); if (row) renderCaseDetail(row.dataset.caseId); });

function prepareAdmission() {
  const date = new Date(); date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  byId("admission-at").value = date.toISOString().slice(0,16);
  byId("admission-message").hidden = true;
}
byId("identification-status").addEventListener("change", event => {
  const unknown = event.target.value === "Unidentified";
  const person = byId("person-name-field").querySelector("input");
  person.required = !unknown; person.disabled = unknown; person.value = unknown ? "" : person.value;
  byId("person-name-field").hidden = unknown;
  const kin = document.querySelector('[name="kinName"]'); kin.required = !unknown;
  document.querySelector('[name="kinPhone"]').required = false;
});
byId("admission-form").addEventListener("submit", async event => {
  event.preventDefault(); byId("admission-message").hidden = true;
  const formEl = event.currentTarget;
  const form = new FormData(formEl);
  const payload = { personName: form.get("personName"), identificationStatus: form.get("identificationStatus"), sex: form.get("sex"), estimatedAge: form.get("estimatedAge"), admissionAt: form.get("admissionAt"), source: form.get("source"), nextOfKin: { name: form.get("kinName"), relationship: form.get("kinRelationship"), phone: form.get("kinPhone") }, notes: form.get("notes") };
  try {
    const result = await request("/api/cases", { method: "POST", body: JSON.stringify(payload) });
    formEl.reset();
    if (window.closeAllCustomSelects) window.closeAllCustomSelects();
    refreshDashboard();
    await renderCaseDetail(result.case.id);
  } catch (error) { message("admission-message", error.message); }
});

async function renderCaseDetail(id) {
  try {
    show("case-detail");
    const root = byId("case-detail-content");
    root.innerHTML = `<div class="case-detail-loading" style="padding: 48px 24px; text-align: center; color: var(--palette-steel); font-family: 'Plus Jakarta Sans', sans-serif; font-size: 15px; font-weight: 600;"><span style="display:inline-block;">Loading case record...</span></div>`;
    window.scrollTo({ top: 0, behavior: "smooth" });

    const { case: item } = await request(`/api/cases/${encodeURIComponent(id)}`);
    const date = new Date(item.admissionAt);
    root.innerHTML = `<div class="case-heading"><div><p class="form-eyebrow">CASE RECORD · ${esc(item.caseNumber)}</p><h1>${esc(item.personName)}<span>.</span></h1><p>Admitted ${date.toLocaleString("en-KE", { dateStyle:"long", timeStyle:"short" })}</p></div><span class="case-status-pill case-status-${item.status.toLowerCase()}">${esc(item.status)}</span></div><div class="detail-grid"><section class="detail-card"><p class="form-eyebrow">PERSON PROFILE</p><dl><div><dt>Identification</dt><dd>${esc(item.identificationStatus)}</dd></div><div><dt>Sex / gender</dt><dd>${esc(item.sex)}</dd></div><div><dt>Estimated age</dt><dd>${esc(item.estimatedAge || "Not recorded")}</dd></div><div><dt>Referral source</dt><dd>${esc(item.source || "Not recorded")}</dd></div><div><dt>Next of kin</dt><dd>${esc(item.nextOfKin?.name || "Not recorded")}${item.nextOfKin?.relationship ? ` · ${esc(item.nextOfKin.relationship)}` : ""}</dd></div><div><dt>Contact phone</dt><dd>${esc(item.nextOfKin?.phone || "Not recorded")}</dd></div><div><dt>Admission note</dt><dd class="detail-notes">${esc(item.notes || "No note recorded")}</dd></div></dl></section><section class="detail-card"><p class="form-eyebrow">CASE HISTORY</p><div class="history-list">${(item.history || []).map(entry => `<div class="history-entry"><i></i><span><b>${esc(entry.action)}</b><small>${new Date(entry.at).toLocaleString("en-KE")} · ${esc(entry.detail)}</small></span></div>`).join("")}</div><div class="setup-hint">Storage assignments are recorded here. QR labels, broader movement tracking and release workflows are planned for later phases.</div></section></div>`;
    root.dataset.caseId = item.id;

    if (item.status === "Released" && ["Facility administrator", "Super administrator", "Mortuary manager"].includes(current?.role)) {
      root.insertAdjacentHTML("beforeend", `<section class="detail-card case-close-card"><p class="form-eyebrow">PHASE 13 · CASE LIFECYCLE</p><h2>Close completed case</h2><p class="setup-hint">The release record remains preserved. Closing marks the operational file complete.</p><form id="case-close-form"><label>Closure note<textarea name="reason" minlength="4" maxlength="300" rows="2" required placeholder="Confirm the post-release record is complete"></textarea></label><p id="case-close-message" class="form-notice" hidden></p><button class="team-invite" type="submit">Close case</button></form></section>`);
      const closeForm = byId("case-close-form");
      if (closeForm) {
        closeForm.addEventListener("submit", async event => {
          event.preventDefault();
          const formEl = event.currentTarget;
          const reason = new FormData(formEl).get("reason");
          if (!confirm("Close this released case? The release record will remain available.")) return;
          try {
            await request(`/api/cases/${encodeURIComponent(item.id)}/close`, { method: "POST", body: JSON.stringify({ reason }) });
            refreshDashboard();
            await renderCaseDetail(item.id);
          } catch (error) { message("case-close-message", error.message); }
        });
      }
    }

    const canPrintLabel = current?.role !== "Auditor / read-only";
    const caseHeading = root.querySelector(".case-heading");
    if (caseHeading) {
      caseHeading.insertAdjacentHTML("beforeend", `<button id="open-case-label" class="team-invite" ${canPrintLabel ? "" : "hidden"}>Print QR label</button>`);
      caseHeading.insertAdjacentHTML("afterend", `<div class="case-label-wrap"><section id="case-label-print-area" class="case-label-print"><div class="case-label-copy"><span class="form-eyebrow">${esc(facility?.name || "MORTUSOFT")}</span><b>CASE IDENTIFICATION</b><strong>${esc(item.caseNumber)}</strong><small>Scan with Mortusoft to open this case after staff sign-in.</small></div><img src="/api/cases/${encodeURIComponent(item.id)}/qr.svg" alt="Secure case lookup QR code"></section><div class="case-label-actions"><span>QR contains an opaque case link only; sign-in is required to view the record.</span><button id="case-label-print-button" class="subtle-button" ${canPrintLabel ? "" : "hidden"}>Print label</button></div><p id="case-label-message" class="form-notice" hidden></p></div>`);
      byId("open-case-label")?.addEventListener("click", () => byId("case-label-print-area")?.scrollIntoView({ behavior: "smooth", block: "center" }));
      byId("case-label-print-button")?.addEventListener("click", async () => { try { await request(`/api/cases/${encodeURIComponent(item.id)}/label-print`, { method: "POST", body: "{}" }); window.print(); } catch (error) { message("case-label-message", error.message); } });
    }

    // Storage card
    root.querySelector(".detail-grid").insertAdjacentHTML("afterbegin", `<section class="detail-card storage-assignment"><p class="form-eyebrow">CURRENT STORAGE</p><div class="current-location">⌂ <b>${esc(item.currentLocation || "Not assigned")}</b></div><div class="storage-assign-row"><select id="case-storage-select" aria-label="Available storage slots"><option value="">Choose an available slot</option></select><button id="case-storage-assign" class="auth-submit">${item.currentLocation ? "Move case" : "Assign storage"} <span>→</span></button></div><p id="case-storage-message" class="form-notice" hidden></p></section>`);
    let storageState = { rooms: [] };
    try {
      storageState = await request("/api/storage");
      const select = byId("case-storage-select");
      if (select && storageState.rooms) {
        storageState.rooms.forEach(room => room.slots.filter(slot => slot.status === "Available" || slot.id === item.storageSlotId).forEach(slot => {
          const option = document.createElement("option"); option.value = slot.id; option.textContent = `${room.name} · Slot ${slot.label}${slot.id === item.storageSlotId ? " (current)" : ""}`; option.selected = slot.id === item.storageSlotId; select.appendChild(option);
        }));
      }
      byId("case-storage-assign")?.addEventListener("click", async () => {
        const sel = byId("case-storage-select");
        if (!sel || !sel.value) { message("case-storage-message", "Configure a room and choose an available slot first."); return; }
        try { const updated = await request(`/api/cases/${encodeURIComponent(item.id)}/storage`, { method: "POST", body: JSON.stringify({ slotId: sel.value }) }); await renderCaseDetail(updated.case.id); }
        catch (error) { message("case-storage-message", error.message); }
      });
    } catch (e) { console.error("Storage load error:", e); }

    // Movements card
    root.insertAdjacentHTML("beforeend", `<section class="detail-card custody-card"><div class="custody-heading"><div><p class="form-eyebrow">PHASE 5 · CHAIN OF CUSTODY</p><h2>Movement log</h2><small>Record each handoff with its destination and reason.</small></div><span class="custody-shield">↗</span></div><form id="movement-form" class="movement-form"><label>Destination<select id="movement-destination" required><option value="">Select a destination</option><option>Cold room</option><option>Embalming room</option><option>Examination room</option><option>Preparation room</option><option>Family viewing room</option><option>Transfer area</option><option>Other</option></select></label><label id="movement-other-wrap" hidden>Destination details<input id="movement-other" maxlength="160" placeholder="Enter destination"></label><label id="movement-slot-wrap" hidden>Cold-room slot<select id="movement-slot"><option value="">Choose an available slot</option></select></label><label class="movement-reason-label">Reason for movement<textarea id="movement-reason" maxlength="500" rows="2" required placeholder="e.g. Preparation requested by family"></textarea></label><p id="movement-message" class="form-notice" hidden></p><button type="submit" class="auth-submit">Record movement <span>→</span></button></form><div class="movement-timeline"><p class="form-eyebrow">MOVEMENT HISTORY</p><div id="movement-rows"></div></div></section>`);
    const movementSlotWrap = byId("movement-slot-wrap");
    byId("movement-destination")?.addEventListener("change", event => {
      const coldRoom = event.target.value === "Cold room";
      byId("movement-other-wrap").hidden = event.target.value !== "Other";
      if (movementSlotWrap) movementSlotWrap.hidden = !coldRoom;
      byId("movement-other").required = event.target.value === "Other";
      byId("movement-slot").required = coldRoom;
    });
    const movementSlot = byId("movement-slot");
    if (movementSlot && storageState.rooms) {
      storageState.rooms.forEach(room => room.slots.filter(slot => slot.status === "Available" || slot.id === item.storageSlotId).forEach(slot => {
        const option = document.createElement("option"); option.value = slot.id; option.textContent = `${room.name} · Slot ${slot.label}${slot.id === item.storageSlotId ? " (current)" : ""}`; movementSlot.appendChild(option);
      }));
    }
    try {
      const { movements } = await request(`/api/cases/${encodeURIComponent(item.id)}/movements`);
      const movementRows = byId("movement-rows");
      if (movementRows) {
        if (!movements || !movements.length) movementRows.innerHTML = '<p class="movement-empty">No movements recorded yet.</p>';
        else movementRows.innerHTML = [...movements].reverse().map(entry => `<article class="movement-entry"><span class="movement-marker">↗</span><div><div class="movement-route"><b>${esc(entry.from)}</b><span>→</span><b>${esc(entry.to)}</b></div><p>${esc(entry.reason)}</p><small>${new Date(entry.movedAt).toLocaleString("en-KE")} · ${esc(entry.movedBy.name)} · ${esc(entry.movedBy.role)}</small></div></article>`).join("");
      }
    } catch (e) { console.error("Movements load error:", e); }
    byId("movement-form")?.addEventListener("submit", async event => {
      event.preventDefault(); byId("movement-message").hidden = true;
      const destination = byId("movement-destination").value;
      try {
        const updated = await request(`/api/cases/${encodeURIComponent(item.id)}/movements`, { method: "POST", body: JSON.stringify({ destination, destinationDetails: byId("movement-other").value, slotId: destination === "Cold room" ? movementSlot.value : "", reason: byId("movement-reason").value }) });
        await renderCaseDetail(updated.case.id);
      } catch (error) { message("movement-message", error.message); }
    });

    // Documents card
    root.insertAdjacentHTML("beforeend", `<section class="detail-card docs-card"><div class="docs-heading"><div><p class="form-eyebrow">PHASE 6 · CASE DOCUMENTATION</p><h2>Documents & attachments</h2><small>Store supporting files alongside this case record.</small></div><span class="docs-icon">▤</span></div><form id="case-doc-form" class="docs-form"><label>Document category<select id="doc-category" required><option value="">Choose category</option><option>Admission form</option><option>Identity document</option><option>Authority / police</option><option>Family authorization</option><option>Medical / postmortem</option><option>Release form</option><option>Other</option></select></label><label>File<input id="doc-file" type="file" accept="application/pdf,image/png,image/jpeg,.pdf,.png,.jpg,.jpeg" required><small>PDF, PNG, or JPEG · up to 5 MB</small></label><p id="doc-message" class="form-notice" hidden></p><button type="submit" class="auth-submit">Attach document <span>→</span></button></form><div class="docs-list"><p class="form-eyebrow">ATTACHED TO THIS CASE</p><div id="case-doc-rows"></div></div></section>`);
    let documents = [];
    try {
      const docRes = await request(`/api/cases/${encodeURIComponent(item.id)}/documents`);
      documents = docRes.documents || [];
      const docRows = byId("case-doc-rows");
      if (docRows) {
        if (!documents.length) docRows.innerHTML = '<p class="movement-empty">No documents attached yet.</p>';
        else docRows.innerHTML = documents.map(doc => `<article class="doc-entry"><span class="doc-file-icon">${doc.mimeType === "application/pdf" ? "PDF" : "IMG"}</span><span class="doc-info"><b>${esc(doc.name)}</b><small>${esc(doc.category)} · ${(doc.size / 1024).toFixed(0)} KB · ${new Date(doc.uploadedAt).toLocaleDateString("en-KE")}</small></span><a href="/api/documents/${encodeURIComponent(doc.id)}" target="_blank" rel="noreferrer">View <span>↗</span></a></article>`).join("");
      }
    } catch (e) { console.error("Docs load error:", e); }
    byId("case-doc-form")?.addEventListener("submit", async event => {
      event.preventDefault(); byId("doc-message").hidden = true;
      const file = byId("doc-file").files[0];
      if (!file) return;
      if (file.size > 5 * 1024 * 1024) { message("doc-message", "Choose a file smaller than 5 MB."); return; }
      try {
        const buffer = new Uint8Array(await file.arrayBuffer());
        let binary = "";
        for (let index = 0; index < buffer.length; index += 0x8000) binary += String.fromCharCode(...buffer.subarray(index, index + 0x8000));
        await request(`/api/cases/${encodeURIComponent(item.id)}/documents`, { method: "POST", body: JSON.stringify({ name: file.name, category: byId("doc-category").value, mimeType: file.type, data: btoa(binary) }) });
        await renderCaseDetail(item.id);
      } catch (error) { message("doc-message", error.message); }
    });

    // Billing card
    const canBill = ["Facility administrator", "Super administrator", "Mortuary manager", "Finance officer"].includes(current?.role);
    root.insertAdjacentHTML("beforeend", `<section class="detail-card billing-card"><div class="billing-heading"><div><p class="form-eyebrow">PHASE 7 · BILLING & PAYMENTS</p><h2>Billing overview</h2><small>Create service invoices and record payments received.</small></div><button id="invoice-add-toggle" class="team-invite" ${canBill ? "" : "hidden"}>＋ Create invoice</button></div><div class="billing-summary"><article><small>Total billed</small><b id="billing-billed">KSh 0</b></article><article><small>Paid</small><b id="billing-paid">KSh 0</b></article><article><small>Outstanding</small><b id="billing-balance">KSh 0</b></article></div><form id="new-invoice-form" class="invoice-form" hidden><div class="invoice-form-heading"><b>New service invoice</b><small>Enter each service and its amount in whole Kenyan shillings.</small></div><div id="invoice-lines"></div><button type="button" id="invoice-line-add" class="add-line-button">＋ Add a service line</button><p id="invoice-message" class="form-notice" hidden></p><div class="invoice-form-actions"><button type="button" id="invoice-cancel" class="subtle-button">Cancel</button><button type="submit" class="auth-submit">Save invoice <span>→</span></button></div></form><p id="billing-empty" class="movement-empty">No invoices for this case yet.</p><div id="invoice-list"></div><div class="billing-note"><b>LOCAL PAYMENT REGISTER</b> Payments are recorded manually. No M-Pesa, bank, or card transaction is initiated by this preview.</div></section>`);
    try {
      const billing = await request(`/api/cases/${encodeURIComponent(item.id)}/billing`);
      if (byId("billing-billed")) byId("billing-billed").textContent = kes(billing.summary?.billed || 0);
      if (byId("billing-paid")) byId("billing-paid").textContent = kes(billing.summary?.paid || 0);
      if (byId("billing-balance")) byId("billing-balance").textContent = kes(billing.summary?.balance || 0);
      if (byId("billing-empty")) byId("billing-empty").hidden = billing.invoices && billing.invoices.length > 0;
      const invoiceList = byId("invoice-list");
      if (invoiceList && billing.invoices) {
        invoiceList.innerHTML = billing.invoices.map(invoice => `<article class="invoice-card"><div class="invoice-card-head"><span><b>${esc(invoice.invoiceNumber)}</b><small>Issued ${new Date(invoice.createdAt).toLocaleDateString("en-KE")} · ${esc(invoice.createdBy.name)}</small></span><span class="invoice-status invoice-${invoice.status.toLowerCase().replaceAll(" ", "-")}">${esc(invoice.status)}</span></div><div class="invoice-items">${invoice.lines.map(line => `<div><span>${esc(line.description)}</span><b>${kes(line.amount)}</b></div>`).join("")}</div><div class="invoice-totals"><div><span>Invoice total</span><b>${kes(invoice.total)}</b></div><div><span>Paid</span><b>${kes(invoice.paid)}</b></div><div><span>Balance due</span><b>${kes(invoice.balance)}</b></div></div>${invoice.payments.length ? `<div class="payment-history"><small>PAYMENT HISTORY</small>${invoice.payments.map(payment => `<div><span>${esc(payment.method)}${payment.reference ? ` · ${esc(payment.reference)}` : ""}<small>${new Date(payment.paidAt).toLocaleDateString("en-KE")} · ${esc(payment.recordedBy.name)}</small></span><b>${kes(payment.amount)}</b></div>`).join("")}</div>` : ""}${canBill && invoice.balance > 0 ? `<details class="payment-details"><summary>Record a payment</summary><form class="payment-form" data-invoice-id="${esc(invoice.id)}"><label>Amount (KSh)<input name="amount" type="number" min="1" max="${invoice.balance}" step="1" required></label><label>Method<select name="method"><option>Cash</option><option>M-Pesa</option><option>Bank transfer</option><option>Card</option><option>Other</option></select></label><label>Reference<input name="reference" maxlength="120" placeholder="Required for M-Pesa / bank"></label><p class="form-notice" hidden></p><button class="auth-submit" type="submit">Record payment <span>→</span></button></form></details>` : ""}</article>`).join("");
      }
      byId("invoice-add-toggle")?.addEventListener("click", () => { byId("new-invoice-form").hidden = false; if (!byId("invoice-lines").children.length) addInvoiceLine(); });
      byId("invoice-cancel")?.addEventListener("click", () => { byId("new-invoice-form").reset(); byId("new-invoice-form").hidden = true; byId("invoice-lines").replaceChildren(); });
      byId("invoice-line-add")?.addEventListener("click", addInvoiceLine);
      byId("new-invoice-form")?.addEventListener("submit", async event => {
        event.preventDefault(); byId("invoice-message").hidden = true;
        const lines = [...byId("invoice-lines").querySelectorAll(".invoice-line-row")].map(row => ({ description: row.querySelector("[name=description]").value.trim(), amount: Number(row.querySelector("[name=amount]").value) })).filter(line => line.description && line.amount);
        try { await request(`/api/cases/${encodeURIComponent(item.id)}/billing`, { method: "POST", body: JSON.stringify({ lines }) }); await renderCaseDetail(item.id); }
        catch (error) { message("invoice-message", error.message); }
      });
      if (invoiceList) {
        invoiceList.querySelectorAll(".payment-form").forEach(form => {
          const method = form.querySelector('[name="method"]'); const reference = form.querySelector('[name="reference"]');
          method?.addEventListener("change", () => { reference.required = ["M-Pesa", "Bank transfer"].includes(method.value); });
          form.addEventListener("submit", async event => {
            event.preventDefault(); const notice = form.querySelector(".form-notice"); if (notice) notice.hidden = true;
            try { await request(`/api/invoices/${encodeURIComponent(form.dataset.invoiceId)}/payments`, { method: "POST", body: JSON.stringify({ amount: Number(form.querySelector('[name="amount"]').value), method: method.value, reference: reference.value }) }); await renderCaseDetail(item.id); }
            catch (error) { if (notice) { notice.textContent = error.message; notice.hidden = false; } }
          });
        });
      }
    } catch (e) { console.error("Billing load error:", e); }

    // Release clearance card
    try {
      const clearance = await request(`/api/cases/${encodeURIComponent(item.id)}/release-clearance`);
      const canAuthorizeRelease = ["Facility administrator", "Super administrator", "Mortuary manager"].includes(current?.role);
      const releaseFormAttached = documents.some(document => document.category === "Release form");
      const releasePanel = document.createElement("section"); releasePanel.className = "detail-card release-card";
      if (item.release) {
        releasePanel.innerHTML = `<div class="release-heading"><div><p class="form-eyebrow">PHASE 8 · RELEASE CLEARANCE</p><h2>Case released</h2><small>Handover recorded and storage released.</small></div><span class="release-state-badge">RELEASED</span></div><div class="release-summary"><div><small>Recipient</small><b>${esc(item.release.recipientName)}</b></div><div><small>Relationship</small><b>${esc(item.release.relationship)}</b></div><div><small>Contact</small><b>${esc(item.release.phone)}</b></div><div><small>Released</small><b>${new Date(item.release.releasedAt).toLocaleString("en-KE")}</b></div><div><small>Authorized by</small><b>${esc(item.release.authorizedBy.name)}</b></div></div>`;
      } else {
        const checksMarkup = (clearance.checks || []).map(check => `<div class="release-check-row"><span class="release-check-indicator ${check.state === "Complete" ? "check-complete" : check.state === "Not applicable" ? "check-na" : ""} ">${check.state === "Complete" ? "✓" : check.state === "Not applicable" ? "–" : "·"}</span><span class="release-check-copy"><b>${esc(check.label)}</b><small>${check.canWaive ? "Record a reason when marking not applicable." : "Required before handover."}</small></span><select data-release-key="${esc(check.key)}" ${canAuthorizeRelease && item.status === "Active" ? "" : "disabled"}><option ${check.state === "Pending" ? "selected" : ""}>Pending</option><option ${check.state === "Complete" ? "selected" : ""}>Complete</option>${check.canWaive ? `<option ${check.state === "Not applicable" ? "selected" : ""}>Not applicable</option>` : ""}</select><input class="release-reason" data-release-reason="${esc(check.key)}" value="${esc(check.reason || "")}" maxlength="300" placeholder="Reason for N/A" ${check.state === "Not applicable" && canAuthorizeRelease ? "" : "hidden"}></div>`).join("");
        releasePanel.innerHTML = `<div class="release-heading"><div><p class="form-eyebrow">PHASE 8 · RELEASE CLEARANCE</p><h2>Release readiness</h2><small>Confirm applicable requirements under facility policy.</small></div><span class="release-state-badge release-pending">${clearance.blockers?.length ? `${clearance.blockers.length} BLOCKERS` : "READY TO REVIEW"}</span></div><div class="release-guardrail"><b>RELEASE GATE</b><span>A release form must be attached. Authority and finance requirements follow facility policy.</span></div><form id="release-checklist-form"><div class="release-check-list">${checksMarkup}</div><div class="release-doc-proof ${releaseFormAttached ? "proof-complete" : "proof-missing"}"><span>${releaseFormAttached ? "✓" : "!"}</span><div><b>${releaseFormAttached ? "Release form attached" : "Release form required"}</b><small>Attach a document categorized as Release form.</small></div></div><p id="release-check-message" class="form-notice" hidden></p>${canAuthorizeRelease && item.status === "Active" ? '<div class="release-check-actions"><span>Checklist changes are recorded in case history.</span><button type="submit" class="subtle-button">Save checklist</button></div>' : ""}</form><div class="release-blockers" ${clearance.blockers?.length ? "" : "hidden"}><b>RELEASE BLOCKED</b><ul>${(clearance.blockers || []).map(blocker => `<li>${esc(blocker)}</li>`).join("")}</ul></div>${canAuthorizeRelease && item.status === "Active" ? '<form id="release-handover-form" class="handover-form"><p class="form-eyebrow">FINAL HANDOVER</p><div class="handover-fields"><label>Recipient full name<input name="recipientName" minlength="2" maxlength="120" required></label><label>Relationship<input name="relationship" minlength="2" maxlength="80" required></label><label>Contact phone<input name="phone" type="tel" maxlength="40" required></label></div><label class="handover-confirm"><input type="checkbox" required><span>I confirm the recipient is verified and this case is cleared for handover.</span></label><p id="release-handover-message" class="form-notice" hidden></p><button type="submit" class="release-finalize" ' + (clearance.blockers?.length ? "disabled" : "") + '>Authorize release & record handover →</button></form>' : ""}`;
      }
      root.appendChild(releasePanel);
      if (!item.release && canAuthorizeRelease && item.status === "Active") {
        releasePanel.querySelectorAll("[data-release-key]").forEach(select => select.addEventListener("change", () => { const reason = releasePanel.querySelector(`[data-release-reason="${select.dataset.releaseKey}"]`); if (reason) { reason.hidden = select.value !== "Not applicable"; reason.required = select.value === "Not applicable"; } }));
        const checkForm = byId("release-checklist-form");
        if (checkForm) {
          checkForm.addEventListener("submit", async event => { event.preventDefault(); const checks = {}; releasePanel.querySelectorAll("[data-release-key]").forEach(select => { checks[select.dataset.releaseKey] = { state: select.value, reason: releasePanel.querySelector(`[data-release-reason="${select.dataset.releaseKey}"]`)?.value || "" }; }); try { await request(`/api/cases/${encodeURIComponent(item.id)}/release-clearance`, { method: "PUT", body: JSON.stringify({ checks }) }); await renderCaseDetail(item.id); } catch (error) { message("release-check-message", error.message); } });
        }
        const handoverForm = byId("release-handover-form");
        if (handoverForm) {
          handoverForm.addEventListener("submit", async event => {
            event.preventDefault();
            const formEl = event.currentTarget;
            const form = new FormData(formEl);
            const recipientName = form.get("recipientName");
            const relationship = form.get("relationship");
            const phone = form.get("phone");
            if (!confirm("Authorize final handover and mark this case Released? This cannot be reversed in the local preview.")) return;
            try {
              await request(`/api/cases/${encodeURIComponent(item.id)}/release`, { method: "POST", body: JSON.stringify({ recipientName, relationship, phone }) });
              refreshDashboard();
              await renderCaseDetail(item.id);
            } catch (error) { message("release-handover-message", error.message); }
          });
        }
      }
    } catch (e) { console.error("Clearance load error:", e); }

    // Family communication card
    try {
      const comms = await request(`/api/cases/${encodeURIComponent(item.id)}/communications`);
      const contact = comms.contact || {};
      const canCommunicate = ["Facility administrator", "Super administrator", "Mortuary manager", "Reception / front desk", "Funeral coordinator"].includes(current?.role);
      const consentGranted = contact.consentStatus === "Granted" && contact.consentChannel === contact.preferredChannel;
      const communicationPanel = document.createElement("section"); communicationPanel.className = "detail-card communications-card";
      communicationPanel.innerHTML = `<div class="communications-heading"><div><p class="form-eyebrow">PHASE 9 · FAMILY COMMUNICATION</p><h2>Family contact & updates</h2><small>Record contact preferences and prepare a case update.</small></div><span class="communication-icon">✉</span></div><div class="communication-guardrail"><b>LOCAL MESSAGE LOG ONLY</b><span>Messages stay in this preview and are not sent. Matching channel consent is required before preparation.</span></div><form id="contact-preferences-form" class="contact-preferences-form"><label>Family contact<input name="name" value="${esc(contact.name || "")}" maxlength="120" required ${canCommunicate ? "" : "disabled"}></label><label>Relationship<input name="relationship" value="${esc(contact.relationship || "")}" maxlength="80" ${canCommunicate ? "" : "disabled"}></label><label>Phone<input name="phone" type="tel" value="${esc(contact.phone || "")}" maxlength="40" ${canCommunicate ? "" : "disabled"}></label><label>Email<input name="email" type="email" value="${esc(contact.email || "")}" maxlength="254" ${canCommunicate ? "" : "disabled"}></label><label>Preferred channel<select name="preferredChannel" ${canCommunicate ? "" : "disabled"}><option ${contact.preferredChannel === "SMS" ? "selected" : ""}>SMS</option><option ${contact.preferredChannel === "Email" ? "selected" : ""}>Email</option></select></label><label>Consent status<select name="consentStatus" ${canCommunicate ? "" : "disabled"}><option ${contact.consentStatus === "Not recorded" ? "selected" : ""}>Not recorded</option><option ${contact.consentStatus === "Granted" ? "selected" : ""}>Granted</option><option ${contact.consentStatus === "Declined" ? "selected" : ""}>Declined</option></select></label><label>Consent method<select name="consentMethod" ${canCommunicate ? "" : "disabled"}><option value="">Choose method</option><option>In person</option><option>Phone</option><option>Written authorization</option><option>Other</option></select></label><label>Consent note<input name="consentNote" value="${esc(contact.consentNote || "")}" maxlength="300" placeholder="Optional context" ${canCommunicate ? "" : "disabled"}></label><div class="consent-recorded">${contact.consentAt ? `Consent ${esc((contact.consentStatus || "").toLowerCase())} for ${esc(contact.consentChannel || "")} · ${new Date(contact.consentAt).toLocaleString("en-KE")} · ${esc(contact.consentBy || "")}` : "Consent has not been recorded."}</div><p id="contact-preferences-message" class="form-notice" hidden></p>${canCommunicate ? '<button type="submit" class="subtle-button">Save contact & consent</button>' : ""}</form><div class="message-prep"><div><b>Prepare a family update</b><small>Uses the case reference and facility contact details only.</small></div><form id="local-message-form"><label>Message template<select name="template"><option>Facility update</option><option>Document follow-up</option><option>Appointment coordination</option></select></label><p id="local-message-message" class="form-notice" hidden></p><button type="submit" class="auth-submit" ${canCommunicate && consentGranted && (contact.preferredChannel === "SMS" ? contact.phone : contact.email) ? "" : "disabled"}>Add to local message log <span>→</span></button></form>${!consentGranted ? '<small class="consent-required">A matching channel consent record is required.</small>' : ""}</div><div class="message-log"><p class="form-eyebrow">PREPARED MESSAGES</p><div id="family-message-rows"></div></div>`;
      root.appendChild(communicationPanel);
      const contactForm = byId("contact-preferences-form");
      if (contactForm && contact.consentMethod) {
        const methodEl = contactForm.elements.namedItem("consentMethod");
        if (methodEl) methodEl.value = contact.consentMethod;
      }
      if (canCommunicate && contactForm) {
        contactForm.addEventListener("submit", async event => { event.preventDefault(); const values = Object.fromEntries(new FormData(contactForm)); try { await request(`/api/cases/${encodeURIComponent(item.id)}/communications/contact`, { method: "PUT", body: JSON.stringify(values) }); await renderCaseDetail(item.id); } catch (error) { message("contact-preferences-message", error.message); } });
      }
      byId("local-message-form")?.addEventListener("submit", async event => {
        event.preventDefault();
        const formEl = event.currentTarget;
        const template = new FormData(formEl).get("template");
        try {
          await request(`/api/cases/${encodeURIComponent(item.id)}/communications/messages`, { method: "POST", body: JSON.stringify({ template }) });
          await renderCaseDetail(item.id);
        } catch (error) { message("local-message-message", error.message); }
      });
      const familyMsgRows = byId("family-message-rows");
      if (familyMsgRows) {
        familyMsgRows.innerHTML = comms.messages && comms.messages.length ? comms.messages.map(entry => `<article class="family-message-entry"><div class="family-message-meta"><b>${esc(entry.template)}</b><span>${esc(entry.channel)} · ${esc(entry.recipientAddress)}</span><small>${new Date(entry.queuedAt).toLocaleString("en-KE")} · ${esc(entry.queuedBy.name)}</small></div><p>${esc(entry.body)}</p><span class="family-message-status">${esc(entry.status)}</span></article>`).join("") : '<p class="movement-empty">No family messages prepared for this case.</p>';
      }
    } catch (e) { console.error("Communications load error:", e); }

  } catch (error) {
    message("case-list-notice", error.message);
    show("cases");
  }
}

async function renderStorage() {
  const root = byId("storage-room-list"); root.replaceChildren();
  byId("storage-message").hidden = true;
  const canManage = ["Facility administrator", "Super administrator"].includes(current?.role);
  byId("storage-add-open").hidden = !canManage;
  try {
    const { rooms, occupancy } = await request("/api/storage");
    byId("storage-total").textContent = occupancy.total;
    byId("storage-occupied").textContent = occupancy.occupied;
    byId("storage-available").textContent = occupancy.available;
    byId("storage-utilization").textContent = `${occupancy.total ? Math.round(occupancy.occupied / occupancy.total * 100) : 0}%`;
    byId("storage-empty").hidden = rooms.length > 0;
    rooms.forEach(room => {
      const occupied = room.slots.filter(slot => slot.status === "Occupied").length;
      const card = document.createElement("section"); card.className = "storage-room-card";
      card.innerHTML = `<div class="storage-room-head"><span class="room-icon">⌂</span><span class="room-title"><b>${esc(room.name)}</b><small>${occupied} occupied · ${room.capacity - occupied} available</small></span><span class="room-utilization">${Math.round(occupied / room.capacity * 100)}% full</span>${canManage ? `<button class="room-remove" data-room-id="${esc(room.id)}" aria-label="Remove ${esc(room.name)}">•••</button>` : ""}</div><div class="slot-grid">${room.slots.map(slot => `<button type="button" class="storage-slot ${slot.status === "Occupied" ? "slot-occupied" : "slot-available"}" data-slot-case="${esc(slot.caseId || "")}" title="${slot.status === "Occupied" ? "View assigned case" : "Available storage slot"}"><b>${esc(slot.label)}</b><small>${slot.status === "Occupied" ? "Occupied" : "Available"}</small></button>`).join("")}</div>`;
      root.appendChild(card);
    });
    root.querySelectorAll("[data-slot-case]").forEach(button => button.addEventListener("click", () => { if (button.dataset.slotCase) renderCaseDetail(button.dataset.slotCase); }));
    root.querySelectorAll("[data-room-id]").forEach(button => button.addEventListener("click", async () => {
      if (!confirm("Remove this cold room? It must be empty first.")) return;
      try { await request(`/api/storage/rooms/${button.dataset.roomId}`, { method: "DELETE" }); renderStorage(); }
      catch (error) { message("storage-message", error.message); }
    }));
  } catch (error) { message("storage-message", error.message); }
}
byId("storage-add-open").addEventListener("click", () => { byId("storage-add-form").hidden = false; byId("room-name").focus(); });
byId("storage-add-cancel").addEventListener("click", () => { byId("storage-add-form").hidden = true; byId("storage-add-form").reset(); });
byId("storage-add-form").addEventListener("submit", async event => {
  event.preventDefault(); byId("storage-message").hidden = true;
  const formEl = event.currentTarget;
  const name = byId("room-name").value.trim();
  const capacity = Number(byId("room-capacity").value);
  try {
    await request("/api/storage/rooms", { method: "POST", body: JSON.stringify({ name, capacity }) });
    formEl.reset();
    byId("storage-add-form").hidden = true;
    byId("room-capacity").value = 12;
    await renderStorage();
  }
  catch (error) { message("storage-message", error.message); }
});

async function loadFacility() {
  const result = await request("/api/facility");
  facility = result.facility;
}
function renderSetup() {
  document.querySelectorAll("[data-step-indicator]").forEach(element => {
    const number = Number(element.dataset.stepIndicator);
    element.className = "step-item " + (number === setupStep ? "step-current " : "") + (number < setupStep ? "step-done" : "");
    element.querySelector("span").textContent = number < setupStep ? "✓" : `0${number + 1}`;
  });
  byId("setup-kicker").textContent = `STEP 0${setupStep + 1} OF 03`;
  const titles = ["Facility profile", "Case numbering", "Review & save"];
  const descriptions = ["The details that identify your facility across Mortusoft.", "Choose a clear, consistent format for new case IDs.", "Confirm your facility setup before saving."];
  byId("setup-title").textContent = titles[setupStep];
  byId("setup-description").textContent = descriptions[setupStep];
  byId("setup-back").textContent = setupStep === 0 ? "Cancel" : "← Previous";
  byId("setup-next").innerHTML = setupStep === 2 ? "Save facility profile <span>✓</span>" : "Continue <span>→</span>";
  const root = byId("setup-fields");
  if (setupStep === 0) {
    root.innerHTML = `<div class="form-grid"><label class="field-wide">Facility name<input data-field="name" value="${esc(facility.name)}"></label><label>Facility type<select data-field="type">${["Private mortuary", "Funeral home", "Hospital mortuary", "County / public mortuary", "Faith-based funeral home"].map(value => `<option ${value === facility.type ? "selected" : ""}>${value}</option>`).join("")}</select></label><label>County / region<input data-field="county" value="${esc(facility.county)}"></label><label>Facility contact email<input data-field="email" type="email" value="${esc(facility.email)}"></label><label>Facility phone<input data-field="phone" value="${esc(facility.phone)}"></label><label class="field-wide">Time zone<select data-field="timezone"><option value="Africa/Nairobi">East Africa Time (UTC+3) · Nairobi</option><option value="Africa/Kampala">East Africa Time (UTC+3) · Kampala</option></select></label></div>`;
    root.querySelector('[data-field="timezone"]').value = facility.timezone;
  } else if (setupStep === 1) {
    root.innerHTML = `<div class="numbering-panel"><div class="numbering-copy"><span>CASE ID PREVIEW</span><strong id="case-preview">${esc(facility.prefix || "MRT")}-00001</strong><small>Each new case will receive the next available number.</small></div><label>Case number prefix<input id="case-prefix" value="${esc(facility.prefix || "MRT")}" maxlength="6"><small>Use up to 6 letters or numbers.</small></label><div class="setup-hint">Case numbers are unique within this facility. Prefix changes apply to new admissions.</div></div>`;
    byId("case-prefix").addEventListener("input", event => { event.target.value = event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""); byId("case-preview").textContent = `${event.target.value || "MRT"}-00001`; });
  } else {
    root.innerHTML = `<div class="review-list">${[["Facility", facility.name], ["Type", facility.type], ["Location", `${facility.county}, Kenya`], ["Contact", facility.email], ["Phone", facility.phone || "Not set"], ["Case number format", `${facility.prefix || "MRT"}-00001`], ["Time zone", facility.timezone]].map(([label, value]) => `<div><span>${label}</span><b>${esc(value)}</b>${label === "Facility" ? '<button type="button" id="edit-facility">Edit</button>' : ""}</div>`).join("")}<div class="setup-hint">Facility settings are stored in this local server’s data file. Use a managed database and production identity provider before adding real case records.</div></div>`;
    byId("edit-facility").addEventListener("click", () => { setupStep = 0; renderSetup(); });
  }
}
byId("setup-back").addEventListener("click", () => { if (setupStep === 0) show("dashboard"); else { collectFacility(); setupStep--; renderSetup(); } });
byId("setup-next").addEventListener("click", async () => {
  collectFacility();
  if (setupStep < 2) { setupStep++; renderSetup(); return; }
  try {
    const result = await request("/api/facility", { method: "PUT", body: JSON.stringify(facility) });
    facility = result.facility;
    byId("facility-name").textContent = facility.name;
    show("dashboard");
  } catch (error) { const root = byId("setup-fields"); root.insertAdjacentHTML("beforeend", `<p class="form-notice">${esc(error.message)}</p>`); }
});
function collectFacility() {
  document.querySelectorAll("[data-field]").forEach(element => facility[element.dataset.field] = element.value);
  const prefix = byId("case-prefix"); if (prefix) facility.prefix = prefix.value;
}

async function renderTeam() {
  try {
    const result = await request("/api/team");
    members = result.members;
    invitations = result.invitations;
    byId("team-notice").hidden = true;
  } catch (error) { message("team-notice", error.message); return; }
  const active = members.filter(member => member.status === "Active");
  byId("team-count").textContent = members.length;
  byId("summary-total").textContent = members.length + invitations.length;
  byId("summary-active").textContent = active.length;
  byId("summary-invited").textContent = invitations.length;
  byId("role-count").textContent = `${members.length + invitations.length} MEMBERS`;
  const root = byId("team-rows"); root.replaceChildren();
  [...members, ...invitations].forEach((member, index) => {
    const isInvitation = member.status === "Invited";
    const row = document.createElement("div"); row.className = "member-row";
    const initials = member.name ? member.name.split(/\s+/).map(value => value[0]).join("").slice(0, 2) : member.email.slice(0, 2).toUpperCase();
    const roleOptions = isInvitation ? `<option>${esc(member.role)}</option>` : roles.map(role => `<option ${role === member.role ? "selected" : ""}>${esc(role)}</option>`).join("");
    row.innerHTML = `<div class="member-person"><span class="member-avatar member-color-${index % 4}">${esc(initials)}</span><span><b>${esc(member.name || member.email)}</b><small>${esc(member.email)}</small></span></div><select aria-label="Role for ${esc(member.email)}" ${isInvitation ? "disabled" : ""}>${roleOptions}</select><span class="member-status ${isInvitation ? "member-invited" : "member-active"}"><i></i>${isInvitation ? "Invited" : "Active"}</span><button class="member-menu" aria-label="Remove ${esc(member.email)}">···</button>`;
    if (!isInvitation) row.querySelector("select").addEventListener("change", async event => {
      try { await request(`/api/team/members/${member.id}`, { method: "PATCH", body: JSON.stringify({ role: event.target.value }) }); }
      catch (error) { message("team-notice", error.message); }
    });
    row.querySelector(".member-menu").addEventListener("click", async () => {
      if (isInvitation) {
        if (!confirm(`Cancel the invitation for ${member.email}?`)) return;
        try { await request(`/api/team/invitations/${member.id}`, { method: "DELETE" }); await renderTeam(); }
        catch (error) { message("team-notice", error.message); }
        return;
      }
      if (!confirm(`Remove ${member.name} from the local facility team?`)) return;
      try { await request(`/api/team/members/${member.id}`, { method: "DELETE" }); await renderTeam(); }
      catch (error) { message("team-notice", error.message); }
    });
    root.appendChild(row);
  });
}
byId("invite-open").addEventListener("click", () => { byId("invite-shade").hidden = false; byId("team-notice").hidden = true; });
function closeInvite() { byId("invite-shade").hidden = true; byId("invite-email").value = ""; }
byId("invite-close").addEventListener("click", closeInvite);
byId("invite-cancel").addEventListener("click", closeInvite);
byId("invite-shade").addEventListener("click", event => { if (event.target === byId("invite-shade")) closeInvite(); });
byId("invite-submit").addEventListener("click", async () => {
  try {
    const result = await request("/api/team/invitations", { method: "POST", body: JSON.stringify({ email: byId("invite-email").value.trim(), role: byId("invite-role").value }) });
    closeInvite(); await renderTeam();
    const note = byId("team-notice"); note.replaceChildren(document.createTextNode("Invitation link created. Share it directly (no email was sent): "));
    const link = document.createElement("a"); link.href = `/?invite=${encodeURIComponent(result.token)}`; link.textContent = `${window.location.origin}/?invite=${result.token}`; link.target = "_blank"; link.rel = "noreferrer"; note.appendChild(link); note.hidden = false;
  } catch (error) { message("team-notice", error.message); }
});

function addInvoiceLine() {
  const row = document.createElement("div"); row.className = "invoice-line-row";
  row.innerHTML = '<label>Service description<input name="description" maxlength="120" placeholder="e.g. Cold storage" required></label><label>Amount (KSh)<input name="amount" type="number" min="1" max="100000000" step="1" placeholder="0" required></label><button type="button" class="invoice-line-remove" aria-label="Remove service line">×</button>';
  row.querySelector(".invoice-line-remove").addEventListener("click", () => { if (row.parentElement.children.length > 1) row.remove(); else row.querySelectorAll("input").forEach(input => input.value = ""); });
  byId("invoice-lines").appendChild(row);
}
function kes(value) { return `KSh ${Number(value || 0).toLocaleString("en-KE")}`; }
function esc(value) { return String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]); }

async function initialize() {
  if (invitationToken) {
    byId("login-panel").hidden = true; byId("register-panel").hidden = false;
    byId("register-panel").querySelector("h2").innerHTML = "Accept your<br>invitation.";
    byId("register-panel").querySelector(".form-intro").textContent = "Create your facility account to continue.";
    byId("register-form").querySelector("button.auth-submit").innerHTML = "Activate facility account <span>→</span>";
    for (const id of ["register-facility", "register-type", "register-county"]) { const input = byId(id); input.closest("label").hidden = true; input.disabled = true; }
    try {
      const invite = await request(`/api/invitations/${encodeURIComponent(invitationToken)}`);
      byId("register-email").value = invite.email; byId("register-email").readOnly = true;
      byId("register-panel").querySelector(".form-eyebrow").textContent = `${invite.facilityName} · ${invite.role}`.toUpperCase();
    } catch (error) { message("register-message", error.message); byId("register-form").querySelector("button.auth-submit").disabled = true; }
    show("signin");
    byId("signin").hidden = false; byId("register-panel").hidden = false;
    return;
  }
  try {
    const result = await request("/api/auth/session");
    if (result.user) enterWorkspace(result);
    else show("signin");
  } catch { show("signin"); }
}
initialize();


/* ==========================================================================
   CUSTOM SYSTEM DROPDOWNS ENGINE (MORTUSOFT COASTAL OCEANIC PALETTE)
   Transforms all native selects into bespoke, elegant floating dropdowns.
   ========================================================================== */
(function initCustomSelects() {
  function enhanceSelect(select) {
    if (!select || select.dataset.msEnhanced === "true") return;
    select.dataset.msEnhanced = "true";

    // Container
    const container = document.createElement("div");
    container.className = "ms-select-container";
    if (select.id) container.dataset.targetId = select.id;
    if (select.disabled) container.classList.add("is-disabled");

    // Keep native select in the DOM for FormData, validation, and programmatic access
    select.style.setProperty("position", "absolute", "important");
    select.style.setProperty("opacity", "0", "important");
    select.style.setProperty("pointer-events", "none", "important");
    select.style.setProperty("width", "0", "important");
    select.style.setProperty("height", "0", "important");
    select.style.setProperty("margin", "0", "important");
    select.style.setProperty("padding", "0", "important");
    select.style.setProperty("border", "0", "important");
    select.tabIndex = -1;

    // Trigger button
    const trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "ms-select-trigger";
    trigger.setAttribute("aria-haspopup", "listbox");
    trigger.setAttribute("aria-expanded", "false");
    if (select.disabled) trigger.disabled = true;

    const labelSpan = document.createElement("span");
    labelSpan.className = "ms-select-label";

    const chevronSpan = document.createElement("span");
    chevronSpan.className = "ms-select-chevron";
    chevronSpan.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>';

    trigger.appendChild(labelSpan);
    trigger.appendChild(chevronSpan);

    // Floating menu
    const menu = document.createElement("div");
    menu.className = "ms-select-menu";
    menu.setAttribute("role", "listbox");
    menu.hidden = true;

    function syncOptions() {
      menu.replaceChildren();
      const currentVal = select.value;
      const opts = Array.from(select.options);
      const selectedOpt = select.selectedOptions[0] || opts.find(o => o.value === currentVal) || opts[0];
      labelSpan.textContent = selectedOpt ? selectedOpt.textContent : (select.getAttribute("placeholder") || "Select an option");

      opts.forEach(opt => {
        const item = document.createElement("div");
        const isSelected = opt.value === select.value || (selectedOpt && opt.value === selectedOpt.value);
        item.className = "ms-select-option" + (isSelected ? " is-selected" : "");
        item.setAttribute("role", "option");
        item.setAttribute("aria-selected", isSelected ? "true" : "false");
        item.dataset.value = opt.value;

        const text = document.createElement("span");
        text.className = "ms-option-text";
        text.textContent = opt.textContent;
        item.appendChild(text);

        if (isSelected) {
          const check = document.createElement("span");
          check.className = "ms-option-check";
          check.textContent = "✓";
          item.appendChild(check);
        }

        item.addEventListener("click", e => {
          e.stopPropagation();
          select.value = opt.value;
          syncOptions();
          closeAllCustomSelects();
          select.dispatchEvent(new Event("change", { bubbles: true }));
          select.dispatchEvent(new Event("input", { bubbles: true }));
        });

        menu.appendChild(item);
      });

      if (select.disabled) {
        trigger.disabled = true;
        container.classList.add("is-disabled");
      } else {
        trigger.disabled = false;
        container.classList.remove("is-disabled");
      }
    }

    syncOptions();

    trigger.addEventListener("click", e => {
      e.stopPropagation();
      if (select.disabled) return;
      const isCurrentlyOpen = !menu.hidden;
      closeAllCustomSelects();
      if (!isCurrentlyOpen) {
        syncOptions();
        menu.hidden = false;
        trigger.setAttribute("aria-expanded", "true");
        container.classList.add("is-open");

        requestAnimationFrame(() => {
          const rect = menu.getBoundingClientRect();
          if (rect.bottom > window.innerHeight - 16) {
            container.classList.add("open-upward");
          } else {
            container.classList.remove("open-upward");
          }
        });
      }
    });

    select.addEventListener("change", syncOptions);

    const observer = new MutationObserver(() => syncOptions());
    observer.observe(select, { childList: true, subtree: true, attributes: true, attributeFilter: ["disabled"] });

    select.parentNode.insertBefore(container, select);
    container.appendChild(trigger);
    container.appendChild(menu);
    container.appendChild(select);
  }

  function closeAllCustomSelects() {
    document.querySelectorAll(".ms-select-container.is-open").forEach(c => {
      c.classList.remove("is-open");
      c.classList.remove("open-upward");
      const trig = c.querySelector(".ms-select-trigger");
      if (trig) trig.setAttribute("aria-expanded", "false");
      const m = c.querySelector(".ms-select-menu");
      if (m) m.hidden = true;
    });
  }

  window.closeAllCustomSelects = closeAllCustomSelects;
  window.enhanceSelect = enhanceSelect;
  window.refreshAllSelects = function() {
    document.querySelectorAll("select:not([data-ms-enhanced])").forEach(enhanceSelect);
  };

  document.addEventListener("click", closeAllCustomSelects);
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") closeAllCustomSelects();
  });

  const pageObserver = new MutationObserver(() => {
    document.querySelectorAll("select:not([data-ms-enhanced])").forEach(enhanceSelect);
  });
  pageObserver.observe(document.documentElement, { childList: true, subtree: true });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      document.querySelectorAll("select").forEach(enhanceSelect);
    });
  } else {
    document.querySelectorAll("select").forEach(enhanceSelect);
  }
})();
