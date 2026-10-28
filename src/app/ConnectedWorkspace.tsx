"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import "./connected-workspace.css";

type WorkspaceData = {
  facility: { id: string; name: string; facility_type: string; county: string; case_prefix: string; timezone: string } | null;
  role?: string;
  cases: Array<{ id: string; case_number: string; deceased_name: string; identification_status: string; status: string; admission_at: string; current_location: string | null }>;
  metrics: null | { activeCases: number; monthAdmissions: number; releases: number; teamMembers: number; storageOccupied: number; storageCapacity: number; storageRooms: number; invoices: number; collectedMinor: number };
};

const navigation = ["Overview", "Cases", "Storage", "Billing", "Release", "Audit", "People", "Facility"];

export default function ConnectedWorkspace() {
  const [page, setPage] = useState("Overview");
  const [selectedCaseId, setSelectedCaseId] = useState("");
  const [caseRows, setCaseRows] = useState<WorkspaceData["cases"]>([]);
  const [caseQuery, setCaseQuery] = useState("");
  const [caseStatus, setCaseStatus] = useState("");
  const [casePage, setCasePage] = useState(1);
  const [caseTotal, setCaseTotal] = useState(0);
  const [data, setData] = useState<WorkspaceData | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setError("");
    try {
      const response = await fetch("/api/workspace/overview", { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to load workspace.");
      setData(result);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to load workspace."); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    if (page !== "Cases" || !data?.facility) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const params = new URLSearchParams({ page: String(casePage), q: caseQuery, status: caseStatus });
        const response = await fetch(`/api/workspace/cases?${params}`, { cache: "no-store", signal: controller.signal });
        const result = await response.json(); if (!response.ok) throw new Error(result.error);
        setCaseRows(result.cases); setCaseTotal(result.total);
        if (selectedCaseId && !result.cases.some((item: CaseRecord) => item.id === selectedCaseId)) setSelectedCaseId("");
      } catch (reason) { if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : "Could not load cases."); }
    }, 180);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [page, data?.facility, casePage, caseQuery, caseStatus, selectedCaseId]);

  async function submit(event: FormEvent<HTMLFormElement>, endpoint: string, then?: () => void) {
    event.preventDefault(); setBusy(true); setError(""); setNotice("");
    const form = event.currentTarget;
    const body = Object.fromEntries(new FormData(form).entries());
    if (data?.facility) body.facilityId = data.facility.id;
    if (typeof body.admissionAt === "string") body.admissionAt = new Date(body.admissionAt).toISOString();
    if (body.identificationStatus === "identified" && !String(body.kinName ?? "").trim()) {
      setError("Add a next of kin name for an identified case, or change identification status."); setBusy(false); return;
    }
    try {
      const response = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not save changes.");
      form.reset(); setNotice(endpoint.endsWith("facility") ? "Facility created and linked to your administrator account." : "Admission saved to the facility case register.");
      then?.(); await load();
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not save changes."); }
    finally { setBusy(false); }
  }

  const facility = data?.facility;
  const metrics = data?.metrics;
  const date = (value: string) => new Intl.DateTimeFormat("en-KE", { dateStyle: "medium" }).format(new Date(value));

  return <main className="cw-shell">
    <aside className="cw-sidebar"><Link className="cw-brand" href="/"><span className="cw-mark"><i/><i/><i/></span><b>mortusoft<span>.</span></b></Link>
      <div className="cw-facility"><small>FACILITY WORKSPACE</small><strong>{facility?.name || "Set up your facility"}</strong><span>{facility?.county || "No facility linked yet"}</span></div>
      <div className="cw-nav-label">OPERATIONS</div><nav>{navigation.map((item, index) => <button key={item} className={page === item ? "selected" : ""} onClick={() => setPage(item)}><span>{["⌂", "⌕", "▦", "▤", "✓", "◷", "♙", "⚙"][index]}</span>{item}</button>)}</nav>
      <div className="cw-side-bottom"><span className="cw-status-dot"/> Secure facility workspace<a className="signout-link" href="/sign-in" onClick={() => { localStorage.removeItem("mortusoft-demo-session"); }}>Sign out <span>↗</span></a></div>
    </aside>
    <section className="cw-main"><header className="cw-topbar"><span className="cw-breadcrumb">Workspace <i>/</i> {page}</span><div style={{ display: "flex", alignItems: "center", gap: 10 }}><span className="cw-secure"><i/> PRIVATE</span><span className="cw-role">{data?.role?.replaceAll("_", " ") || "Facility administrator"}</span><button type="button" className="cw-topbar-signout" onClick={() => { localStorage.removeItem("mortusoft-demo-session"); window.location.href = "/sign-in"; }}>Sign out</button></div></header>
      <div className="cw-content"><div className="cw-heading"><div><p className="cw-eyebrow">{facility ? `${facility.county} · FACILITY OPERATIONS` : "WELCOME TO MORTUSOFT"}</p><h1>{page === "Overview" ? "Good to have you here" : page}<span>.</span></h1><p>{facility ? `Your ${facility.name} workspace, in one clear view.` : "Create your facility workspace to get started."}</p></div>{page === "Cases" && facility && <button className="cw-primary" onClick={() => setPage("New admission")}>+ Admit a case</button>}</div>
        {error && <div className="cw-alert" role="alert">{error}<button onClick={() => void load()}>Retry</button></div>}{notice && <div className="cw-success">✓ {notice}</div>}
        {!facility ? <section className="cw-panel cw-form-panel"><div className="cw-panel-heading"><div><small>FIRST STEP</small><h2>Set up your facility</h2><p>Your account becomes the facility administrator.</p></div></div><form onSubmit={event => void submit(event, "/api/workspace/facility")} className="cw-form-grid"><label>Facility name<input name="name" required minLength={2} maxLength={120} placeholder="e.g. Nairobi Memorial"/></label><label>Facility type<select name="type"><option>Private mortuary</option><option>Funeral home</option><option>Hospital mortuary</option><option>County / public mortuary</option></select></label><label>County<input name="county" required placeholder="e.g. Nairobi"/></label><label>Case number prefix<input name="prefix" defaultValue="MRT" maxLength={6} pattern="[A-Za-z0-9]{1,6}"/></label><label>Time zone<select name="timezone"><option>Africa/Nairobi</option><option>Africa/Kampala</option></select></label><button className="cw-primary" disabled={busy}>{busy ? "Saving…" : "Create facility"} <span>→</span></button></form></section> : page === "New admission" ? <section className="cw-panel cw-form-panel"><div className="cw-panel-heading"><div><small>CASE MANAGEMENT</small><h2>Admit a case</h2><p>Case numbers are assigned atomically by the facility database.</p></div></div><form onSubmit={event => void submit(event, "/api/workspace/cases", () => setPage("Cases"))} className="cw-form-grid"><label>Deceased person’s name<input name="personName" required minLength={2} maxLength={160}/></label><label>Admission date and time<input name="admissionAt" type="datetime-local" required/></label><label>Identification status<select name="identificationStatus"><option value="identified">Identified</option><option value="unidentified">Unidentified</option><option value="under_review">Under review</option></select></label><label>Next of kin name<input name="kinName"/></label><label>Next of kin phone<input name="kinPhone"/></label><label>Referral source<input name="source" maxLength={160}/></label><label>Age estimate<input name="age" maxLength={30}/></label><label>Sex / description<input name="sex" defaultValue="Not recorded" maxLength={50}/></label><label className="cw-wide">Admission notes<textarea name="notes" maxLength={2000}/></label><button className="cw-primary" disabled={busy}>{busy ? "Saving…" : "Save admission"} <span>→</span></button></form></section> : page === "Overview" ? <>
          <div className="cw-metrics">{[["Active cases", metrics?.activeCases ?? 0, "Currently in facility"], ["Admissions this month", metrics?.monthAdmissions ?? 0, "Recorded this month"], ["Team members", metrics?.teamMembers ?? 0, "Active accounts"], ["Storage in use", `${metrics?.storageOccupied ?? 0} / ${metrics?.storageCapacity ?? 0}`, `${metrics?.storageRooms ?? 0} rooms configured`]].map(([label, value, caption]) => <article key={String(label)}><small>{label}</small><strong>{value}</strong><span>{caption}</span></article>)}</div>
          <section className="cw-panel"><div className="cw-panel-heading"><div><small>FACILITY RECORDS</small><h2>Recent cases</h2><p>Live records visible to your signed-in facility membership.</p></div><button className="cw-text-button" onClick={() => setPage("Cases")}>Open register →</button></div><CaseTable cases={data.cases.slice(0, 6)} date={date} onSelect={(id) => { setSelectedCaseId(id); setPage("Cases"); }}/></section>
        </> : page === "Cases" ? <><section className="cw-panel"><div className="cw-panel-heading"><div><small>CASE MANAGEMENT</small><h2>Case register</h2><p>{caseTotal} facility records · select a case to view its workflow</p></div><button className="cw-primary" onClick={() => setPage("New admission")}>+ Admit a case</button></div><div className="cw-case-toolbar"><input aria-label="Search cases" placeholder="Search case number or person" value={caseQuery} onChange={event => { setCaseQuery(event.target.value); setCasePage(1); }}/><select aria-label="Filter by status" value={caseStatus} onChange={event => { setCaseStatus(event.target.value); setCasePage(1); }}><option value="">All statuses</option><option value="active">Active</option><option value="released">Released</option><option value="closed">Closed</option></select></div><CaseTable cases={caseRows} date={date} onSelect={setSelectedCaseId}/><div className="cw-pagination"><span>Page {casePage} of {Math.max(1, Math.ceil(caseTotal / 50))}</span><button disabled={casePage <= 1} onClick={() => setCasePage(value => value - 1)}>← Previous</button><button disabled={casePage * 50 >= caseTotal} onClick={() => setCasePage(value => value + 1)}>Next →</button></div></section>{selectedCaseId && caseRows.find(item => item.id === selectedCaseId) && <CaseOperations key={selectedCaseId} caseRecord={caseRows.find(item => item.id === selectedCaseId)!}/>}</>
        : page === "Storage" ? <section className="cw-metrics"><article><small>Rooms configured</small><strong>{metrics?.storageRooms ?? 0}</strong><span>Across this facility</span></article><article><small>Slots occupied</small><strong>{metrics?.storageOccupied ?? 0}</strong><span>Current case assignments</span></article><article><small>Total slots</small><strong>{metrics?.storageCapacity ?? 0}</strong><span>Recorded capacity</span></article></section>
        : page === "Billing" ? <><section className="cw-metrics"><article><small>Invoices</small><strong>{metrics?.invoices ?? 0}</strong><span>Facility invoices</span></article><article><small>Collected</small><strong>KSh {((metrics?.collectedMinor ?? 0) / 100).toLocaleString("en-KE")}</strong><span>Recorded payment total</span></article></section><BillingPanel cases={data.cases}/></>
        : page === "Release" ? <><section className="cw-metrics"><article><small>Released cases</small><strong>{metrics?.releases ?? 0}</strong><span>Case lifecycle records</span></article></section><ReleasePanel cases={data.cases.filter(item => item.status === "active")}/></>
        : page === "People" ? <TeamPanel/>
        : page === "Audit" ? <AuditPanel/>
        : <section className="cw-panel cw-coming"><span>✦</span><h2>{page} workspace</h2><p>This area is ready in the navigation. Its production workflow is still part of the remaining Phase 15 integration work.</p></section>}
        <footer className="cw-footer"><span>Mortusoft · {facility?.case_prefix || "MRT"} case series</span><span>Facility scoped · Access controlled</span></footer>
      </div>
    </section>
  </main>;
}

function CaseTable({ cases, date, onSelect }: { cases: WorkspaceData["cases"]; date: (value: string) => string; onSelect?: (id: string) => void }) {
  if (!cases.length) return <div className="cw-empty">No facility cases yet. Use <b>Admit a case</b> to create your first record.</div>;
  return <div className="cw-table-wrap"><table className="cw-table"><thead><tr><th>CASE / PERSON</th><th>ADMITTED</th><th>LOCATION</th><th>IDENTIFICATION</th><th>STATUS</th><th style={{ width: 44 }}></th></tr></thead><tbody>{cases.map(item => <tr key={item.id} onClick={() => onSelect?.(item.id)} className={onSelect ? "cw-clickable-row" : ""}><td><strong>{item.deceased_name}</strong><small>{item.case_number}</small></td><td>{date(item.admission_at)}</td><td>{item.current_location || "Not assigned"}</td><td>{item.identification_status.replaceAll("_", " ")}</td><td><span className={`cw-status cw-${item.status}`}>{item.status}</span></td><td><button type="button" className="cw-row-action" title="View case workflow" aria-label={`View workflow for ${item.case_number}`} onClick={(e) => { e.stopPropagation(); onSelect?.(item.id); }}>→</button></td></tr>)}</tbody></table></div>;
}

type CaseRecord = WorkspaceData["cases"][number];

function CaseOperations({ caseRecord }: { caseRecord: CaseRecord }) {
  const [movements, setMovements] = useState<Array<{ id: string; from_location: string | null; to_location: string; reason: string; moved_at: string }>>([]);
  const [documents, setDocuments] = useState<Array<{ id: string; original_name: string; category: string; uploaded_at: string; signedUrl: string | null }>>([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const endpoint = `/api/workspace/cases/${caseRecord.id}`;
  const load = useCallback(async () => {
    const [movementResponse, documentResponse] = await Promise.all([fetch(`${endpoint}/movements`), fetch(`${endpoint}/documents`)]);
    const [movementData, documentData] = await Promise.all([movementResponse.json(), documentResponse.json()]);
    setMovements(movementData.movements ?? []); setDocuments(documentData.documents ?? []);
    if (!movementResponse.ok) setMessage(movementData.error || "Movement history unavailable.");
    else if (!documentResponse.ok) setMessage(documentData.error || "Documents unavailable.");
  }, [endpoint]);
  useEffect(() => { void load(); }, [load]);
  async function move(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage("");
    const form = event.currentTarget;
    try { const response = await fetch(`${endpoint}/movements`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(new FormData(form))) }); const result = await response.json(); if (!response.ok) throw new Error(result.error); form.reset(); setMessage("Movement recorded."); await load(); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Movement could not be saved."); } finally { setBusy(false); }
  }
  async function upload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage("");
    const form = event.currentTarget;
    try { const response = await fetch(`${endpoint}/documents`, { method: "POST", body: new FormData(form) }); const result = await response.json(); if (!response.ok) throw new Error(result.error); form.reset(); setMessage("Document stored in private case storage."); await load(); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Document upload failed."); } finally { setBusy(false); }
  }
  return <section className="cw-panel cw-operations"><div className="cw-panel-heading"><div><small>CASE WORKFLOW</small><h2>{caseRecord.case_number} · {caseRecord.deceased_name}</h2><p>Movement tracking and private case documents</p></div><button className="cw-text-button" onClick={() => void load()}>Refresh ↻</button></div>
    {message && <p className="cw-inline-message">{message}</p>}
    <div className="cw-operation-grid"><div><h3>Record a movement</h3><form className="cw-compact-form" onSubmit={event => void move(event)}><label>New location<input name="toLocation" required minLength={2} maxLength={120} placeholder="e.g. Cold room A · Bay 04"/></label><label>Reason<input name="reason" required minLength={3} maxLength={240} placeholder="Reason for transfer"/></label><button className="cw-primary" disabled={busy || caseRecord.status !== "active"}>{busy ? "Saving…" : "Record move"} <span>→</span></button></form><div className="cw-mini-list">{movements.map(item => <article key={item.id}><b>{item.from_location || "Facility intake"} → {item.to_location}</b><small>{item.reason} · {new Date(item.moved_at).toLocaleString("en-KE")}</small></article>)}{!movements.length && <p>No movements recorded.</p>}</div></div>
      <div><h3>Case documents</h3><form className="cw-compact-form" onSubmit={event => void upload(event)}><label>Document category<select name="category"><option>Supporting document</option><option>Release form</option><option>Identification</option><option>Authority clearance</option><option>Family authorization</option></select></label><label>PDF, PNG, or JPEG · up to 5 MB<input name="file" type="file" accept="application/pdf,image/png,image/jpeg" required/></label><button className="cw-primary" disabled={busy}>{busy ? "Uploading…" : "Upload privately"} <span>↑</span></button></form><div className="cw-mini-list">{documents.map(item => <article key={item.id}><b>{item.category}</b><small>{item.original_name} · {new Date(item.uploaded_at).toLocaleDateString("en-KE")}</small>{item.signedUrl && <a href={item.signedUrl} target="_blank" rel="noreferrer">Open secure link ↗</a>}</article>)}{!documents.length && <p>No documents attached.</p>}</div></div>
    </div>
  </section>;
}

const releaseChecks = [
  ["identityVerified", "Identity verified", false], ["documentsComplete", "Required supporting documents complete", false],
  ["authorityClearance", "Authority / postmortem clearance", true], ["familyAuthorization", "Family authorization", true],
  ["financialClearance", "Financial requirements checked", true], ["recipientVerified", "Recipient identity verified", false],
  ["releaseFormComplete", "Release form completed and attached", false], ["finalAuthorization", "Final release authorization", false],
] as const;

function ReleasePanel({ cases }: { cases: CaseRecord[] }) {
  const [caseId, setCaseId] = useState(cases[0]?.id ?? "");
  const [checks, setChecks] = useState<Record<string, { state: string; reason: string }>>({});
  const [docs, setDocs] = useState<Array<{ category: string }>>([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const chosen = cases.find(item => item.id === caseId);
  const load = useCallback(async () => {
    if (!caseId) { setChecks({}); return; }
    const [checkResponse, docResponse] = await Promise.all([fetch(`/api/workspace/cases/${caseId}/release-checks`), fetch(`/api/workspace/cases/${caseId}/documents`)]);
    const [checkData, docData] = await Promise.all([checkResponse.json(), docResponse.json()]);
    setChecks(Object.fromEntries((checkData.checks ?? []).map((item: { check_key: string; state: string; reason: string | null }) => [item.check_key, { state: item.state, reason: item.reason ?? "" }])));
    setDocs(docData.documents ?? []);
  }, [caseId]);
  useEffect(() => { void load(); }, [load]);
  async function saveCheck(key: string) {
    const value = checks[key] ?? { state: "pending", reason: "" };
    const response = await fetch(`/api/workspace/cases/${caseId}/release-checks`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key, ...value }) });
    const result = await response.json(); if (!response.ok) throw new Error(result.error);
    setMessage("Release check saved."); await load();
  }
  async function authorize(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage("");
    try { const response = await fetch(`/api/workspace/cases/${caseId}/release`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))) }); const result = await response.json(); if (!response.ok) throw new Error(result.error); setMessage(`${chosen?.case_number} release recorded.`); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Release could not be authorized."); } finally { setBusy(false); }
  }
  if (!cases.length) return <section className="cw-panel cw-empty">No active cases are available for release clearance.</section>;
  return <section className="cw-panel cw-release-panel"><div className="cw-panel-heading"><div><small>CONTROLLED HANDOVER</small><h2>Release clearance</h2><p>Complete every required check before authorizing a handover.</p></div><select aria-label="Select case" value={caseId} onChange={event => { setCaseId(event.target.value); setMessage(""); }} className="cw-case-select">{cases.map(item => <option value={item.id} key={item.id}>{item.case_number} · {item.deceased_name}</option>)}</select></div>
    {message && <p className="cw-inline-message">{message}</p>}
    <div className="cw-check-list">{releaseChecks.map(([key, label, canWaive]) => { const value = checks[key] ?? { state: "pending", reason: "" }; return <div key={key} className="cw-check-row"><span className="cw-check-label"><b>{label}</b><small>{canWaive ? "Not applicable requires a reason." : "Required before handover."}</small></span><select value={value.state} onChange={event => setChecks(old => ({ ...old, [key]: { ...value, state: event.target.value } }))}><option value="pending">Pending</option><option value="complete">Complete</option>{canWaive && <option value="not_applicable">Not applicable</option>}</select>{value.state === "not_applicable" && <input placeholder="Reason" value={value.reason} onChange={event => setChecks(old => ({ ...old, [key]: { ...value, reason: event.target.value } }))}/>}<button className="cw-small-save" onClick={() => void saveCheck(key).catch(error => setMessage(error.message))}>Save</button></div>; })}</div>
    <div className="cw-release-doc-note">Release form attachment: {docs.some(doc => doc.category.toLowerCase() === "release form") ? <b>Attached</b> : <b className="cw-doc-missing">Missing · attach it in the selected case workflow</b>}</div>
    <form onSubmit={event => void authorize(event)} className="cw-form-grid cw-handover-form"><label>Recipient name<input name="recipient" required minLength={2} maxLength={160}/></label><label>Relationship / authority<input name="relationship" required minLength={2} maxLength={80}/></label><label>Identity or authorization reference<input name="idReference" required minLength={3} maxLength={80}/></label><button className="cw-primary" disabled={busy}>{busy ? "Authorizing…" : "Authorize handover"} <span>→</span></button></form>
  </section>;
}

function TeamPanel() {
  const [members, setMembers] = useState<Array<{ user_id: string; role: string; status: string; created_at: string }>>([]);
  const [canManage, setCanManage] = useState(false); const [message, setMessage] = useState("");
  const load = useCallback(async () => { const response = await fetch("/api/workspace/team"); const data = await response.json(); if (!response.ok) { setMessage(data.error); return; } setMembers(data.members); setCanManage(data.canManage); }, []);
  useEffect(() => { void load(); }, [load]);
  async function update(userId: string, changes: Record<string, string>) { setMessage(""); const response = await fetch("/api/workspace/team", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId, ...changes }) }); const data = await response.json(); if (!response.ok) { setMessage(data.error); return; } setMessage("Team access updated."); await load(); }
  const roles = ["facility_admin", "mortuary_manager", "mortuary_attendant", "embalming_staff", "reception", "finance", "funeral_coordinator", "driver", "auditor"];
  return <section className="cw-panel"><div className="cw-panel-heading"><div><small>FACILITY ACCESS</small><h2>People & permissions</h2><p>Membership roles are enforced by facility row-level policies.</p></div></div>{message && <p className="cw-inline-message">{message}</p>}<div className="cw-team-list">{members.map(member => <article key={member.user_id}><div><b>{member.user_id.slice(0, 8)}…</b><small>Added {new Date(member.created_at).toLocaleDateString("en-KE")}</small></div>{canManage ? <><select value={member.role} onChange={event => void update(member.user_id, { role: event.target.value })}>{roles.map(role => <option key={role} value={role}>{role.replaceAll("_", " ")}</option>)}</select><button className="cw-small-save" onClick={() => void update(member.user_id, { status: member.status === "active" ? "suspended" : "active" })}>{member.status === "active" ? "Suspend" : "Reactivate"}</button></> : <span className="cw-status cw-active">{member.role.replaceAll("_", " ")}</span>}<span className={member.status === "active" ? "cw-member-active" : "cw-member-suspended"}>{member.status}</span></article>)}</div><p className="cw-footnote">Inviting new accounts requires a configured email provider and administrator invite flow; this panel manages existing facility memberships.</p></section>;
}

function AuditPanel() {
  const [events, setEvents] = useState<Array<{ id: number; actor_id: string | null; action: string; entity_table: string; case_number: string | null; changed_fields: string[]; occurred_at: string }>>([]);
  const [message, setMessage] = useState("");
  const load = useCallback(async () => { const response = await fetch("/api/workspace/audit"); const data = await response.json(); if (!response.ok) { setMessage(data.error); return; } setEvents(data.events); setMessage(""); }, []);
  useEffect(() => { void load(); }, [load]);
  return <section className="cw-panel"><div className="cw-panel-heading"><div><small>GOVERNANCE & TRACEABILITY</small><h2>Audit activity</h2><p>Metadata only · accessible to facility administrators and auditors.</p></div><button className="cw-text-button" onClick={() => void load()}>Refresh ↻</button></div>{message && <p className="cw-inline-message">{message}</p>}{!events.length && !message ? <div className="cw-empty">No audit activity recorded yet.</div> : <div className="cw-audit-list">{events.map(item => <article key={item.id}><span className="cw-audit-dot"/><div><b>{item.action} · {item.entity_table}</b><small>{item.case_number || "Facility record"} · {item.changed_fields.join(", ") || "record created"}</small><small>{new Date(item.occurred_at).toLocaleString("en-KE")} · {item.actor_id ? `User ${item.actor_id.slice(0, 8)}…` : "System"}</small></div></article>)}</div>}</section>;
}

type InvoiceRecord = { id: string; invoice_number: string; case_id: string; currency: string; status: string; created_at: string; case: { case_number: string; deceased_name: string } | null; lines: Array<{ description: string; amount_minor: number }>; payments: Array<{ amount_minor: number; method: string; reference: string | null; paid_at: string }>; totalMinor: number; paidMinor: number; dueMinor: number };

function BillingPanel({ cases }: { cases: CaseRecord[] }) {
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [message, setMessage] = useState(""); const [busy, setBusy] = useState(false);
  const [paymentInvoice, setPaymentInvoice] = useState("");
  const load = useCallback(async () => { const response = await fetch("/api/workspace/billing"); const data = await response.json(); if (!response.ok) { setMessage(data.error); return; } setInvoices(data.invoices); setMessage(""); }, []);
  useEffect(() => { void load(); }, [load]);
  async function save(event: FormEvent<HTMLFormElement>, action: "create" | "payment") {
    event.preventDefault(); setBusy(true); setMessage(""); const form = event.currentTarget;
    try { const response = await fetch("/api/workspace/billing", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, ...Object.fromEntries(new FormData(form)) }) }); const data = await response.json(); if (!response.ok) throw new Error(data.error); form.reset(); setMessage(action === "create" ? "Invoice issued." : "Payment record saved."); await load(); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Billing update failed."); } finally { setBusy(false); }
  }
  const openInvoices = invoices.filter(invoice => invoice.status === "issued" && invoice.dueMinor > 0);
  return <section className="cw-panel"><div className="cw-panel-heading"><div><small>FACILITY FINANCE</small><h2>Invoices & payment records</h2><p>Manual accounting entries · no payment gateway is connected.</p></div><button className="cw-text-button" onClick={() => void load()}>Refresh ↻</button></div>{message && <p className="cw-inline-message">{message}</p>}
    <div className="cw-operation-grid"><div><h3>Issue an invoice</h3><form className="cw-compact-form" onSubmit={event => void save(event, "create")}><label>Case<select name="caseId" required defaultValue=""><option value="" disabled>Select case</option>{cases.map(item => <option key={item.id} value={item.id}>{item.case_number} · {item.deceased_name}</option>)}</select></label><label>Service / charge<input name="description" required minLength={2} maxLength={160}/></label><label>Amount (KSh)<input name="amount" type="number" min="0.01" step="0.01" required/></label><button className="cw-primary" disabled={busy}>{busy ? "Saving…" : "Issue invoice"} <span>→</span></button></form></div>
      <div><h3>Record a payment received</h3><form className="cw-compact-form" onSubmit={event => void save(event, "payment")}><label>Unpaid invoice<select name="invoiceId" required value={paymentInvoice} onChange={event => setPaymentInvoice(event.target.value)}><option value="" disabled>Select invoice</option>{openInvoices.map(item => <option key={item.id} value={item.id}>{item.invoice_number} · due KSh {(item.dueMinor / 100).toLocaleString("en-KE")}</option>)}</select></label><label>Amount received (KSh)<input name="amount" type="number" min="0.01" step="0.01" required/></label><label>Payment method<select name="method"><option>Cash</option><option>Bank transfer</option><option>M-Pesa · manual record</option><option>Card · manual record</option><option>Other</option></select></label><label>Reference (helps prevent duplicate entry)<input name="reference" maxLength={120}/></label><button className="cw-primary" disabled={busy || !openInvoices.length}>{busy ? "Saving…" : "Record payment"} <span>→</span></button></form></div></div>
    <div className="cw-invoice-list">{invoices.map(invoice => <article key={invoice.id}><div><b>{invoice.invoice_number}</b><small>{invoice.case?.case_number || "Case"} · {invoice.case?.deceased_name || "Record"} · {invoice.lines.map(line => line.description).join(", ")}</small></div><span>Total<br/><b>KSh {(invoice.totalMinor / 100).toLocaleString("en-KE")}</b></span><span>Paid<br/><b>KSh {(invoice.paidMinor / 100).toLocaleString("en-KE")}</b></span><span>Due<br/><b>KSh {(invoice.dueMinor / 100).toLocaleString("en-KE")}</b></span><span className={`cw-status ${invoice.dueMinor === 0 ? "cw-active" : "cw-pending"}`}>{invoice.dueMinor === 0 ? "Paid" : invoice.status}</span></article>)}{!invoices.length && <div className="cw-empty">No invoices have been issued.</div>}</div>
  </section>;
}

