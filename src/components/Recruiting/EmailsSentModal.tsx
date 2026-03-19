"use client";
import { useState } from "react";
import Modal from "@/components/Common/Modal";

interface EmailEntry {
  id: string;
  school: string;
  coach: string;
  date: string;
  body: string;
}

const SEED: EmailEntry[] = [
  {
    id: "e1",
    school: "UCLA",
    coach: "Coach Speraw",
    date: "March 8, 2026",
    body: "Dear Coach Speraw,\n\nMy name is Sofia Reyes and I am a Class of 2029 outside hitter from Southern California. I play for SC Rockstar 16U and currently hold a national ranking of #89 among 2029 outside hitters.\n\nI have followed UCLA volleyball closely and would love the opportunity to be part of your program. My dig percentage is 94% and I average 4.2 digs per set. I maintain a 3.9 GPA and am committed to excellence both on and off the court.\n\nI would be honored to send you my highlight film and schedule a campus visit at your convenience.\n\nThank you for your time,\nSofia Reyes\nSC Rockstar 16U | Class of 2029",
  },
  {
    id: "e2",
    school: "Pepperdine",
    coach: "Coach Hunt",
    date: "March 1, 2026",
    body: "Dear Coach Hunt,\n\nI'm a Class of 2029 outside hitter currently playing for SC Rockstar 16U in Southern California. Pepperdine's program and culture are exactly what I'm looking for in a college home.\n\nI'd love to connect and share more about my game. Please find my highlight reel linked below.\n\nBest,\nSofia Reyes",
  },
  {
    id: "e3",
    school: "UC San Diego",
    coach: "Coach Rottman",
    date: "Feb 20, 2026",
    body: "Dear Coach Rottman,\n\nI wanted to reach out and express my strong interest in the UC San Diego volleyball program. I am a 2029 outside hitter from SC Rockstar 16U with a 94% dig percentage and national ranking.\n\nI would love to learn more about your program and share my film with you.\n\nThank you,\nSofia Reyes",
  },
];

interface Props { open: boolean; onClose: () => void; }

export default function EmailsSentModal({ open, onClose }: Props) {
  const [emails, setEmails] = useState<EmailEntry[]>(SEED);
  const [detail, setDetail] = useState<EmailEntry | null>(null);
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
    const entry: EmailEntry = {
      id: `e${Date.now()}`,
      school: form.school.trim(),
      coach: form.coach.trim() || "Coach",
      date: form.date ? new Date(form.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "Recently",
      body: form.body.trim(),
    };
    setEmails(prev => [entry, ...prev]);
    setForm({ school: "", coach: "", date: "", body: "" });
    setLogOpen(false);
  };

  // Detail view
  if (detail) {
    return (
      <Modal open={open} onClose={() => { setDetail(null); onClose(); }} title={`Email — ${detail.school}`}>
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
            {copied ? "Copied!" : "Copy email"}
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
      <Modal open={open} onClose={() => { setLogOpen(false); onClose(); }} title="Log sent email">
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
          {[
            { label: "School", key: "school", type: "text", placeholder: "e.g. Stanford" },
            { label: "Coach name", key: "coach", type: "text", placeholder: "e.g. Coach Johnson" },
            { label: "Date sent", key: "date", type: "date", placeholder: "" },
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
            <label style={{ fontSize: 11, fontWeight: 700, color: "#555", display: "block", marginBottom: 4 }}>Email body</label>
            <textarea
              placeholder="Paste the email you sent..."
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
    <Modal open={open} onClose={onClose} title="Emails sent" subtitle={`${emails.length} emails logged`}>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
        {emails.map(e => (
          <button
            key={e.id}
            onClick={() => setDetail(e)}
            style={{ display: "block", width: "100%", textAlign: "left", padding: "10px 12px", background: "#F8F8F6", borderRadius: 8, border: "1px solid var(--border)", cursor: "pointer" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 2 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#111" }}>{e.school}</span>
              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{e.date}</span>
            </div>
            <div style={{ fontSize: 12, color: "#555", marginBottom: 3 }}>{e.coach}</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
              {e.body.split("\n")[0]}
            </div>
          </button>
        ))}
      </div>
      <button
        onClick={() => setLogOpen(true)}
        style={{ width: "100%", padding: "10px", fontSize: 13, fontWeight: 600, color: "var(--green)", background: "none", border: "1px dashed var(--green)", borderRadius: 10, cursor: "pointer" }}
      >
        + Log sent email
      </button>
    </Modal>
  );
}
