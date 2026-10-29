"use client";

import { useState } from "react";
import AuthGate from "../components/AuthGate";
import AppShell from "../components/AppShell";
import Icon from "../components/Icon";

export default function ReportsPage() {
  const [range, setRange] = useState("Last 30 days");
  const [downloadNotice, setDownloadNotice] = useState("");

  const handleExport = (format: string) => {
    setDownloadNotice(`Generating ${format} audit report for ${range}...`);
    setTimeout(() => {
      setDownloadNotice(`✓ Mortusoft_Facility_Report_${range.replaceAll(" ", "_")}.${format.toLowerCase()} downloaded.`);
      setTimeout(() => setDownloadNotice(""), 4000);
    }, 800);
  };

  return (
    <AuthGate>
      <AppShell active="Reports">
        <div className="page-heading">
          <div>
            <p className="eyebrow">OPERATIONAL ANALYTICS <span>·</span> STATUTORY & COMPLIANCE</p>
            <h1>Reports & Intelligence<span>.</span></h1>
            <p className="heading-subtitle">Audit-grade records, admission demographics, chamber utilization, and Ministry of Health compliance exports.</p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="select-button" onClick={() => handleExport("CSV")}>
              Export CSV
            </button>
            <button className="primary-button" onClick={() => handleExport("PDF")}>
              <Icon name="download" size={16} /> Export PDF Audit
            </button>
          </div>
        </div>

        {downloadNotice && (
          <div className="notice-strip" style={{ marginBottom: 16 }}>
            <span className="notice-icon"><Icon name="check" size={14} /></span>
            <span>{downloadNotice}</span>
          </div>
        )}

        {/* Date Filter Bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", gap: 8 }}>
            {["Last 7 days", "Last 30 days", "This Quarter", "Year to Date"].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRange(r)}
                style={{
                  padding: "6px 14px",
                  borderRadius: 8,
                  border: range === r ? "1px solid #A68868" : "1px solid var(--line)",
                  background: range === r ? "#FAF8F5" : "#ffffff",
                  color: range === r ? "#A68868" : "var(--palette-steel)",
                  fontWeight: 700,
                  fontSize: 12.5,
                  cursor: "pointer"
                }}
              >
                {r}
              </button>
            ))}
          </div>
          <span style={{ fontSize: 12.5, color: "var(--muted)" }}>
            Reporting Period: <b>1 Oct 2026 - 29 Oct 2026</b>
          </span>
        </div>

        {/* Analytics KPIs */}
        <section className="metrics-grid" style={{ marginBottom: 20 }}>
          <article className="metric-card">
            <div className="metric-top">
              <span className="metric-label">Total Admissions</span>
              <span className="metric-icon metric-icon-indigo"><Icon name="folder" size={17} /></span>
            </div>
            <div className="metric-value">42</div>
            <div className="metric-foot"><span className="trend trend-up">↑ 12% vs prior period</span></div>
          </article>

          <article className="metric-card">
            <div className="metric-top">
              <span className="metric-label">Completed Releases</span>
              <span className="metric-icon metric-icon-teal"><Icon name="check" size={17} /></span>
            </div>
            <div className="metric-value">36</div>
            <div className="metric-foot"><span className="trend trend-up">↑ 8% vs prior period</span></div>
          </article>

          <article className="metric-card">
            <div className="metric-top">
              <span className="metric-label">Average Stay</span>
              <span className="metric-icon metric-icon-amber"><Icon name="clock" size={17} /></span>
            </div>
            <div className="metric-value" style={{ fontSize: 22 }}>4.6 Days</div>
            <div className="metric-foot"><span className="trend trend-up">↓ 0.4 days turnaround</span></div>
          </article>

          <article className="metric-card">
            <div className="metric-top">
              <span className="metric-label">Gross Revenue</span>
              <span className="metric-icon metric-icon-blue"><Icon name="receipt" size={17} /></span>
            </div>
            <div className="metric-value" style={{ fontSize: 20 }}>KSh 1.42M</div>
            <div className="metric-foot"><span className="trend trend-up">↑ 15% revenue growth</span></div>
          </article>
        </section>

        {/* Detailed Breakdown Grids */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: 20, marginBottom: 24 }}>
          {/* Referral Source Breakdown */}
          <section className="panel" style={{ padding: 22 }}>
            <div className="panel-heading" style={{ marginBottom: 14 }}>
              <div>
                <h2>Intake & Referral Sources</h2>
                <p>Distribution of intake origin across this facility</p>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                { label: "Hospital / Healthcare transfers", count: 24, pct: 57, color: "#4B6382" },
                { label: "Police / Medico-legal referrals", count: 9, pct: 21, color: "#A68868" },
                { label: "Direct family intake", count: 7, pct: 17, color: "#558B84" },
                { label: "Inter-county transfer", count: 2, pct: 5, color: "#8E86F4" },
              ].map((src) => (
                <div key={src.label}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 5 }}>
                    <span style={{ fontWeight: 600, color: "var(--ink)" }}>{src.label}</span>
                    <span style={{ fontWeight: 700, color: "var(--palette-steel)" }}>{src.count} cases ({src.pct}%)</span>
                  </div>
                  <div style={{ height: 6, background: "var(--line)", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ width: `${src.pct}%`, height: "100%", background: src.color, borderRadius: 3 }} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Chamber Occupancy Efficiency */}
          <section className="panel" style={{ padding: 22 }}>
            <div className="panel-heading" style={{ marginBottom: 14 }}>
              <div>
                <h2>Chamber Turnover & Capacity</h2>
                <p>Utilization benchmarks for statutory facility inspection</p>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                { label: "Cold Room A (General Capacity)", occupied: 26, total: 32, pct: 82 },
                { label: "Cold Room B (Standard Preservation)", occupied: 30, total: 40, pct: 75 },
                { label: "Cold Room C (Private Holding)", occupied: 20, total: 24, pct: 83 },
              ].map((rm) => (
                <div key={rm.label}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 5 }}>
                    <span style={{ fontWeight: 600, color: "var(--ink)" }}>{rm.label}</span>
                    <span style={{ fontWeight: 700, color: rm.pct > 80 ? "#A68868" : "#2D7D46" }}>
                      {rm.occupied} / {rm.total} ({rm.pct}%)
                    </span>
                  </div>
                  <div style={{ height: 6, background: "var(--line)", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ width: `${rm.pct}%`, height: "100%", background: rm.pct > 80 ? "#A68868" : "#4B6382", borderRadius: 3 }} />
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 22, padding: "12px 14px", background: "var(--sand-light)", borderRadius: 8, fontSize: 12.5, color: "var(--ink)" }}>
              <strong>MOH Compliance Note:</strong> All cold rooms maintain refrigeration telemetry within the required +2.0°C to +4.0°C statutory threshold.
            </div>
          </section>
        </div>

        {/* Statutory Log Table */}
        <section className="panel cases-panel">
          <div className="panel-heading cases-heading">
            <div>
              <div className="panel-title-row">
                <h2>Statutory Audit Trail</h2>
                <span className="count-pill">Audited</span>
              </div>
              <p>Certified chronological ledger for County Health Department review.</p>
            </div>
          </div>

          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>DATE & TIME</th>
                  <th>TRANSACTION</th>
                  <th>CASE / REFERENCE</th>
                  <th>AUTHORIZED BY</th>
                  <th>VERIFICATION HASH</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { time: "20 Oct 2026, 10:15", action: "Admission Confirmed", ref: "MRT-00458 (Grace Wanjiku)", user: "Angela Muthoni", hash: "SHA256: 4f98...e1a0" },
                  { time: "20 Oct 2026, 09:30", action: "Handover Authorized", ref: "MRT-00453 (Daniel Otieno)", user: "Angela Muthoni", hash: "SHA256: 8c12...33b9" },
                  { time: "19 Oct 2026, 17:00", action: "Police Intake Logged", ref: "MRT-00456 (Case 56)", user: "David Kamau", hash: "SHA256: 11a4...99fd" },
                  { time: "19 Oct 2026, 14:30", action: "Chamber Transfer", ref: "MRT-00455 (Josephine Achieng)", user: "David Kamau", hash: "SHA256: bc70...55e2" },
                ].map((row, idx) => (
                  <tr key={idx}>
                    <td className="date-cell">{row.time}</td>
                    <td><strong style={{ color: "var(--ink)" }}>{row.action}</strong></td>
                    <td><span style={{ color: "var(--palette-steel)", fontWeight: 600 }}>{row.ref}</span></td>
                    <td>{row.user}</td>
                    <td><code style={{ fontSize: 11, background: "rgba(75, 99, 130, 0.08)", padding: "2px 6px", borderRadius: 4 }}>{row.hash}</code></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </AppShell>
    </AuthGate>
  );
}
