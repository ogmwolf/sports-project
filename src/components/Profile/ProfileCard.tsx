"use client";
import { useState } from "react";
import { useApp } from "@/context/AppContext";
import EditProfileModal from "./EditProfileModal";
import { getCurrentSeason, getActiveSports } from "@/utils/seasons.js";
import { getDisplayStats } from "@/utils/sportStats.js";

export default function ProfileCard() {
  const { athlete } = useApp();
  const [editOpen, setEditOpen] = useState(false);

  const activeSport = getActiveSports(athlete.sports, athlete.gender)[0] || athlete.sports[0];
  const season = getCurrentSeason(activeSport, athlete.gender);
  const displayStats = getDisplayStats(activeSport, athlete);

  return (
    <div className="card" style={{ padding: 0 }}>
      {/* Cover photo */}
      <div style={{
        height: 80, background: "#1A6B3C",
        borderRadius: "10px 10px 0 0", position: "relative",
      }}>
        <div style={{
          position: "absolute", bottom: -32, left: 16,
          width: 64, height: 64, borderRadius: "50%",
          background: "#1A6B3C", border: "3px solid white",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "white", fontWeight: 800, fontSize: 20,
        }}>
          {athlete.initials}
        </div>
      </div>

      <div style={{ padding: "40px 16px 16px" }}>
        {/* Edit profile button */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
          <button
            onClick={() => setEditOpen(true)}
            style={{
              background: "none", border: "1px solid #ccc", borderRadius: 20,
              padding: "5px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer", color: "#555",
            }}
          >
            Edit profile
          </button>
        </div>

        {/* Name + role */}
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#111", letterSpacing: "-0.02em" }}>
            {athlete.name}
          </h1>
          <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 2 }}>
            {athlete.position} · {athlete.sports[0]} · #{athlete.number}
          </div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 1 }}>
            {athlete.club} · Class of {athlete.classYear} · {athlete.location}
          </div>
          {athlete.bio && (
            <p style={{ fontSize: 13, color: "#444", marginTop: 8, lineHeight: 1.55 }}>{athlete.bio}</p>
          )}
        </div>

        {/* Pills */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
          <span className="badge badge-green">{athlete.club}</span>
          <span className="badge badge-purple">Natl #{athlete.stats.nationalRank}</span>
          <span className="badge badge-amber">{athlete.stats.state} #{athlete.stats.stateRank}</span>
          {season && (
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              background: "#E8F5EE", borderRadius: 20, padding: "2px 8px",
              fontSize: 10, fontWeight: 700, color: "#0F4A28",
            }}>
              📅 {season.name}
            </span>
          )}
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: "var(--border)", margin: "14px 0" }} />

        {/* Sport-specific stat grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8 }}>
          {displayStats.map(s => (
            <div key={s.label} style={{ textAlign: "center", background: "#F8F8F6", borderRadius: 8, padding: "8px 4px" }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#111", letterSpacing: "-0.02em" }}>{s.value}</div>
              <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 600, letterSpacing: "0.04em", marginTop: 1 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <EditProfileModal open={editOpen} onClose={() => setEditOpen(false)} />
    </div>
  );
}
