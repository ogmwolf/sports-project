"use client";
import { useApp } from "@/context/AppContext";
import StatusBadge from "@/components/Common/StatusBadge";

interface School {
  id: string;
  name: string;
  abbr: string;
  division: string;
  conference: string;
  color: string;
  status: string;
}

export default function SchoolItem({ school }: { school: School }) {
  const { selectedSchoolId, selectSchool, followedSchools, toggleFollowSchool } = useApp();
  const selected = selectedSchoolId === school.id;

  return (
    <div
      onClick={() => selectSchool(selected ? null : school.id)}
      style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "10px 12px", borderRadius: 8, cursor: "pointer",
        border: `1px solid ${selected ? "var(--green)" : "var(--border)"}`,
        background: selected ? "var(--green-light)" : "#FAFAFA",
        transition: "all 0.15s",
      }}
    >
      {/* Logo placeholder */}
      <div style={{
        width: 38, height: 38, borderRadius: 8, flexShrink: 0,
        background: school.color, display: "flex", alignItems: "center",
        justifyContent: "center", color: "white", fontWeight: 800, fontSize: 11,
      }}>
        {school.abbr.slice(0, 4)}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#111", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {school.name}
        </div>
        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
          {school.division} · {school.conference}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <StatusBadge status={school.status} />
        <button
          onClick={e => { e.stopPropagation(); toggleFollowSchool(school.id); }}
          style={{
            background: followedSchools.has(school.id) ? "var(--green-light)" : "none",
            border: `1px solid ${followedSchools.has(school.id) ? "var(--green)" : "#ddd"}`,
            borderRadius: 20, padding: "3px 10px",
            fontSize: 10, fontWeight: 700,
            color: followedSchools.has(school.id) ? "var(--green)" : "#777",
            cursor: "pointer", flexShrink: 0,
            transition: "all 0.15s",
          }}
        >
          {followedSchools.has(school.id) ? "Following" : "Follow"}
        </button>
      </div>
    </div>
  );
}
