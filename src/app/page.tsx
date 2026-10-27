"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AuthGate from "./components/AuthGate";
import ConnectedWorkspace from "./ConnectedWorkspace";
import { hasNeonConfig } from "@/lib/neon/config";

type IconName = "grid" | "folder" | "snow" | "file" | "receipt" | "chart" | "users" | "settings" | "search" | "bell" | "plus" | "arrow" | "clock" | "check" | "more" | "chevron" | "menu" | "close";

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, React.ReactNode> = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1.4"/><rect x="14" y="3" width="7" height="7" rx="1.4"/><rect x="3" y="14" width="7" height="7" rx="1.4"/><rect x="14" y="14" width="7" height="7" rx="1.4"/></>,
    folder: <><path d="M3 7.5A1.5 1.5 0 0 1 4.5 6h5l2 2h8A1.5 1.5 0 0 1 21 9.5v8a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5z"/><path d="M3 10h18"/></>,
    snow: <><path d="M12 2v20M4 6l16 12M20 6 4 18M8 4l4 2 4-2M8 20l4-2 4 2M3 10l1-4 4 1M16 17l4 1 1-4M21 10l-1-4-4 1M8 17l-4 1-1-4"/></>,
    file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h8"/></>,
    receipt: <><path d="M4 3v18l2.5-1.5L9 21l3-1.5 3 1.5 2.5-1.5L20 21V3l-2.5 1.5L15 3l-3 1.5L9 3 6.5 4.5z"/><path d="M8 9h8M8 13h6"/></>,
    chart: <><path d="M3 3v18h18"/><path d="m7 14 4-4 4 3 6-7"/></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="10" cy="7" r="4"/><path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.7a8.2 8.2 0 0 1-1.5.9l-.3 1.8h-2.8l-.3-1.8a8.2 8.2 0 0 1-1.5-.9l-1.7.7-1.4-2.4 1.4-1.1a7.6 7.6 0 0 1 0-1.8l-1.4-1.1 1.4-2.4 1.7.7a8.2 8.2 0 0 1 1.5-.9l.3-1.8h2.8l.3 1.8a8.2 8.2 0 0 1 1.5.9l1.7-.7 1.4 2.4-1.4 1.1a7.6 7.6 0 0 1-.1 1.8z" transform="translate(-1 -1) scale(1.08)"/></>,
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></>,
    plus: <><path d="M12 5v14M5 12h14"/></>,
    arrow: <><path d="M7 17 17 7M7 7h10v10"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
    more: <><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></>,
    chevron: <path d="m9 18 6-6-6-6"/>,
    menu: <><path d="M4 6h16M4 12h16M4 18h16"/></>,
    close: <><path d="m18 6-12 12M6 6l12 12"/></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

const cases = [
  { id: "MRT-00458", name: "Grace Wanjiku", initials: "GW", color: "rose", date: "Today, 09:42", location: "Cold Room A Â· 12", status: "Active" },
  { id: "MRT-00457", name: "Peter Mwangi", initials: "PM", color: "blue", date: "Today, 08:16", location: "Cold Room B Â· 04", status: "Pending" },
  { id: "MRT-00456", name: "Unidentified Â· Case 56", initials: "UC", color: "violet", date: "Yesterday, 16:30", location: "Cold Room A Â· 08", status: "Review" },
  { id: "MRT-00455", name: "Josephine Achieng", initials: "JA", color: "amber", date: "Yesterday, 14:05", location: "Cold Room C Â· 02", status: "Active" },
];

const actions = [
  { kind: "amber", label: "Release authorization", detail: "MRT-00451 Â· Awaiting facility manager", time: "12 min ago" },
  { kind: "blue", label: "Admission documents", detail: "MRT-00457 Â· 2 documents needed", time: "38 min ago" },
  { kind: "green", label: "Payment confirmation", detail: "MRT-00448 Â· KSh 18,500 received", time: "1 hr ago" },
];

type NavigationItem = { name: string; icon: IconName; badge?: string };
const navGroups: { label: string; items: NavigationItem[] }[] = [
  { label: "WORKSPACE", items: [{ name: "Overview", icon: "grid" as const }, { name: "Cases", icon: "folder" as const, badge: "63" }, { name: "Storage", icon: "snow" as const }, { name: "Documents", icon: "file" as const }] },
  { label: "MANAGEMENT", items: [{ name: "Billing", icon: "receipt" as const }, { name: "Reports", icon: "chart" as const }, { name: "Team", icon: "users" as const }] },
];

function Dashboard() {
  const router = useRouter();
  const [active, setActive] = useState("Overview");
  const [query, setQuery] = useState("");
  const [range, setRange] = useState("Last 7 days");
  const [menuOpen, setMenuOpen] = useState(false);
  const filteredCases = useMemo(() => cases.filter((item) => `${item.id} ${item.name} ${item.location}`.toLowerCase().includes(query.toLowerCase())), [query]);

  return (
    <main className="app-shell">
      <aside className={`sidebar ${menuOpen ? "sidebar-open" : ""}`}>
        <div className="brand-row">
          <div className="brand-mark"><span></span><span></span><span></span></div>
          <span className="brand-name">mortusoft<span className="brand-period">.</span></span>
          <button className="icon-button mobile-close" aria-label="Close navigation" onClick={() => setMenuOpen(false)}><Icon name="close" /></button>
        </div>
        <button className="facility-switcher" onClick={() => router.push("/setup")}>
          <span className="facility-avatar">N</span>
          <span className="facility-copy"><strong>Nairobi Memorial</strong><small>Facility workspace</small></span>
          <Icon name="chevron" size={15} />
        </button>
        <nav className="main-nav" aria-label="Main navigation">
          {navGroups.map((group) => <div className="nav-group" key={group.label}>
            <p className="nav-label">{group.label}</p>
            {group.items.map((item) => <button key={item.name} onClick={() => { setActive(item.name); if (item.name === "Team") router.push("/team"); }} className={`nav-item ${active === item.name ? "nav-active" : ""}`}>
              <Icon name={item.icon} size={17} /><span>{item.name}</span>{item.badge && <span className="nav-badge">{item.badge}</span>}
            </button>)}
          </div>)}
        </nav>
        <div className="sidebar-spacer" />
        <div className="support-card"><div className="support-icon"><span className="support-spark">âœ³</span></div><strong>Here when you need us</strong><p>Our team is ready to help your facility.</p><button>Contact support <Icon name="arrow" size={13} /></button></div>
        <button className={`nav-item settings-link ${active === "Settings" ? "nav-active" : ""}`} onClick={() => { setActive("Settings"); router.push("/setup"); }}><Icon name="settings" size={17} /><span>Settings</span></button>
        <div className="profile-row"><div className="profile-avatar">AM</div><div className="profile-copy"><strong>Angela Muthoni</strong><small>Facility administrator Â· Demo</small></div><button className="signout-link" onClick={() => { localStorage.removeItem("mortusoft-demo-session"); router.push("/sign-in"); }}>Sign out</button></div>
      </aside>

      <section className="main-area">
        <header className="topbar">
          <button className="icon-button menu-toggle" aria-label="Open navigation" onClick={() => setMenuOpen(true)}><Icon name="menu" /></button>
          <div className="breadcrumbs"><span>Workspace</span><Icon name="chevron" size={13} /><strong>{active}</strong></div>
          <div className="topbar-right"><div className="system-status"><span className="status-dot"></span> All systems operational</div><button className="icon-button notification-button" aria-label="Notifications"><Icon name="bell" size={18} /><i></i></button><div className="topbar-divider"></div><span className="date-label">Tuesday, 20 October 2026</span></div>
        </header>

        <div className="content-wrap">
          <div className="page-heading"><div><p className="eyebrow">TUESDAY, 20 OCTOBER 2026 <span>Â·</span> NAIROBI, KENYA</p><h1>Good morning, Angela<span className="heading-period">.</span></h1><p className="heading-subtitle">Here&apos;s what&apos;s happening at your facility today.</p></div><button className="primary-button" onClick={() => setActive("New case")}><Icon name="plus" size={17} /> New admission</button></div>

          <div className="notice-strip"><span className="notice-icon"><Icon name="check" size={14} /></span><span><strong>Daily overview is up to date.</strong> Last synced just now.</span><span className="notice-date">As of 10:24 AM EAT</span></div>

          <section className="metrics-grid" aria-label="Facility metrics">
            <article className="metric-card"><div className="metric-top"><span className="metric-label">Active cases</span><span className="metric-icon metric-icon-indigo"><Icon name="folder" size={17} /></span></div><div className="metric-value">63</div><div className="metric-foot"><span className="trend trend-up"><Icon name="arrow" size={12} /> 8.2%</span><span>vs. last month</span></div><div className="metric-spark spark-indigo"><span style={{height:"34%"}}/><span style={{height:"48%"}}/><span style={{height:"40%"}}/><span style={{height:"62%"}}/><span style={{height:"50%"}}/><span style={{height:"71%"}}/><span style={{height:"66%"}}/><span style={{height:"83%"}}/><span style={{height:"71%"}}/><span style={{height:"94%"}}/></div></article>
            <article className="metric-card"><div className="metric-top"><span className="metric-label">Available capacity</span><span className="metric-icon metric-icon-teal"><Icon name="snow" size={17} /></span></div><div className="metric-value">17<span className="metric-unit"> / 96</span></div><div className="metric-foot"><span className="metric-context"><span className="mini-dot dot-teal"></span> 82% occupancy</span><span>across 3 rooms</span></div><div className="metric-progress"><span style={{width:"82%"}}></span></div></article>
            <article className="metric-card"><div className="metric-top"><span className="metric-label">Today&apos;s admissions</span><span className="metric-icon metric-icon-blue"><Icon name="plus" size={17} /></span></div><div className="metric-value">08</div><div className="metric-foot"><span className="metric-context">3 cases received</span><span>since 8:00 AM</span></div><div className="metric-avatar-stack"><span className="stack-avatar stack-one">GW</span><span className="stack-avatar stack-two">PM</span><span className="stack-avatar stack-three">JM</span><span className="stack-extra">+5 more</span></div></article>
            <article className="metric-card"><div className="metric-top"><span className="metric-label">Pending actions</span><span className="metric-icon metric-icon-amber"><Icon name="clock" size={17} /></span></div><div className="metric-value">11</div><div className="metric-foot"><span className="metric-context metric-alert"><span className="mini-dot dot-amber"></span> 3 need attention</span><span>across 3 categories</span></div><div className="action-segments"><span/><span/><span/><span/><span/><span/><span/><span/><span/><span/><span/></div></article>
          </section>

          <section className="middle-grid">
            <article className="panel occupancy-panel"><div className="panel-heading"><div><div className="panel-title-row"><h2>Storage overview</h2><span className="live-tag"><span></span> LIVE</span></div><p>Capacity and occupancy across your facility</p></div><button className="select-button" onClick={() => setActive("Storage")}>View storage <Icon name="chevron" size={14} /></button></div>
              <div className="occupancy-summary"><div><span className="occupancy-number">79<span>%</span></span><span className="occupancy-caption">overall occupancy</span></div><div className="occupancy-legend"><span><i className="legend-occupied"/>Occupied <b>76</b></span><span><i className="legend-available"/>Available <b>17</b></span><span><i className="legend-reserved"/>Reserved <b>3</b></span></div></div>
              <div className="room-list">
                <div className="room-row"><div className="room-meta"><div><strong>Cold Room A</strong><span>32 chambers</span></div><b>82%</b></div><div className="room-track"><span style={{width:"82%"}} /></div><div className="room-foot"><span>26 occupied</span><span>6 available</span></div></div>
                <div className="room-row"><div className="room-meta"><div><strong>Cold Room B</strong><span>40 chambers</span></div><b>75%</b></div><div className="room-track"><span className="room-fill-blue" style={{width:"75%"}} /></div><div className="room-foot"><span>30 occupied</span><span>10 available</span></div></div>
                <div className="room-row"><div className="room-meta"><div><strong>Cold Room C</strong><span>24 chambers</span></div><b>83%</b></div><div className="room-track"><span className="room-fill-violet" style={{width:"83%"}} /></div><div className="room-foot"><span>20 occupied</span><span>4 available</span></div></div>
              </div><button className="panel-bottom-link" onClick={() => setActive("Storage")}>Open chamber map <Icon name="arrow" size={13} /></button>
            </article>

            <article className="panel activity-panel"><div className="panel-heading"><div><h2>Activity at a glance</h2><p>Case movement over time</p></div><button className="select-button" onClick={() => setRange(range === "Last 7 days" ? "Last 30 days" : "Last 7 days")}>{range} <span className="down-chevron">âŒ„</span></button></div>
              <div className="chart-legend"><span><i className="legend-admissions"/>Admissions</span><span><i className="legend-releases"/>Releases</span></div>
              <div className="chart-area"><div className="chart-y-labels"><span>12</span><span>9</span><span>6</span><span>3</span><span>0</span></div><div className="chart-plot"><div className="chart-gridlines"><i/><i/><i/><i/><i/></div><svg className="chart-svg" viewBox="0 0 520 164" preserveAspectRatio="none" role="img" aria-label={`Admissions and releases, ${range.toLowerCase()}`}><defs><linearGradient id="admissionFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#8e86f4" stopOpacity=".2"/><stop offset="100%" stopColor="#8e86f4" stopOpacity="0"/></linearGradient></defs><path d="M0 111 C24 105 34 81 58 86 S90 119 116 101 S153 63 174 70 S207 105 232 89 S266 49 290 57 S326 95 348 76 S383 38 406 48 S434 78 462 58 S496 31 520 23 L520 164 L0 164Z" fill="url(#admissionFill)"/><path d="M0 111 C24 105 34 81 58 86 S90 119 116 101 S153 63 174 70 S207 105 232 89 S266 49 290 57 S326 95 348 76 S383 38 406 48 S434 78 462 58 S496 31 520 23" fill="none" stroke="#7569e8" strokeWidth="2.5"/><path d="M0 139 C24 136 39 126 58 128 S94 139 116 130 S151 110 174 116 S211 134 232 125 S266 104 290 109 S325 126 348 118 S383 98 406 104 S442 119 462 109 S496 92 520 88" fill="none" stroke="#76b9b1" strokeWidth="2" strokeDasharray="5 5"/><circle cx="520" cy="23" r="4" fill="#7569e8" stroke="white" strokeWidth="2"/><circle cx="520" cy="88" r="4" fill="#76b9b1" stroke="white" strokeWidth="2"/></svg><div className="chart-x-labels">{(range === "Last 7 days" ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] : ["1 Oct", "5 Oct", "9 Oct", "13 Oct", "17 Oct", "20 Oct"]).map((d) => <span key={d}>{d}</span>)}</div></div></div>
              <div className="chart-totals"><div><span className="total-dot total-indigo"/><strong>42</strong><small>admissions</small><span className="total-change">â†‘ 12%</span></div><div><span className="total-dot total-teal"/><strong>36</strong><small>releases</small><span className="total-change">â†‘ 8%</span></div></div>
            </article>
          </section>

          <section className="bottom-grid">
            <article className="panel cases-panel"><div className="panel-heading cases-heading"><div><div className="panel-title-row"><h2>Recent cases</h2><span className="count-pill">63</span></div><p>The latest activity across your facility</p></div><button className="select-button" onClick={() => setActive("Cases")}>All cases <Icon name="chevron" size={14} /></button></div>
              <div className="table-toolbar"><label className="search-box"><Icon name="search" size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search cases..." aria-label="Search cases" /></label><button className="filter-button" onClick={() => setQuery("")}>Clear filters <span>âŒ„</span></button></div>
              <div className="table-scroll"><table><thead><tr><th>CASE</th><th>ADMITTED</th><th>LOCATION</th><th>STATUS</th><th></th></tr></thead><tbody>{filteredCases.map((item) => <tr key={item.id}><td><div className="case-person"><span className={`case-avatar avatar-${item.color}`}>{item.initials}</span><span><strong>{item.name}</strong><small>{item.id}</small></span></div></td><td className="date-cell">{item.date}</td><td><span className="location-cell"><span className="location-pin"/> {item.location}</span></td><td><span className={`case-status status-${item.status.toLowerCase()}`}><i/>{item.status}</span></td><td><button className="row-more" aria-label={`More options for ${item.id}`}><Icon name="more" size={17}/></button></td></tr>)}</tbody></table>{filteredCases.length === 0 && <div className="empty-search">No cases match â€œ{query}â€.</div>}</div>
              <div className="table-footer"><span>Showing <strong>{filteredCases.length}</strong> of <strong>63</strong> cases</span><button onClick={() => setActive("Cases")}>View all cases <Icon name="arrow" size={13}/></button></div>
            </article>

            <article className="panel actions-panel"><div className="panel-heading"><div><div className="panel-title-row"><h2>Needs your attention</h2><span className="attention-count">3</span></div><p>Items requiring a follow-up</p></div><button className="icon-button panel-more" aria-label="More actions"><Icon name="more" /></button></div>
              <div className="action-list">{actions.map((item) => <button key={item.label} className="action-row" onClick={() => setActive(item.label)}><span className={`action-mark mark-${item.kind}`}><Icon name={item.kind === "green" ? "check" : item.kind === "blue" ? "file" : "clock"} size={15}/></span><span className="action-copy"><strong>{item.label}</strong><small>{item.detail}</small><span className="action-time">{item.time}</span></span><Icon name="chevron" size={15}/></button>)}</div>
              <button className="panel-bottom-link action-bottom" onClick={() => setActive("Tasks")}>View all pending actions <Icon name="arrow" size={13} /></button>
            </article>
          </section>
          <footer className="page-footer"><span>Â© 2026 Mortusoft</span><span>Built for care, designed for clarity.</span><button>Help center <Icon name="arrow" size={11}/></button></footer>
        </div>
      </section>
      {menuOpen && <button className="sidebar-backdrop" aria-label="Close navigation" onClick={() => setMenuOpen(false)} />}
    </main>
  );
}

export default function Home() {
  return <AuthGate>{hasNeonConfig() ? <ConnectedWorkspace /> : <Dashboard />}</AuthGate>;
}

