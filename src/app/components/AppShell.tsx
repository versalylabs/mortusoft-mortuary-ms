"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Icon, { IconName } from "./Icon";

export type NavItemName =
  | "Overview"
  | "Cases"
  | "Storage"
  | "Documents"
  | "Billing"
  | "Reports"
  | "Team"
  | "Settings";

interface AppShellProps {
  active: NavItemName;
  children: React.ReactNode;
}

type NavigationItem = {
  name: NavItemName;
  icon: IconName;
  badge?: string;
  href: string;
};

const navGroups: { label: string; items: NavigationItem[] }[] = [
  {
    label: "WORKSPACE",
    items: [
      { name: "Overview", icon: "grid", href: "/" },
      { name: "Cases", icon: "folder", badge: "63", href: "/cases" },
      { name: "Storage", icon: "snow", href: "/storage" },
      { name: "Documents", icon: "file", href: "/documents" },
    ],
  },
  {
    label: "MANAGEMENT",
    items: [
      { name: "Billing", icon: "receipt", href: "/billing" },
      { name: "Reports", icon: "chart", href: "/reports" },
      { name: "Team", icon: "users", href: "/team" },
    ],
  },
];

export default function AppShell({ active, children }: AppShellProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSignOut = () => {
    localStorage.removeItem("mortusoft-demo-session");
    router.push("/sign-in");
  };

  return (
    <main className="app-shell">
      <aside className={`sidebar ${menuOpen ? "sidebar-open" : ""}`}>
        <div className="brand-row">
          <Link href="/" className="brand-mark" aria-label="Mortusoft Home">
            <span></span>
            <span></span>
            <span></span>
          </Link>
          <Link href="/" className="brand-name" style={{ textDecoration: "none", color: "inherit" }}>
            mortusoft<span className="brand-period">.</span>
          </Link>
          <button
            type="button"
            className="icon-button mobile-close"
            aria-label="Close navigation"
            onClick={() => setMenuOpen(false)}
          >
            <Icon name="close" />
          </button>
        </div>

        <button
          type="button"
          className="facility-switcher"
          onClick={() => router.push("/setup")}
          title="Facility profile & settings"
        >
          <span className="facility-avatar">N</span>
          <span className="facility-copy">
            <strong>Nairobi Memorial</strong>
            <small>Facility workspace</small>
          </span>
          <Icon name="chevron" size={15} />
        </button>

        <nav className="main-nav" aria-label="Main navigation">
          {navGroups.map((group) => (
            <div className="nav-group" key={group.label}>
              <p className="nav-label">{group.label}</p>
              {group.items.map((item) => (
                <button
                  type="button"
                  key={item.name}
                  onClick={() => {
                    setMenuOpen(false);
                    router.push(item.href);
                  }}
                  className={`nav-item ${active === item.name ? "nav-active" : ""}`}
                >
                  <Icon name={item.icon} size={17} />
                  <span>{item.name}</span>
                  {item.badge && <span className="nav-badge">{item.badge}</span>}
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-spacer" />

        <div className="support-card">
          <div className="support-icon">
            <span className="support-spark">✳</span>
          </div>
          <strong>Here when you need us</strong>
          <p>Our support team is ready to help your facility.</p>
          <button type="button" onClick={() => router.push("/setup")}>
            Contact support <Icon name="arrow" size={13} />
          </button>
        </div>

        <button
          type="button"
          className={`nav-item settings-link ${active === "Settings" ? "nav-active" : ""}`}
          onClick={() => {
            setMenuOpen(false);
            router.push("/setup");
          }}
        >
          <Icon name="settings" size={17} />
          <span>Settings</span>
        </button>

        <div className="profile-row">
          <div className="profile-avatar">AM</div>
          <div className="profile-copy">
            <strong>Angela Muthoni</strong>
            <small>Facility administrator · Demo</small>
          </div>
          <button
            type="button"
            className="signout-link"
            onClick={handleSignOut}
          >
            Sign out
          </button>
        </div>
      </aside>

      <section className="main-area">
        <header className="topbar">
          <button
            type="button"
            className="icon-button menu-toggle"
            aria-label="Open navigation"
            onClick={() => setMenuOpen(true)}
          >
            <Icon name="menu" />
          </button>
          <div className="breadcrumbs">
            <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>Workspace</Link>
            <Icon name="chevron" size={13} />
            <strong>{active}</strong>
          </div>
          <div className="topbar-right">
            <div className="system-status">
              <span className="status-dot"></span> All systems operational
            </div>
            <button
              type="button"
              className="icon-button notification-button"
              aria-label="Notifications"
            >
              <Icon name="bell" size={18} />
              <i></i>
            </button>
            <div className="topbar-divider"></div>
            <span className="date-label">Tuesday, 20 October 2026</span>
            <button
              type="button"
              className="topbar-signout"
              onClick={handleSignOut}
            >
              Sign out
            </button>
          </div>
        </header>

        <div className="content-wrap">
          {children}
        </div>
      </section>

      {menuOpen && (
        <button
          type="button"
          className="sidebar-backdrop"
          aria-label="Close navigation"
          onClick={() => setMenuOpen(false)}
        />
      )}
    </main>
  );
}
