"use client";
import { useState } from "react";
import type { JSX } from "react";
import { useApp } from "@/context/AppContext";

const POST_TYPES = ["Milestone", "Clip", "Tournament", "PR", "Photos", "Other"];

const XIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.257 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
  </svg>
);
const IGIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
  </svg>
);
const TTIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.73a4.85 4.85 0 01-1.01-.04z" />
  </svg>
);
const SCIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l.013.013c.597.045 1.5-.202 1.5-.202.174 0 .596.074.62.556.01.181-.041.598-.924.892-.097.03-.374.136-.374.136s.16.617.478 1.369c.208.487.746 1.504 1.95 1.882.05.017.05.1-.001.127-.502.254-1.27.516-2.22.516-.093 0-.191 0-.291-.007a4.42 4.42 0 01-.443.498l-.01.012c.295.132.647.23 1.06.238.166.003.313-.003.465-.01.047-.003.094-.005.141-.005h.012c.22 0 .573.048.573.427 0 .5-.546.684-.958.684-.04 0-.082 0-.123-.004l-.048-.002a5.77 5.77 0 01-.985.097c-.264 0-.536-.024-.808-.072l-.04-.007a7.88 7.88 0 01-.538.46c-.47.355-1.027.58-1.71.684a7.55 7.55 0 01-1.15.088c-.388 0-.765-.03-1.124-.088-.682-.104-1.24-.329-1.71-.684-.17-.128-.358-.285-.537-.46l-.04.007a5.784 5.784 0 01-.808.072 5.77 5.77 0 01-.985-.097l-.048.002c-.04.004-.082.004-.123.004-.411 0-.958-.184-.958-.684 0-.38.353-.427.573-.427h.012c.047 0 .094.002.14.005.152.007.3.013.466.01.412-.008.764-.106 1.058-.238l-.01-.012a4.455 4.455 0 01-.443-.498c-.1.007-.198.007-.291.007-.95 0-1.72-.262-2.22-.516-.05-.027-.05-.11 0-.127 1.203-.378 1.741-1.395 1.95-1.882.317-.752.478-1.369.478-1.369s-.277-.106-.374-.136c-.882-.294-.933-.711-.924-.892.024-.482.446-.556.62-.556 0 0 .902.247 1.5.202l.012-.013c-.104-1.628-.23-3.654.3-4.847C7.862 1.068 11.218.793 12.206.793z" />
  </svg>
);
const FBIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const PLATFORMS: Record<string, { label: string; bg: string; Icon: () => JSX.Element }> = {
  x:         { label: "X",         bg: "#111111", Icon: XIcon },
  instagram: { label: "Instagram", bg: "#C13584", Icon: IGIcon },
  tiktok:    { label: "TikTok",    bg: "#111111", Icon: TTIcon },
  snapchat:  { label: "Snapchat",  bg: "#D4B800", Icon: SCIcon },
  meta:      { label: "Meta",      bg: "#1877F2", Icon: FBIcon },
};

export default function Composer() {
  const { addPost, showToast } = useApp();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [postType, setPostType] = useState("Milestone");
  const [broadcasts, setBroadcasts] = useState<Set<string>>(new Set());
  const [mediaActive, setMediaActive] = useState<string | null>(null);

  const toggleBroadcast = (p: string) => {
    setBroadcasts(prev => {
      const next = new Set(prev);
      next.has(p) ? next.delete(p) : next.add(p);
      return next;
    });
  };

  const handlePost = () => {
    if (!text.trim()) return;
    addPost({
      id: `post-${Date.now()}`,
      author: "Sofia Reyes",
      initials: "SR",
      position: "OH",
      club: "SC Rockstar 16U",
      classYear: 2029,
      timestamp: "just now",
      body: text.trim(),
      platforms: Array.from(broadcasts),
      reactions: 0,
      comments: [],
    });
    showToast("Posted!");
    setText(""); setOpen(false); setBroadcasts(new Set()); setMediaActive(null);
  };

  if (!open) {
    return (
      <div className="card" style={{ padding: "12px 16px" }}>
        {/* Top row: avatar + fake input */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <div style={{ width: 38, height: 38, borderRadius: "50%", background: "#1A6B3C", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 800, fontSize: 13, flexShrink: 0 }}>
            SR
          </div>
          <button
            onClick={() => setOpen(true)}
            style={{ flex: 1, textAlign: "left", padding: "9px 14px", background: "none", border: "1px solid #ccc", borderRadius: 20, fontSize: 13, color: "#999", cursor: "pointer", fontFamily: "inherit" }}
          >
            Start a post...
          </button>
        </div>
        {/* Divider */}
        <div style={{ height: 1, background: "var(--border)", marginBottom: 6 }} />
        {/* Action row */}
        <div style={{ display: "flex" }}>
          {[
            { icon: "🎬", label: "Video" },
            { icon: "📷", label: "Photo" },
            { icon: "📝", label: "Milestone" },
          ].map((btn, i) => (
            <div key={btn.label} style={{ display: "flex", flex: 1, alignItems: "center" }}>
              {i > 0 && <div style={{ width: 1, height: 24, background: "var(--border)" }} />}
              <button
                onClick={() => setOpen(true)}
                style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "8px", background: "none", border: "none", cursor: "pointer", borderRadius: 6, fontSize: 12, fontWeight: 700, color: "#555" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#f5f5f3"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "none"; }}
              >
                <span style={{ fontSize: 16 }}>{btn.icon}</span>
                {btn.label}
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: "16px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#1A6B3C", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 800, fontSize: 14 }}>SR</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#111" }}>Sofia Reyes</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>OH · SC Rockstar 16U · Class of 2029</div>
          </div>
        </div>
        <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#999", padding: 4 }}>
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <textarea
        autoFocus
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="What's happening in your recruiting journey?"
        style={{ width: "100%", border: "none", resize: "none", fontSize: 14, color: "#111", lineHeight: 1.6, minHeight: 90, background: "none", outline: "none", boxSizing: "border-box" }}
        rows={4}
      />

      {/* Media row */}
      <div style={{ display: "flex", gap: 8, padding: "10px 0", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", marginBottom: 12 }}>
        {[
          { id: "video", label: "Video", icon: "🎬" },
          { id: "photo", label: "Photo", icon: "📷" },
          { id: "link",  label: "Link",  icon: "🔗" },
        ].map(m => (
          <button
            key={m.id}
            onClick={() => setMediaActive(mediaActive === m.id ? null : m.id)}
            style={{ display: "flex", alignItems: "center", gap: 4, padding: "5px 10px", borderRadius: 20, border: `1px solid ${mediaActive === m.id ? "var(--green)" : "var(--border)"}`, background: mediaActive === m.id ? "var(--green-light)" : "white", color: mediaActive === m.id ? "var(--green)" : "var(--text-secondary)", fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.15s" }}
          >
            <span>{m.icon}</span> {m.label}
          </button>
        ))}
      </div>

      {/* Post type chips */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 6 }}>Post type</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {POST_TYPES.map(pt => (
            <button key={pt} onClick={() => setPostType(pt)} style={{ padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600, border: `1px solid ${postType === pt ? "var(--green)" : "var(--border)"}`, background: postType === pt ? "var(--green)" : "white", color: postType === pt ? "white" : "var(--text-secondary)", cursor: "pointer", transition: "all 0.15s" }}>
              {pt}
            </button>
          ))}
        </div>
      </div>

      {/* Broadcast toggles */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 6 }}>Broadcast to</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {Object.entries(PLATFORMS).map(([key, info]) => {
            const on = broadcasts.has(key);
            return (
              <button
                key={key}
                onClick={() => toggleBroadcast(key)}
                style={{
                  display: "inline-flex", alignItems: "center", gap: on ? 4 : 0,
                  padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                  border: `1px solid ${on ? info.bg : "var(--border)"}`,
                  background: on ? info.bg : "white",
                  color: on ? "white" : "var(--text-secondary)",
                  cursor: "pointer", transition: "all 0.15s",
                }}
              >
                <span style={{ color: on ? "white" : info.bg, display: "flex", alignItems: "center" }}>
                  <info.Icon />
                </span>
                {on && info.label}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 11, color: text.length > 400 ? "#E53E3E" : "var(--text-muted)" }}>{text.length}/500</span>
        <button className="btn-primary" onClick={handlePost} disabled={!text.trim()} style={{ padding: "8px 24px" }}>Post</button>
      </div>
    </div>
  );
}
