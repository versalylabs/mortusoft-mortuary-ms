"use client";

import { useMemo, useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthGate from "../components/AuthGate";
import AppShell from "../components/AppShell";
import Icon from "../components/Icon";

export type CaseItem = {
  id: string;
  name: string;
  initials: string;
  color: "rose" | "blue" | "violet" | "amber";
  date: string;
  location: string;
  status: "Active" | "Pending" | "Review" | "Released";
  idStatus: "Identified" | "Unidentified" | "Under Review";
  kinName?: string;
  kinPhone?: string;
  notes?: string;
  movements?: Array<{ from: string; to: string; time: string; note: string }>;
};

const defaultCases: CaseItem[] = [
  {
    id: "MRT-00458",
    name: "Grace Wanjiku",
    initials: "GW",
    color: "rose",
    date: "20 Oct 2026, 09:42",
    location: "Cold Room A · Bay 12",
    status: "Active",
    idStatus: "Identified",
    kinName: "James Wanjiku",
    kinPhone: "+254 712 345 678",
    notes: "Admitted from Nairobi Hospital. Family requested preservation package.",
    movements: [
      { from: "Intake Bay", to: "Cold Room A · Bay 12", time: "20 Oct 2026, 10:15", note: "Chamber assignment upon completed documentation." }
    ]
  },
  {
    id: "MRT-00457",
    name: "Peter Mwangi",
    initials: "PM",
    color: "blue",
    date: "20 Oct 2026, 08:16",
    location: "Cold Room B · Bay 04",
    status: "Pending",
    idStatus: "Identified",
    kinName: "Sarah Mwangi",
    kinPhone: "+254 722 987 654",
    notes: "2 admission documents needed before release clearance.",
    movements: [
      { from: "Intake Bay", to: "Cold Room B · Bay 04", time: "20 Oct 2026, 08:45", note: "Primary holding pending next-of-kin documentation." }
    ]
  },
  {
    id: "MRT-00456",
    name: "Unidentified · Case 56",
    initials: "UC",
    color: "violet",
    date: "19 Oct 2026, 16:30",
    location: "Cold Room A · Bay 08",
    status: "Review",
    idStatus: "Unidentified",
    kinName: "Police Referral",
    kinPhone: "Central Police Station",
    notes: "Fingerprint verification and Gazette notice initiated.",
    movements: [
      { from: "Intake Bay", to: "Cold Room A · Bay 08", time: "19 Oct 2026, 17:00", note: "Police transfer holding." }
    ]
  },
  {
    id: "MRT-00455",
    name: "Josephine Achieng",
    initials: "JA",
    color: "amber",
    date: "19 Oct 2026, 14:05",
    location: "Cold Room C · Bay 02",
    status: "Active",
    idStatus: "Identified",
    kinName: "Oduor Achieng",
    kinPhone: "+254 733 112 233",
    notes: "Transfer scheduled for Friday.",
    movements: [
      { from: "Intake Bay", to: "Cold Room C · Bay 02", time: "19 Oct 2026, 14:30", note: "Assigned to Cold Room C." }
    ]
  },
  {
    id: "MRT-00454",
    name: "Samuel Kiprop",
    initials: "SK",
    color: "blue",
    date: "18 Oct 2026, 11:20",
    location: "Cold Room B · Bay 11",
    status: "Active",
    idStatus: "Identified",
    kinName: "Faith Kiprop",
    kinPhone: "+254 720 445 566",
    notes: "Burial permit received and verified.",
    movements: [
      { from: "Intake Bay", to: "Cold Room B · Bay 11", time: "18 Oct 2026, 11:50", note: "Standard intake." }
    ]
  },
  {
    id: "MRT-00453",
    name: "Daniel Otieno",
    initials: "DO",
    color: "rose",
    date: "17 Oct 2026, 15:10",
    location: "Discharge Bay",
    status: "Released",
    idStatus: "Identified",
    kinName: "Mary Otieno",
    kinPhone: "+254 711 778 899",
    notes: "Handover authorized and completed. Invoice settled.",
    movements: [
      { from: "Cold Room A · Bay 05", to: "Discharge Bay", time: "19 Oct 2026, 09:30", note: "Final release to family." }
    ]
  }
];

function CasesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialAction = searchParams.get("action");
  const initialSelected = searchParams.get("selected");

  const [items, setItems] = useState<CaseItem[]>(defaultCases);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [roomFilter, setRoomFilter] = useState("All");
  const [selectedCase, setSelectedCase] = useState<CaseItem | null>(null);
  const [showModal, setShowModal] = useState(initialAction === "new");
  const [newMoveRoom, setNewMoveRoom] = useState("");
  const [notice, setNotice] = useState("");

  // New Admission form fields
  const [formName, setFormName] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formIdStatus, setFormIdStatus] = useState<CaseItem["idStatus"]>("Identified");
  const [formLocation, setFormLocation] = useState("Cold Room A · Bay 14");
  const [formKin, setFormKin] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formNotes, setFormNotes] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("mortusoft-demo-cases-list");
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch {
        // use default
      }
    }
  }, []);

  useEffect(() => {
    if (initialSelected) {
      const match = items.find((c) => c.id === initialSelected);
      if (match) setSelectedCase(match);
    }
  }, [initialSelected, items]);

  const saveCases = (newList: CaseItem[]) => {
    setItems(newList);
    localStorage.setItem("mortusoft-demo-cases-list", JSON.stringify(newList));
  };

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const textMatch = `${item.id} ${item.name} ${item.location} ${item.kinName || ""}`
        .toLowerCase()
        .includes(query.toLowerCase());
      const statusMatch = statusFilter === "All" || item.status === statusFilter;
      const roomMatch = roomFilter === "All" || item.location.includes(roomFilter);
      return textMatch && statusMatch && roomMatch;
    });
  }, [items, query, statusFilter, roomFilter]);

  const handleAddCase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const initials = formName
      .trim()
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

    const colors: CaseItem["color"][] = ["rose", "blue", "violet", "amber"];
    const randomColor = colors[items.length % colors.length];
    const newId = `MRT-00${459 + items.length - defaultCases.length}`;

    const newCase: CaseItem = {
      id: newId,
      name: formName.trim(),
      initials,
      color: randomColor,
      date: formDate ? new Date(formDate).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" }) : "Just now",
      location: formLocation,
      status: "Active",
      idStatus: formIdStatus,
      kinName: formKin,
      kinPhone: formPhone,
      notes: formNotes,
      movements: [
        {
          from: "Intake Bay",
          to: formLocation,
          time: new Date().toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" }),
          note: "Admission intake"
        }
      ]
    };

    const updated = [newCase, ...items];
    saveCases(updated);
    setShowModal(false);
    setSelectedCase(newCase);
    setNotice(`Case ${newId} admitted successfully.`);

    // Reset form
    setFormName("");
    setFormKin("");
    setFormPhone("");
    setFormNotes("");
  };

  const handleRecordMovement = () => {
    if (!selectedCase || !newMoveRoom) return;
    const updated = items.map((c) => {
      if (c.id === selectedCase.id) {
        const moves = c.movements || [];
        const newMoves = [
          {
            from: c.location,
            to: newMoveRoom,
            time: new Date().toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" }),
            note: "Chamber relocation"
          },
          ...moves
        ];
        return { ...c, location: newMoveRoom, movements: newMoves };
      }
      return c;
    });
    saveCases(updated);
    setSelectedCase((prev) => prev ? { ...prev, location: newMoveRoom } : null);
    setNewMoveRoom("");
    setNotice(`Movement to ${newMoveRoom} recorded.`);
  };

  const handleRelease = (id: string) => {
    const updated = items.map((c) => (c.id === id ? { ...c, status: "Released" as const, location: "Discharge Bay" } : c));
    saveCases(updated);
    setSelectedCase((prev) => (prev && prev.id === id ? { ...prev, status: "Released" as const, location: "Discharge Bay" } : prev));
    setNotice(`Case ${id} released and discharged.`);
  };

  return (
    <AppShell active="Cases">
      <div className="page-heading">
        <div>
          <p className="eyebrow">FACILITY REGISTER <span>·</span> ADMISSIONS & STATUS</p>
          <h1>Case Register<span>.</span></h1>
          <p className="heading-subtitle">Comprehensive ledger of all deceased records, chamber assignments, and workflow statuses.</p>
        </div>
        <button className="primary-button" onClick={() => setShowModal(true)}>
          <Icon name="plus" size={17} /> New admission
        </button>
      </div>

      {notice && (
        <div className="notice-strip" style={{ marginBottom: 16 }}>
          <span className="notice-icon"><Icon name="check" size={14} /></span>
          <span>{notice}</span>
          <button style={{ marginLeft: "auto", background: "none", border: 0, cursor: "pointer", color: "var(--palette-steel)" }} onClick={() => setNotice("")}>✕</button>
        </div>
      )}

      {/* Metrics Row */}
      <section className="metrics-grid" style={{ marginBottom: 20 }}>
        <article className="metric-card">
          <div className="metric-top">
            <span className="metric-label">Active Cases</span>
            <span className="metric-icon metric-icon-indigo"><Icon name="folder" size={17} /></span>
          </div>
          <div className="metric-value">{items.filter((c) => c.status === "Active").length}</div>
          <div className="metric-foot"><span>Currently in holding chambers</span></div>
        </article>

        <article className="metric-card">
          <div className="metric-top">
            <span className="metric-label">Pending Clearance</span>
            <span className="metric-icon metric-icon-amber"><Icon name="clock" size={17} /></span>
          </div>
          <div className="metric-value">{items.filter((c) => c.status === "Pending").length}</div>
          <div className="metric-foot"><span className="trend trend-up">Awaiting documents</span></div>
        </article>

        <article className="metric-card">
          <div className="metric-top">
            <span className="metric-label">Under Review</span>
            <span className="metric-icon metric-icon-blue"><Icon name="file" size={17} /></span>
          </div>
          <div className="metric-value">{items.filter((c) => c.status === "Review").length}</div>
          <div className="metric-foot"><span>Identification checks</span></div>
        </article>

        <article className="metric-card">
          <div className="metric-top">
            <span className="metric-label">Released</span>
            <span className="metric-icon metric-icon-teal"><Icon name="check" size={17} /></span>
          </div>
          <div className="metric-value">{items.filter((c) => c.status === "Released").length}</div>
          <div className="metric-foot"><span>Discharged this cycle</span></div>
        </article>
      </section>

      {/* Case Register Table */}
      <section className="panel cases-panel">
        <div className="panel-heading cases-heading">
          <div>
            <div className="panel-title-row">
              <h2>All Facility Cases</h2>
              <span className="count-pill">{filtered.length} of {items.length}</span>
            </div>
            <p>Select any case row to view documentation, chamber location, and movement history.</p>
          </div>
        </div>

        <div className="table-toolbar" style={{ flexWrap: "wrap", gap: 12 }}>
          <label className="search-box">
            <Icon name="search" size={15} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search case #, name, or room..."
              aria-label="Search cases"
            />
          </label>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
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
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
              <option value="Review">Under Review</option>
              <option value="Released">Released</option>
            </select>

            <select
              value={roomFilter}
              onChange={(e) => setRoomFilter(e.target.value)}
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
              <option value="All">All Rooms</option>
              <option value="Cold Room A">Cold Room A</option>
              <option value="Cold Room B">Cold Room B</option>
              <option value="Cold Room C">Cold Room C</option>
              <option value="Discharge">Discharge Bay</option>
            </select>

            {(query || statusFilter !== "All" || roomFilter !== "All") && (
              <button
                type="button"
                className="filter-button"
                onClick={() => { setQuery(""); setStatusFilter("All"); setRoomFilter("All"); }}
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>CASE / PERSON</th>
                <th>ADMITTED</th>
                <th>CHAMBER LOCATION</th>
                <th>IDENTIFICATION</th>
                <th>STATUS</th>
                <th style={{ width: 60 }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => setSelectedCase(item)}
                  style={{
                    cursor: "pointer",
                    background: selectedCase?.id === item.id ? "rgba(166, 136, 104, 0.08)" : undefined
                  }}
                >
                  <td>
                    <div className="case-person">
                      <span className={`case-avatar avatar-${item.color}`}>
                        {item.initials}
                      </span>
                      <span>
                        <strong>{item.name}</strong>
                        <small>{item.id}</small>
                      </span>
                    </div>
                  </td>
                  <td className="date-cell">{item.date}</td>
                  <td>
                    <span className="location-cell">
                      <span className="location-pin" /> {item.location}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: 13, color: "var(--ink)", fontWeight: 600 }}>
                      {item.idStatus}
                    </span>
                  </td>
                  <td>
                    <span className={`case-status status-${item.status.toLowerCase()}`}>
                      <i /> {item.status}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="row-more"
                      title="Open case details"
                      aria-label={`Open details for ${item.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCase(item);
                      }}
                    >
                      <Icon name="arrow" size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="empty-search">
              No facility cases match your current filters.
            </div>
          )}
        </div>
      </section>

      {/* Case Details Drawer / Modal */}
      {selectedCase && (
        <div
          className="modal-shade"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(7, 23, 57, 0.5)",
            backdropFilter: "blur(3px)",
            zIndex: 60,
            display: "flex",
            justifyContent: "flex-end"
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedCase(null);
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 520,
              background: "#ffffff",
              height: "100%",
              overflowY: "auto",
              padding: "28px 24px",
              boxShadow: "-4px 0 24px rgba(7, 23, 57, 0.15)",
              display: "flex",
              flexDirection: "column",
              gap: 20
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid var(--line)", paddingBottom: 16 }}>
              <div>
                <span className="count-pill">{selectedCase.id}</span>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--ink)", marginTop: 6 }}>
                  {selectedCase.name}
                </h2>
                <span style={{ fontSize: 13, color: "var(--muted)" }}>
                  Admitted {selectedCase.date}
                </span>
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={() => setSelectedCase(null)}
                style={{ background: "#F5EFEB", borderRadius: "50%", width: 32, height: 32 }}
              >
                <Icon name="close" size={16} />
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div style={{ padding: "12px 14px", background: "var(--sand-light)", borderRadius: 8 }}>
                <small style={{ color: "var(--palette-steel)", fontWeight: 700, display: "block", fontSize: 11 }}>CHAMBER LOCATION</small>
                <strong style={{ fontSize: 14, color: "var(--ink)", display: "block", marginTop: 4 }}>{selectedCase.location}</strong>
              </div>
              <div style={{ padding: "12px 14px", background: "var(--sand-light)", borderRadius: 8 }}>
                <small style={{ color: "var(--palette-steel)", fontWeight: 700, display: "block", fontSize: 11 }}>CASE STATUS</small>
                <span className={`case-status status-${selectedCase.status.toLowerCase()}`} style={{ marginTop: 4 }}>
                  <i /> {selectedCase.status}
                </span>
              </div>
            </div>

            <div style={{ padding: 14, border: "1px solid var(--line)", borderRadius: 8, background: "#ffffff" }}>
              <strong style={{ display: "block", fontSize: 13, color: "var(--palette-steel)", marginBottom: 6 }}>NEXT OF KIN & CONTACT</strong>
              <div style={{ fontSize: 13.5, color: "var(--ink)", lineHeight: 1.6 }}>
                <div><b>Name:</b> {selectedCase.kinName || "Not recorded"}</div>
                <div><b>Contact:</b> {selectedCase.kinPhone || "Not recorded"}</div>
                {selectedCase.notes && <div style={{ marginTop: 4 }}><b>Notes:</b> {selectedCase.notes}</div>}
              </div>
            </div>

            {/* Movement Recording */}
            <div style={{ padding: 14, border: "1px solid var(--line)", borderRadius: 8, background: "#FAF8F5" }}>
              <strong style={{ display: "block", fontSize: 13, color: "var(--palette-steel)", marginBottom: 10 }}>RECORD CHAMBER MOVEMENT</strong>
              <div style={{ display: "flex", gap: 10 }}>
                <select
                  value={newMoveRoom}
                  onChange={(e) => setNewMoveRoom(e.target.value)}
                  style={{ flex: 1, height: 38, borderRadius: 6, border: "1px solid var(--line)", padding: "0 10px", fontSize: 13 }}
                >
                  <option value="">Select destination chamber...</option>
                  <option value="Cold Room A · Bay 02">Cold Room A · Bay 02</option>
                  <option value="Cold Room A · Bay 15">Cold Room A · Bay 15</option>
                  <option value="Cold Room B · Bay 06">Cold Room B · Bay 06</option>
                  <option value="Cold Room B · Bay 18">Cold Room B · Bay 18</option>
                  <option value="Cold Room C · Bay 05">Cold Room C · Bay 05</option>
                  <option value="Embalming Suite">Embalming Suite</option>
                  <option value="Viewing Chapel">Viewing Chapel</option>
                  <option value="Discharge Bay">Discharge Bay</option>
                </select>
                <button
                  type="button"
                  disabled={!newMoveRoom}
                  onClick={handleRecordMovement}
                  style={{
                    padding: "0 14px",
                    background: "var(--palette-steel)",
                    color: "#ffffff",
                    borderRadius: 6,
                    border: 0,
                    fontWeight: 700,
                    fontSize: 12.5,
                    cursor: newMoveRoom ? "pointer" : "not-allowed",
                    opacity: newMoveRoom ? 1 : 0.6
                  }}
                >
                  Record
                </button>
              </div>
            </div>

            {/* Movement History */}
            <div>
              <strong style={{ display: "block", fontSize: 13, color: "var(--palette-steel)", marginBottom: 8 }}>
                MOVEMENT AUDIT TRAIL
              </strong>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {(selectedCase.movements || []).map((m, idx) => (
                  <div key={idx} style={{ padding: 10, background: "#ffffff", border: "1px solid var(--line)", borderRadius: 6, fontSize: 12.5 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", color: "var(--muted)", fontSize: 11, marginBottom: 2 }}>
                      <span>{m.time}</span>
                      <span style={{ fontWeight: 600, color: "var(--palette-steel)" }}>{m.note}</span>
                    </div>
                    <div><b>{m.from}</b> → <b>{m.to}</b></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ marginTop: "auto", display: "flex", gap: 10, paddingTop: 14, borderTop: "1px solid var(--line)" }}>
              {selectedCase.status !== "Released" ? (
                <button
                  type="button"
                  onClick={() => handleRelease(selectedCase.id)}
                  style={{
                    flex: 1,
                    height: 40,
                    borderRadius: 8,
                    background: "#2D7D46",
                    color: "#ffffff",
                    border: 0,
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: "pointer"
                  }}
                >
                  Authorize Release
                </button>
              ) : (
                <div style={{ flex: 1, textAlign: "center", color: "#2D7D46", fontWeight: 700, fontSize: 13, padding: "8px 0" }}>
                  ✓ Case Discharged & Released
                </div>
              )}
              <button
                type="button"
                onClick={() => router.push(`/billing?case=${selectedCase.id}`)}
                style={{
                  padding: "0 16px",
                  height: 40,
                  borderRadius: 8,
                  background: "#ffffff",
                  color: "var(--palette-steel)",
                  border: "1px solid var(--line)",
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: "pointer"
                }}
              >
                Invoicing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Admission Modal */}
      {showModal && (
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
            if (e.target === e.currentTarget) setShowModal(false);
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 560,
              background: "#ffffff",
              borderRadius: 14,
              padding: "24px 28px",
              boxShadow: "0 20px 40px rgba(7, 23, 57, 0.2)",
              maxHeight: "90vh",
              overflowY: "auto"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <p className="eyebrow" style={{ margin: 0 }}>NEW CASE ADMISSION</p>
                <h2 style={{ margin: "4px 0 0", fontSize: 20, fontWeight: 800, color: "var(--ink)" }}>Admit Deceased to Facility</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{ background: "#F5EFEB", border: 0, borderRadius: "50%", width: 32, height: 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <Icon name="close" size={16} />
              </button>
            </div>

            <form onSubmit={handleAddCase} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <label style={{ display: "flex", flexDirection: "column", gap: 5, fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>
                Deceased Person&apos;s Full Name *
                <input
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Samuel Kimani"
                  style={{ height: 40, borderRadius: 8, border: "1px solid var(--line)", padding: "0 12px", fontSize: 13.5 }}
                />
              </label>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <label style={{ display: "flex", flexDirection: "column", gap: 5, fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>
                  Admission Date & Time
                  <input
                    type="datetime-local"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    style={{ height: 40, borderRadius: 8, border: "1px solid var(--line)", padding: "0 12px", fontSize: 13 }}
                  />
                </label>

                <label style={{ display: "flex", flexDirection: "column", gap: 5, fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>
                  Identification Status
                  <select
                    value={formIdStatus}
                    onChange={(e) => setFormIdStatus(e.target.value as CaseItem["idStatus"])}
                    style={{ height: 40, borderRadius: 8, border: "1px solid var(--line)", padding: "0 12px", fontSize: 13 }}
                  >
                    <option value="Identified">Identified</option>
                    <option value="Unidentified">Unidentified</option>
                    <option value="Under Review">Under Review</option>
                  </select>
                </label>
              </div>

              <label style={{ display: "flex", flexDirection: "column", gap: 5, fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>
                Initial Chamber Assignment
                <select
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  style={{ height: 40, borderRadius: 8, border: "1px solid var(--line)", padding: "0 12px", fontSize: 13 }}
                >
                  <option value="Cold Room A · Bay 14">Cold Room A · Bay 14 (Available)</option>
                  <option value="Cold Room B · Bay 07">Cold Room B · Bay 07 (Available)</option>
                  <option value="Cold Room C · Bay 09">Cold Room C · Bay 09 (Available)</option>
                  <option value="Intake Holding">Intake Holding Chamber</option>
                </select>
              </label>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <label style={{ display: "flex", flexDirection: "column", gap: 5, fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>
                  Next of Kin Name
                  <input
                    value={formKin}
                    onChange={(e) => setFormKin(e.target.value)}
                    placeholder="e.g. Grace Kimani"
                    style={{ height: 40, borderRadius: 8, border: "1px solid var(--line)", padding: "0 12px", fontSize: 13 }}
                  />
                </label>

                <label style={{ display: "flex", flexDirection: "column", gap: 5, fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>
                  Next of Kin Phone
                  <input
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="+254 700 000 000"
                    style={{ height: 40, borderRadius: 8, border: "1px solid var(--line)", padding: "0 12px", fontSize: 13 }}
                  />
                </label>
              </div>

              <label style={{ display: "flex", flexDirection: "column", gap: 5, fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>
                Admission Notes / Special Care Instructions
                <textarea
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  rows={3}
                  placeholder="e.g. Police transfer record attached, family requested view tomorrow."
                  style={{ borderRadius: 8, border: "1px solid var(--line)", padding: "10px 12px", fontSize: 13, fontFamily: "inherit" }}
                />
              </label>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  className="subtle-button"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="primary-button"
                >
                  Complete Admission
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}

export default function CasesPage() {
  return (
    <AuthGate>
      <Suspense fallback={<div className="auth-loading">Loading cases...</div>}>
        <CasesContent />
      </Suspense>
    </AuthGate>
  );
}
