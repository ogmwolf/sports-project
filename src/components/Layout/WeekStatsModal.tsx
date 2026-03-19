"use client";
import { useRouter } from "next/navigation";
import Modal from "@/components/Common/Modal";
import { useApp } from "@/context/AppContext";
import SchoolItem from "@/components/Recruiting/SchoolItem";

export type WeekStatType =
  | "profile-views"
  | "coach-views"
  | "schools"
  | "emails-sent"
  | "responses"
  | "impressions";

interface Props {
  type: WeekStatType;
  onClose: () => void;
}

// ── Shared sub-components ──────────────────────────────────────────

function BigStat({ value, color = "#111", sub }: { value: string; color?: string; sub: string }) {
  return (
    <div style={{ textAlign: "center", marginBottom: 16 }}>
      <div style={{ fontSize: 32, fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 13, color: "#999", marginTop: 6 }}>{sub}</div>
    </div>
  );
}

function Divider() {
  return <div style={{ height: 1, background: "#f0f0ee", margin: "12px 0" }} />;
}

function GreenBox({ text }: { text: string }) {
  return (
    <div style={{
      background: "#E8F5EE", borderLeft: "3px solid #1A6B3C",
      borderRadius: 6, padding: "10px 12px", marginTop: 14,
    }}>
      <span style={{ fontSize: 12, color: "#0F4A28", lineHeight: 1.6 }}>{text}</span>
    </div>
  );
}

function FootNote({ text }: { text: string }) {
  return (
    <p style={{ fontSize: 12, color: "#999", fontStyle: "italic", marginTop: 14, lineHeight: 1.6 }}>
      {text}
    </p>
  );
}

function GoToRecruiting({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  return (
    <button
      className="btn-primary"
      onClick={() => { onClose(); router.push("/recruiting"); }}
      style={{ width: "100%", marginTop: 16, padding: "10px", fontSize: 13, borderRadius: 10 }}
    >
      Go to Recruiting →
    </button>
  );
}

// ── Email / Response seed entries (matches Coach Outreach modals) ──

const EMAIL_SEED = [
  { school: "UCLA",        coach: "Coach Speraw",  date: "March 8, 2026",  preview: "Dear Coach Speraw, My name is Sofia Reyes and I am a Class of 2029 outside hitter..." },
  { school: "Pepperdine",  coach: "Coach Hunt",    date: "March 1, 2026",  preview: "Dear Coach Hunt, I'm a Class of 2029 outside hitter currently playing for SC Rockstar..." },
  { school: "UC San Diego",coach: "Coach Rottman", date: "Feb 20, 2026",   preview: "Dear Coach Rottman, I wanted to reach out and express my strong interest..." },
];

const RESPONSE_SEED = [
  { school: "UCLA",       coach: "Coach Speraw", date: "March 11, 2026", preview: "Thanks for reaching out Sofia. We'd love to learn more about you..." },
  { school: "Pepperdine", coach: "Coach Hunt",   date: "March 3, 2026",  preview: "Sofia, great to hear from you. Your film from the SCVA qualifier caught our attention..." },
];

function OutreachList({ entries }: { entries: typeof EMAIL_SEED }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {entries.map((e, i) => (
        <div key={i} style={{ padding: "10px 12px", background: "#F8F8F6", borderRadius: 8, border: "1px solid #ebebeb" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#111" }}>{e.school}</span>
            <span style={{ fontSize: 11, color: "#999" }}>{e.date}</span>
          </div>
          <div style={{ fontSize: 12, color: "#555", marginBottom: 3 }}>{e.coach}</div>
          <div style={{ fontSize: 12, color: "#999", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{e.preview}</div>
        </div>
      ))}
    </div>
  );
}

// ── Modal content per type ─────────────────────────────────────────

function ProfileViewsContent() {
  return (
    <>
      <BigStat value="23" sub="people viewed your profile this week" />
      <Divider />
      {[
        { icon: "🎓", label: "College domains (.edu)", count: 3 },
        { icon: "📍", label: "California",              count: 8 },
        { icon: "🌐", label: "Other locations",         count: 12 },
      ].map(row => (
        <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #f5f5f5" }}>
          <span style={{ fontSize: 13, color: "#555" }}>{row.icon} {row.label}</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#111" }}>{row.count}</span>
        </div>
      ))}
      <FootNote text="Sign in as a coach or club to see who's viewing. Individual viewer details available in a future update when full accounts are enabled." />
      <GreenBox text="3 views came from college (.edu) domains this week. Keep your profile updated — coaches are watching." />
    </>
  );
}

function CoachViewsContent() {
  const coaches = [
    { initials: "C1", name: "Coach · Division I Program",  meta: "Viewed March 14 · California" },
    { initials: "C2", name: "Coach · Division I Program",  meta: "Viewed March 12 · West Coast" },
    { initials: "C3", name: "Coach · Division II Program", meta: "Viewed March 11 · California" },
  ];
  return (
    <>
      <BigStat value="3" color="#1A6B3C" sub="college coaches viewed your profile" />
      <Divider />
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {coaches.map((c, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#E6F1FB", display: "flex", alignItems: "center", justifyContent: "center", color: "#0C447C", fontWeight: 800, fontSize: 12, flexShrink: 0 }}>
              {c.initials}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#111" }}>{c.name}</div>
              <div style={{ fontSize: 11, color: "#999" }}>{c.meta}</div>
            </div>
          </div>
        ))}
      </div>
      <FootNote text="Coach identities are anonymous until they choose to connect with you. Full coach details coming in a future update." />
      <GreenBox text="Tip: Send a follow-up email to programs in your target list — a coach viewing your profile is a strong signal of interest." />
    </>
  );
}

function SchoolsContent({ onClose }: { onClose: () => void }) {
  const { schools } = useApp();
  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 320, overflowY: "auto" }}>
        {schools.map(s => <SchoolItem key={s.id} school={s} />)}
      </div>
      <GoToRecruiting onClose={onClose} />
    </>
  );
}

function EmailsSentContent({ onClose }: { onClose: () => void }) {
  return (
    <>
      <OutreachList entries={EMAIL_SEED} />
      <GoToRecruiting onClose={onClose} />
    </>
  );
}

function ResponsesContent({ onClose }: { onClose: () => void }) {
  return (
    <>
      <OutreachList entries={RESPONSE_SEED} />
      <GoToRecruiting onClose={onClose} />
    </>
  );
}

function ImpressionsContent() {
  return (
    <>
      <BigStat value="1,840" sub="times your posts were seen this week" />
      <Divider />

      {/* Top post */}
      <div style={{ fontSize: 10, fontWeight: 700, color: "#999", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>
        Your most viewed post
      </div>
      <div style={{ padding: "10px 12px", background: "#F8F8F6", borderRadius: 8, border: "1px solid #ebebeb", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#E6F1FB", display: "flex", alignItems: "center", justifyContent: "center", color: "#0C447C", fontWeight: 800, fontSize: 11, flexShrink: 0 }}>CL</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#111" }}>Camila Linares</div>
            <div style={{ fontSize: 11, color: "#999" }}>Libero · SC Rockstar 16U · 2h ago</div>
          </div>
        </div>
        <p style={{ margin: 0, fontSize: 13, color: "#333", lineHeight: 1.55 }}>
          Committed! So grateful for everyone who supported me on this journey. This has been a dream since I was 10 years old and I can&#39;t believe it&#39;s real. See you in Malibu 🌊
        </p>
        <div style={{ fontSize: 11, color: "#999", marginTop: 6 }}>❤ 24 reactions · 8 comments</div>
      </div>

      {/* Engagement breakdown */}
      <div style={{ fontSize: 10, fontWeight: 700, color: "#999", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>
        Engagement
      </div>
      {[
        { label: "Reactions",      count: 24 },
        { label: "Comments",       count: 8 },
        { label: "Shares",         count: 3 },
        { label: "Profile clicks", count: 6 },
      ].map((row, i, arr) => (
        <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: i < arr.length - 1 ? "1px solid #f5f5f5" : "none" }}>
          <span style={{ fontSize: 13, color: "#555" }}>{row.label}</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#111" }}>{row.count}</span>
        </div>
      ))}

      <FootNote text="Impressions count how many times your posts appeared in someone's feed. Post consistently to increase visibility with coaches and scouts." />
    </>
  );
}

// ── Main component ─────────────────────────────────────────────────

const TITLES: Record<WeekStatType, string> = {
  "profile-views": "Profile views this week",
  "coach-views":   "Coach views this week",
  "schools":       "Schools in your pipeline",
  "emails-sent":   "Emails sent",
  "responses":     "Responses received",
  "impressions":   "Post impressions this week",
};

export default function WeekStatsModal({ type, onClose }: Props) {
  return (
    <Modal open title={TITLES[type]} onClose={onClose}>
      {type === "profile-views" && <ProfileViewsContent />}
      {type === "coach-views"   && <CoachViewsContent />}
      {type === "schools"       && <SchoolsContent onClose={onClose} />}
      {type === "emails-sent"   && <EmailsSentContent onClose={onClose} />}
      {type === "responses"     && <ResponsesContent onClose={onClose} />}
      {type === "impressions"   && <ImpressionsContent />}
    </Modal>
  );
}
