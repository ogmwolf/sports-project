"use client";
import { useState, useRef, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import MilestoneBanner from "./MilestoneBanner";
import ClipPreview from "./ClipPreview";
import PRQuote from "./PRQuote";
import BroadcastBadges from "./BroadcastBadges";
import CommentThread from "./CommentThread";

interface Post {
  id: string;
  author: string;
  initials: string;
  position: string | null;
  club: string;
  classYear: number | null;
  timestamp: string;
  body: string;
  isClub?: boolean;
  isBot?: boolean;
  isOfficial?: boolean;
  milestone?: { type: string; text: string; detail: string };
  clip?: { title: string; duration: string; youtubeId?: string; label?: string };
  prQuote?: { text: string; source: string };
  photo?: { url: string };
  platforms: string[];
  reactions: number;
  reactLabel?: string;
}

const AVATAR_COLORS: Record<string, string> = {
  SL: "#7C3AED", TM: "#0369A1", RV: "#1A6B3C",
  AK: "#B45309", JR: "#0F766E", JW: "#1A6B3C", MW: "#1A6B3C", SR: "#1A6B3C",
};

const CURRENT_USER = "Sofia Reyes";

export default function FeedPost({ post }: { post: Post }) {
  const { likedPosts, toggleLike, comments, followedUsers, toggleFollowUser, showToast, deletePost, updatePost } = useApp();
  const liked = likedPosts.has(post.id);
  const postComments = comments[post.id] || [];
  const [commentsOpen, setCommentsOpen] = useState(false);

  // Owner menu state
  const isOwner = post.author === CURRENT_USER && !post.isClub && !post.isBot && !post.isOfficial;
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editText, setEditText] = useState(post.body);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click or Escape
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { setMenuOpen(false); setDeleteConfirm(false); } };
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
        setDeleteConfirm(false);
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => { document.removeEventListener("keydown", onKey); document.removeEventListener("mousedown", onClick); };
  }, [menuOpen]);

  const handleDelete = () => {
    setDeleting(true);
    setMenuOpen(false);
    setTimeout(() => deletePost(post.id), 220);
  };

  const handleSaveEdit = () => {
    updatePost(post.id, editText);
    setEditMode(false);
  };

  const reactCount = liked ? post.reactions + 1 : post.reactions;
  const avatarBg = AVATAR_COLORS[post.initials] || "#6B7280";

  const byline = [
    post.position,
    post.club,
    post.classYear ? `Class of ${post.classYear}` : null,
  ].filter(Boolean).join(" · ");

  return (
    <div
      className="card"
      style={{
        padding: 0, overflow: "hidden",
        opacity: deleting ? 0 : 1,
        transition: deleting ? "opacity 0.2s ease, max-height 0.2s ease" : "none",
      }}
    >
      {/* Header */}
      <div style={{ padding: "14px 16px 0", position: "relative" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
          {/* Avatar */}
          {post.isOfficial ? (
            <div style={{
              width: 42, height: 42, borderRadius: "50%", flexShrink: 0,
              background: "#D4AF37",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 20,
            }}>🏆</div>
          ) : post.isBot ? (
            <div style={{
              width: 42, height: 42, borderRadius: "50%", flexShrink: 0,
              background: "#534AB7",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 20,
            }}>🤖</div>
          ) : (
            <div style={{
              width: 42, height: 42, borderRadius: "50%", flexShrink: 0,
              background: avatarBg,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "white", fontWeight: 800, fontSize: 14,
            }}>
              {post.initials}
            </div>
          )}

          {/* Name + role */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
              <span style={{ fontWeight: 700, fontSize: 14, color: "#111" }}>{post.author}</span>
              {post.isOfficial && (
                <span style={{ background: "#E8F5EE", color: "#0F4A28", fontSize: 10, borderRadius: 10, padding: "2px 8px", fontWeight: 700 }}>
                  ✓ Official
                </span>
              )}
              {post.isBot && (
                <span style={{ background: "#EEEDFE", color: "#3C3489", fontSize: 10, borderRadius: 10, padding: "2px 8px", fontWeight: 600 }}>
                  {post.club}
                </span>
              )}
            </div>
            {!post.isBot && !post.isOfficial && byline && <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 1 }}>{byline}</div>}
            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{post.timestamp}</div>
          </div>

          {/* Follow button — not for club accounts, bot posts, official posts, or own posts */}
          {!post.isClub && !post.isBot && !post.isOfficial && !isOwner && (
            <button
              onClick={() => toggleFollowUser(post.id)}
              style={{
                background: followedUsers.has(post.id) ? "var(--green-light)" : "none",
                border: `1px solid ${followedUsers.has(post.id) ? "var(--green)" : "#ccc"}`,
                borderRadius: 20, padding: "4px 12px",
                fontSize: 11, fontWeight: 700,
                color: followedUsers.has(post.id) ? "var(--green)" : "#555",
                cursor: "pointer", flexShrink: 0, transition: "all 0.15s",
              }}
            >
              {followedUsers.has(post.id) ? "Following" : "+ Follow"}
            </button>
          )}

          {/* ··· owner menu */}
          {isOwner && (
            <div ref={menuRef} style={{ position: "relative", flexShrink: 0 }}>
              <MenuButton onClick={() => { setMenuOpen(o => !o); setDeleteConfirm(false); }} />

              {menuOpen && (
                <div style={{
                  position: "absolute", top: "calc(100% + 4px)", right: 0,
                  background: "#fff", border: "1px solid #e8e8e8",
                  borderRadius: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  zIndex: 500, minWidth: 140, overflow: "hidden",
                }}>
                  {!deleteConfirm ? (
                    <>
                      {/* Edit */}
                      <button
                        onClick={() => { setEditMode(true); setMenuOpen(false); setEditText(post.body); }}
                        style={menuItemStyle}
                      >
                        <PencilIcon />
                        <span style={{ fontSize: 13, color: "#111" }}>Edit post</span>
                      </button>
                      {/* Delete */}
                      <button
                        onClick={() => setDeleteConfirm(true)}
                        style={menuItemStyle}
                      >
                        <TrashIcon />
                        <span style={{ fontSize: 13, color: "#e24b4a" }}>Delete post</span>
                      </button>
                    </>
                  ) : (
                    /* Delete confirmation */
                    <div style={{ padding: "10px 12px" }}>
                      <div style={{ fontSize: 12, color: "#333", marginBottom: 8, fontWeight: 600 }}>Delete this post?</div>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          onClick={handleDelete}
                          style={{ flex: 1, padding: "5px 0", borderRadius: 6, border: "none", background: "#e24b4a", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => { setDeleteConfirm(false); setMenuOpen(false); }}
                          style={{ flex: 1, padding: "5px 0", borderRadius: 6, border: "1px solid #ddd", background: "none", fontSize: 12, fontWeight: 600, color: "#555", cursor: "pointer" }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Body — normal or edit mode */}
        {editMode ? (
          <div style={{ marginTop: 10 }}>
            <textarea
              value={editText}
              onChange={e => setEditText(e.target.value)}
              rows={4}
              style={{
                width: "100%", boxSizing: "border-box",
                padding: "8px 10px", borderRadius: 8,
                border: "1px solid #ddd", fontSize: 14,
                color: "#111", lineHeight: 1.6, resize: "vertical",
                fontFamily: "inherit", outline: "none",
              }}
            />
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button
                onClick={handleSaveEdit}
                style={{ padding: "6px 16px", borderRadius: 8, border: "none", background: "#1A6B3C", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
              >
                Save
              </button>
              <button
                onClick={() => setEditMode(false)}
                style={{ padding: "6px 16px", borderRadius: 8, border: "1px solid #ddd", background: "none", fontSize: 13, fontWeight: 600, color: "#555", cursor: "pointer" }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p style={{ margin: "10px 0 0", fontSize: 14, color: "#111", lineHeight: 1.6, whiteSpace: (post.isBot || post.isOfficial) ? "pre-wrap" : "normal" }}>{post.body}</p>
        )}

        {/* Photo */}
        {post.photo && (
          <>
            <div
              style={{ position: "relative", marginTop: 10, cursor: "pointer", borderRadius: 8, overflow: "hidden" }}
              onClick={() => setLightboxOpen(true)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.photo.url}
                alt=""
                style={{ width: "100%", display: "block" }}
                onError={(e) => {
                  const img = e.currentTarget;
                  if (img.src.includes("maxresdefault")) {
                    img.src = img.src.replace("maxresdefault", "hqdefault");
                  }
                }}
              />
              <div style={{
                position: "absolute", bottom: 8, left: 8,
                background: "rgba(0,0,0,0.55)", color: "#fff",
                fontSize: 11, fontWeight: 700, borderRadius: 20,
                padding: "3px 10px",
              }}>
                📸 Photo
              </div>
            </div>
            {lightboxOpen && (
              <div
                style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}
                onClick={() => setLightboxOpen(false)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={post.photo.url}
                  alt=""
                  style={{ maxWidth: "92vw", maxHeight: "90vh", borderRadius: 8, objectFit: "contain" }}
                  onError={(e) => {
                    const img = e.currentTarget;
                    if (img.src.includes("maxresdefault")) {
                      img.src = img.src.replace("maxresdefault", "hqdefault");
                    }
                  }}
                />
              </div>
            )}
          </>
        )}

        {/* Rich content */}
        {post.milestone && <MilestoneBanner {...post.milestone} />}
        {post.clip && <ClipPreview {...post.clip} />}
        {post.prQuote && <PRQuote {...post.prQuote} />}

        {/* Broadcast badges */}
        {post.platforms && post.platforms.length > 0 && (
          <div style={{ marginTop: 8, marginBottom: 6 }}>
            <BroadcastBadges platforms={post.platforms} />
          </div>
        )}

        {/* Reaction + comment count */}
        <div style={{ fontSize: 12, color: "var(--text-muted)", padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
          {post.isBot ? "✓" : liked ? "❤️" : "🤍"} {reactCount} {post.reactLabel || "reactions"} · {postComments.length} comments
        </div>
      </div>

      {/* Action bar */}
      <div style={{ display: "flex", padding: "2px 6px 2px" }}>
        {[
          {
            label: liked ? "Liked" : "React",
            icon: (
              <svg width="16" height="16" fill={liked ? "#E53E3E" : "none"} viewBox="0 0 24 24" stroke={liked ? "#E53E3E" : "currentColor"} strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            ),
            onClick: () => toggleLike(post.id),
            active: liked,
          },
          {
            label: "Comment",
            icon: (
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
            ),
            onClick: () => setCommentsOpen(o => !o),
            active: commentsOpen,
          },
          {
            label: "Share",
            icon: (
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            ),
            onClick: () => showToast("Link copied!"),
            active: false,
          },
        ].map(btn => (
          <button
            key={btn.label}
            onClick={btn.onClick}
            style={{
              flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
              padding: "9px 4px", background: "none", border: "none", cursor: "pointer",
              borderRadius: 6, fontSize: 12, fontWeight: 600,
              color: btn.active && btn.label !== "Share" ? (btn.label === "Liked" ? "#E53E3E" : "var(--green)") : "var(--text-secondary)",
              transition: "all 0.1s",
            }}
          >
            {btn.icon}
            {btn.label}
          </button>
        ))}
      </div>

      {/* Comment thread */}
      {commentsOpen && <CommentThread postId={post.id} comments={postComments} />}
    </div>
  );
}

// ── Small internal components ──────────────────────────────────────

const menuItemStyle: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 8,
  width: "100%", padding: "9px 12px",
  background: "none", border: "none", cursor: "pointer",
  textAlign: "left",
};

function MenuButton({ onClick }: { onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center",
        background: hovered ? "#f5f5f3" : "none", border: "none", cursor: "pointer",
        borderRadius: 4, color: hovered ? "#333" : "#999", padding: 0, transition: "all 0.1s",
      }}
      title="More options"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="5" cy="12" r="2" />
        <circle cx="12" cy="12" r="2" />
        <circle cx="19" cy="12" r="2" />
      </svg>
    </button>
  );
}

function PencilIcon() {
  return (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#555" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#e24b4a" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );
}
