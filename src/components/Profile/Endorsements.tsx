"use client";

interface Endorsement {
  id: string;
  coach: string;
  title: string;
  initials: string;
  verified: boolean;
  text: string;
}

interface Athlete {
  endorsements: Endorsement[];
}

export default function Endorsements({ athlete }: { athlete: Athlete }) {
  return (
    <div className="card">
      <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 12 }}>
        Coach Endorsements
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {athlete.endorsements.map(e => (
          <div key={e.id} style={{ border: "1px solid var(--border)", borderRadius: 8, padding: "12px 14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <div style={{
                width: 38, height: 38, borderRadius: "50%", background: "#6B7280",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "white", fontWeight: 700, fontSize: 13, flexShrink: 0,
              }}>
                {e.initials}
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#111" }}>{e.coach}</span>
                  {e.verified && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="#1A6B3C">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#1A6B3C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                      <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{e.title}</div>
              </div>
            </div>
            <p style={{ margin: 0, fontSize: 13, color: "#333", fontStyle: "italic", lineHeight: 1.6 }}>
              &ldquo;{e.text}&rdquo;
            </p>
          </div>
        ))}
      </div>

      <button className="dashed-btn" style={{ marginTop: 10 }}>
        + Request endorsement
      </button>
    </div>
  );
}
