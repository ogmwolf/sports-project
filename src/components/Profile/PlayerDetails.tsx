interface Athlete {
  sports: string[];
  number: number;
  position: string;
  height: string;
  weight: string;
  handedness: string;
  club: string;
  stats: { nationalRank: number; stateRank: number; state: string };
  gpa: number;
  classYear: number;
}

const HAND_LABELS: Record<string, string> = {
  Soccer:   "Dominant foot",
  Football: "Throws",
  Swimming: "Lane preference",
  Track:    "Lane preference",
};

const Row = ({ label, value }: { label: string; value: string | number }) => (
  <div style={{
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "9px 0", borderBottom: "1px solid #F0F0EE",
  }}>
    <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>
      {label}
    </span>
    <span style={{ fontSize: 13, fontWeight: 600, color: "#111" }}>{value}</span>
  </div>
);

export default function PlayerDetails({ athlete }: { athlete: Athlete }) {
  const primarySport = athlete.sports[0] || "";
  const handLabel = HAND_LABELS[primarySport] || "Dominant hand";

  return (
    <div className="card">
      <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 4 }}>
        Player Details
      </div>
      <Row label="Jersey"          value={`#${athlete.number}`} />
      <Row label="Position"        value={athlete.position} />
      <Row label="Height"          value={athlete.height} />
      <Row label="Weight"          value={athlete.weight} />
      <Row label={handLabel}       value={athlete.handedness} />
      <Row label="Club"            value={athlete.club} />
      <Row label="National Ranking" value={`#${athlete.stats.nationalRank} (2029 OH)`} />
      <Row label="State Ranking"   value={`#${athlete.stats.stateRank} (${athlete.stats.state})`} />
      <Row label="GPA"             value={`${athlete.gpa} weighted`} />
      <Row label="Grad Year"       value={athlete.classYear} />
    </div>
  );
}
