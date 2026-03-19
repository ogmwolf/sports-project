"use client";
import { useState } from "react";
import Modal from "@/components/Common/Modal";
import { useApp } from "@/context/AppContext";
import emailData from "@/data/emails.json";

interface Props { open: boolean; onClose: () => void; }

const STYLES = [
  { id: "short", label: "Short & direct" },
  { id: "film",  label: "Lead with film" },
  { id: "fit",   label: "Why I fit your program" },
];

type EmailTemplates = {
  [schoolId: string]: {
    [styleId: string]: {
      subject: string;
      body: string;
    };
  };
};

const templates = emailData.templates as EmailTemplates;

export default function EmailGenerator({ open, onClose }: Props) {
  const { schools, showToast } = useApp();
  const [schoolId, setSchoolId] = useState(schools[0]?.id || "");
  const [style, setStyle] = useState("short");
  const [copied, setCopied] = useState(false);

  const email = templates[schoolId]?.[style];

  const handleCopy = () => {
    if (!email) return;
    const text = `Subject: ${email.subject}\n\n${email.body}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      showToast("Email copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const selectStyle: React.CSSProperties = {
    width: "100%", padding: "9px 12px", border: "1px solid var(--border)",
    borderRadius: 8, fontSize: 13, background: "white", marginBottom: 12,
    color: "#111",
  };

  return (
    <Modal open={open} onClose={onClose} title="Generate Outreach Email" subtitle="Customized for Sofia Reyes · OH · Class of 2029">
      {/* School selector */}
      <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.05em", textTransform: "uppercase", display: "block", marginBottom: 4 }}>School</label>
      <select style={selectStyle} value={schoolId} onChange={e => setSchoolId(e.target.value)}>
        {schools.map(s => (
          <option key={s.id} value={s.id}>{s.name}</option>
        ))}
      </select>

      {/* Style selector */}
      <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.05em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Style</label>
      <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
        {STYLES.map(s => (
          <button
            key={s.id}
            onClick={() => setStyle(s.id)}
            style={{
              flex: 1, padding: "8px 4px", borderRadius: 8, fontSize: 12, fontWeight: 600,
              border: `1px solid ${style === s.id ? "var(--green)" : "var(--border)"}`,
              background: style === s.id ? "var(--green-light)" : "white",
              color: style === s.id ? "var(--green-text)" : "#555",
              cursor: "pointer", transition: "all 0.15s",
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Preview */}
      {email && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 6 }}>Preview</div>
          <div style={{ background: "#F8F8F6", border: "1px solid var(--border)", borderRadius: 8, padding: 12, maxHeight: 220, overflowY: "auto" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 6 }}>
              Subject: {email.subject}
            </div>
            <pre style={{ margin: 0, fontSize: 12, color: "#333", whiteSpace: "pre-wrap", fontFamily: "inherit", lineHeight: 1.6 }}>
              {email.body}
            </pre>
          </div>
        </div>
      )}

      <button
        className="btn-primary"
        onClick={handleCopy}
        style={{ width: "100%", padding: "11px", fontSize: 14, borderRadius: 10 }}
      >
        {copied ? "✓ Copied!" : "Copy to clipboard"}
      </button>
    </Modal>
  );
}
