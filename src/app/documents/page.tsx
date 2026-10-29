"use client";

import { useState } from "react";
import AuthGate from "../components/AuthGate";
import AppShell from "../components/AppShell";
import Icon from "../components/Icon";

type DocItem = {
  id: string;
  title: string;
  caseId: string;
  personName: string;
  category: "Burial Permit" | "Death Certificate" | "Police Abstract" | "Next of Kin ID" | "Transfer Permit";
  date: string;
  fileSize: string;
  status: "Verified" | "Pending" | "Action Required";
};

const initialDocs: DocItem[] = [
  { id: "DOC-101", title: "Burial_Permit_NBI_0942.pdf", caseId: "MRT-00458", personName: "Grace Wanjiku", category: "Burial Permit", date: "20 Oct 2026", fileSize: "1.4 MB", status: "Verified" },
  { id: "DOC-102", title: "Medical_Death_Certificate.pdf", caseId: "MRT-00457", personName: "Peter Mwangi", category: "Death Certificate", date: "20 Oct 2026", fileSize: "820 KB", status: "Pending" },
  { id: "DOC-103", title: "Police_Report_OB45_2026.pdf", caseId: "MRT-00456", personName: "Unidentified · Case 56", category: "Police Abstract", date: "19 Oct 2026", fileSize: "2.1 MB", status: "Action Required" },
  { id: "DOC-104", title: "Next_Of_Kin_National_ID.pdf", caseId: "MRT-00455", personName: "Josephine Achieng", category: "Next of Kin ID", date: "19 Oct 2026", fileSize: "540 KB", status: "Verified" },
  { id: "DOC-105", title: "County_Transfer_Clearance.pdf", caseId: "MRT-00454", personName: "Samuel Kiprop", category: "Transfer Permit", date: "18 Oct 2026", fileSize: "1.1 MB", status: "Verified" },
  { id: "DOC-106", title: "Burial_Authorization_Signed.pdf", caseId: "MRT-00453", personName: "Daniel Otieno", category: "Burial Permit", date: "17 Oct 2026", fileSize: "960 KB", status: "Verified" },
];

export default function DocumentsPage() {
  const [docs, setDocs] = useState<DocItem[]>(initialDocs);
  const [query, setQuery] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [showUpload, setShowUpload] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<DocItem | null>(null);

  // Upload Form
  const [uploadCase, setUploadCase] = useState("MRT-00458");
  const [uploadCat, setUploadCat] = useState<DocItem["category"]>("Burial Permit");
  const [uploadFile, setUploadFile] = useState("");

  const filtered = docs.filter((d) => {
    const textMatch = `${d.title} ${d.caseId} ${d.personName}`.toLowerCase().includes(query.toLowerCase());
    const catMatch = catFilter === "All" || d.category === catFilter;
    return textMatch && catMatch;
  });

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;

    const newDoc: DocItem = {
      id: `DOC-${100 + docs.length + 1}`,
      title: uploadFile,
      caseId: uploadCase,
      personName: uploadCase === "MRT-00458" ? "Grace Wanjiku" : "Peter Mwangi",
      category: uploadCat,
      date: "Today, Just now",
      fileSize: "1.2 MB",
      status: "Verified",
    };

    setDocs([newDoc, ...docs]);
    setShowUpload(false);
    setUploadFile("");
  };

  return (
    <AuthGate>
      <AppShell active="Documents">
        <div className="page-heading">
          <div>
            <p className="eyebrow">CASE RECORDS <span>·</span> COMPLIANCE & LEGAL CLEARANCES</p>
            <h1>Documents & Permits<span>.</span></h1>
            <p className="heading-subtitle">Centralized custody of burial permits, medical death certificates, and police transfer abstracts.</p>
          </div>
          <button className="primary-button" onClick={() => setShowUpload(true)}>
            <Icon name="plus" size={17} /> Upload document
          </button>
        </div>

        {/* Metrics Row */}
        <section className="metrics-grid" style={{ marginBottom: 20 }}>
          <article className="metric-card">
            <div className="metric-top">
              <span className="metric-label">Total Documents</span>
              <span className="metric-icon metric-icon-indigo"><Icon name="file" size={17} /></span>
            </div>
            <div className="metric-value">{docs.length}</div>
            <div className="metric-foot"><span>Safely encrypted in vault</span></div>
          </article>

          <article className="metric-card">
            <div className="metric-top">
              <span className="metric-label">Verified Clearances</span>
              <span className="metric-icon metric-icon-teal"><Icon name="check" size={17} /></span>
            </div>
            <div className="metric-value">{docs.filter((d) => d.status === "Verified").length}</div>
            <div className="metric-foot"><span className="trend trend-up">Ready for release</span></div>
          </article>

          <article className="metric-card">
            <div className="metric-top">
              <span className="metric-label">Pending Verification</span>
              <span className="metric-icon metric-icon-amber"><Icon name="clock" size={17} /></span>
            </div>
            <div className="metric-value">{docs.filter((d) => d.status === "Pending").length}</div>
            <div className="metric-foot"><span>Awaiting registrar review</span></div>
          </article>

          <article className="metric-card">
            <div className="metric-top">
              <span className="metric-label">Action Required</span>
              <span className="metric-icon metric-icon-blue"><Icon name="folder" size={17} /></span>
            </div>
            <div className="metric-value">{docs.filter((d) => d.status === "Action Required").length}</div>
            <div className="metric-foot"><span className="trend trend-up">Follow-up with authorities</span></div>
          </article>
        </section>

        {/* Documents Table */}
        <section className="panel cases-panel">
          <div className="panel-heading cases-heading">
            <div>
              <div className="panel-title-row">
                <h2>Document Archive</h2>
                <span className="count-pill">{filtered.length} documents</span>
              </div>
              <p>All attachments are linked directly to facility case numbers and audit logs.</p>
            </div>
          </div>

          <div className="table-toolbar" style={{ flexWrap: "wrap", gap: 12 }}>
            <label className="search-box">
              <Icon name="search" size={15} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search file name, case ID, or person..."
                aria-label="Search documents"
              />
            </label>

            <select
              value={catFilter}
              onChange={(e) => setCatFilter(e.target.value)}
              style={{
                height: 40,
                padding: "0 12px",
                borderRadius: 8,
                border: "1px solid var(--line)",
                background: "#ffffff",
                color: "var(--ink)",
                fontSize: 13,
                fontWeight: 600
              }}
            >
              <option value="All">All Categories</option>
              <option value="Burial Permit">Burial Permits</option>
              <option value="Death Certificate">Death Certificates</option>
              <option value="Police Abstract">Police Abstracts</option>
              <option value="Next of Kin ID">Next of Kin ID</option>
              <option value="Transfer Permit">Transfer Permits</option>
            </select>
          </div>

          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>DOCUMENT NAME</th>
                  <th>LINKED CASE</th>
                  <th>CATEGORY</th>
                  <th>UPLOAD DATE</th>
                  <th>STATUS</th>
                  <th style={{ width: 80 }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((doc) => (
                  <tr key={doc.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 6, background: "var(--sand-light)", color: "var(--palette-steel)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Icon name="file" size={16} />
                        </div>
                        <div>
                          <strong style={{ fontSize: 13.5, color: "var(--ink)", display: "block" }}>{doc.title}</strong>
                          <small style={{ fontSize: 11, color: "var(--muted)" }}>{doc.fileSize}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <strong style={{ fontSize: 13, color: "var(--palette-steel)" }}>{doc.caseId}</strong>
                      <small style={{ display: "block", color: "var(--muted)", fontSize: 11.5 }}>{doc.personName}</small>
                    </td>
                    <td>
                      <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink)" }}>{doc.category}</span>
                    </td>
                    <td className="date-cell">{doc.date}</td>
                    <td>
                      <span className={`case-status status-${doc.status === "Verified" ? "active" : doc.status === "Pending" ? "pending" : "review"}`}>
                        <i /> {doc.status}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => setPreviewDoc(doc)}
                        style={{
                          background: "transparent",
                          border: "1px solid var(--line)",
                          borderRadius: 6,
                          padding: "5px 10px",
                          fontSize: 12,
                          fontWeight: 700,
                          color: "var(--palette-steel)",
                          cursor: "pointer"
                        }}
                      >
                        Preview
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Document Preview Modal */}
        {previewDoc && (
          <div
            className="modal-shade"
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(7, 23, 57, 0.5)",
              backdropFilter: "blur(3px)",
              zIndex: 60,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 20
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setPreviewDoc(null);
            }}
          >
            <div style={{ background: "#ffffff", borderRadius: 12, maxWidth: 480, width: "100%", padding: 24, boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div>
                  <span className="count-pill">{previewDoc.category}</span>
                  <h3 style={{ margin: "6px 0 0", fontSize: 17, color: "var(--ink)" }}>{previewDoc.title}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewDoc(null)}
                  style={{ background: "#F5EFEB", border: 0, borderRadius: "50%", width: 30, height: 30, cursor: "pointer" }}
                >
                  <Icon name="close" size={15} />
                </button>
              </div>

              <div style={{ padding: 18, background: "#FAF8F5", borderRadius: 8, fontSize: 13, lineHeight: 1.6, marginBottom: 18 }}>
                <div><b>Linked Case:</b> {previewDoc.caseId} ({previewDoc.personName})</div>
                <div><b>File Size:</b> {previewDoc.fileSize}</div>
                <div><b>Date Uploaded:</b> {previewDoc.date}</div>
                <div><b>Verification Status:</b> {previewDoc.status}</div>
                <div style={{ marginTop: 8, color: "var(--muted)" }}>
                  Document cryptographic checksum matches digital archive record.
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button type="button" className="subtle-button" onClick={() => setPreviewDoc(null)}>Close</button>
                <button type="button" className="primary-button" onClick={() => alert("Downloading secure file: " + previewDoc.title)}>
                  Download PDF
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Upload Modal */}
        {showUpload && (
          <div
            className="modal-shade"
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(7, 23, 57, 0.5)",
              backdropFilter: "blur(3px)",
              zIndex: 60,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 20
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowUpload(false);
            }}
          >
            <div style={{ background: "#ffffff", borderRadius: 12, maxWidth: 500, width: "100%", padding: 26, boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div>
                  <p className="eyebrow" style={{ margin: 0 }}>SECURITY VAULT</p>
                  <h3 style={{ margin: "4px 0 0", fontSize: 18, color: "var(--ink)" }}>Upload Case Document</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowUpload(false)}
                  style={{ background: "#F5EFEB", border: 0, borderRadius: "50%", width: 30, height: 30, cursor: "pointer" }}
                >
                  <Icon name="close" size={15} />
                </button>
              </div>

              <form onSubmit={handleUpload} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <label style={{ display: "flex", flexDirection: "column", gap: 5, fontSize: 13, fontWeight: 700 }}>
                  Associated Case
                  <select
                    value={uploadCase}
                    onChange={(e) => setUploadCase(e.target.value)}
                    style={{ height: 40, borderRadius: 8, border: "1px solid var(--line)", padding: "0 10px", fontSize: 13 }}
                  >
                    <option value="MRT-00458">MRT-00458 · Grace Wanjiku</option>
                    <option value="MRT-00457">MRT-00457 · Peter Mwangi</option>
                    <option value="MRT-00456">MRT-00456 · Unidentified Case 56</option>
                    <option value="MRT-00455">MRT-00455 · Josephine Achieng</option>
                  </select>
                </label>

                <label style={{ display: "flex", flexDirection: "column", gap: 5, fontSize: 13, fontWeight: 700 }}>
                  Document Category
                  <select
                    value={uploadCat}
                    onChange={(e) => setUploadCat(e.target.value as DocItem["category"])}
                    style={{ height: 40, borderRadius: 8, border: "1px solid var(--line)", padding: "0 10px", fontSize: 13 }}
                  >
                    <option value="Burial Permit">Burial Permit</option>
                    <option value="Death Certificate">Medical Certificate of Death</option>
                    <option value="Police Abstract">Police Abstract / Clearance</option>
                    <option value="Next of Kin ID">Next of Kin National ID</option>
                    <option value="Transfer Permit">Transfer Permit</option>
                  </select>
                </label>

                <label style={{ display: "flex", flexDirection: "column", gap: 5, fontSize: 13, fontWeight: 700 }}>
                  File Name / Scan Reference
                  <input
                    required
                    placeholder="e.g. Burial_Permit_Signed_Scan.pdf"
                    value={uploadFile}
                    onChange={(e) => setUploadFile(e.target.value)}
                    style={{ height: 40, borderRadius: 8, border: "1px solid var(--line)", padding: "0 12px", fontSize: 13.5 }}
                  />
                </label>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
                  <button type="button" className="subtle-button" onClick={() => setShowUpload(false)}>Cancel</button>
                  <button type="submit" className="primary-button">Upload & Verify</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </AppShell>
    </AuthGate>
  );
}
