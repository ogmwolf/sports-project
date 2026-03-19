"use client";
import { useState } from "react";
import Link from "next/link";
import NewsCard from "@/components/Feed/NewsCard";
import nilNewsData from "@/data/nil-news.json";

const TOP_CLUBS = [
  { rank: 1, name: "SC Rockstar",    location: "Manhattan Beach CA", initials: "SR", bg: "#1A6B3C", color: "white" },
  { rank: 2, name: "A5 Volleyball",  location: "Atlanta GA",          initials: "A5", bg: "#185FA5", color: "white" },
  { rank: 3, name: "TAV",            location: "Frisco TX",           initials: "TV", bg: "#E6F1FB", color: "#0C447C" },
];

const PEOPLE = [
  { initials: "KB", name: "Kayla Brooks",    role: "Setter · Coast VBC",           bg: "#FAEEDA", color: "#633806" },
  { initials: "TN", name: "Taylor Nguyen",   role: "OH · Mizuno Long Beach",       bg: "#EEEDFE", color: "#3C3489" },
  { initials: "JR", name: "Jordan Ruiz",     role: "Libero · El Segundo VB",    bg: "#EEEDFE", color: "#3C3489" },
  { initials: "MC", name: "Marcus Chen",     role: "Setter · Manhattan Beach VB", bg: "#E8F5EE", color: "#0F4A28" },
  { initials: "PP", name: "Priya Patel",     role: "OH · Mira Costa HS",        bg: "#FAEEDA", color: "#633806" },
  { initials: "TR", name: "Tyler Rhodes",    role: "MB · Redondo Beach VB",     bg: "#EEEDFE", color: "#3C3489" },
  { initials: "KT", name: "Kayla Torres",    role: "DS/L · Beach Cities FC",    bg: "#FAECE7", color: "#712B13" },
  { initials: "DW", name: "Devon Williams",  role: "S · El Segundo VB",         bg: "#E6F1FB", color: "#0C447C" },
  { initials: "AN", name: "Ava Nguyen",      role: "OH · Torrance VB",          bg: "#E8F5EE", color: "#0F4A28" },
];

interface Event {
  name: string;
  dates: string;
  venue: string;
  divisions: string;
  detail: string;
  url: string;
}

const EVENTS: Event[] = [
  { name: "Red Rock Rave #2",        dates: "Apr 4–6",      venue: "Mandalay Bay, Las Vegas",  divisions: "14U–18U Open/Club",      detail: "SCVA qualifier — top 4 bids per division. Must be registered by Mar 21.",   url: "#" },
  { name: "SCVA Far Westerns",       dates: "Apr 26–27",    venue: "Long Beach CC",            divisions: "12U–18U",                detail: "Regional championship. Automatic qualifier bids awarded.",                   url: "#" },
  { name: "SoCal Qualifier",         dates: "May 3–4",      venue: "Anaheim Convention Ctr",   divisions: "14U–18U",                detail: "One of the largest qualifiers on the West Coast. Pool play + bracket.",     url: "#" },
  { name: "Big South Qualifier",     dates: "May 10–11",    venue: "Palm Springs CC",          divisions: "15U–18U Open",           detail: "Bids awarded to USAV Junior Nationals in all divisions.",                    url: "#" },
  { name: "Pacific Qualifier",       dates: "May 17–18",    venue: "Sacramento CC",            divisions: "14U–18U",                detail: "Bid tournament — top finishers earn JNC berths.",                           url: "#" },
  { name: "Crossroads Classic",      dates: "May 24–25",    venue: "Las Vegas CC",             divisions: "13U–18U",                detail: "Invitational format. Strong field from SCVA + Sierra Nevada.",               url: "#" },
  { name: "USAV Junior Nationals",   dates: "Jun 16–22",    venue: "Indianapolis, IN",         divisions: "All age groups",         detail: "The premier junior volleyball event in the country. Must qualify.",           url: "#" },
  { name: "USAV GJNCs 16s",         dates: "Jun 30–Jul 3", venue: "Kay Bailey Hutchison, Dallas", divisions: "16U Open/USA",      detail: "Girls Junior National Championships 16-Open division.",                       url: "#" },
  { name: "AVP Next — Long Beach",   dates: "Jul 12–13",    venue: "Long Beach Blvd",          divisions: "16U–18U Beach",          detail: "Beach volleyball development series. Pairs format.",                         url: "#" },
  { name: "SCVA Fall Classic",       dates: "Sep 6–7",      venue: "Ontario CC",               divisions: "14U–18U",                detail: "Season opener. Non-qualifier — great for early-season competition.",          url: "#" },
];

// ── NIL tag color helper ────────────────────────────────────────────────────
function nilTagStyle(tag: string): React.CSSProperties {
  switch (tag) {
    case "NCAA":       return { background: "#E6F1FB", color: "#0C447C" };
    case "Collective": return { background: "#EEEDFE", color: "#3C3489" };
    case "Deal":       return { background: "#E8F5EE", color: "#0F4A28" };
    case "Revenue":    return { background: "#FAEEDA", color: "#633806" };
    case "Policy":     return { background: "#FAECE7", color: "#712B13" };
    default:           return { background: "#f0f0f0", color: "#555" };
  }
}

// ── NIL Updates widget ──────────────────────────────────────────────────────
const TOP_NIL_STORIES = nilNewsData.slice(0, 3);

function NILWidget() {
  return (
    <div className="card" style={{ marginTop: 8 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
          NIL Updates
        </div>
        <Link href="/recruiting?tab=nil" style={{ fontSize: 11, fontWeight: 700, color: "#1A6B3C", textDecoration: "none" }}>
          See all →
        </Link>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {TOP_NIL_STORIES.map(story => (
          <a
            key={story.id}
            href={story.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: "none", display: "block" }}
          >
            <span style={{
              ...nilTagStyle(story.tag),
              borderRadius: 20, padding: "2px 7px",
              fontSize: 10, fontWeight: 700,
              display: "inline-block", marginBottom: 3,
            }}>
              {story.tag}
            </span>
            <div style={{
              fontSize: 12, fontWeight: 600, color: "#111", lineHeight: 1.4,
              overflow: "hidden", display: "-webkit-box",
              WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
            }}>
              {story.headline}
            </div>
            <div style={{ fontSize: 10, color: "#999", marginTop: 2 }}>{story.source}</div>
          </a>
        ))}
      </div>
    </div>
  );
}

export default function RightSidebar() {
  const [followed, setFollowed] = useState<Set<string>>(new Set());
  const [showAllPeople, setShowAllPeople] = useState(false);
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);
  const [showAllEvents, setShowAllEvents] = useState(false);

  const visibleEvents = showAllEvents ? EVENTS : EVENTS.slice(0, 3);

  return (
    <div>
      {/* Top Clubs */}
      <div className="card" style={{ marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
            Top Clubs
          </div>
          <Link href="/rankings" style={{ fontSize: 11, fontWeight: 700, color: "#1A6B3C", textDecoration: "none" }}>
            See all →
          </Link>
        </div>
        {TOP_CLUBS.map(c => (
          <div key={c.name} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderRadius: 6 }}>
            <span style={{ width: 16, fontSize: 11, fontWeight: 700, color: c.rank === 1 ? "#D4AF37" : c.rank === 2 ? "#A8A9AD" : "#CD7F32", textAlign: "right", flexShrink: 0 }}>
              {c.rank}
            </span>
            <div style={{ width: 24, height: 24, borderRadius: "50%", background: c.bg, display: "flex", alignItems: "center", justifyContent: "center", color: c.color, fontWeight: 800, fontSize: 9, flexShrink: 0 }}>
              {c.initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#111" }}>{c.name}</div>
              <div style={{ fontSize: 11, color: "#555" }}>{c.location}</div>
            </div>
          </div>
        ))}
      </div>

      {/* News card */}
      <NewsCard />

      {/* NIL Updates widget */}
      <NILWidget />

      {/* Athletes you may know */}
      <div className="card" style={{ marginTop: 8 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 12 }}>
          Athletes you may know
        </div>
        {(showAllPeople ? PEOPLE : PEOPLE.slice(0, 3)).map(p => (
          <div key={p.name} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: p.bg, display: "flex", alignItems: "center", justifyContent: "center", color: p.color, fontWeight: 800, fontSize: 12, flexShrink: 0 }}>
              {p.initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#111", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.role}</div>
            </div>
            <button
              onClick={() => setFollowed(prev => {
                const next = new Set(prev);
                next.has(p.name) ? next.delete(p.name) : next.add(p.name);
                return next;
              })}
              style={{
                background: followed.has(p.name) ? "var(--green-light)" : "none",
                border: `1px solid ${followed.has(p.name) ? "var(--green)" : "#ccc"}`,
                borderRadius: 20, padding: "4px 12px",
                fontSize: 11, fontWeight: 700, cursor: "pointer",
                color: followed.has(p.name) ? "var(--green)" : "#555",
                flexShrink: 0, transition: "all 0.15s",
              }}
            >
              {followed.has(p.name) ? "Following" : "+ Follow"}
            </button>
          </div>
        ))}
        <button
          onClick={() => setShowAllPeople(s => !s)}
          style={{ background: "none", border: "none", cursor: "pointer", color: "var(--green)", fontSize: 12, fontWeight: 700, padding: 0, textDecoration: "none" }}
          onMouseEnter={e => (e.currentTarget.style.textDecoration = "underline")}
          onMouseLeave={e => (e.currentTarget.style.textDecoration = "none")}
        >
          {showAllPeople ? "Show less ←" : "Show more →"}
        </button>
      </div>

      {/* Upcoming events */}
      <div id="upcoming-events" className="card" style={{ marginTop: 8 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 12 }}>
          Upcoming
        </div>
        {visibleEvents.map((ev, i) => {
          const isExpanded = expandedEvent === ev.name;
          return (
            <div
              key={ev.name}
              style={{
                marginBottom: i < visibleEvents.length - 1 ? 10 : 0,
                borderLeft: isExpanded ? "3px solid var(--green)" : "3px solid transparent",
                paddingLeft: isExpanded ? 8 : 0,
                transition: "border-color 0.15s",
              }}
            >
              <div
                style={{ display: "flex", gap: 10, alignItems: "flex-start", cursor: "pointer" }}
                onClick={() => setExpandedEvent(isExpanded ? null : ev.name)}
              >
                <div style={{ background: "var(--green-light)", color: "var(--green-text)", borderRadius: 6, padding: "4px 6px", fontSize: 9, fontWeight: 800, letterSpacing: "0.04em", textAlign: "center", flexShrink: 0, minWidth: 52, lineHeight: 1.3 }}>
                  {ev.dates}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#111", lineHeight: 1.3 }}>{ev.name}</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 1 }}>{ev.venue}</div>
                </div>
                <span style={{ fontSize: 10, color: "var(--text-muted)", flexShrink: 0, marginTop: 2 }}>{isExpanded ? "▴" : "▾"}</span>
              </div>
              {isExpanded && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ fontSize: 11, color: "#555", fontWeight: 600, marginBottom: 2 }}>{ev.divisions}</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.5, marginBottom: 6 }}>{ev.detail}</div>
                  <a href={ev.url} style={{ fontSize: 11, color: "var(--green)", fontWeight: 700, textDecoration: "none" }}>View event →</a>
                </div>
              )}
            </div>
          );
        })}
        {!showAllEvents && (
          <button
            onClick={() => setShowAllEvents(true)}
            style={{ marginTop: 12, width: "100%", background: "none", border: "none", color: "var(--green)", fontSize: 12, fontWeight: 700, cursor: "pointer", textAlign: "center", padding: "4px 0" }}
          >
            Show all 10 events ▾
          </button>
        )}
        {showAllEvents && (
          <button
            onClick={() => setShowAllEvents(false)}
            style={{ marginTop: 12, width: "100%", background: "none", border: "none", color: "var(--text-muted)", fontSize: 12, fontWeight: 700, cursor: "pointer", textAlign: "center", padding: "4px 0" }}
          >
            Show less ▴
          </button>
        )}
      </div>
    </div>
  );
}
