"use client";
import { useState } from "react";
import Modal from "@/components/Common/Modal";

interface ReplyEntry {
  id: string;
  school: string;
  coach: string;
  date: string;
  body: string;
}

const SEED: ReplyEntry[] = [
  {
    id: "r1",
    school: "UCLA",
    coach: "Coach Speraw",
    date: "March 11, 2026",
    body: "Thanks for reaching out Sofia. We'd love to learn more about you. Your film looks impressive — the defensive range you show in the Red Rock clips is exactly what we look for. Please send over your updated stats and we'll be in touch about a campus visit.",
  },
  {
    id: "r2",
    school: "Pepperdine",
    coach: "Coach Hunt",
    date: "March 3, 2026",
    body: "Sofia, great to hear from you. Your film from the SCVA qualifier caught our attention. We're in the early stages of building our 2029 class and want to keep you on our radar. Stay in touch and keep us posted on your spring season results.",
  },
];

interface Props { open: boolean; onClose: () => void; }

export default function ResponsesModal({ open, onClose }: Props) {
  const [replies, setReplies] = useState<ReplyEntry[]>(SEED);
  const [detail, setDetail] = useState<ReplyEntry | null>(null);
  const [logOpen, setLogOpen] = useState(false);
  const [form, setForm] = useState({ school: "", coach: "", date: "", body: "" });
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleLog = () => {
    if (!form.school.trim() || !form.body.trim()) return;
    const entry: ReplyEntry = {
      id: `r${Date.now()}`,
      school: form.school.trim(),
      coach: form.coach.trim() || "Coach",
      date: form.date ? new Date(form.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "Recently",
      body: form.body.trim(),
    };
    setReplies(prev => [entry, ...prev]);
    setForm({ school: "", coach: "", date: "", body: "" });
    setLogOpen(false);
  };

  // Detail view
  if (detail) {
    return (
      <Modal open={open} onClose={() => { setDetail(null); onClose(); }} title={`Reply — ${detail.school}`}>
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{detail.coach} · {detail.date}</div>
        </div>
        <pre style={{ whiteSpace: "pre-wrap", fontSize: 13, color: "#333", lineHeight: 1.6, background: "#F8F8F6", borderRadius: 8, padding: "12px 14px", margin: "0 0 16px", fontFamily: "system-ui, -apple-system, sans-serif", border: "1px solid var(--border)" }}>
          {detail.body}
        </pre>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            className="btn-primary"
            onClick={() => handleCopy(detail.body)}
            style={{ flex: 1, padding: "10px", fontSize: 13, borderRadius: 10 }}
          >
            {copied ? "Copied!" : "Copy reply"}
          </button>
          <button
            onClick={() => setDetail(null)}
            style={{ flex: 1, padding: "10px", fontSize: 13, borderRadius: 10, background: "none", border: "1px solid var(--border)", cursor: "pointer", color: "#555" }}
          >
            Back
          </button>
        </div>
      </Modal>
    );
  }

  // Log form
  if (logOpen) {
    return (
      <Modal open={open} onClose={() => { setLogOpen(false); onClose(); }} title="Log response">
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
          {[
            { label: "School", key: "school", type: "text", placeholder: "e.g. Stanford" },
            { label: "Coach name", key: "coach", type: "text", placeholder: "e.g. Coach Johnson" },
            { label: "Date received", key: "date", type: "date", placeholder: "" },
          ].map(f => (
            <div key={f.key}>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#555", display: "block", marginBottom: 4 }}>{f.label}</label>
              <input
                type={f.type}
                placeholder={f.placeholder}
                value={form[f.key as keyof typeof form]}
                onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                style={{ width: "100%", padding: "8px 10px", fontSize: 13, border: "1px solid var(--border)", borderRadius: 8, outline: "none", boxSizing: "border-box" }}
              />
            </div>
          ))}
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: "#555", display: "block", marginBottom: 4 }}>Reply text</label>
            <textarea
              placeholder="Paste the coach's reply..."
              value={form.body}
              onChange={e => setForm(prev => ({ ...prev, body: e.target.value }))}
              rows={6}
              style={{ width: "100%", padding: "8px 10px", fontSize: 13, border: "1px solid var(--border)", borderRadius: 8, outline: "none", resize: "vertical", boxSizing: "border-box", fontFamily: "system-ui, -apple-system, sans-serif" }}
            />
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn-primary" onClick={handleLog} style={{ flex: 1, padding: "10px", fontSize: 13, borderRadius: 10 }}>Save</button>
          <button onClick={() => setLogOpen(false)} style={{ flex: 1, padding: "10px", fontSize: 13, borderRadius: 10, background: "none", border: "1px solid var(--border)", cursor: "pointer", color: "#555" }}>Cancel</button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal open={open} onClose={onClose} title="Responses received" subtitle={`${replies.length} replies logged`}>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
        {replies.map(r => (
          <button
            key={r.id}
            onClick={() => setDetail(r)}
            style={{ display: "block", width: "100%", textAlign: "left", padding: "10px 12px", background: "#F8F8F6", borderRadius: 8, border: "1px solid var(--border)", cursor: "pointer" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 2 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#111" }}>{r.school}</span>
              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{r.date}</span>
            </div>
            <div style={{ fontSize: 12, color: "#555", marginBottom: 3 }}>{r.coach}</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
              {r.body.split("\n")[0]}
            </div>
          </button>
        ))}
      </div>
      <button
        onClick={() => setLogOpen(true)}
        style={{ width: "100%", padding: "10px", fontSize: 13, fontWeight: 600, color: "var(--green)", background: "none", border: "1px dashed var(--green)", borderRadius: 10, cursor: "pointer" }}
      >
        + Log response
      </button>
    </Modal>
  );
}
