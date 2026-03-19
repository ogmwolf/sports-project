"use client";
import { useState } from "react";
import Modal from "@/components/Common/Modal";
import { useApp } from "@/context/AppContext";

interface Props { open: boolean; onClose: () => void; }

const STATUSES = ["Interested", "Contacted", "Visited", "Offered", "Committed"];
const DIVISIONS = ["D1", "D2", "D3", "NAIA", "JUCO"];
const STATUS_TO_STEP: Record<string, number> = {
  Interested: 0, Contacted: 1, Visited: 2, Offered: 3, Committed: 4,
};

export default function AddSchoolModal({ open, onClose }: Props) {
  const { addSchool } = useApp();
  const [name, setName] = useState("");
  const [division, setDivision] = useState("D1");
  const [conference, setConference] = useState("");
  const [status, setStatus] = useState("Interested");
  const [notes, setNotes] = useState("");

  const handleAdd = () => {
    if (!name.trim()) return;
    const id = name.toLowerCase().replace(/\s+/g, "-") + `-${Date.now()}`;
    addSchool({
      id, name: name.trim(), abbr: name.trim().slice(0, 4).toUpperCase(),
      division, conference: conference || "Independent",
      location: "", color: "#4B5563", coach: "",
      status, lastContact: "—", notes: notes.trim(),
      pipelineStep: STATUS_TO_STEP[status] ?? 0,
    });
    setName(""); setConference(""); setNotes(""); setStatus("Interested");
    onClose();
  };

  const labelStyle = { fontSize: 11, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.05em", textTransform: "uppercase" as const, display: "block", marginBottom: 4 };
  const inputStyle = { width: "100%", padding: "9px 12px", border: "1px solid var(--border)", borderRadius: 8, fontSize: 13, color: "#111", background: "white", marginBottom: 12, boxSizing: "border-box" as const };

  return (
    <Modal open={open} onClose={onClose} title="Add School">
      <label style={labelStyle}>School name</label>
      <input style={inputStyle} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Stanford" />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
        <div>
          <label style={labelStyle}>Division</label>
          <select style={{ ...inputStyle, marginBottom: 0 }} value={division} onChange={e => setDivision(e.target.value)}>
            {DIVISIONS.map(d => <option key={d}>{d}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Status</label>
          <select style={{ ...inputStyle, marginBottom: 0 }} value={status} onChange={e => setStatus(e.target.value)}>
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <label style={labelStyle}>Conference (optional)</label>
      <input style={inputStyle} value={conference} onChange={e => setConference(e.target.value)} placeholder="e.g. Pac-12" />

      <label style={labelStyle}>Notes (optional)</label>
      <textarea style={{ ...inputStyle, minHeight: 60, resize: "vertical" }} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Initial impressions, contacts, etc." />

      <button
        className="btn-primary"
        onClick={handleAdd}
        disabled={!name.trim()}
        style={{ width: "100%", padding: "11px", fontSize: 14, borderRadius: 10 }}
      >
        Add to pipeline
      </button>
    </Modal>
  );
}
