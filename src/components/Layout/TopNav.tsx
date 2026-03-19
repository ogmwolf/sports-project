"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";

const PULSE_STYLE = `
  @keyframes scoutly-pulse-green {
    0%   { box-shadow: 0 0 0 0 rgba(26,107,60,0.5); }
    70%  { box-shadow: 0 0 0 5px rgba(26,107,60,0); }
    100% { box-shadow: 0 0 0 0 rgba(26,107,60,0); }
  }
`;

const NAV_ITEMS = [
  {
    id: "feed",
    href: "/feed",
    label: "Home",
    icon: (active: boolean) => (
      <svg width="20" height="20" fill={active ? "#1A6B3C" : "none"} viewBox="0 0 24 24" stroke={active ? "#1A6B3C" : "#666"} strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9.75L12 3l9 6.75V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.75z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 21V12h6v9" />
      </svg>
    ),
  },
  {
    id: "network",
    href: "/network",
    label: "Team",
    icon: (_active: boolean) => (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke={_active ? "#1A6B3C" : "#666"} strokeWidth="2">
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
    id: "recruiting",
    href: "/recruiting",
    label: "Recruiting",
    icon: (active: boolean) => (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke={active ? "#1A6B3C" : "#666"} strokeWidth={1.8}>
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="12" cy="12" r="1" fill={active ? "#1A6B3C" : "#666"} stroke="none" />
      </svg>
    ),
  },
  {
    id: "rankings",
    href: "/rankings",
    label: "Rankings",
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke={active ? "#1A6B3C" : "#666"} strokeWidth={2}>
        <path d="M12 15c-4 0-7-3-7-7V4h14v4c0 4-3 7-7 7z"/>
        <path d="M8.5 15.5S7 17 7 19h10c0-2-1.5-3.5-1.5-3.5"/>
        <line x1="9" y1="19" x2="15" y2="19"/>
        <line x1="12" y1="15" x2="12" y2="19"/>
      </svg>
    ),
  },
  {
    id: "health",
    href: "/health",
    label: "Health",
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke={active ? "#1A6B3C" : "#666"} strokeWidth={2}>
        <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
      </svg>
    ),
  },
];

export default function TopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { showToast } = useApp();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isActive = (href: string) => {
    if (href === "/feed") return pathname === "/" || pathname === "/feed";
    return pathname.startsWith(href);
  };

  // Close on outside click or Escape
  useEffect(() => {
    if (!dropdownOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDropdownOpen(false);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [dropdownOpen]);

  return (
    <header className="top-nav" style={{ position: "relative" }}>
      <style>{PULSE_STYLE}</style>

      <div className="top-nav-inner">
        {/* Logo */}
        <Link href="/feed" className="nav-logo">
          <div style={{ width: 28, height: 28, background: "#1A6B3C", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ color: "#fff", fontWeight: 700, fontSize: 16, lineHeight: 1 }}>S</span>
          </div>
          <span style={{ fontWeight: 800, fontSize: 20, color: "#1A6B3C", letterSpacing: "-0.02em" }}>Scoutly</span>
        </Link>

        {/* Search bar (desktop) */}
        <div className="nav-search">
          <svg className="nav-search-icon" width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input placeholder="Search athletes, clubs, schools..." />
        </div>

        {/* Mobile search icon */}
        <button
          className="nav-search-mobile"
          onClick={() => showToast("Search coming soon")}
          style={{ display: "none", background: "none", border: "none", cursor: "pointer", color: "#666", marginLeft: "auto", padding: 8 }}
        >
          <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>

        {/* Nav items */}
        <nav className="nav-items">
          {NAV_ITEMS.map(item => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`nav-item ${active ? "active" : ""}`}
                style={{
                  width: 80,
                  ...(active ? { color: "#1A6B3C", borderBottomColor: "#1A6B3C" } : undefined),
                }}
              >
                <span className="nav-item-icon">
                  {item.icon(active)}
                </span>
                <span className="nav-item-label" style={{ fontSize: 11 }}>{item.label}</span>
              </Link>
            );
          })}

          {/* Me avatar with dropdown */}
          <div ref={dropdownRef} style={{ position: "relative", width: 44, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <button
              onClick={() => setDropdownOpen(o => !o)}
              style={{
                background: "none", border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                padding: 0, position: "relative",
              }}
              aria-label="Me menu"
            >
              {/* SR avatar */}
              <div style={{
                width: 30, height: 30, borderRadius: "50%", background: "#1A6B3C",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "white", fontWeight: 700, fontSize: 11, position: "relative",
              }}>
                SR
                {/* Red unread dot */}
                <span style={{
                  position: "absolute", top: 0, right: 0,
                  width: 8, height: 8, background: "#e24b4a", borderRadius: "50%",
                  border: "1.5px solid white",
                }} />
              </div>
            </button>

            {/* Dropdown */}
            {dropdownOpen && (
              <>
                {/* Overlay to close on outside click */}
                <div
                  style={{ position: "fixed", inset: 0, zIndex: 199 }}
                  onClick={() => setDropdownOpen(false)}
                />
                <div style={{
                  position: "absolute", top: 56, right: 8, zIndex: 200,
                  background: "white", border: "1px solid #e8e8e8",
                  borderRadius: 10, minWidth: 220,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}>
                  {/* Profile summary */}
                  <div style={{ padding: "14px 16px", borderBottom: "1px solid #f0f0f0" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: "50%", background: "#1A6B3C",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "white", fontWeight: 700, fontSize: 14, flexShrink: 0,
                      }}>
                        SR
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14, color: "#111" }}>Sofia Reyes</div>
                        <div style={{ fontSize: 12, color: "#999" }}>OH · SC Rockstar 16U</div>
                      </div>
                    </div>
                    <Link
                      href="/profile"
                      onClick={() => setDropdownOpen(false)}
                      style={{ display: "inline-block", marginTop: 10, fontSize: 12, color: "#1A6B3C", textDecoration: "none" }}
                    >
                      View profile →
                    </Link>
                  </div>

                  {/* Menu items */}
                  {/* Preview onboarding */}
                  <button
                    onClick={() => { setDropdownOpen(false); router.push("/onboarding"); }}
                    style={{
                      display: "flex", alignItems: "center", gap: 10, width: "100%",
                      height: 40, padding: "0 16px", background: "none", border: "none",
                      cursor: "pointer", fontSize: 13, color: "#333", textAlign: "left",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#fafaf8")}
                    onMouseLeave={e => (e.currentTarget.style.background = "none")}
                  >
                    <span style={{
                      width: 6, height: 6, borderRadius: "50%", background: "#1A6B3C", flexShrink: 0,
                      animation: "scoutly-pulse-green 2s infinite",
                    }} />
                    <span>✨ Preview onboarding</span>
                  </button>

                  {/* Notifications */}
                  <button
                    onClick={() => { setDropdownOpen(false); router.push("/notifications"); }}
                    style={{
                      display: "flex", alignItems: "center", gap: 10, width: "100%",
                      height: 40, padding: "0 16px", background: "none", border: "none",
                      cursor: "pointer", fontSize: 13, color: "#333", textAlign: "left",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#fafaf8")}
                    onMouseLeave={e => (e.currentTarget.style.background = "none")}
                  >
                    <span style={{ fontSize: 16 }}>🔔</span>
                    <span style={{ flex: 1 }}>Notifications</span>
                    <span style={{
                      fontSize: 10, borderRadius: 10, padding: "2px 8px", fontWeight: 600,
                      background: "#E8F5EE", color: "#0F4A28",
                    }}>3</span>
                  </button>

                  {/* Settings */}
                  <button
                    onClick={() => { setDropdownOpen(false); showToast("Settings coming soon"); }}
                    style={{
                      display: "flex", alignItems: "center", gap: 10, width: "100%",
                      height: 40, padding: "0 16px", background: "none", border: "none",
                      cursor: "pointer", fontSize: 13, color: "#333", textAlign: "left",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#fafaf8")}
                    onMouseLeave={e => (e.currentTarget.style.background = "none")}
                  >
                    <span style={{ fontSize: 16 }}>⚙️</span>
                    <span>Settings</span>
                  </button>

                  {/* Divider */}
                  <div style={{ height: 1, background: "#f0f0f0", margin: "4px 0" }} />

                  {/* Sign out */}
                  <button
                    onClick={() => { setDropdownOpen(false); showToast("Signed out (demo)"); }}
                    style={{
                      display: "flex", alignItems: "center", width: "100%",
                      height: 40, padding: "0 16px", background: "none", border: "none",
                      cursor: "pointer", fontSize: 13, color: "#e24b4a", textAlign: "left",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#fafaf8")}
                    onMouseLeave={e => (e.currentTarget.style.background = "none")}
                  >
                    Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
