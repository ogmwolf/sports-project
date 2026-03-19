"use client";

interface School {
  id: string;
  name: string;
  division: string;
  conference: string;
  status: string;
  lastContact: string;
  notes: string;
  pipelineStep: number;
}

const STEPS = ["Interested", "Contacted", "Visited", "Offered", "Committed"];

export default function Pipeline({ school }: { school: School | null }) {
  return (
    <div className="card">
      <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 12 }}>
        Recruiting Pipeline
      </div>

      {!school ? (
        <div style={{
          textAlign: "center", padding: "20px 0",
          color: "var(--text-muted)", fontSize: 13,
        }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>🏫</div>
          Tap a school below to see your pipeline
        </div>
      ) : (
        <div style={{ transition: "all 0.2s ease" }}>
          {/* School name */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#111" }}>{school.name}</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{school.division} · {school.conference}</div>
          </div>

          {/* Step dots */}
          <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
            {STEPS.map((step, i) => {
              const isDone = i < school.pipelineStep;
              const isCurrent = i === school.pipelineStep;
              return (
                <div key={step} style={{ display: "flex", alignItems: "center", flex: i < STEPS.length - 1 ? 1 : "none" }}>
                  <div
                    className={`pipeline-dot ${isDone ? "done" : isCurrent ? "current" : ""}`}
                    title={step}
                  />
                  {i < STEPS.length - 1 && (
                    <div className={`pipeline-line ${isDone ? "done" : ""}`} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Step labels */}
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
            {STEPS.map((step, i) => {
              const isDone = i < school.pipelineStep;
              const isCurrent = i === school.pipelineStep;
              return (
                <div key={step} style={{
                  fontSize: 9, fontWeight: isCurrent ? 800 : 600,
                  color: isDone || isCurrent ? "var(--green)" : "var(--text-muted)",
                  letterSpacing: "0.03em",
                  textAlign: "center",
                  flex: i < STEPS.length - 1 ? 1 : "none",
                }}>
                  {step}
                </div>
              );
            })}
          </div>

          {/* Detail rows */}
          <div style={{ borderTop: "1px solid var(--border)", paddingTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
            <Row label="Division" value={`${school.division} · ${school.conference}`} />
            <Row label="Last Contact" value={school.lastContact} />
            {school.notes && (
              <div style={{ background: "#F8F8F6", borderRadius: 8, padding: "8px 10px" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 4 }}>Notes</div>
                <div style={{ fontSize: 12, color: "#333", lineHeight: 1.55 }}>{school.notes}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 600, color: "#111" }}>{value}</span>
    </div>
  );
}
