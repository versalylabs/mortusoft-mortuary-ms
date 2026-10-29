"use client";

import React from "react";

export type IconName =
  | "grid"
  | "folder"
  | "snow"
  | "file"
  | "receipt"
  | "chart"
  | "users"
  | "settings"
  | "search"
  | "bell"
  | "plus"
  | "arrow"
  | "clock"
  | "check"
  | "more"
  | "chevron"
  | "menu"
  | "close"
  | "filter"
  | "download"
  | "upload";

export default function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
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
    filter: <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"/>,
    download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></>,
    upload: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}
