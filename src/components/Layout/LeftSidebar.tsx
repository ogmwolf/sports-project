"use client";
import { useState } from "react";
import Link from "next/link";
import WeekStatsModal, { type WeekStatType } from "./WeekStatsModal";
import { useApp } from "@/context/AppContext";
import { getCurrentSeason, getAllInSeasonSports } from "@/utils/seasons.js";

interface WeekStat {
  label: string;
  value: string;
  trend: "up" | "neutral";
  modal: WeekStatType;
}

const WEEK_STATS: WeekStat[] = [
  { label: "Profile views",       value: "23",    trend: "up",     modal: "profile-views" },
  { label: "Coach profile views", value: "3",     trend: "up",     modal: "coach-views"   },
  { label: "Schools tracking",    value: "30",    trend: "neutral", modal: "schools"      },
  { label: "Emails sent",         value: "8",     trend: "neutral", modal: "emails-sent"  },
  { label: "Responses received",  value: "2",     trend: "up",     modal: "responses"     },
  { label: "Post impressions",    value: "1,840", trend: "up",     modal: "impressions"   },
];

// ── Season card helpers ────────────────────────────────────────────

const MONTH_ABBR = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function formatMonthRange(months: number[]): string {
  if (!months?.length) return "";
  const sorted = [...months].sort((a, b) => a - b);
  if (sorted[0] === sorted[sorted.length - 1]) return MONTH_ABBR[sorted[0] - 1];
  return `${MONTH_ABBR[sorted[0] - 1]} – ${MONTH_ABBR[sorted[sorted.length - 1] - 1]}`;
}

const SPORT_DISPLAY_NAMES: Record<string, string> = {
  volleyball: "Volleyball",
  soccer:     "Soccer",
  basketball: "Basketball",
  baseball:   "Baseball",
  softball:   "Softball",
  football:   "Football",
  lacrosse:   "Lacrosse",
  swimming:   "Swimming",
  track:      "Track",
  tennis:     "Tennis",
  golf:       "Golf",
  wrestling:  "Wrestling",
  waterpolo:  "Water Polo",
  equestrian: "Equestrian",
};

const NEXT_ACTIONS: Record<string, string> = {
  volleyball: "Red Rock Rave #2 · Apr 4–6",
  soccer:     "Spring qualifiers underway",
  basketball: "AAU season begins",
};

// Sort priority for "Also in season" by gender — US youth participation + recruiting value
const ALSO_IN_SEASON_ORDER: Record<string, string[]> = {
  male: [
    "football", "basketball", "baseball", "soccer",
    "track", "wrestling", "tennis", "swimming",
    "lacrosse", "golf", "waterpolo", "equestrian",
  ],
  female: [
    "volleyball", "basketball", "soccer", "softball",
    "track", "tennis", "swimming", "lacrosse",
    "golf", "waterpolo", "equestrian", "wrestling",
  ],
};

function normalizeSportKey(sport: string): string {
  return (sport || "").toLowerCase().replace(/\s+/g, "").replace(/_/g, "");
}

// ── Sport row ──────────────────────────────────────────────────────

interface SportRowProps {
  sportKey: string;
  displayName: string;
  seasonName: string;
  months: number[];
  isOwn: boolean;
  isLast: boolean;
  expanded: boolean;
  onToggle: () => void;
}

function SportRow({ sportKey, displayName, seasonName, months, isOwn, isLast, expanded, onToggle }: SportRowProps) {
  const [hovered, setHovered] = useState(false);
  const nextAction = isOwn ? NEXT_ACTIONS[sportKey] : null;

  return (
    <div style={{ borderBottom: isLast ? "none" : "1px solid #f5f5f5" }}>
      <div
        onClick={onToggle}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: "flex", alignItems: "center", height: 36, cursor: "pointer",
          borderRadius: 6, background: hovered ? "#fafaf8" : "transparent",
          margin: "0 -4px", padding: "0 4px",
        }}
      >
        <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: "#111" }}>{displayName}</span>
        <span style={{ fontSize: 11, color: "#999" }}>{seasonName}</span>
      </div>
      <div style={{ maxHeight: expanded ? 200 : 0, overflow: "hidden", transition: "max-height 150ms ease" }}>
        <div style={{
          background: "#F3F2EE", borderRadius: 6, padding: "8px 10px",
          margin: "4px 0 6px", fontSize: 12, color: "#444", lineHeight: 1.6,
        }}>
          <div>{months.length > 0 ? formatMonthRange(months) : "Off season"}</div>
          {isOwn && nextAction && (
            <div style={{ fontSize: 11, color: "#1A6B3C", marginTop: 4 }}>
              Next: {nextAction}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Season card ────────────────────────────────────────────────────

function CurrentSeasonCard() {
  const { athlete } = useApp();
  const { sports, gender } = athlete;
  const [expandedSport, setExpandedSport] = useState<string | null>(null);
  const [showAllAlso, setShowAllAlso] = useState(false);

  if (!sports || sports.length === 0) {
    return (
      <div className="card" style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: "#999", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>
          In season now
        </div>
        <Link href="/onboarding" style={{ fontSize: 12, color: "#1A6B3C", fontWeight: 700, textDecoration: "none" }}>
          Add your sport in your profile →
        </Link>
      </div>
    );
  }

  // Your sports: always show ALL athlete sports; off-season gets "Off season" label
  const ownRows = sports.map(sport => {
    const key = normalizeSportKey(sport);
    const season = getCurrentSeason(sport, gender);
    return {
      key,
      displayName: SPORT_DISPLAY_NAMES[key] || sport,
      seasonName: season ? season.name : "Off season",
      months: season ? season.months : [],
    };
  });

  // Also in season: all gender-appropriate sports in season, minus athlete's own
  const normalizedOwn = new Set(sports.map(normalizeSportKey));
  const allInSeason = getAllInSeasonSports(gender);
  // Female exclusions and equestrian rule
  const FEMALE_EXCLUDE = new Set(["wrestling", "baseball", "football"]);
  const alsoInSeason = allInSeason
    .filter(key => !normalizedOwn.has(key))
    .filter(key => {
      if (gender === "female" && FEMALE_EXCLUDE.has(key)) return false;
      if (key === "equestrian" && !normalizedOwn.has("equestrian")) return false;
      return true;
    })
    .map(key => {
      const season = getCurrentSeason(key, gender);
      return season
        ? { key, displayName: SPORT_DISPLAY_NAMES[key] || key, seasonName: season.name, months: season.months }
        : null;
    })
    .filter((e): e is { key: string; displayName: string; seasonName: string; months: number[] } => e !== null)
    .sort((a, b) => {
      const order = ALSO_IN_SEASON_ORDER[gender || "female"] ?? ALSO_IN_SEASON_ORDER.female;
      const aIdx = order.indexOf(a.key);
      const bIdx = order.indexOf(b.key);
      return (aIdx === -1 ? 999 : aIdx) - (bIdx === -1 ? 999 : bIdx);
    });

  const visibleAlso = showAllAlso ? alsoInSeason : alsoInSeason.slice(0, 3);

  const toggle = (key: string) => setExpandedSport(prev => prev === key ? null : key);

  return (
    <div className="card" style={{ marginBottom: 10 }}>
      {/* Header */}
      <div style={{ fontSize: 10, fontWeight: 700, color: "#999", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 12 }}>
        In season now
      </div>

      {/* Your sports section */}
      <div style={{ fontSize: 10, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
        Your sports
      </div>
      {ownRows.map((entry, i) => (
        <SportRow
          key={entry.key}
          sportKey={entry.key}
          displayName={entry.displayName}
          seasonName={entry.seasonName}
          months={entry.months}
          isOwn={true}
          isLast={i === ownRows.length - 1}
          expanded={expandedSport === entry.key}
          onToggle={() => toggle(entry.key)}
        />
      ))}

      {/* Section divider */}
      {alsoInSeason.length > 0 && (
        <div style={{ height: 1, background: "#f0f0f0", margin: "8px 0" }} />
      )}

      {/* Also in season section */}
      {alsoInSeason.length > 0 && (
        <>
          <div style={{ fontSize: 10, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
            Also in season
          </div>
          {visibleAlso.map((entry, i) => (
            <SportRow
              key={entry.key}
              sportKey={entry.key}
              displayName={entry.displayName}
              seasonName={entry.seasonName}
              months={entry.months}
              isOwn={false}
              isLast={i === visibleAlso.length - 1 && (showAllAlso || alsoInSeason.length <= 3)}
              expanded={expandedSport === entry.key}
              onToggle={() => toggle(entry.key)}
            />
          ))}
          {alsoInSeason.length > 3 && (
            <button
              onClick={() => setShowAllAlso(v => !v)}
              style={{ background: "none", border: "none", padding: "4px 0 0", cursor: "pointer", fontSize: 11, color: "#1A6B3C", fontWeight: 600 }}
            >
              {showAllAlso ? "Show less" : `Show more →`}
            </button>
          )}
        </>
      )}
    </div>
  );
}

// ── Main sidebar ───────────────────────────────────────────────────

export default function LeftSidebar() {
  const { athlete } = useApp();
  const [playerInfoOpen, setPlayerInfoOpen] = useState(true);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [activeModal, setActiveModal] = useState<WeekStatType | null>(null);

  return (
    <div>
      {/* Athlete card */}
      <div className="card" style={{ padding: 0, marginBottom: 8 }}>
        <div style={{ height: 56, background: "#1A6B3C", borderRadius: "10px 10px 0 0", position: "relative" }}>
          <div style={{ position: "absolute", bottom: -32, left: "50%", transform: "translateX(-50%)", width: 64, height: 64, borderRadius: "50%", background: "#E8F5EE", border: "3px solid white", display: "flex", alignItems: "center", justifyContent: "center", color: "#0F4A28", fontWeight: 800, fontSize: 20 }}>
            {athlete.initials}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 40, paddingBottom: 14, paddingLeft: 12, paddingRight: 12 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: "#111", textAlign: "center" }}>{athlete.name}</div>
          <div style={{ fontSize: 12, color: "#666", textAlign: "center", marginTop: 2 }}>
            {athlete.position} · {athlete.sports[0] || ""}
          </div>

          <div style={{ width: "100%", borderTop: "1px solid var(--border)", paddingTop: 10, marginTop: 12 }}>
            <button
              onClick={() => setPlayerInfoOpen(o => !o)}
              style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}
            >
              <span style={{ fontSize: 12, fontWeight: 700, color: "#333" }}>Player info</span>
              <span style={{ fontSize: 10, color: "#999" }}>{playerInfoOpen ? "▴" : "▾"}</span>
            </button>
            {playerInfoOpen && (
              <div style={{ marginTop: 8, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 8px" }}>
                {[
                  { label: "Grad year", value: athlete.classYear },
                  { label: "Height",    value: athlete.height },
                  { label: "Weight",    value: athlete.weight },
                  { label: "Hand",      value: athlete.handedness },
                  { label: "Position",  value: athlete.position },
                  { label: "Club",      value: athlete.club },
                  { label: "GPA",       value: athlete.gpa },
                ].map(row => (
                  <div key={row.label}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: "#999", letterSpacing: "0.04em", textTransform: "uppercase" }}>{row.label}</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#111" }}>{row.value}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* This week */}
      <div className="card" style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#111", marginBottom: 10 }}>This week</div>
        <div style={{ height: 1, background: "#f5f5f5", marginBottom: 2 }} />

        {WEEK_STATS.map((row, i) => {
          const hovered = hoveredRow === i;
          return (
            <button
              key={row.label}
              onClick={() => setActiveModal(row.modal)}
              onMouseEnter={() => setHoveredRow(i)}
              onMouseLeave={() => setHoveredRow(null)}
              style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                width: "100%", border: "none", textAlign: "left",
                cursor: "pointer", padding: "7px 4px", margin: "0 -4px", borderRadius: 6,
                borderBottom: i < WEEK_STATS.length - 1 ? "1px solid #f5f5f5" : "none",
                background: hovered ? "#fafaf8" : "none",
                transition: "background 0.12s",
              } as React.CSSProperties}
            >
              <span style={{ fontSize: 12, color: "#555" }}>{row.label}</span>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#111" }}>{row.value}</span>
                <span style={{ fontSize: 11, color: row.trend === "up" ? "#2D9A5A" : "#999" }}>
                  {row.trend === "up" ? "↑" : "→"}
                </span>
                <span style={{ fontSize: 12, color: "#ccc", opacity: hovered ? 1 : 0, transition: "opacity 0.12s", marginLeft: 2 }}>›</span>
              </span>
            </button>
          );
        })}

        <div style={{ marginTop: 10, fontSize: 10, color: "#999", fontStyle: "italic" }}>Updated daily</div>
      </div>

      {/* Current season */}
      <CurrentSeasonCard />

      {/* Week stat modal */}
      {activeModal && (
        <WeekStatsModal type={activeModal} onClose={() => setActiveModal(null)} />
      )}
    </div>
  );
}
