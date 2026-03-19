const typeConfig: Record<string, { icon: string; bg: string; border: string; color: string }> = {
  committed: { icon: "🎉", bg: "#E8F5EE", border: "#1A6B3C", color: "#0F4A28" },
  offer:     { icon: "📋", bg: "#EEF2FF", border: "#4F46E5", color: "#3730A3" },
  visited:   { icon: "🏫", bg: "#FFF7ED", border: "#EA580C", color: "#9A3412" },
  event:     { icon: "📅", bg: "#F0F9FF", border: "#0284C7", color: "#0C4A6E" },
};

interface Props {
  type: string;
  text: string;
  detail: string;
}

export default function MilestoneBanner({ type, text, detail }: Props) {
  const cfg = typeConfig[type] || typeConfig.event;
  return (
    <div style={{
      background: cfg.bg, border: `1.5px solid ${cfg.border}`,
      borderRadius: 8, padding: "10px 12px", margin: "10px 0",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 20 }}>{cfg.icon}</span>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: cfg.color }}>{text}</div>
          <div style={{ fontSize: 11, color: cfg.color, opacity: 0.8 }}>{detail}</div>
        </div>
      </div>
    </div>
  );
}
