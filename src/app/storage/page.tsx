"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthGate from "../components/AuthGate";
import AppShell from "../components/AppShell";
import Icon from "../components/Icon";

type RoomData = {
  id: string;
  name: string;
  temp: string;
  total: number;
  occupied: number;
  available: number;
  status: "Optimal" | "Warning" | "Maintenance";
};

const rooms: RoomData[] = [
  { id: "A", name: "Cold Room A", temp: "2.4°C", total: 32, occupied: 26, available: 6, status: "Optimal" },
  { id: "B", name: "Cold Room B", temp: "2.8°C", total: 40, occupied: 30, available: 10, status: "Optimal" },
  { id: "C", name: "Cold Room C", temp: "3.1°C", total: 24, occupied: 20, available: 4, status: "Optimal" },
];

export default function StoragePage() {
  const router = useRouter();
  const [selectedRoom, setSelectedRoom] = useState<string>("A");
  const [selectedBay, setSelectedBay] = useState<number | null>(null);

  const activeRoom = rooms.find((r) => r.id === selectedRoom) || rooms[0];

  return (
    <AuthGate>
      <AppShell active="Storage">
        <div className="page-heading">
          <div>
            <p className="eyebrow">FACILITY CAPACITY <span>·</span> CHAMBERS & COLD ROOMS</p>
            <h1>Storage Overview<span>.</span></h1>
            <p className="heading-subtitle">Real-time occupancy, chamber mapping, and refrigeration sensor telemetry.</p>
          </div>
          <button className="primary-button" onClick={() => router.push("/cases?action=new")}>
            <Icon name="plus" size={17} /> Assign chamber
          </button>
        </div>

        {/* Global Facility Metrics */}
        <section className="metrics-grid" style={{ marginBottom: 20 }}>
          <article className="metric-card">
            <div className="metric-top">
              <span className="metric-label">Total Capacity</span>
              <span className="metric-icon metric-icon-indigo"><Icon name="snow" size={17} /></span>
            </div>
            <div className="metric-value">96</div>
            <div className="metric-foot"><span>Across 3 cold rooms</span></div>
          </article>

          <article className="metric-card">
            <div className="metric-top">
              <span className="metric-label">Occupied Chambers</span>
              <span className="metric-icon metric-icon-teal"><Icon name="folder" size={17} /></span>
            </div>
            <div className="metric-value">76</div>
            <div className="metric-foot"><span className="trend trend-up">79% overall occupancy</span></div>
          </article>

          <article className="metric-card">
            <div className="metric-top">
              <span className="metric-label">Available Slots</span>
              <span className="metric-icon metric-icon-blue"><Icon name="check" size={17} /></span>
            </div>
            <div className="metric-value">20</div>
            <div className="metric-foot"><span>Ready for new intake</span></div>
          </article>

          <article className="metric-card">
            <div className="metric-top">
              <span className="metric-label">Sensor Telemetry</span>
              <span className="metric-icon metric-icon-amber"><Icon name="clock" size={17} /></span>
            </div>
            <div className="metric-value" style={{ fontSize: 22 }}>2.7°C avg</div>
            <div className="metric-foot"><span className="trend trend-up">All systems nominal</span></div>
          </article>
        </section>

        {/* Cold Rooms Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, marginBottom: 24 }}>
          {rooms.map((room) => {
            const pct = Math.round((room.occupied / room.total) * 100);
            const isSelected = selectedRoom === room.id;
            return (
              <div
                key={room.id}
                onClick={() => setSelectedRoom(room.id)}
                style={{
                  background: isSelected ? "#FAF8F5" : "#ffffff",
                  border: isSelected ? "2px solid #A68868" : "1px solid var(--line)",
                  borderRadius: 12,
                  padding: "18px 20px",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  boxShadow: isSelected ? "0 4px 16px rgba(166, 136, 104, 0.15)" : undefined
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div>
                    <h2 style={{ fontSize: 16, fontWeight: 800, color: "var(--ink)", margin: 0 }}>{room.name}</h2>
                    <span style={{ fontSize: 12, color: "var(--muted)" }}>{room.total} Chambers total</span>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, padding: "3px 8px", borderRadius: 6, background: "rgba(45, 125, 70, 0.1)", color: "#2D7D46" }}>
                    {room.temp}
                  </span>
                </div>

                <div className="room-track" style={{ height: 8, margin: "10px 0" }}>
                  <span style={{ width: `${pct}%`, background: isSelected ? "#A68868" : "#4B6382" }} />
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>
                  <span>{room.occupied} Occupied ({pct}%)</span>
                  <span style={{ color: "#2D7D46" }}>{room.available} Available</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Interactive Chamber Grid Map */}
        <section className="panel" style={{ padding: "24px 22px" }}>
          <div className="panel-heading" style={{ marginBottom: 16 }}>
            <div>
              <div className="panel-title-row">
                <h2>{activeRoom.name} · Chamber Matrix</h2>
                <span className="count-pill">{activeRoom.occupied} / {activeRoom.total} Occupied</span>
              </div>
              <p>Visual map of individual chambers. Click on any chamber to inspect status or allocate a case.</p>
            </div>
            <div style={{ display: "flex", gap: 12, alignItems: "center", fontSize: 12 }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: "#4B6382" }} /> Occupied
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: "#E8E2D9", border: "1px solid var(--line)" }} /> Available
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: "#A68868" }} /> Selected
              </span>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(88px, 1fr))",
              gap: 10,
              padding: "16px 0"
            }}
          >
            {Array.from({ length: activeRoom.total }, (_, idx) => {
              const bayNumber = idx + 1;
              const isOccupied = bayNumber <= activeRoom.occupied;
              const isSelected = selectedBay === bayNumber;
              const caseId = isOccupied ? `MRT-00${450 + bayNumber}` : null;

              return (
                <div
                  key={bayNumber}
                  onClick={() => setSelectedBay(bayNumber)}
                  style={{
                    height: 72,
                    borderRadius: 8,
                    border: isSelected ? "2px solid #A68868" : "1px solid var(--line)",
                    background: isSelected ? "#FAF8F5" : isOccupied ? "#4B6382" : "#ffffff",
                    color: isOccupied && !isSelected ? "#FAF8F5" : "var(--ink)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    padding: 4,
                    textAlign: "center"
                  }}
                >
                  <span style={{ fontSize: 11, fontWeight: 700, opacity: 0.85 }}>
                    Bay {bayNumber < 10 ? `0${bayNumber}` : bayNumber}
                  </span>
                  <span style={{ fontSize: 11.5, fontWeight: 800, marginTop: 4 }}>
                    {isOccupied ? caseId : "Vacant"}
                  </span>
                </div>
              );
            })}
          </div>

          {selectedBay && (
            <div
              style={{
                marginTop: 18,
                padding: "16px 20px",
                background: "#FAF8F5",
                border: "1px solid var(--line)",
                borderRadius: 10,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 12
              }}
            >
              <div>
                <strong>Chamber {activeRoom.name} · Bay {selectedBay < 10 ? `0${selectedBay}` : selectedBay}</strong>
                <p style={{ margin: "3px 0 0", fontSize: 13, color: "var(--muted)" }}>
                  {selectedBay <= activeRoom.occupied
                    ? `Occupied by Case MRT-00${450 + selectedBay}. Monitored at ${activeRoom.temp}.`
                    : "Currently vacant and sanitised. Ready for new case admission."}
                </p>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                {selectedBay <= activeRoom.occupied ? (
                  <button
                    type="button"
                    className="primary-button"
                    onClick={() => router.push(`/cases?selected=MRT-00${450 + selectedBay}`)}
                  >
                    View case record
                  </button>
                ) : (
                  <button
                    type="button"
                    className="primary-button"
                    onClick={() => router.push(`/cases?action=new`)}
                  >
                    Admit to this bay
                  </button>
                )}
                <button
                  type="button"
                  className="subtle-button"
                  onClick={() => setSelectedBay(null)}
                >
                  Deselect
                </button>
              </div>
            </div>
          )}
        </section>
      </AppShell>
    </AuthGate>
  );
}
