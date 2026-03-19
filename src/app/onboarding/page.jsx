"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";

// ── Sport data ────────────────────────────────────────────────────

const SPORTS = [
  "Volleyball", "Soccer", "Basketball", "Baseball",
  "Softball", "Football", "Tennis", "Swimming",
  "Track", "Lacrosse", "Water polo", "Wrestling",
  "Golf", "Equestrian", "Other",
];

const COACH_SPORTS = SPORTS.filter(s => s !== "Other" && s !== "Equestrian");

const POSITION_PLACEHOLDERS = {
  Volleyball:   "e.g. Libero, Setter, OH",
  Soccer:       "e.g. Midfielder, Forward, Goalkeeper",
  Basketball:   "e.g. Point Guard, Small Forward",
  Baseball:     "e.g. Pitcher, Shortstop",
  Softball:     "e.g. Pitcher, Shortstop",
  Football:     "e.g. Quarterback, Wide Receiver",
  Tennis:       "e.g. Singles, Doubles",
  Swimming:     "e.g. Freestyle, Butterfly, IM",
  Track:        "e.g. Sprinter, Distance, Jumps",
  Lacrosse:     "e.g. Attack, Midfield, Defense",
  "Water polo": "e.g. Driver, Goalkeeper, 2-meter",
  Wrestling:    "e.g. 132, 145 (weight class)",
};

const HAND_LABELS = {
  Soccer:   "Dominant foot",
  Football: "Throws",
};

const DIVISIONS = ["D1", "D2", "D3", "NAIA", "Club"];

// ── Shared styles ─────────────────────────────────────────────────

const fi = {
  width: "100%", boxSizing: "border-box",
  padding: "9px 12px", borderRadius: 8,
  border: "1px solid #ddd", fontSize: 14,
  color: "#111", fontFamily: "inherit", background: "#fff",
};

const lbl = {
  fontSize: 12, fontWeight: 600, color: "#555",
  display: "block", marginBottom: 4,
};

const GLOBAL_STYLE = `
  .ob-input:focus, .ob-select:focus { border-color: #1A6B3C !important; outline: none; }
  input[type=number]::-webkit-inner-spin-button,
  input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
  input[type=number] { -moz-appearance: textfield; }
  @media (max-width: 520px) { .sport-grid { grid-template-columns: repeat(3, 1fr) !important; } }
`;

// ── Shared components ─────────────────────────────────────────────

function Logo() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 28 }}>
      <div style={{ width: 32, height: 32, background: "#1A6B3C", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ color: "#fff", fontWeight: 700, fontSize: 16, lineHeight: 1 }}>S</span>
      </div>
      <span style={{ fontWeight: 700, fontSize: 16, color: "#1A6B3C", marginTop: 6 }}>Scoutly</span>
    </div>
  );
}

function ProgressBar({ step, total }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ fontSize: 11, color: "#999", textAlign: "center", marginBottom: 12 }}>
        Step {step} of {total}
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        {Array.from({ length: total }, (_, i) => i + 1).map((s, i) => (
          <div key={s} style={{ display: "flex", alignItems: "center" }}>
            <div style={{
              width: 10, height: 10, borderRadius: "50%", flexShrink: 0,
              background: s < step ? "#1A6B3C" : s === step ? "#fff" : "#ddd",
              border: s === step ? "2px solid #1A6B3C" : s < step ? "2px solid #1A6B3C" : "2px solid #ddd",
              boxShadow: s === step ? "0 0 0 3px #E8F5EE" : "none",
              transition: "all 0.2s",
            }} />
            {i < total - 1 && (
              <div style={{
                width: 40, height: 1,
                background: s < step ? "#1A6B3C" : "#ddd",
                transition: "background 0.2s",
              }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function NavButtons({ onBack, onNext, nextLabel = "Continue →", nextDisabled = false }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 28 }}>
      <button
        onClick={onBack}
        style={{ background: "none", border: "1px solid #ddd", borderRadius: 20, padding: "8px 20px", fontSize: 13, fontWeight: 600, color: "#555", cursor: "pointer" }}
      >
        ← Back
      </button>
      <button
        onClick={onNext}
        disabled={nextDisabled}
        style={{
          background: nextDisabled ? "#ccc" : "#1A6B3C", border: "none", borderRadius: 20,
          padding: "8px 24px", fontSize: 13, fontWeight: 700,
          color: "#fff", cursor: nextDisabled ? "default" : "pointer",
        }}
      >
        {nextLabel}
      </button>
    </div>
  );
}

function SportCard({ name, selected, onToggle }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={() => onToggle(name)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: "100%", padding: "10px 8px", position: "relative",
        border: selected ? "2px solid #1A6B3C" : hovered ? "1px solid #1A6B3C" : "1px solid #e8e8e8",
        borderRadius: 8, background: selected ? "#E8F5EE" : "#fff",
        fontSize: 12, fontWeight: 600, color: selected ? "#0F4A28" : "#555",
        textAlign: "center", cursor: "pointer", transition: "all 0.12s",
      }}
    >
      {selected && (
        <span style={{ position: "absolute", top: 4, right: 6, fontSize: 9, fontWeight: 700, color: "#1A6B3C" }}>✓</span>
      )}
      {name}
    </button>
  );
}

function SportGrid({ sports, selected, onToggle }) {
  return (
    <div className="sport-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 20 }}>
      {sports.map(name => (
        <SportCard key={name} name={name} selected={selected.includes(name)} onToggle={onToggle} />
      ))}
    </div>
  );
}

function pill(active, size = "sm") {
  return {
    padding: size === "md" ? "12px 40px" : "8px 24px",
    borderRadius: 20,
    fontSize: size === "md" ? 14 : 13,
    fontWeight: 600, cursor: "pointer",
    border: active ? "2px solid #1A6B3C" : "1px solid #ddd",
    background: active ? "#E8F5EE" : "#fff",
    color: active ? "#0F4A28" : "#555",
    transition: "all 0.12s",
  };
}

// ══════════════════════════════════════════════════════════════════
// LANDING
// ══════════════════════════════════════════════════════════════════

const ROLES = [
  { key: "athlete", label: "Athlete", desc: "Build your recruiting profile" },
  { key: "parent",  label: "Parent",  desc: "Track your child's recruiting journey" },
  { key: "coach",   label: "Coach",   desc: "Discover and recruit athletes" },
];

function RoleCard({ role, onSelect }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={() => onSelect(role.key)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: "100%", padding: "16px 20px",
        border: `1px solid ${hovered ? "#1A6B3C" : "#e8e8e8"}`,
        borderRadius: 10,
        background: hovered ? "#F9FFFE" : "#fff",
        cursor: "pointer", display: "flex", alignItems: "center",
        justifyContent: "space-between", textAlign: "left",
        transition: "all 0.12s",
      }}
    >
      <div>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#111", marginBottom: 2 }}>{role.label}</div>
        <div style={{ fontSize: 13, color: "#999" }}>{role.desc}</div>
      </div>
      <span style={{ fontSize: 18, color: "#ccc", marginLeft: 12 }}>›</span>
    </button>
  );
}

function Landing({ onSelect }) {
  return (
    <div>
      <h1 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 700, color: "#111", textAlign: "center" }}>
        Who are you?
      </h1>
      <p style={{ margin: "0 0 28px", fontSize: 13, color: "#999", textAlign: "center" }}>
        Select your role to get started.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {ROLES.map(role => (
          <RoleCard key={role.key} role={role} onSelect={onSelect} />
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// ATHLETE FLOW
// ══════════════════════════════════════════════════════════════════

function AthleteStep1({ selected, setSelected, onBack, onNext }) {
  const toggle = name =>
    setSelected(prev => prev.includes(name) ? prev.filter(s => s !== name) : [...prev, name]);

  return (
    <div>
      <h1 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 700, color: "#111" }}>
        What sport(s) do you play?
      </h1>
      <p style={{ margin: "0 0 20px", fontSize: 13, color: "#999" }}>Select all that apply.</p>
      <SportGrid sports={SPORTS} selected={selected} onToggle={toggle} />
      <NavButtons onBack={onBack} onNext={onNext} nextDisabled={selected.length === 0} />
    </div>
  );
}

function AthleteStep2({ sports, gender, setGender, form, setForm, onBack, onNext }) {
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const hasOther = sports.includes("Other");
  const primary  = sports.find(s => s !== "Other") || sports[0] || "";

  const positionPh  = hasOther ? "Your position(s)" : (POSITION_PLACEHOLDERS[primary] || "Your position");
  const numberLabel = hasOther ? "Jersey / cap number" : primary === "Water polo" ? "Cap number" : "Jersey number";
  const handLabel   = hasOther ? "Dominant hand / foot" : (HAND_LABELS[primary] || "Dominant hand");

  const canContinue =
    form.firstName.trim() && form.lastName.trim() &&
    form.position.trim()  && form.gradYear && form.club.trim();

  return (
    <div>
      <h1 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 700, color: "#111" }}>
        Tell us about yourself
      </h1>
      <p style={{ margin: "0 0 20px", fontSize: 13, color: "#999" }}>Coaches will see this on your profile.</p>

      {/* Name */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
        <div>
          <label style={lbl}>First name</label>
          <input className="ob-input" style={fi} value={form.firstName} onChange={e => set("firstName", e.target.value)} />
        </div>
        <div>
          <label style={lbl}>Last name</label>
          <input className="ob-input" style={fi} value={form.lastName} onChange={e => set("lastName", e.target.value)} />
        </div>
      </div>

      {/* Position */}
      <div style={{ marginBottom: 14 }}>
        <label style={lbl}>Position</label>
        <input className="ob-input" style={fi} value={form.position} onChange={e => set("position", e.target.value)} placeholder={positionPh} />
      </div>

      {/* Jersey + Grad year */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
        <div>
          <label style={lbl}>{numberLabel} (optional)</label>
          <input className="ob-input" style={fi} type="number" value={form.number} onChange={e => set("number", e.target.value)} placeholder="3" />
        </div>
        <div>
          <label style={lbl}>Grad year *</label>
          <input className="ob-input" style={fi} type="number" min="2025" max="2032" value={form.gradYear} onChange={e => set("gradYear", e.target.value)} placeholder="2029" />
        </div>
      </div>

      {/* Club */}
      <div style={{ marginBottom: 14 }}>
        <label style={lbl}>Club or team name *</label>
        <input className="ob-input" style={fi} value={form.club} onChange={e => set("club", e.target.value)} placeholder="e.g. SC Rockstar 16U" />
      </div>

      {/* High school */}
      <div style={{ marginBottom: 14 }}>
        <label style={lbl}>High school (optional)</label>
        <input className="ob-input" style={fi} value={form.school} onChange={e => set("school", e.target.value)} placeholder="e.g. Mira Costa High School" />
      </div>

      {/* GPA */}
      <div style={{ marginBottom: 14 }}>
        <label style={lbl}>GPA (optional)</label>
        <input className="ob-input" style={fi} type="number" min="0" max="4.0" step="0.1" value={form.gpa} onChange={e => set("gpa", e.target.value)} placeholder="e.g. 3.8" />
      </div>

      {/* Gender */}
      <div style={{ marginBottom: 14 }}>
        <label style={lbl}>Gender</label>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={pill(gender === "male")}   onClick={() => setGender(g => g === "male"   ? null : "male")}>Male</button>
          <button style={pill(gender === "female")} onClick={() => setGender(g => g === "female" ? null : "female")}>Female</button>
        </div>
      </div>

      {/* Dominant hand / foot */}
      <div style={{ marginBottom: 14 }}>
        <label style={lbl}>{handLabel}</label>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={pill(form.dominantHand === "Left")}  onClick={() => set("dominantHand", "Left")}>Left</button>
          <button style={pill(form.dominantHand === "Right")} onClick={() => set("dominantHand", "Right")}>Right</button>
        </div>
      </div>

      <NavButtons onBack={onBack} onNext={onNext} nextDisabled={!canContinue} />
    </div>
  );
}

const ACTION_CARDS = [
  { borderColor: "#1A6B3C", iconBg: "#E8F5EE", emoji: "🎬", title: "Add your highlight reel",       body: "Link your Hudl, YouTube, or Vimeo. Coaches watch film first.",   btn: "Add highlights →"  },
  { borderColor: "#185FA5", iconBg: "#E6F1FB", emoji: "🏫", title: "Add your target schools",        body: "Track every program you're interested in.",                        btn: "Add schools →"     },
  { borderColor: "#534AB7", iconBg: "#EEEDFE", emoji: "✉️", title: "Send your first outreach email", body: "We'll help you write it in 2 minutes.",                            btn: "Generate email →"  },
];

function AthleteStep3({ sports, gender, form, onBack }) {
  const router = useRouter();
  const { updateAthlete } = useApp();

  const handleFinish = () => {
    const first = form.firstName.trim();
    const last  = form.lastName.trim();
    updateAthlete({
      name:       `${first} ${last}`.trim(),
      initials:   `${(first[0] || "").toUpperCase()}${(last[0] || "").toUpperCase()}`,
      sports,
      gender,
      position:   form.position,
      number:     Number(form.number) || undefined,
      classYear:  Number(form.gradYear) || undefined,
      club:       form.club,
      school:     form.school || undefined,
      gpa:        Number(form.gpa) || undefined,
      handedness: form.dominantHand,
    });
    router.push("/profile");
  };

  return (
    <div>
      <button
        onClick={onBack}
        style={{ background: "none", border: "1px solid #ddd", borderRadius: 20, padding: "6px 16px", fontSize: 13, fontWeight: 600, color: "#555", cursor: "pointer", marginBottom: 20 }}
      >
        ← Back
      </button>

      <h1 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 700, color: "#111" }}>You're all set! 🎉</h1>
      <p style={{ margin: "0 0 20px", fontSize: 13, color: "#999" }}>
        Here's what to do first to get noticed by coaches.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {ACTION_CARDS.map(card => (
          <div
            key={card.title}
            style={{
              background: "#fff", borderRadius: 10, border: "1px solid #e8e8e8",
              borderLeft: `3px solid ${card.borderColor}`,
              padding: "14px 16px", display: "flex", gap: 14, alignItems: "center",
            }}
          >
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: card.iconBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>
              {card.emoji}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#111" }}>{card.title}</div>
              <div style={{ fontSize: 13, color: "#666", lineHeight: 1.4, marginTop: 2, marginBottom: 8 }}>{card.body}</div>
              <button
                onClick={() => router.push("/recruiting")}
                style={{ border: "1px solid #1A6B3C", color: "#1A6B3C", background: "none", borderRadius: 20, padding: "5px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
              >
                {card.btn}
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleFinish}
        style={{ width: "100%", marginTop: 20, padding: 12, borderRadius: 20, border: "none", background: "#1A6B3C", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}
      >
        Take me to my profile →
      </button>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// PARENT FLOW
// ══════════════════════════════════════════════════════════════════

function ParentStep1({ form, setForm, onBack, onNext }) {
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const canContinue = form.firstName.trim() && form.lastName.trim() && form.email.trim();

  return (
    <div>
      <h1 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 700, color: "#111" }}>Tell us about you</h1>
      <p style={{ margin: "0 0 20px", fontSize: 13, color: "#999" }}>We'll use this to set up your parent account.</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
        <div>
          <label style={lbl}>First name</label>
          <input className="ob-input" style={fi} value={form.firstName} onChange={e => set("firstName", e.target.value)} />
        </div>
        <div>
          <label style={lbl}>Last name</label>
          <input className="ob-input" style={fi} value={form.lastName} onChange={e => set("lastName", e.target.value)} />
        </div>
      </div>

      <div style={{ marginBottom: 14 }}>
        <label style={lbl}>Your email address</label>
        <input className="ob-input" style={fi} type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="you@example.com" />
      </div>

      <NavButtons onBack={onBack} onNext={onNext} nextDisabled={!canContinue} />
    </div>
  );
}

function ParentStep2({ athleteEmail, setAthleteEmail, onBack, onNext }) {
  const canContinue = athleteEmail.trim().includes("@") && athleteEmail.trim().length > 3;

  return (
    <div>
      <h1 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 700, color: "#111" }}>
        Connect with your athlete
      </h1>
      <p style={{ margin: "0 0 24px", fontSize: 13, color: "#999", lineHeight: 1.6 }}>
        Enter your athlete's Scoutly email. We'll send them a connection request — you'll get read-only access once they approve.
      </p>

      <div style={{ marginBottom: 14 }}>
        <label style={lbl}>Athlete's email address</label>
        <input
          className="ob-input"
          style={fi}
          type="email"
          value={athleteEmail}
          onChange={e => setAthleteEmail(e.target.value)}
          placeholder="athlete@example.com"
        />
      </div>

      <NavButtons onBack={onBack} onNext={onNext} nextDisabled={!canContinue} nextLabel="Send request →" />
    </div>
  );
}

function ParentStep3({ athleteEmail }) {
  const router = useRouter();

  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>📬</div>
      <h1 style={{ margin: "0 0 10px", fontSize: 20, fontWeight: 700, color: "#111" }}>Request sent!</h1>
      <p style={{ margin: "0 0 6px", fontSize: 14, color: "#555", lineHeight: 1.6 }}>
        We've sent <strong>{athleteEmail}</strong> a connection request.
      </p>
      <p style={{ margin: "0 0 28px", fontSize: 13, color: "#999" }}>
        You'll get access to their profile once they approve. We'll notify you by email.
      </p>

      <div style={{ background: "#F3F2EE", borderRadius: 10, padding: "16px 20px", marginBottom: 28, textAlign: "left" }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#999", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
          What happens next
        </div>
        {[
          "Your athlete receives an email notification",
          "They approve the connection in their Scoutly account",
          "Once approved, you'll see their profile and recruiting activity",
        ].map((item, i) => (
          <div key={i} style={{ display: "flex", gap: 10, marginBottom: i < 2 ? 8 : 0, fontSize: 13, color: "#555", lineHeight: 1.5 }}>
            <span style={{ color: "#1A6B3C", fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>
            {item}
          </div>
        ))}
      </div>

      <button
        onClick={() => router.push("/")}
        style={{ width: "100%", padding: 12, borderRadius: 20, border: "none", background: "#1A6B3C", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}
      >
        Return to home →
      </button>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// COACH FLOW
// ══════════════════════════════════════════════════════════════════

function CoachStep1({ form, setForm, onBack, onNext }) {
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const canContinue = form.firstName.trim() && form.lastName.trim() && form.institution.trim();

  return (
    <div>
      <h1 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 700, color: "#111" }}>Tell us about you</h1>
      <p style={{ margin: "0 0 20px", fontSize: 13, color: "#999" }}>We'll set up your coach profile.</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
        <div>
          <label style={lbl}>First name</label>
          <input className="ob-input" style={fi} value={form.firstName} onChange={e => set("firstName", e.target.value)} />
        </div>
        <div>
          <label style={lbl}>Last name</label>
          <input className="ob-input" style={fi} value={form.lastName} onChange={e => set("lastName", e.target.value)} />
        </div>
      </div>

      <div style={{ marginBottom: 14 }}>
        <label style={lbl}>Institution name</label>
        <input className="ob-input" style={fi} value={form.institution} onChange={e => set("institution", e.target.value)} placeholder="e.g. UCLA, Pepperdine University" />
      </div>

      <NavButtons onBack={onBack} onNext={onNext} nextDisabled={!canContinue} />
    </div>
  );
}

function CoachStep2({ sports, setSports, division, setDivision, onBack, onNext }) {
  const toggle = name =>
    setSports(prev => prev.includes(name) ? prev.filter(s => s !== name) : [...prev, name]);
  const canContinue = sports.length > 0 && !!division;

  return (
    <div>
      <h1 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 700, color: "#111" }}>What do you coach?</h1>
      <p style={{ margin: "0 0 20px", fontSize: 13, color: "#999" }}>Select your sport(s) and division.</p>

      <SportGrid sports={COACH_SPORTS} selected={sports} onToggle={toggle} />

      <div style={{ marginBottom: 14 }}>
        <label style={lbl}>Division level</label>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {DIVISIONS.map(d => (
            <button key={d} style={pill(division === d)} onClick={() => setDivision(d)}>{d}</button>
          ))}
        </div>
      </div>

      <NavButtons onBack={onBack} onNext={onNext} nextDisabled={!canContinue} />
    </div>
  );
}

function CoachStep3({ filters, setFilters, onBack, onNext }) {
  const set = (k, v) => setFilters(p => ({ ...p, [k]: v }));
  const gradYears = Array.from({ length: 8 }, (_, i) => 2025 + i);
  const sel = { ...fi };

  return (
    <div>
      <h1 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 700, color: "#111" }}>
        What are you looking for?
      </h1>
      <p style={{ margin: "0 0 20px", fontSize: 13, color: "#999", lineHeight: 1.5 }}>
        This sets up your default search filters. You can change these at any time.
      </p>

      <div style={{ marginBottom: 14 }}>
        <label style={lbl}>Position(s)</label>
        <input
          className="ob-input"
          style={fi}
          value={filters.positions}
          onChange={e => set("positions", e.target.value)}
          placeholder="e.g. Libero, OH"
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
        <div>
          <label style={lbl}>Grad year from</label>
          <select className="ob-select" style={sel} value={filters.gradYearFrom} onChange={e => set("gradYearFrom", e.target.value)}>
            <option value="">Any</option>
            {gradYears.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div>
          <label style={lbl}>Grad year to</label>
          <select className="ob-select" style={sel} value={filters.gradYearTo} onChange={e => set("gradYearTo", e.target.value)}>
            <option value="">Any</option>
            {gradYears.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      <div style={{ marginBottom: 14 }}>
        <label style={lbl}>Region (optional)</label>
        <input
          className="ob-input"
          style={fi}
          value={filters.region}
          onChange={e => set("region", e.target.value)}
          placeholder="e.g. Southern California, West Coast"
        />
      </div>

      <NavButtons onBack={onBack} onNext={onNext} />
    </div>
  );
}

function CoachStep4({ onBack }) {
  const router = useRouter();
  const [eduEmail, setEduEmail] = useState("");
  const [sent, setSent] = useState(false);
  const isValidEdu = eduEmail.trim().endsWith(".edu") && eduEmail.includes("@");

  if (sent) {
    return (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>📧</div>
        <h1 style={{ margin: "0 0 10px", fontSize: 20, fontWeight: 700, color: "#111" }}>Check your inbox</h1>
        <p style={{ margin: "0 0 8px", fontSize: 14, color: "#555", lineHeight: 1.6 }}>
          We sent a verification link to <strong>{eduEmail}</strong>.
        </p>
        <p style={{ margin: "0 0 28px", fontSize: 13, color: "#999" }}>
          Once verified, your profile will display the{" "}
          <span style={{ color: "#1A6B3C", fontWeight: 700 }}>Verified Coach ✓</span> badge.
        </p>
        <button
          onClick={() => router.push("/recruiting")}
          style={{ width: "100%", padding: 12, borderRadius: 20, border: "none", background: "#1A6B3C", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}
        >
          Continue to dashboard →
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 700, color: "#111" }}>Verify your institution</h1>
      <p style={{ margin: "0 0 6px", fontSize: 13, color: "#999", lineHeight: 1.5 }}>
        Enter your institutional email to unlock the{" "}
        <span style={{ color: "#1A6B3C", fontWeight: 700 }}>Verified Coach ✓</span> badge.
      </p>
      <p style={{ margin: "0 0 24px", fontSize: 12, color: "#bbb" }}>
        Must be a .edu address. Other domains? Contact support.
      </p>

      <div style={{ marginBottom: 20 }}>
        <label style={lbl}>Institution email (.edu)</label>
        <input
          className="ob-input"
          style={fi}
          type="email"
          value={eduEmail}
          onChange={e => setEduEmail(e.target.value)}
          placeholder="yourname@university.edu"
        />
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <button
          onClick={onBack}
          style={{ background: "none", border: "1px solid #ddd", borderRadius: 20, padding: "8px 20px", fontSize: 13, fontWeight: 600, color: "#555", cursor: "pointer", flexShrink: 0 }}
        >
          ← Back
        </button>
        <button
          onClick={() => setSent(true)}
          disabled={!isValidEdu}
          style={{
            flex: 1, background: isValidEdu ? "#1A6B3C" : "#ccc", border: "none",
            borderRadius: 20, padding: "8px 16px", fontSize: 13, fontWeight: 700,
            color: "#fff", cursor: isValidEdu ? "pointer" : "default",
          }}
        >
          Send verification email
        </button>
      </div>

      <button
        onClick={() => router.push("/recruiting")}
        style={{ width: "100%", marginTop: 14, background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "#aaa", textDecoration: "underline" }}
      >
        Skip for now — verify later
      </button>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════════

export default function OnboardingPage() {
  const [role, setRole] = useState(null);   // null | "athlete" | "parent" | "coach"
  const [step, setStep] = useState(0);      // 0 = landing

  // Athlete state
  const [aSports, setASports]   = useState([]);
  const [aGender, setAGender]   = useState(null);
  const [aForm,   setAForm]     = useState({
    firstName: "", lastName: "", position: "",
    number: "", gradYear: "", club: "", school: "",
    gpa: "", dominantHand: "Right",
  });

  // Parent state
  const [pForm,        setPForm]        = useState({ firstName: "", lastName: "", email: "" });
  const [athleteEmail, setAthleteEmail] = useState("");

  // Coach state
  const [cForm,     setCForm]     = useState({ firstName: "", lastName: "", institution: "" });
  const [cSports,   setCSports]   = useState([]);
  const [cDivision, setCDivision] = useState("");
  const [cFilters,  setCFilters]  = useState({ positions: "", gradYearFrom: "", gradYearTo: "", region: "" });

  const totalSteps = role === "coach" ? 4 : 3;

  const selectRole = r => { setRole(r); setStep(1); };
  const goBack = () => {
    if (step <= 1) { setRole(null); setStep(0); }
    else setStep(s => s - 1);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F3F2EE", padding: "60px 16px" }}>
      <style>{GLOBAL_STYLE}</style>
      <div style={{
        maxWidth: 480, margin: "0 auto",
        background: "#fff", borderRadius: 16, padding: 40,
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
      }}>
        <Logo />
        {step > 0 && <ProgressBar step={step} total={totalSteps} />}

        {/* Landing */}
        {step === 0 && <Landing onSelect={selectRole} />}

        {/* ── Athlete ── */}
        {role === "athlete" && step === 1 && (
          <AthleteStep1 selected={aSports} setSelected={setASports} onBack={goBack} onNext={() => setStep(2)} />
        )}
        {role === "athlete" && step === 2 && (
          <AthleteStep2
            sports={aSports} gender={aGender} setGender={setAGender}
            form={aForm} setForm={setAForm}
            onBack={goBack} onNext={() => setStep(3)}
          />
        )}
        {role === "athlete" && step === 3 && (
          <AthleteStep3 sports={aSports} gender={aGender} form={aForm} onBack={goBack} />
        )}

        {/* ── Parent ── */}
        {role === "parent" && step === 1 && (
          <ParentStep1 form={pForm} setForm={setPForm} onBack={goBack} onNext={() => setStep(2)} />
        )}
        {role === "parent" && step === 2 && (
          <ParentStep2
            athleteEmail={athleteEmail} setAthleteEmail={setAthleteEmail}
            onBack={goBack} onNext={() => setStep(3)}
          />
        )}
        {role === "parent" && step === 3 && (
          <ParentStep3 athleteEmail={athleteEmail} />
        )}

        {/* ── Coach ── */}
        {role === "coach" && step === 1 && (
          <CoachStep1 form={cForm} setForm={setCForm} onBack={goBack} onNext={() => setStep(2)} />
        )}
        {role === "coach" && step === 2 && (
          <CoachStep2
            sports={cSports} setSports={setCSports}
            division={cDivision} setDivision={setCDivision}
            onBack={goBack} onNext={() => setStep(3)}
          />
        )}
        {role === "coach" && step === 3 && (
          <CoachStep3 filters={cFilters} setFilters={setCFilters} onBack={goBack} onNext={() => setStep(4)} />
        )}
        {role === "coach" && step === 4 && (
          <CoachStep4 onBack={goBack} />
        )}
      </div>
    </div>
  );
}
