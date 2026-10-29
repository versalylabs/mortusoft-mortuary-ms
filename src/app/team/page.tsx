"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuthGate from "../components/AuthGate";
import AppShell from "../components/AppShell";
import Icon from "../components/Icon";

type Member = { name: string; email: string; role: string; status: string; initials: string };

const defaults: Member[] = [
  { name: "Angela Muthoni", email: "angela@nairobi-memorial.example", role: "Facility administrator", status: "Active", initials: "AM" },
  { name: "David Kamau", email: "david@nairobi-memorial.example", role: "Mortuary manager", status: "Active", initials: "DK" },
  { name: "Grace Njeri", email: "grace@nairobi-memorial.example", role: "Reception / front desk", status: "Active", initials: "GN" },
  { name: "Peter Otieno", email: "peter@nairobi-memorial.example", role: "Finance officer", status: "Invited", initials: "PO" }
];

function TeamContent() {
  const router = useRouter();
  const [members, setMembers] = useState(defaults);
  const [invite, setInvite] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Mortuary attendant");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const value = localStorage.getItem("mortusoft-demo-team");
    if (value) {
      try {
        setMembers(JSON.parse(value));
      } catch {
        // use default
      }
    }
  }, []);

  function update(next: Member[]) {
    setMembers(next);
    localStorage.setItem("mortusoft-demo-team", JSON.stringify(next));
  }

  function add() {
    if (!email.includes("@")) {
      setNotice("Enter a valid email address.");
      return;
    }
    const name = email
      .split("@")[0]
      .split(/[._-]/)
      .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : ""))
      .join(" ");
    update([
      ...members,
      {
        name,
        email,
        role,
        status: "Invited",
        initials: name.split(" ").map((x) => x[0]).join("").slice(0, 2)
      }
    ]);
    setInvite(false);
    setEmail("");
    setNotice("Demo invitation added to the team list.");
  }

  return (
    <AppShell active="Team">
      <div className="page-heading">
        <div>
          <p className="eyebrow">NAIROBI MEMORIAL <span>·</span> ACCESS & PERMISSIONS</p>
          <h1>People & permissions<span>.</span></h1>
          <p className="heading-subtitle">Manage who can access your facility workspace and configure role privileges.</p>
        </div>
        <button className="primary-button" onClick={() => { setNotice(""); setInvite(true); }}>
          <Icon name="plus" size={17} /> Invite a teammate
        </button>
      </div>

      {notice && (
        <div className="notice-strip" style={{ marginBottom: 16 }}>
          <span className="notice-icon"><Icon name="check" size={14} /></span>
          <span>{notice}</span>
          <button style={{ marginLeft: "auto", background: "none", border: 0, cursor: "pointer", color: "var(--palette-steel)" }} onClick={() => setNotice("")}>✕</button>
        </div>
      )}

      <div className="team-summary" style={{ marginBottom: 20 }}>
        <div>
          <span className="summary-icon">♙</span>
          <span><b>{members.length}</b><small>Team members</small></span>
        </div>
        <div>
          <span className="summary-icon summary-green">✓</span>
          <span><b>{members.filter((m) => m.status === "Active").length}</b><small>Active accounts</small></span>
        </div>
        <div>
          <span className="summary-icon summary-amber">◷</span>
          <span><b>{members.filter((m) => m.status === "Invited").length}</b><small>Pending invitations</small></span>
        </div>
      </div>

      <section className="team-card">
        <div className="team-card-heading">
          <div>
            <h2>Facility team</h2>
            <p>Access is scoped to Nairobi Memorial.</p>
          </div>
          <span className="role-count">{members.length} MEMBERS</span>
        </div>

        <div className="member-table">
          <div className="member-head">
            <span>TEAM MEMBER</span>
            <span>ROLE</span>
            <span>STATUS</span>
            <span></span>
          </div>
          {members.map((m, i) => (
            <div className="member-row" key={m.email}>
              <div className="member-person">
                <span className={`member-avatar member-color-${i % 4}`}>{m.initials}</span>
                <span><b>{m.name}</b><small>{m.email}</small></span>
              </div>
              <select
                value={m.role}
                onChange={(e) => update(members.map((x, j) => (i === j ? { ...x, role: e.target.value } : x)))}
                aria-label={`Role for ${m.name}`}
              >
                <option>Super administrator</option>
                <option>Facility administrator</option>
                <option>Mortuary manager</option>
                <option>Mortuary attendant</option>
                <option>Embalming / preservation staff</option>
                <option>Reception / front desk</option>
                <option>Finance officer</option>
                <option>Funeral coordinator</option>
                <option>Driver</option>
                <option>Auditor / read-only</option>
              </select>
              <span className={`member-status ${m.status === "Active" ? "member-active" : "member-invited"}`}>
                <i />{m.status}
              </span>
              <button
                className="member-menu"
                title="Remove member"
                onClick={() => {
                  if (m.email !== defaults[0].email) update(members.filter((_, j) => j !== i));
                  else setNotice("The current demo administrator cannot be removed.");
                }}
              >
                ···
              </button>
            </div>
          ))}
        </div>

        <div className="team-card-foot">
          <span>Role changes save in this browser for demo purposes.</span>
          <button onClick={() => router.push("/setup")}>Facility settings →</button>
        </div>
      </section>

      <section className="roles-note" style={{ marginTop: 20 }}>
        <div className="roles-note-icon">⌘</div>
        <div>
          <b>Access by role</b>
          <p>Roles provide a starting point. Granular permissions by branch, module, and action are configured per staff member.</p>
        </div>
        <span className="roles-note-tag">ROLE BASED</span>
      </section>

      {invite && (
        <div className="modal-shade" onMouseDown={(e) => { if (e.target === e.currentTarget) setInvite(false); }}>
          <section className="invite-modal">
            <button className="modal-close" onClick={() => setInvite(false)}>×</button>
            <span className="modal-icon">+</span>
            <p className="form-eyebrow">EXPAND YOUR TEAM</p>
            <h2>Invite a teammate</h2>
            <p className="modal-desc">Choose their facility role. This preview adds a sample invitation locally.</p>
            <label>
              Email address
              <input autoFocus type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="teammate@facility.com" />
            </label>
            <label>
              Facility role
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                {["Mortuary manager", "Mortuary attendant", "Embalming / preservation staff", "Reception / front desk", "Finance officer", "Funeral coordinator", "Driver", "Auditor / read-only"].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </label>
            <div className="modal-actions">
              <button className="subtle-button" onClick={() => setInvite(false)}>Cancel</button>
              <button className="auth-submit" onClick={add}>Add demo invitation <span>→</span></button>
            </div>
          </section>
        </div>
      )}
    </AppShell>
  );
}

export default function Team() {
  return (
    <AuthGate>
      <TeamContent />
    </AuthGate>
  );
}
