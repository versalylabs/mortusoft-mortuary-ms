"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AuthGate from "./components/AuthGate";
import AppShell from "./components/AppShell";
import Icon from "./components/Icon";
import ConnectedWorkspace from "./ConnectedWorkspace";
import { hasNeonConfig } from "@/lib/neon/config";

const cases = [
  { id: "MRT-00458", name: "Grace Wanjiku", initials: "GW", color: "rose" as const, date: "Today, 09:42", location: "Cold Room A · 12", status: "Active" },
  { id: "MRT-00457", name: "Peter Mwangi", initials: "PM", color: "blue" as const, date: "Today, 08:16", location: "Cold Room B · 04", status: "Pending" },
  { id: "MRT-00456", name: "Unidentified · Case 56", initials: "UC", color: "violet" as const, date: "Yesterday, 16:30", location: "Cold Room A · 08", status: "Review" },
  { id: "MRT-00455", name: "Josephine Achieng", initials: "JA", color: "amber" as const, date: "Yesterday, 14:05", location: "Cold Room C · 02", status: "Active" },
];

const actions = [
  { kind: "amber" as const, label: "Release authorization", detail: "MRT-00451 · Awaiting facility manager", time: "12 min ago", href: "/cases?selected=MRT-00451" },
  { kind: "blue" as const, label: "Admission documents", detail: "MRT-00457 · 2 documents needed", time: "38 min ago", href: "/documents" },
  { kind: "green" as const, label: "Payment confirmation", detail: "MRT-00448 · KSh 18,500 received", time: "1 hr ago", href: "/billing" },
];

function Dashboard() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [range, setRange] = useState("Last 7 days");

  const filteredCases = useMemo(
    () => cases.filter((item) => `${item.id} ${item.name} ${item.location}`.toLowerCase().includes(query.toLowerCase())),
    [query]
  );

  return (
    <AppShell active="Overview">
      <div className="page-heading">
        <div>
          <p className="eyebrow">TUESDAY, 20 OCTOBER 2026 <span>·</span> NAIROBI, KENYA</p>
          <h1>Good morning, Angela<span className="heading-period">.</span></h1>
          <p className="heading-subtitle">Here&apos;s what&apos;s happening at your facility today.</p>
        </div>
        <button className="primary-button" onClick={() => router.push("/cases?action=new")}>
          <Icon name="plus" size={17} /> New admission
        </button>
      </div>

      <div className="notice-strip">
        <span className="notice-icon"><Icon name="check" size={14} /></span>
        <span><strong>Daily overview is up to date.</strong> Last synced just now.</span>
        <span className="notice-date">As of 10:24 AM EAT</span>
      </div>

      <section className="metrics-grid" aria-label="Facility metrics">
        <article className="metric-card" onClick={() => router.push("/cases")} style={{ cursor: "pointer" }}>
          <div className="metric-top">
            <span className="metric-label">Active cases</span>
            <span className="metric-icon metric-icon-indigo"><Icon name="folder" size={17} /></span>
          </div>
          <div className="metric-value">63</div>
          <div className="metric-foot">
            <span className="trend trend-up"><Icon name="arrow" size={12} /> 8.2%</span>
            <span>vs. last month</span>
          </div>
          <div className="metric-spark spark-indigo">
            <span style={{ height: "34%" }} /><span style={{ height: "48%" }} /><span style={{ height: "40%" }} /><span style={{ height: "62%" }} /><span style={{ height: "50%" }} /><span style={{ height: "71%" }} /><span style={{ height: "66%" }} /><span style={{ height: "83%" }} /><span style={{ height: "71%" }} /><span style={{ height: "94%" }} />
          </div>
        </article>

        <article className="metric-card" onClick={() => router.push("/storage")} style={{ cursor: "pointer" }}>
          <div className="metric-top">
            <span className="metric-label">Available capacity</span>
            <span className="metric-icon metric-icon-teal"><Icon name="snow" size={17} /></span>
          </div>
          <div className="metric-value">17<span className="metric-unit"> / 96</span></div>
          <div className="metric-foot">
            <span className="metric-context"><span className="mini-dot dot-teal"></span> 82% occupancy</span>
            <span>across 3 rooms</span>
          </div>
          <div className="metric-progress"><span style={{ width: "82%" }}></span></div>
        </article>

        <article className="metric-card" onClick={() => router.push("/cases")} style={{ cursor: "pointer" }}>
          <div className="metric-top">
            <span className="metric-label">Today&apos;s admissions</span>
            <span className="metric-icon metric-icon-blue"><Icon name="plus" size={17} /></span>
          </div>
          <div className="metric-value">08</div>
          <div className="metric-foot">
            <span className="metric-context">3 cases received</span>
            <span>since 8:00 AM</span>
          </div>
          <div className="metric-avatar-stack">
            <span className="stack-avatar stack-one">GW</span>
            <span className="stack-avatar stack-two">PM</span>
            <span className="stack-avatar stack-three">JM</span>
            <span className="stack-extra">+5 more</span>
          </div>
        </article>

        <article className="metric-card" onClick={() => router.push("/cases")} style={{ cursor: "pointer" }}>
          <div className="metric-top">
            <span className="metric-label">Pending actions</span>
            <span className="metric-icon metric-icon-amber"><Icon name="clock" size={17} /></span>
          </div>
          <div className="metric-value">11</div>
          <div className="metric-foot">
            <span className="metric-context metric-alert"><span className="mini-dot dot-amber"></span> 3 need attention</span>
            <span>across 3 categories</span>
          </div>
          <div className="action-segments">
            <span /><span /><span /><span /><span /><span /><span /><span /><span /><span /><span />
          </div>
        </article>
      </section>

      <section className="middle-grid">
        <article className="panel occupancy-panel">
          <div className="panel-heading">
            <div>
              <div className="panel-title-row">
                <h2>Storage overview</h2>
                <span className="live-tag"><span></span> LIVE</span>
              </div>
              <p>Capacity and occupancy across your facility</p>
            </div>
            <button className="select-button" onClick={() => router.push("/storage")}>
              View storage <Icon name="chevron" size={14} />
            </button>
          </div>
          <div className="occupancy-summary">
            <div>
              <span className="occupancy-number">79<span>%</span></span>
              <span className="occupancy-caption">overall occupancy</span>
            </div>
            <div className="occupancy-legend">
              <span><i className="legend-occupied" />Occupied <b>76</b></span>
              <span><i className="legend-available" />Available <b>17</b></span>
              <span><i className="legend-reserved" />Reserved <b>3</b></span>
            </div>
          </div>
          <div className="room-list">
            <div className="room-row">
              <div className="room-meta"><div><strong>Cold Room A</strong><span>32 chambers</span></div><b>82%</b></div>
              <div className="room-track"><span style={{ width: "82%" }} /></div>
              <div className="room-foot"><span>26 occupied</span><span>6 available</span></div>
            </div>
            <div className="room-row">
              <div className="room-meta"><div><strong>Cold Room B</strong><span>40 chambers</span></div><b>75%</b></div>
              <div className="room-track"><span className="room-fill-blue" style={{ width: "75%" }} /></div>
              <div className="room-foot"><span>30 occupied</span><span>10 available</span></div>
            </div>
            <div className="room-row">
              <div className="room-meta"><div><strong>Cold Room C</strong><span>24 chambers</span></div><b>83%</b></div>
              <div className="room-track"><span className="room-fill-violet" style={{ width: "83%" }} /></div>
              <div className="room-foot"><span>20 occupied</span><span>4 available</span></div>
            </div>
          </div>
          <button className="panel-bottom-link" onClick={() => router.push("/storage")}>
            Open chamber map <Icon name="arrow" size={13} />
          </button>
        </article>

        <article className="panel activity-panel">
          <div className="panel-heading">
            <div>
              <h2>Activity at a glance</h2>
              <p>Case movement over time</p>
            </div>
            <button className="select-button" onClick={() => setRange(range === "Last 7 days" ? "Last 30 days" : "Last 7 days")}>
              {range} <span className="down-chevron">⌄</span>
            </button>
          </div>
          <div className="chart-legend">
            <span><i className="legend-admissions" />Admissions</span>
            <span><i className="legend-releases" />Releases</span>
          </div>
          <div className="chart-area">
            <div className="chart-y-labels"><span>12</span><span>9</span><span>6</span><span>3</span><span>0</span></div>
            <div className="chart-plot">
              <div className="chart-gridlines"><i /><i /><i /><i /><i /></div>
              <svg className="chart-svg" viewBox="0 0 520 164" preserveAspectRatio="none" role="img" aria-label={`Admissions and releases, ${range.toLowerCase()}`}>
                <defs>
                  <linearGradient id="admissionFill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#8e86f4" stopOpacity=".2" />
                    <stop offset="100%" stopColor="#8e86f4" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d="M0 111 C24 105 34 81 58 86 S90 119 116 101 S153 63 174 70 S207 105 232 89 S266 49 290 57 S326 95 348 76 S383 38 406 48 S434 78 462 58 S496 31 520 23 L520 164 L0 164Z" fill="url(#admissionFill)" />
                <path d="M0 111 C24 105 34 81 58 86 S90 119 116 101 S153 63 174 70 S207 105 232 89 S266 49 290 57 S326 95 348 76 S383 38 406 48 S434 78 462 58 S496 31 520 23" fill="none" stroke="#7569e8" strokeWidth="2.5" />
                <path d="M0 139 C24 136 39 126 58 128 S94 139 116 130 S151 110 174 116 S211 134 232 125 S266 104 290 109 S325 126 348 118 S383 98 406 104 S442 119 462 109 S496 92 520 88" fill="none" stroke="#76b9b1" strokeWidth="2" strokeDasharray="5 5" />
                <circle cx="520" cy="23" r="4" fill="#7569e8" stroke="white" strokeWidth="2" />
                <circle cx="520" cy="88" r="4" fill="#76b9b1" stroke="white" strokeWidth="2" />
              </svg>
              <div className="chart-x-labels">
                {(range === "Last 7 days" ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] : ["1 Oct", "5 Oct", "9 Oct", "13 Oct", "17 Oct", "20 Oct"]).map((d) => (
                  <span key={d}>{d}</span>
                ))}
              </div>
            </div>
          </div>
          <div className="chart-totals">
            <div><span className="total-dot total-indigo" /><strong>42</strong><small>admissions</small><span className="total-change">↑ 12%</span></div>
            <div><span className="total-dot total-teal" /><strong>36</strong><small>releases</small><span className="total-change">↑ 8%</span></div>
          </div>
        </article>
      </section>

      <section className="bottom-grid">
        <article className="panel cases-panel">
          <div className="panel-heading cases-heading">
            <div>
              <div className="panel-title-row">
                <h2>Recent cases</h2>
                <span className="count-pill">63</span>
              </div>
              <p>The latest activity across your facility</p>
            </div>
            <button className="select-button" onClick={() => router.push("/cases")}>
              All cases <Icon name="chevron" size={14} />
            </button>
          </div>
          <div className="table-toolbar">
            <label className="search-box">
              <Icon name="search" size={15} />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search cases..." aria-label="Search cases" />
            </label>
            <button className="filter-button" onClick={() => setQuery("")}>Clear filters <span>⌄</span></button>
          </div>
          <div className="table-scroll">
            <table>
              <thead><tr><th>CASE</th><th>ADMITTED</th><th>LOCATION</th><th>STATUS</th><th></th></tr></thead>
              <tbody>
                {filteredCases.map((item) => (
                  <tr key={item.id} onClick={() => router.push(`/cases?selected=${item.id}`)} style={{ cursor: "pointer" }}>
                    <td>
                      <div className="case-person">
                        <span className={`case-avatar avatar-${item.color}`}>{item.initials}</span>
                        <span><strong>{item.name}</strong><small>{item.id}</small></span>
                      </div>
                    </td>
                    <td className="date-cell">{item.date}</td>
                    <td><span className="location-cell"><span className="location-pin" /> {item.location}</span></td>
                    <td><span className={`case-status status-${item.status.toLowerCase()}`}><i />{item.status}</span></td>
                    <td>
                      <button className="row-more" aria-label={`View details for ${item.id}`} onClick={(e) => { e.stopPropagation(); router.push(`/cases?selected=${item.id}`); }}>
                        <Icon name="arrow" size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredCases.length === 0 && <div className="empty-search">No cases match “{query}”.</div>}
          </div>
          <div className="table-footer">
            <span>Showing <strong>{filteredCases.length}</strong> of <strong>63</strong> cases</span>
            <button onClick={() => router.push("/cases")}>View all cases <Icon name="arrow" size={13} /></button>
          </div>
        </article>

        <article className="panel actions-panel">
          <div className="panel-heading">
            <div>
              <div className="panel-title-row">
                <h2>Needs your attention</h2>
                <span className="attention-count">3</span>
              </div>
              <p>Items requiring a follow-up</p>
            </div>
            <button className="icon-button panel-more" aria-label="More actions"><Icon name="more" /></button>
          </div>
          <div className="action-list">
            {actions.map((item) => (
              <button key={item.label} className="action-row" onClick={() => router.push(item.href)}>
                <span className={`action-mark mark-${item.kind}`}>
                  <Icon name={item.kind === "green" ? "check" : item.kind === "blue" ? "file" : "clock"} size={15} />
                </span>
                <span className="action-copy">
                  <strong>{item.label}</strong>
                  <small>{item.detail}</small>
                  <span className="action-time">{item.time}</span>
                </span>
                <Icon name="chevron" size={15} />
              </button>
            ))}
          </div>
          <button className="panel-bottom-link action-bottom" onClick={() => router.push("/cases")}>
            View all pending actions <Icon name="arrow" size={13} />
          </button>
        </article>
      </section>

      <footer className="page-footer">
        <span>© 2026 Mortusoft</span>
        <span>Built for care, designed for clarity.</span>
        <button onClick={() => router.push("/setup")}>Help center <Icon name="arrow" size={11} /></button>
      </footer>
    </AppShell>
  );
}

export default function Home() {
  return <AuthGate>{hasNeonConfig() ? <ConnectedWorkspace /> : <Dashboard />}</AuthGate>;
}
