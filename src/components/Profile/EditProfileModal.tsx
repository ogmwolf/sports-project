"use client";
import { useState } from "react";
import Modal from "@/components/Common/Modal";
import { useApp } from "@/context/AppContext";
import type { Athlete } from "@/context/AppContext";

interface Props {
  open: boolean;
  onClose: () => void;
}

const SPORTS_LIST = [
  "Volleyball", "Soccer", "Basketball", "Baseball",
  "Softball", "Football", "Lacrosse", "Swimming",
  "Track", "Tennis", "Golf", "Wrestling",
  "Water Polo", "Equestrian", "Other",
];

const inputStyle: React.CSSProperties = {
  width: "100%", boxSizing: "border-box",
  padding: "8px 10px", borderRadius: 8,
  border: "1px solid #ddd", fontSize: 13,
  color: "#111", fontFamily: "inherit", outline: "none",
};

const labelStyle: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, color: "#555",
  letterSpacing: "0.04em", textTransform: "uppercase",
  display: "block", marginBottom: 4,
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

export default function EditProfileModal({ open, onClose }: Props) {
  const { athlete, updateAthlete, showToast } = useApp();

  const weightNum = parseInt(athlete.weight) || 0;
  const nameParts = athlete.name.split(" ");
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";

  const [form, setForm] = useState({
    firstName,
    lastName,
    sport: athlete.sports?.[0] || "Volleyball",
    position: athlete.position,
    number: athlete.number,
    classYear: athlete.classYear,
    club: athlete.club,
    school: athlete.school || "",
    height: athlete.height,
    weight: weightNum,
    handedness: athlete.handedness,
    gpa: athlete.gpa,
    bio: athlete.bio || "",
  });

  const set = (key: string, value: string | number) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const handleSave = () => {
    const updates: Partial<Athlete> = {
      name: `${form.firstName} ${form.lastName}`.trim(),
      initials: `${form.firstName[0] || ""}${form.lastName[0] || ""}`.toUpperCase(),
      sports: [form.sport],
      position: form.position,
      number: Number(form.number),
      classYear: Number(form.classYear),
      club: form.club,
      school: form.school,
      height: form.height,
      weight: form.weight ? `${form.weight} lbs` : athlete.weight,
      handedness: form.handedness,
      gpa: Number(form.gpa),
      bio: form.bio,
    };
    updateAthlete(updates);
    showToast("Profile updated");
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Edit profile">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
        <div>
          <label style={labelStyle}>First name</label>
          <input style={inputStyle} value={form.firstName} onChange={e => set("firstName", e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>Last name</label>
          <input style={inputStyle} value={form.lastName} onChange={e => set("lastName", e.target.value)} />
        </div>
      </div>

      <Field label="Sport">
        <select style={inputStyle} value={form.sport} onChange={e => set("sport", e.target.value)}>
          {SPORTS_LIST.map(s => <option key={s}>{s}</option>)}
        </select>
      </Field>

      <Field label="Position">
        <input style={inputStyle} value={form.position} onChange={e => set("position", e.target.value)} />
      </Field>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
        <div>
          <label style={labelStyle}>Jersey number</label>
          <input style={inputStyle} type="number" value={form.number} onChange={e => set("number", e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>Grad year</label>
          <input style={inputStyle} type="number" value={form.classYear} onChange={e => set("classYear", e.target.value)} />
        </div>
      </div>

      <Field label="Club">
        <input style={inputStyle} value={form.club} onChange={e => set("club", e.target.value)} />
      </Field>

      <Field label="School">
        <input style={inputStyle} value={form.school} onChange={e => set("school", e.target.value)} placeholder="e.g. Mira Costa HS" />
      </Field>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
        <div>
          <label style={labelStyle}>Height</label>
          <input style={inputStyle} value={form.height} onChange={e => set("height", e.target.value)} placeholder={`e.g. 6'0"`} />
        </div>
        <div>
          <label style={labelStyle}>Weight (lbs)</label>
          <input style={inputStyle} type="number" value={form.weight || ""} onChange={e => set("weight", e.target.value)} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
        <div>
          <label style={labelStyle}>Dominant hand</label>
          <select style={inputStyle} value={form.handedness} onChange={e => set("handedness", e.target.value)}>
            <option>Right</option>
            <option>Left</option>
          </select>
        </div>
        <div>
          <label style={labelStyle}>GPA</label>
          <input style={inputStyle} type="number" step="0.1" max="4.0" value={form.gpa} onChange={e => set("gpa", e.target.value)} />
        </div>
      </div>

      <Field label="Bio (optional)">
        <textarea
          style={{ ...inputStyle, resize: "vertical", minHeight: 80 }}
          maxLength={300}
          value={form.bio}
          onChange={e => set("bio", e.target.value)}
          placeholder="Tell coaches about yourself..."
        />
        <div style={{ fontSize: 11, color: "#999", textAlign: "right", marginTop: 2 }}>
          {form.bio.length}/300
        </div>
      </Field>

      <div style={{
        display: "flex", gap: 8, marginTop: 8,
        position: "sticky", bottom: -20, background: "#fff",
        paddingTop: 12, paddingBottom: 4,
      }}>
        <button
          onClick={handleSave}
          style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "none", background: "#1A6B3C", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
        >
          Save
        </button>
        <button
          onClick={onClose}
          style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "1px solid #ddd", background: "none", fontSize: 13, fontWeight: 600, color: "#555", cursor: "pointer" }}
        >
          Cancel
        </button>
      </div>
    </Modal>
  );
}
