"use client";
import { useState } from "react";

interface Highlight {
  id: string;
  title: string;
  views: string;
  duration: string;
}

interface Athlete {
  highlights: Highlight[];
}

export default function HighlightReel({ athlete }: { athlete: Athlete }) {
  const [playing, setPlaying] = useState<string | null>(null);

  return (
    <div className="card">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
          Highlight Reel
        </div>
        <span style={{ fontSize: 11, color: "var(--green)", fontWeight: 600 }}>{athlete.highlights.length} videos</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {athlete.highlights.map(video => (
          <button
            key={video.id}
            onClick={() => setPlaying(playing === video.id ? null : video.id)}
            style={{
              display: "flex", alignItems: "center", gap: 12,
              background: playing === video.id ? "var(--green-light)" : "#F8F8F6",
              border: "1px solid " + (playing === video.id ? "var(--green)" : "transparent"),
              borderRadius: 8, padding: "10px 12px", cursor: "pointer",
              transition: "all 0.15s", textAlign: "left", width: "100%",
            }}
          >
            {/* Thumbnail placeholder */}
            <div style={{
              width: 56, height: 40, borderRadius: 6, background: "#1A6B3C22",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, position: "relative",
            }}>
              <svg width="18" height="18" fill="#1A6B3C" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
              <span style={{
                position: "absolute", bottom: 2, right: 4,
                fontSize: 9, fontWeight: 700, color: "var(--green)",
              }}>{video.duration}</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#111", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{video.title}</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{video.views} views</div>
            </div>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: "#ccc", flexShrink: 0 }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ))}
      </div>

      <button className="dashed-btn" style={{ marginTop: 10 }}>
        + Add clip
      </button>
    </div>
  );
}
