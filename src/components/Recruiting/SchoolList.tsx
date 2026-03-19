"use client";
import { useState, useEffect } from "react";
import SchoolTableView from "./SchoolTableView";
import { useApp } from "@/context/AppContext";

const ExpandIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M8 3H5a2 2 0 0 0-2 2v3"/>
    <path d="M21 8V5a2 2 0 0 0-2-2h-3"/>
    <path d="M3 16v3a2 2 0 0 0 2 2h3"/>
    <path d="M16 21h3a2 2 0 0 0 2-2v-3"/>
  </svg>
);

export default function SchoolList({ onAdd }: { onAdd: () => void }) {
  const { schools } = useApp();
  const [fsOpen, setFsOpen] = useState(false);
  const [btnHovered, setBtnHovered] = useState(false);

  useEffect(() => {
    if (!fsOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setFsOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [fsOpen]);

  return (
    <div>
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
          Schools ({schools.length})
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <button
            onClick={onAdd}
            style={{
              background: "none", border: "1px solid #ddd", borderRadius: 20,
              padding: "4px 12px", fontSize: 11, fontWeight: 600,
              color: "#555", cursor: "pointer",
            }}
          >
            + Add
          </button>
          <button
            onClick={() => setFsOpen(true)}
            onMouseEnter={() => setBtnHovered(true)}
            onMouseLeave={() => setBtnHovered(false)}
            title="Full screen"
            style={{
              background: btnHovered ? "#fafaf8" : "white",
              border: `1px solid ${btnHovered ? "#ccc" : "#e8e8e8"}`,
              borderRadius: 6,
              padding: "5px 8px",
              cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#555",
            }}
          >
            <ExpandIcon />
          </button>
        </div>
      </div>

      <SchoolTableView />

      {/* Full screen modal */}
      {fsOpen && (
        <>
          {/* Overlay */}
          <div
            onClick={() => setFsOpen(false)}
            style={{
              position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 1000,
            }}
          />
          {/* Modal */}
          <div style={{
            position: "fixed",
            top: "clamp(0px, 40px, 5vh)",
            left: "clamp(0px, 40px, 5vw)",
            right: "clamp(0px, 40px, 5vw)",
            bottom: "clamp(0px, 40px, 5vh)",
            background: "white",
            borderRadius: "clamp(0px, 12px, 12px)",
            zIndex: 1001,
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
          }}>
            {/* Modal header */}
            <div style={{
              height: 52, padding: "0 20px",
              borderBottom: "1px solid #e8e8e8",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              flexShrink: 0,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: "#111" }}>My Schools</span>
                <span style={{
                  fontSize: 11, fontWeight: 600, borderRadius: 20,
                  padding: "2px 10px", background: "#E8F5EE", color: "#0F4A28",
                }}>
                  {schools.length} schools
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button
                  onClick={onAdd}
                  style={{
                    background: "#1A6B3C", color: "white", border: "none",
                    borderRadius: 20, padding: "6px 14px", fontSize: 12, fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  + Add school
                </button>
                <button
                  onClick={() => setFsOpen(false)}
                  style={{
                    background: "none", border: "1px solid #e8e8e8", borderRadius: 6,
                    padding: "5px 10px", fontSize: 13, cursor: "pointer", color: "#555",
                    fontWeight: 600,
                  }}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal body */}
            <div style={{ flex: 1, overflowY: "auto", padding: 0 }}>
              <SchoolTableView fullscreen />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
