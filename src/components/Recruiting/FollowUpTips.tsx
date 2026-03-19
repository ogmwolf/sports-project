"use client";
import Modal from "@/components/Common/Modal";

interface Props { open: boolean; onClose: () => void; }

const TIPS = [
  { icon: "⏰", tip: "Follow up within 48 hours of any coach interaction — response time signals your seriousness." },
  { icon: "📊", tip: "Send updated stats within 2 days of every tournament. Coaches track momentum." },
  { icon: "📱", tip: "Connect with coaches on social. A like or comment on their program content gets you noticed." },
  { icon: "✍️", tip: "Personalize every email — mention a specific coach, player, or win that shows you've done your research." },
  { icon: "🏫", tip: "Visit campus when possible. Even unofficial visits show initiative and help you stand out from digital-only recruits." },
];

export default function FollowUpTips({ open, onClose }: Props) {
  return (
    <Modal open={open} onClose={onClose} title="Follow-Up Tips" subtitle="How to stay on coaches' radar">
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
        {TIPS.map((t, i) => (
          <div key={i} style={{ display: "flex", gap: 10, padding: "10px 12px", background: "#F8F8F6", borderRadius: 8 }}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>{t.icon}</span>
            <span style={{ fontSize: 13, color: "#333", lineHeight: 1.55 }}>{t.tip}</span>
          </div>
        ))}
      </div>
      <button className="btn-primary" onClick={onClose} style={{ width: "100%", padding: "11px", fontSize: 14, borderRadius: 10 }}>
        Got it
      </button>
    </Modal>
  );
}
