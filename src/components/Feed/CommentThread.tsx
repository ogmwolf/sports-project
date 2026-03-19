"use client";
import { useState } from "react";
import { useApp } from "@/context/AppContext";

interface Comment {
  id: string;
  author: string;
  initials: string;
  text: string;
  timestamp: string;
  badge?: string;
  avatarBg?: string;
}

interface Props {
  postId: string;
  comments: Comment[];
}

export default function CommentThread({ postId, comments }: Props) {
  const { addComment } = useApp();
  const [text, setText] = useState("");

  const handlePost = () => {
    if (!text.trim()) return;
    addComment(postId, text.trim());
    setText("");
  };

  return (
    <div style={{ borderTop: "1px solid var(--border)", padding: "12px 16px 14px" }}>
      {comments.map(c => (
        <div key={c.id} style={{ display: "flex", gap: 8, marginBottom: 10 }}>
          <div style={{
            width: 28, height: 28, borderRadius: "50%", background: c.avatarBg || "#9CA3AF",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: c.avatarBg ? "#633806" : "white", fontSize: 10, fontWeight: 700, flexShrink: 0,
          }}>
            {c.initials || c.author[0]}
          </div>
          <div style={{ flex: 1, background: "#F3F4F6", borderRadius: "0 10px 10px 10px", padding: "7px 10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 2 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#111" }}>{c.author}</span>
              {c.badge && (
                <span style={{ fontSize: 10, background: "#EEEDFE", color: "#3C3489", borderRadius: 8, padding: "1px 6px", fontWeight: 600 }}>
                  {c.badge}
                </span>
              )}
              <span style={{ fontSize: 10, color: "var(--text-muted)" }}>{c.timestamp}</span>
            </div>
            <p style={{ margin: 0, fontSize: 12, color: "#333", lineHeight: 1.5 }}>{c.text}</p>
          </div>
        </div>
      ))}

      {/* Input */}
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 4 }}>
        <div style={{
          width: 28, height: 28, borderRadius: "50%", background: "#1A6B3C",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "white", fontSize: 10, fontWeight: 700, flexShrink: 0,
        }}>SR</div>
        <div style={{ flex: 1, display: "flex", gap: 6, alignItems: "center", background: "#F3F4F6", borderRadius: 20, padding: "6px 12px" }}>
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handlePost()}
            placeholder="Add a comment..."
            style={{ flex: 1, background: "none", border: "none", fontSize: 12, color: "#111", outline: "none" }}
          />
          <button
            onClick={handlePost}
            disabled={!text.trim()}
            style={{
              background: "none", border: "none", cursor: "pointer",
              fontSize: 12, fontWeight: 700,
              color: text.trim() ? "var(--green)" : "var(--text-muted)",
              padding: 0, flexShrink: 0,
            }}
          >
            Post
          </button>
        </div>
      </div>
    </div>
  );
}
