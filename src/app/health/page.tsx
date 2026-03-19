"use client";
import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";

type HealthTab = "injuries" | "community" | "doctors";

// ── Injury data ────────────────────────────────────────────────────

const INJURIES = [
  {
    emoji: "🦶",
    name: "Ankle Sprain",
    severity: "Very Common" as const,
    recovery: "1–6 weeks",
    content: {
      causes: "Inversion sprains occur when landing from a jump, often when stepping on another player's foot at the net. The lateral ligaments (ATFL, CFL) are most commonly affected.",
      symptoms: "Immediate pain on the outer ankle. Swelling and bruising around the joint. Difficulty bearing weight. Limited range of motion in the ankle.",
      treatment: "Apply RICE immediately: Rest the ankle. Ice for 15–20 min every 2–3 hours for the first 48 hours. Compress with an elastic bandage to reduce swelling. Elevate the ankle above heart level. OTC NSAIDs (ibuprofen) can reduce swelling and pain.",
      seeDoctor: "If you cannot bear weight at all. Significant swelling, bruising, or deformity. Symptoms don't improve within 5–7 days of RICE. An X-ray may be needed to rule out fracture.",
      prevention: "Ankle strengthening exercises (single-leg balance, banded inversion/eversion). Wearing supportive footwear with good ankle structure. Using an ankle brace during competition. Proprioception training drills.",
    },
  },
  {
    emoji: "🦵",
    name: "Patellar Tendinitis",
    severity: "Common" as const,
    recovery: "4–12 weeks",
    content: {
      causes: "Repetitive jumping and landing loads the patellar tendon excessively. Often develops gradually over a season with insufficient recovery between training sessions. High training volume without progressive loading is the primary risk factor.",
      symptoms: "Pain and tenderness directly below the kneecap. Stiffness after rest that warms up with activity. Pain that worsens during or after jumping. Aching after prolonged sitting with knees bent.",
      treatment: "Relative rest from jumping activities. Ice the tendon for 15 min post-activity. NSAIDs for acute flare-ups. Eccentric single-leg squats on a decline board are the gold-standard rehab exercise. A patellar tendon strap can reduce load during play.",
      seeDoctor: "If pain is severe or rated above 7/10. Persists beyond 6 weeks of conservative treatment. Sudden sharp pain that could indicate a partial tear. You experience significant weakness in the leg.",
      prevention: "Adequate warm-up before jumping sessions. Progressive jump training load — avoid sudden volume increases. Eccentric quad strengthening as part of regular conditioning. Hip and glute strengthening to reduce knee load. Adequate recovery between sessions.",
    },
  },
  {
    emoji: "💪",
    name: "Rotator Cuff Strain",
    severity: "Common" as const,
    recovery: "3–8 weeks",
    content: {
      causes: "Repetitive overhead motions in spiking, serving, and blocking stress the supraspinatus, infraspinatus, and teres minor muscles. Fatigue, poor hitting mechanics, and insufficient shoulder conditioning accelerate wear.",
      symptoms: "Dull ache deep in the shoulder or outer upper arm. Pain reaching overhead or behind the back. Weakness when lifting the arm to the side. Occasional clicking or popping during movement.",
      treatment: "Rest from overhead activity for at least 1–2 weeks. Apply ice or heat depending on phase (ice for acute, heat for chronic). NSAIDs for inflammation. A targeted PT program focusing on external rotation, internal rotation, and scaption exercises.",
      seeDoctor: "If you have sudden severe pain or heard a pop. Cannot lift your arm away from your side. Symptoms persist beyond 4 weeks of rest and conservative treatment. An MRI may be needed to evaluate for a partial or full tear.",
      prevention: "Pre-season rotator cuff conditioning program. Scapular stabilization exercises (rows, face pulls). Proper hitting mechanics coaching. Graduated return to full-intensity hitting after rest periods. Adequate recovery between serving and spiking sessions.",
    },
  },
  {
    emoji: "✋",
    name: "Finger Injuries",
    severity: "Very Common" as const,
    recovery: "1–4 weeks",
    content: {
      causes: "Blocking and setting expose fingers to direct ball impact. Sudden hyperextension during a block is the most common mechanism. Jams and sprains of the PIP or DIP joints are frequent, and avulsion fractures can occur.",
      symptoms: "Immediate pain and tenderness at the affected joint. Swelling that develops quickly after impact. Bruising often visible within hours. Difficulty bending or fully straightening the finger.",
      treatment: "Buddy tape the injured finger to an adjacent finger for support. Ice immediately and elevate. Use a dorsal aluminum splint if there is significant instability or suspected fracture. NSAIDs for pain and swelling management.",
      seeDoctor: "If the finger appears visibly deformed or rotated. You cannot fully extend the fingertip (possible mallet finger or extensor tendon avulsion). Numbness or significant instability. An X-ray is needed to rule out fracture before continuing to play.",
      prevention: "Proper setting technique — use fingertip pads, not flat hands. Proper blocking hand position. Wearing finger sleeves or pre-taping high-risk fingers during practice. Strengthening finger flexors and extensors in the off-season.",
    },
  },
  {
    emoji: "🏃",
    name: "ACL / MCL Sprain",
    severity: "Serious" as const,
    recovery: "6–12 months (ACL surgery)",
    content: {
      causes: "Non-contact ACL tears typically occur on landing with a straight or slightly bent knee, sudden deceleration, or pivoting. Female athletes are 2–8× more likely to tear the ACL due to anatomical and biomechanical factors. MCL sprains often occur from direct medial-side contact or valgus knee loading on landing.",
      symptoms: "ACL: sudden loud pop heard or felt, immediate instability, rapid swelling within 2 hours, inability to continue play. MCL: medial (inner) knee pain, localized swelling, tenderness to touch on the inner side of the knee.",
      immediate: "Stop play immediately — do not attempt to walk it off. Apply ice and compression. Immobilize in a brace if available. Seek medical evaluation within 24–48 hours. An MRI will be needed to confirm the diagnosis and extent of injury.",
      surgery: "Complete ACL tears typically require surgical reconstruction (patellar tendon, hamstring, or cadaver graft) followed by 9–12 months of structured rehabilitation before return to sport. Grade 1–2 MCL sprains usually heal without surgery with 4–8 weeks of bracing and PT.",
      prevention: "ACL prevention programs (FIFA 11+, PEP program) reduce injury risk by up to 50% with consistent use. Key elements: neuromuscular training, proper jump-landing mechanics, hip abductor and glute strengthening. Programs should be performed 3× per week during the season.",
    },
  },
  {
    emoji: "🔄",
    name: "Lower Back Strain",
    severity: "Common" as const,
    recovery: "2–6 weeks",
    content: {
      causes: "Repeated lumbar flexion and extension in floor defense (diving), jumping, and overhead movements strain the paraspinal muscles and lumbar discs. Poor core stability is the primary contributing factor in volleyball athletes.",
      symptoms: "Dull or sharp pain in the lower back or sacral region. Muscle tightness and spasms that limit movement. Pain worsens with bending, prolonged sitting, or twisting. Occasional radiation of pain into the glutes or upper thigh.",
      treatment: "Relative rest — avoid aggravating activities (heavy lifting, explosive jumping). Apply ice for acute phase (first 48h), then heat to relax muscle spasms. NSAIDs for pain management. Gentle mobility work (cat-cow, hip flexor stretches) as pain allows. Progressive core strengthening as symptoms improve.",
      seeDoctor: "If pain radiates down the leg below the knee — possible disc herniation or nerve compression. Numbness, tingling, or weakness in the leg. Pain does not improve after 2 weeks of rest and conservative care. You have a history of stress fractures or spondylolysis.",
      prevention: "Daily core and glute strengthening (planks, bird dogs, deadbugs, bridges). Hip flexor flexibility work. Proper diving and landing mechanics. Avoid rapid increases in training volume. Adequate recovery between high-volume jumping and floor work sessions.",
    },
  },
];

const SEVERITY_STYLE: Record<string, { bg: string; color: string }> = {
  "Very Common": { bg: "#FAECE7", color: "#712B13" },
  "Common":      { bg: "#FAEEDA", color: "#633806" },
  "Serious":     { bg: "#e24b4a", color: "white" },
};

// ── Q&A data ───────────────────────────────────────────────────────

const QA_FEED = [
  {
    id: "qa1",
    authorInitials: "KL",
    authorBg: "#185FA5",
    authorName: "Karen Liu",
    authorBadge: "Parent",
    badgeBg: "#E8F5EE",
    badgeColor: "#1A6B3C",
    timestamp: "2 days ago",
    category: "Injury",
    categoryBg: "#FAECE7",
    categoryColor: "#712B13",
    question: "My daughter (16, OH) sprained her ankle at practice on Tuesday — mild grade 1. Coach wants her back for the regional qualifier this Saturday. Is 4 days enough recovery time?",
    answerCount: 7,
    topAnswer: {
      authorInitials: "Dr. P",
      authorBg: "#534AB7",
      authorName: "Dr. P. Nakamura",
      verified: true,
      preview: "A grade 1 sprain (ligament stretching without tearing) can allow return to play in 4–7 days with proper management, but it depends on her current pain level and functional testing. She should be pain-free walking before returning to jumping and cutting.",
    },
  },
  {
    id: "qa2",
    authorInitials: "TR",
    authorBg: "#1A6B3C",
    authorName: "Tyler R.",
    authorBadge: "Athlete",
    badgeBg: "#E8F5EE",
    badgeColor: "#1A6B3C",
    timestamp: "5 days ago",
    category: "Recovery",
    categoryBg: "#E6F1FB",
    categoryColor: "#0C447C",
    question: "I've had patellar tendinitis for 6 weeks. I've been resting but it keeps coming back the second I start jumping again. My PT says eccentric squats but they hurt during. Is that normal?",
    answerCount: 11,
    topAnswer: {
      authorInitials: "MA",
      authorBg: "#2D9A5A",
      authorName: "Mike Adler, DPT",
      verified: true,
      preview: "Some discomfort during eccentric loading (3–4/10 on a pain scale) is acceptable and expected with patellar tendinopathy rehab. Pain above 5/10 or pain that doesn't return to baseline within 24 hours means you're loading too aggressively — reduce range of motion or add a load.",
    },
  },
  {
    id: "qa3",
    authorInitials: "SC",
    authorBg: "#C13584",
    authorName: "Sarah C.",
    authorBadge: "Coach",
    badgeBg: "#F5E6F5",
    badgeColor: "#7B1F6E",
    timestamp: "1 week ago",
    category: "Prevention",
    categoryBg: "#E8F5EE",
    categoryColor: "#0F4A28",
    question: "What's the best pre-practice warm-up protocol specifically for reducing ACL risk in female club volleyball players? Looking for evidence-based recommendations.",
    answerCount: 9,
    topAnswer: {
      authorInitials: "JW",
      authorBg: "#0C447C",
      authorName: "Jessica Walsh, ATC",
      verified: true,
      preview: "The FIFA 11+ and PEP (Prevent Injury and Enhance Performance) programs have the strongest evidence for female athletes. Key components: dynamic warm-up, single-leg balance work, jump-landing mechanics drills, and hip abductor strengthening. Takes 15–20 min and shown to reduce ACL injury by up to 50%.",
    },
  },
  {
    id: "qa4",
    authorInitials: "DM",
    authorBg: "#633806",
    authorName: "David M.",
    authorBadge: "Parent",
    badgeBg: "#E8F5EE",
    badgeColor: "#1A6B3C",
    timestamp: "2 weeks ago",
    category: "Find a doctor",
    categoryBg: "#FAEEDA",
    categoryColor: "#633806",
    question: "Looking for a sports medicine doctor in the South Bay / Manhattan Beach area who has specific experience with youth volleyball athletes. Any community recommendations?",
    answerCount: 14,
    topAnswer: {
      authorInitials: "MR",
      authorBg: "#8B1A1A",
      authorName: "Melissa R.",
      verified: false,
      preview: "We've had great experiences at South Bay Sports Medicine in Torrance. Dr. Okafor sees a lot of club volleyball players and really understands the demands of the sport. She treated both my daughters through ankle sprains and one patellar tendinitis case.",
    },
  },
  {
    id: "qa5",
    authorInitials: "AV",
    authorBg: "#3C3489",
    authorName: "Aaliyah V.",
    authorBadge: "Athlete",
    badgeBg: "#E8F5EE",
    badgeColor: "#1A6B3C",
    timestamp: "3 weeks ago",
    category: "Nutrition",
    categoryBg: "#E6F1FB",
    categoryColor: "#0C447C",
    question: "I'm a 17-year-old outside hitter training 5x/week. I feel exhausted and my jumps are way down the last month. Could nutrition be a factor? What should I be eating around practice?",
    answerCount: 16,
    topAnswer: {
      authorInitials: "RD",
      authorBg: "#2D9A5A",
      authorName: "Dr. R. Delgado, RD",
      verified: true,
      preview: "Persistent fatigue and performance decline in a high-training-load athlete should be evaluated for relative energy deficiency in sport (RED-S). Key signals: are you eating enough total calories? For a 5x/week athlete, pre-workout carbs (banana, toast) and post-workout protein + carbs within 30–45 min are critical.",
    },
  },
];

// ── Provider data ──────────────────────────────────────────────────

const PROVIDERS = [
  {
    initials: "KO",
    bg: "#185FA5",
    name: "Dr. Keiko Okafor, MD",
    title: "Sports Medicine Physician",
    specialty: "Volleyball & overhead athlete injuries, return-to-sport protocols",
    location: "Torrance, CA",
    rating: 4.9,
    reviews: 74,
    scoutlyRecs: 23,
    topPick: true,
  },
  {
    initials: "MT",
    bg: "#1A6B3C",
    name: "Marcus Tran, DPT",
    title: "Physical Therapist",
    specialty: "Patellar tendinopathy, ankle rehab, ACL return-to-sport",
    location: "Manhattan Beach, CA",
    rating: 4.8,
    reviews: 58,
    scoutlyRecs: 17,
    topPick: false,
  },
  {
    initials: "SB",
    bg: "#534AB7",
    name: "Dr. Sandra Brennan, MD",
    title: "Orthopedic Surgeon",
    specialty: "ACL reconstruction, shoulder surgery, young athlete specialization",
    location: "Redondo Beach, CA",
    rating: 4.8,
    reviews: 91,
    scoutlyRecs: 31,
    topPick: false,
  },
  {
    initials: "JA",
    bg: "#0C447C",
    name: "Jamie Arroyo, ATC/PT",
    title: "Athletic Trainer & PT",
    specialty: "Injury prevention, sports taping, in-season management",
    location: "El Segundo, CA",
    rating: 4.7,
    reviews: 39,
    scoutlyRecs: 12,
    topPick: false,
  },
];

// ── Helpers ────────────────────────────────────────────────────────

function BulletList({ text }: { text: string }) {
  // Split on ". " followed by a capital letter to get sentence-level bullets
  const bullets = text
    .split(/\.\s+(?=[A-Z])/)
    .map(s => s.replace(/\.$/, "").trim())
    .filter(Boolean);
  return (
    <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
      {bullets.map((b, i) => (
        <li key={i} style={{ display: "flex", gap: 8, marginBottom: 4 }}>
          <span style={{ color: "#1A6B3C", flexShrink: 0, fontWeight: 700, lineHeight: 1.7 }}>•</span>
          <span style={{ fontSize: 13, color: "#444", lineHeight: 1.7 }}>{b}</span>
        </li>
      ))}
    </ul>
  );
}

// ── Injury card ────────────────────────────────────────────────────

const EXPANDED_SECTIONS: { key: string; label: string; para?: boolean }[] = [
  { key: "causes",    label: "What it is",           para: true },
  { key: "symptoms",  label: "How to recognize it" },
  { key: "treatment", label: "Immediate response" },
  { key: "immediate", label: "Immediate response" },
  { key: "surgery",   label: "Surgery & recovery" },
  { key: "seeDoctor", label: "When to see a doctor" },
  { key: "prevention",label: "Prevention tips" },
];

function InjuryCard({
  injury,
  expanded,
  onToggle,
}: {
  injury: typeof INJURIES[0];
  expanded: boolean;
  onToggle: () => void;
}) {
  const sev = SEVERITY_STYLE[injury.severity];
  const c = injury.content as unknown as Record<string, string>;

  return (
    <div style={{
      background: "white",
      border: "1px solid #e8e8e8",
      borderRadius: 10,
      padding: 16,
      gridColumn: expanded ? "1 / -1" : undefined,
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 20 }}>{injury.emoji}</span>
          <span style={{ fontSize: 15, fontWeight: 700, color: "#111" }}>{injury.name}</span>
        </div>
        <span style={{
          fontSize: 10, fontWeight: 700, borderRadius: 20, padding: "3px 8px",
          background: sev.bg, color: sev.color, flexShrink: 0,
        }}>
          {injury.severity}
        </span>
      </div>

      {/* Recovery */}
      <div style={{ fontSize: 12, color: "#999", marginTop: 8 }}>⏱ Recovery: {injury.recovery}</div>

      {/* Toggle */}
      <button
        onClick={onToggle}
        style={{
          marginTop: 8, background: "none", border: "none", cursor: "pointer",
          color: "#1A6B3C", fontSize: 12, fontWeight: 700, padding: 0,
        }}
      >
        {expanded ? "Show less ▴" : "Learn more ▾"}
      </button>

      {/* Expandable content — max-height animation */}
      <div style={{
        overflow: "hidden",
        maxHeight: expanded ? 900 : 0,
        transition: "max-height 200ms ease",
      }}>
        <div style={{ borderTop: "1px solid #f0f0f0", marginTop: 12, paddingTop: 4 }}>
          {EXPANDED_SECTIONS.map(({ key, label, para }) =>
            c[key] ? (
              <div key={key} style={{ marginTop: 12 }}>
                <div style={{
                  fontSize: 11, fontWeight: 700, color: "#999",
                  textTransform: "uppercase" as const, letterSpacing: "0.05em",
                  marginBottom: 4,
                }}>
                  {label}
                </div>
                {para
                  ? <p style={{ margin: 0, fontSize: 13, color: "#444", lineHeight: 1.7 }}>{c[key]}</p>
                  : <BulletList text={c[key]} />
                }
              </div>
            ) : null
          )}
        </div>
      </div>
    </div>
  );
}

// ── Q&A card ───────────────────────────────────────────────────────

function QACard({ item }: { item: typeof QA_FEED[0] }) {
  return (
    <div style={{ background: "white", border: "1px solid #e8e8e8", borderRadius: 10, padding: "14px 16px", marginBottom: 10 }}>
      {/* Author row */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <div style={{
          width: 34, height: 34, borderRadius: "50%", background: item.authorBg,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "white", fontWeight: 800, fontSize: 11, flexShrink: 0,
        }}>
          {item.authorInitials}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#111" }}>{item.authorName}</span>
            <span style={{ fontSize: 10, fontWeight: 700, borderRadius: 20, padding: "1px 7px", background: item.badgeBg, color: item.badgeColor }}>
              {item.authorBadge}
            </span>
            <span style={{ fontSize: 10, fontWeight: 700, borderRadius: 20, padding: "1px 7px", background: item.categoryBg, color: item.categoryColor }}>
              {item.category}
            </span>
          </div>
          <div style={{ fontSize: 11, color: "#bbb", marginTop: 1 }}>{item.timestamp}</div>
        </div>
      </div>

      {/* Question */}
      <div style={{ fontSize: 13, color: "#111", lineHeight: 1.6, marginBottom: 10 }}>{item.question}</div>

      {/* Top answer preview */}
      <div style={{ background: "#fafaf8", borderRadius: 8, padding: "10px 12px", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
          <div style={{
            width: 24, height: 24, borderRadius: "50%", background: item.topAnswer.authorBg,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "white", fontWeight: 800, fontSize: 9, flexShrink: 0,
          }}>
            {item.topAnswer.authorInitials}
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#111" }}>{item.topAnswer.authorName}</span>
          {item.topAnswer.verified && (
            <span style={{ fontSize: 10, fontWeight: 700, background: "#E6F1FB", color: "#0C447C", borderRadius: 20, padding: "1px 6px" }}>
              ✓ Verified
            </span>
          )}
        </div>
        <div style={{ fontSize: 12, color: "#444", lineHeight: 1.6 }}>{item.topAnswer.preview}</div>
      </div>

      {/* Footer */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: 11, color: "#bbb" }}>{item.answerCount} answers</div>
        <div style={{ display: "flex", gap: 12 }}>
          <button style={{ background: "none", border: "none", cursor: "pointer", color: "#1A6B3C", fontSize: 12, fontWeight: 700, padding: 0 }}>
            See all answers →
          </button>
          <button style={{ background: "none", border: "none", cursor: "pointer", color: "#555", fontSize: 12, padding: 0 }}>
            Answer →
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Provider card ──────────────────────────────────────────────────

function ProviderCard({ provider }: { provider: typeof PROVIDERS[0] }) {
  return (
    <div style={{
      background: "white", border: "1px solid #e8e8e8", borderRadius: 10,
      padding: 16, display: "flex", gap: 14, marginBottom: 10,
    }}>
      <div style={{
        width: 52, height: 52, borderRadius: "50%", background: provider.bg,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "white", fontWeight: 800, fontSize: 14, flexShrink: 0,
      }}>
        {provider.initials}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 2 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#111" }}>{provider.name}</span>
              {provider.topPick && (
                <span style={{ fontSize: 10, fontWeight: 700, borderRadius: 20, padding: "2px 8px", background: "#FAEEDA", color: "#633806", flexShrink: 0 }}>
                  Community Top Pick
                </span>
              )}
            </div>
            <div style={{ fontSize: 12, color: "#666", marginTop: 1 }}>{provider.title}</div>
          </div>
          <button style={{
            background: "none", border: "1px solid #1A6B3C", color: "#1A6B3C",
            borderRadius: 8, padding: "5px 12px", fontSize: 12, fontWeight: 700,
            cursor: "pointer", flexShrink: 0,
          }}>
            View →
          </button>
        </div>
        <div style={{ fontSize: 12, color: "#555", marginTop: 4, lineHeight: 1.5 }}>{provider.specialty}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 6, flexWrap: "wrap" }}>
          <span style={{ fontSize: 12, color: "#666" }}>📍 {provider.location}</span>
          <span style={{ fontSize: 12, color: "#666" }}>⭐ {provider.rating} ({provider.reviews} reviews)</span>
        </div>
        <div style={{ fontSize: 11, color: "#1A6B3C", fontWeight: 700, marginTop: 4 }}>
          ✓ {provider.scoutlyRecs} Scoutly members recommend
        </div>
      </div>
    </div>
  );
}

// ── Tab components ─────────────────────────────────────────────────

function InjuriesTab() {
  const [expandedInjury, setExpandedInjury] = useState<string | null>(null);
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
      {INJURIES.map(injury => (
        <InjuryCard
          key={injury.name}
          injury={injury}
          expanded={expandedInjury === injury.name}
          onToggle={() => setExpandedInjury(expandedInjury === injury.name ? null : injury.name)}
        />
      ))}
    </div>
  );
}

function CommunityTab({ showToast }: { showToast: (msg: string) => void }) {
  const [search, setSearch] = useState("");
  const [composerOpen, setComposerOpen] = useState(false);
  const [questionText, setQuestionText] = useState("");
  const [questionCategory, setQuestionCategory] = useState("Injury");

  const q = search.toLowerCase().trim();
  const filtered = q
    ? QA_FEED.filter(item =>
        item.question.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      )
    : QA_FEED;

  const handlePost = () => {
    if (!questionText.trim()) return;
    showToast("Question posted!");
    setQuestionText("");
    setComposerOpen(false);
  };

  return (
    <div>
      {/* Search */}
      <div style={{ position: "relative", marginBottom: 16 }}>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="🔍 Search health questions..."
          style={{
            width: "100%", border: "1px solid #ddd", borderRadius: 20,
            padding: "8px 36px 8px 16px", fontSize: 13, color: "#555",
            background: "white", fontFamily: "inherit",
            boxSizing: "border-box" as const, outline: "none",
          }}
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            style={{
              position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
              background: "none", border: "none", cursor: "pointer",
              color: "#bbb", fontSize: 16, padding: 0, lineHeight: 1,
            }}
          >×</button>
        )}
      </div>

      {/* Composer */}
      {!composerOpen ? (
        <div className="card" style={{ padding: "12px 16px", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: "50%", background: "#1A6B3C",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "white", fontWeight: 800, fontSize: 11, flexShrink: 0,
            }}>SR</div>
            <button
              onClick={() => setComposerOpen(true)}
              style={{
                flex: 1, textAlign: "left", padding: "9px 14px",
                background: "none", border: "1px solid #ccc", borderRadius: 20,
                fontSize: 13, color: "#999", cursor: "pointer", fontFamily: "inherit",
              }}
            >
              Ask a health or injury question...
            </button>
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: 16, marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%", background: "#1A6B3C",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "white", fontWeight: 800, fontSize: 11,
              }}>SR</div>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#111" }}>Sofia Reyes</span>
            </div>
            <button onClick={() => setComposerOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#999", fontSize: 18, padding: 0 }}>×</button>
          </div>
          <textarea
            autoFocus
            value={questionText}
            onChange={e => setQuestionText(e.target.value)}
            placeholder="Describe your question..."
            rows={4}
            style={{
              width: "100%", border: "none", resize: "none", fontSize: 13,
              color: "#111", lineHeight: 1.6, background: "none", outline: "none",
              boxSizing: "border-box" as const, marginBottom: 10,
            }}
          />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
            <select
              value={questionCategory}
              onChange={e => setQuestionCategory(e.target.value)}
              style={{
                border: "1px solid #ddd", borderRadius: 20, padding: "5px 12px",
                fontSize: 12, color: "#555", background: "white", fontFamily: "inherit",
              }}
            >
              {["Injury", "Recovery", "Prevention", "Find a doctor", "Nutrition", "Mental health", "Other"].map(c => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <button
              className="btn-primary"
              onClick={handlePost}
              disabled={!questionText.trim()}
              style={{ padding: "7px 20px", fontSize: 13 }}
            >
              Post question
            </button>
          </div>
        </div>
      )}

      {/* Q&A feed */}
      {filtered.length > 0 ? (
        filtered.map(item => <QACard key={item.id} item={item} />)
      ) : (
        <div style={{ padding: "24px 16px", textAlign: "center" }}>
          <div style={{ fontSize: 13, color: "#999" }}>
            No questions found for &ldquo;{search}&rdquo;
          </div>
          <div style={{ fontSize: 13, color: "#999", marginTop: 4 }}>Be the first to ask!</div>
        </div>
      )}
    </div>
  );
}

function DoctorsTab({ showToast }: { showToast: (msg: string) => void }) {
  return (
    <div>
      <input
        type="text"
        placeholder="Search by name, specialty, or location..."
        readOnly
        style={{
          width: "100%", border: "1px solid #ddd", borderRadius: 20,
          padding: "9px 16px", fontSize: 13, color: "#999",
          background: "white", fontFamily: "inherit",
          boxSizing: "border-box" as const, marginBottom: 16, outline: "none",
        }}
      />
      {PROVIDERS.map(p => <ProviderCard key={p.name} provider={p} />)}
      <div style={{ textAlign: "center", marginTop: 8, marginBottom: 8 }}>
        <button
          onClick={() => showToast("Provider recommendations launching soon — we'll notify you when it's live!")}
          style={{ background: "none", border: "none", cursor: "pointer", color: "#1A6B3C", fontSize: 12, fontWeight: 700, padding: 0 }}
        >
          + Recommend a provider in your area
        </button>
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────

const TABS: { key: HealthTab; label: string }[] = [
  { key: "injuries",  label: "Injuries" },
  { key: "community", label: "Community" },
  { key: "doctors",   label: "Doctors" },
];

export default function HealthPage() {
  const { showToast } = useApp();
  const [dismissed, setDismissed] = useState(true);
  const [tab, setTab] = useState<HealthTab>("injuries");

  useEffect(() => {
    setDismissed(sessionStorage.getItem("scoutly_health_disclaimer") === "dismissed");
  }, []);

  const dismissBanner = () => {
    sessionStorage.setItem("scoutly_health_disclaimer", "dismissed");
    setDismissed(true);
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#111", margin: "0 0 2px" }}>Med Center</h1>
        <div style={{ fontSize: 13, color: "#999" }}>Sports medicine resources for volleyball athletes and families</div>
      </div>

      {/* Disclaimer banner — always above tabs */}
      {!dismissed && (
        <div style={{
          background: "#E6F1FB", borderBottom: "1px solid #b8d4f0",
          padding: "10px 16px", fontSize: 12, color: "#0C447C",
          marginBottom: 16, borderRadius: 8,
          display: "flex", alignItems: "flex-start", gap: 10,
        }}>
          <span style={{ flexShrink: 0 }}>ℹ️</span>
          <span style={{ flex: 1, lineHeight: 1.6 }}>
            Content on Scoutly Med Center is for informational purposes only and does not constitute medical advice. Always consult a qualified healthcare professional for diagnosis and treatment.
          </span>
          <button
            onClick={dismissBanner}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#0C447C", fontSize: 16, fontWeight: 700, padding: 0, flexShrink: 0, lineHeight: 1 }}
            aria-label="Dismiss"
          >×</button>
        </div>
      )}

      {/* Sub-tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid #e8e8e8", marginBottom: 20 }}>
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              fontSize: 13, padding: "10px 20px", cursor: "pointer",
              background: "none", border: "none",
              borderBottom: tab === t.key ? "2px solid #1A6B3C" : "2px solid transparent",
              color: tab === t.key ? "#111" : "#999",
              fontWeight: tab === t.key ? 600 : 400,
              whiteSpace: "nowrap",
            }}
          >{t.label}</button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "injuries"  && <InjuriesTab />}
      {tab === "community" && <CommunityTab showToast={showToast} />}
      {tab === "doctors"   && <DoctorsTab showToast={showToast} />}
    </div>
  );
}
