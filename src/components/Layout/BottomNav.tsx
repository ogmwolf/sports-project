"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { useState } from "react";

const TABS = [
  {
    id: "feed", href: "/feed", label: "Home",
    icon: (active: boolean) => (
      <svg width="22" height="22" fill={active ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9.75L12 3l9 6.75V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.75z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 21V12h6v9" />
      </svg>
    ),
  },
  {
    id: "network", href: "/network", label: "Network",
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8"
        style={{ color: active ? "#1A6B3C" : "#666" }}>
        <circle cx="17" cy="7" r="3"/>
        <circle cx="7" cy="7" r="3"/>
        <path d="M1 20v-2a6 6 0 0 1 6-6h1"/>
        <path d="M23 20v-2a6 6 0 0 0-4-5.7"/>
        <circle cx="12" cy="17" r="3"/>
        <path d="M9 20v-1a3 3 0 0 1 6 0v1"/>
      </svg>
    ),
  },
  {
    id: "recruiting", href: "/recruiting", label: "Recruiting",
    icon: (active: boolean) => (
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}
        style={{ color: active ? "#1A6B3C" : "#666" }}>
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="12" cy="12" r="1" fill={active ? "#1A6B3C" : "#666"} stroke="none" />
      </svg>
    ),
  },
];

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { showToast } = useApp();
  const [meOpen, setMeOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/feed") return pathname === "/" || pathname === "/feed";
    return pathname.startsWith(href);
  };

  return (
    <>
      <nav className="bottom-nav">
        {TABS.map(tab => (
          <Link
            key={tab.id}
            href={tab.href}
            className={`bottom-nav-item ${isActive(tab.href) ? "active" : ""}`}
            style={{ textDecoration: "none" }}
          >
            {tab.icon(isActive(tab.href))}
            <span>{tab.label}</span>
          </Link>
        ))}

        {/* Me tab */}
        <button
          className={`bottom-nav-item ${pathname.startsWith("/profile") ? "active" : ""}`}
          onClick={() => setMeOpen(o => !o)}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 0, position: "relative" }}
        >
          <div style={{ position: "relative", display: "inline-flex" }}>
            <div style={{
              width: 28, height: 28, borderRadius: "50%", background: "#1A6B3C",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "white", fontWeight: 700, fontSize: 11,
            }}>
              SR
            </div>
            <span style={{
              position: "absolute", top: 0, right: 0,
              width: 8, height: 8, background: "#e24b4a", borderRadius: "50%",
              border: "1.5px solid white",
            }} />
          </div>
          <span>Me</span>
        </button>
      </nav>

      {/* Me mini dropdown for mobile */}
      {meOpen && (
        <>
          <div
            style={{ position: "fixed", inset: 0, zIndex: 499 }}
            onClick={() => setMeOpen(false)}
          />
          <div style={{
            position: "fixed", bottom: 64, right: 8, zIndex: 500,
            background: "white", border: "1px solid #e8e8e8", borderRadius: 10,
            minWidth: 200, boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}>
            <button onClick={() => { setMeOpen(false); router.push("/profile"); }}
              style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", height: 40, padding: "0 16px", background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "#333" }}>
              👤 View Profile
            </button>
            <button onClick={() => { setMeOpen(false); router.push("/onboarding"); }}
              style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", height: 40, padding: "0 16px", background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "#333" }}>
              ✨ Preview onboarding
            </button>
            <button onClick={() => { setMeOpen(false); router.push("/notifications"); }}
              style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", height: 40, padding: "0 16px", background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "#333" }}>
              🔔 Notifications
            </button>
            <button onClick={() => { setMeOpen(false); router.push("/health"); }}
              style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", height: 40, padding: "0 16px", background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "#333" }}>
              🏥 Med Center
            </button>
            <div style={{ height: 1, background: "#f0f0f0" }} />
            <button onClick={() => { setMeOpen(false); showToast("Signed out (demo)"); }}
              style={{ display: "flex", alignItems: "center", width: "100%", height: 40, padding: "0 16px", background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "#e24b4a" }}>
              Sign out
            </button>
          </div>
        </>
      )}
    </>
  );
}
