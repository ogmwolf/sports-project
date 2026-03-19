"use client";
import { useState, useEffect, useRef } from "react";
import fallback from "@/data/news.json";
import InfoIcon from "@/components/Common/InfoIcon";

interface NewsItem {
  id: string;
  headline: string;
  source: string;
  sourceUrl: string;
  date: string;
  tag: string;
  body: string;
}

const TAG_CLASSES: Record<string, string> = {
  Live: "tag-Live", NCAA: "tag-NCAA", Recruiting: "tag-Recruiting",
  Rankings: "tag-Rankings", Tournament: "tag-Tournament", Nationals: "tag-Nationals",
};

export default function NewsCard() {
  const [news, setNews] = useState<NewsItem[]>(fallback as NewsItem[]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showMore, setShowMore] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const infoRef = useRef<HTMLDivElement>(null);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/news");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) setNews(data);
      }
    } catch {
      // keep fallback
    } finally {
      setLoading(false);
      setLastUpdated(new Date());
    }
  };

  useEffect(() => { fetchNews(); }, []);

  // Close popover on outside click
  useEffect(() => {
    if (!infoOpen) return;
    const handler = (e: MouseEvent) => {
      if (infoRef.current && !infoRef.current.contains(e.target as Node)) {
        setInfoOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [infoOpen]);

  const visible = showMore ? news : news.slice(0, 4);

  const minutesAgo = lastUpdated
    ? Math.floor((Date.now() - lastUpdated.getTime()) / 60000)
    : null;

  return (
    <div className="card" style={{ padding: "14px 16px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 800, color: "#111", letterSpacing: "0.04em" }}>VOLLEYBALL NEWS</span>
          {minutesAgo !== null && (
            <span style={{ fontSize: 10, color: "var(--text-muted)" }}>
              Updated {minutesAgo < 1 ? "just now" : `${minutesAgo}m ago`}
            </span>
          )}
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button
            onClick={fetchNews}
            title="Refresh"
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: 14, padding: 2 }}
          >
            ↻
          </button>
          {/* ⓘ info button + popover */}
          <div ref={infoRef} style={{ position: "relative" }}>
            <button
              onClick={() => setInfoOpen(o => !o)}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 2, display: "flex", alignItems: "center" }}
              title="About this card"
            >
              <InfoIcon />
            </button>
            {infoOpen && (
              <div style={{
                position: "absolute", top: "calc(100% + 6px)", right: 0,
                width: 240, background: "#fff",
                border: "1px solid #e8e8e8", borderRadius: 8,
                padding: "12px", zIndex: 50,
                fontSize: 12, color: "#444", lineHeight: 1.6,
              }}>
                These are today&apos;s top volleyball news stories and conversations, sourced from JVA, USA Volleyball, PrepVolleyball, and other trusted sources. Stories are personalized based on your sport, position, and location. Updated every 2 hours.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[1,2,3,4].map(i => (
            <div key={i}>
              <div className="skeleton" style={{ height: 12, width: "90%", marginBottom: 4 }} />
              <div className="skeleton" style={{ height: 10, width: "50%" }} />
            </div>
          ))}
        </div>
      )}

      {/* Stories */}
      {!loading && (
        <div>
          {expanded ? (
            // Full article view
            <div>
              <button
                onClick={() => setExpanded(null)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--green)", fontSize: 12, fontWeight: 700, marginBottom: 10, padding: 0 }}
              >
                ← Back to headlines
              </button>
              {(() => {
                const story = news.find(n => n.id === expanded);
                if (!story) return null;
                return (
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                      <span className={`badge ${TAG_CLASSES[story.tag] || "badge-gray"}`}>{story.tag}</span>
                      <span style={{ fontSize: 10, color: "var(--text-muted)" }}>{story.source} · {story.date}</span>
                    </div>
                    <h3 style={{ margin: "0 0 8px", fontSize: 14, fontWeight: 700, color: "#111", lineHeight: 1.4 }}>{story.headline}</h3>
                    <p style={{ margin: "0 0 10px", fontSize: 13, color: "#333", lineHeight: 1.65 }}>{story.body}</p>
                    {story.sourceUrl && story.sourceUrl !== "#" && (
                      <a
                        href={story.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: 12, color: "var(--green)", fontWeight: 700, textDecoration: "none" }}
                      >
                        Read full article →
                      </a>
                    )}
                  </div>
                );
              })()}
            </div>
          ) : (
            // Headlines list
            <div>
              {visible.map((story, idx) => (
                <div
                  key={story.id}
                  style={{
                    display: "flex", gap: 10, paddingBottom: 10,
                    borderBottom: idx < visible.length - 1 ? "1px solid #F0F0EE" : "none",
                    marginBottom: idx < visible.length - 1 ? 10 : 0,
                    cursor: "pointer",
                  }}
                  onClick={() => setExpanded(story.id)}
                >
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-muted)", flexShrink: 0, marginTop: 1 }}>
                    {idx + 1}
                  </span>
                  <div>
                    <button
                      style={{ background: "none", border: "none", cursor: "pointer", padding: 0, textAlign: "left" }}
                      onClick={e => { e.stopPropagation(); setExpanded(story.id); }}
                    >
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#111", lineHeight: 1.4, display: "block" }}>
                        {story.headline}
                      </span>
                    </button>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
                      <span className={`badge ${TAG_CLASSES[story.tag] || "badge-gray"}`} style={{ fontSize: 9 }}>{story.tag}</span>
                      <span style={{ fontSize: 10, color: "var(--text-muted)" }}>{story.source} · {story.date}</span>
                    </div>
                  </div>
                </div>
              ))}

              {news.length > 4 && (
                <button
                  onClick={() => setShowMore(s => !s)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--green)", fontSize: 12, fontWeight: 700, padding: "8px 0 0", width: "100%", textAlign: "center" }}
                >
                  {showMore ? "Show less ↑" : `Show ${news.length - 4} more ↓`}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
