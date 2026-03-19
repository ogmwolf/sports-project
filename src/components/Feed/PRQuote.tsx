interface Props { text: string; source: string; }

export default function PRQuote({ text, source }: Props) {
  return (
    <div style={{
      borderLeft: "3px solid #1A6B3C", background: "#F8F8F6",
      borderRadius: "0 8px 8px 0", padding: "10px 14px", margin: "10px 0",
    }}>
      <p style={{ margin: "0 0 4px", fontSize: 13, color: "#222", fontStyle: "italic", lineHeight: 1.6 }}>
        &ldquo;{text}&rdquo;
      </p>
      <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)" }}>— {source}</div>
    </div>
  );
}
