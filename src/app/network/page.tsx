"use client";
import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

// ─── Types ───────────────────────────────────────────────────────────────────

interface SeedMessage {
  id: string;
  from: "them" | "you";
  text: string;
}

interface Conversation {
  id: string;
  initials: string;
  avatarBg: string;
  avatarColor: string;
  name: string;
  badge?: { label: string; bg: string; color: string };
  preview: string;
  time: string;
  unread: boolean;
  messages: SeedMessage[];
}

// ─── Seed data ───────────────────────────────────────────────────────────────

const CONNECTIONS = [
  { initials: "CL", name: "Camila Linares", sub: "Libero · SC Rockstar 16U", bg: "#E6F1FB", color: "#0C447C" },
  { initials: "TN", name: "Taylor Nguyen", sub: "OH · Mizuno Long Beach", bg: "#EEEDFE", color: "#3C3489" },
  { initials: "KB", name: "Kayla Brooks", sub: "Setter · Coast VBC", bg: "#FAEEDA", color: "#633806" },
  { initials: "AJ", name: "Aisha Johnson", sub: "MB · Wilson HS", bg: "#E8F5EE", color: "#0F4A28" },
  { initials: "EP", name: "Emma Park", sub: "DS · A5 Volleyball", bg: "#FAECE7", color: "#712B13" },
  { initials: "GK", name: "Grace Kim", sub: "Libero · South Torrance", bg: "#E6F1FB", color: "#0C447C" },
];

const COACH_BADGE = { label: "Verified Coach", bg: "#E8F5EE", color: "#0F4A28" };

const SEED_CONVERSATIONS: Conversation[] = [
  {
    id: "conv1",
    initials: "CS", avatarBg: "#E6F1FB", avatarColor: "#0C447C",
    name: "Coach Speraw · UCLA", badge: COACH_BADGE,
    preview: "Thanks for reaching out Sofia. We'd love to learn more about...",
    time: "2h ago", unread: true,
    messages: [
      { id: "m1", from: "them", text: "Thanks for reaching out Sofia. We'd love to learn more about your recruiting process." },
      { id: "m2", from: "you",  text: "Thank you Coach Speraw! I'd love to chat. I'm available next week." },
      { id: "m3", from: "them", text: "Perfect. I'll have our recruiting coordinator reach out to schedule a call." },
    ],
  },
  {
    id: "conv3",
    initials: "CH", avatarBg: "#FAEEDA", avatarColor: "#633806",
    name: "Coach Hunt · Pepperdine", badge: COACH_BADGE,
    preview: "Sofia, great to hear from you. Your film is impressive and...",
    time: "2 days ago", unread: true,
    messages: [
      { id: "m1", from: "them", text: "Sofia, great to hear from you. Your film is impressive." },
      { id: "m2", from: "you",  text: "Thank you so much Coach Hunt! Pepperdine has always been a dream school." },
      { id: "m3", from: "them", text: "We're very interested. Let's set up a campus visit for April." },
    ],
  },
  {
    id: "conv4",
    initials: "AJ", avatarBg: "#E8F5EE", avatarColor: "#0F4A28",
    name: "Aisha Johnson", badge: undefined,
    preview: "Are you going to Far Westerns? We should warm up together!",
    time: "3 days ago", unread: false,
    messages: [
      { id: "m1", from: "you",  text: "Hey! Yes definitely going to Far Westerns. Which pool are you in?" },
      { id: "m2", from: "them", text: "Pool C! We might see each other in bracket play 🤞" },
    ],
  },
  {
    id: "conv6",
    initials: "BR", avatarBg: "#FAEEDA", avatarColor: "#633806",
    name: "Brooke Rivera", badge: undefined,
    preview: "Dude your serve in the finals was INSANE. What did you change?",
    time: "4 days ago", unread: false,
    messages: [
      { id: "m1", from: "them", text: "Dude your serve in the finals was INSANE. What did you change?" },
      { id: "m2", from: "you",  text: "Ha thank you! I've been working on my toss with Maria. More consistent contact point." },
      { id: "m3", from: "them", text: "I need to book a session with her. Can you send me her info?" },
      { id: "m4", from: "you",  text: "For sure, sending now!" },
    ],
  },
  {
    id: "conv7",
    initials: "MS", avatarBg: "#EEEDFE", avatarColor: "#3C3489",
    name: "Maria Santos · Skills Trainer", badge: undefined,
    preview: "Great session today. Work on the crosscourt angle this week before...",
    time: "5 days ago", unread: false,
    messages: [
      { id: "m1", from: "them", text: "Great session today. Work on the crosscourt angle this week before we meet again." },
      { id: "m2", from: "you",  text: "Will do! Should I film my reps?" },
      { id: "m3", from: "them", text: "Yes — send me 10 swings from each approach angle. I'll review before Thursday." },
    ],
  },
];

// ─── Tab-bar style helper ────────────────────────────────────────────────────

function tabStyle(active: boolean): React.CSSProperties {
  return {
    flexShrink: 0,
    fontSize: 13,
    padding: "10px 16px",
    cursor: "pointer",
    background: "none",
    border: "none",
    borderBottom: active ? "2px solid #1A6B3C" : "2px solid transparent",
    color: active ? "#111" : "#999",
    fontWeight: active ? 600 : 400,
    whiteSpace: "nowrap",
  };
}

// ─── Club tab ─────────────────────────────────────────────────────────────────

function ClubTab() {
  return (
    <div>
      {/* Club header card */}
      <div style={{ background: "white", border: "1px solid #e8e8e8", borderRadius: 10, padding: "16px", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#111" }}>SC Rockstar Volleyball</div>
          <span style={{ fontSize: 10, borderRadius: 10, padding: "3px 10px", fontWeight: 600, background: "#E8F5EE", color: "#0F4A28" }}>Verified Club</span>
        </div>
        <div style={{ fontSize: 13, color: "#999", marginBottom: 14 }}>16U Open · Manhattan Beach, CA</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8 }}>
          {[
            { val: "24", label: "athletes" },
            { val: "3", label: "coaches" },
            { val: "2008", label: "Founded" },
            { val: "USAV", label: "member" },
          ].map(s => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#1A6B3C" }}>{s.val}</div>
              <div style={{ fontSize: 10, color: "#999", marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Club feed */}
      <div style={{ fontSize: 14, fontWeight: 700, color: "#111", marginBottom: 12 }}>Club updates</div>
      {[
        {
          id: "cf1", initials: "RV", bg: "#1A6B3C", color: "white",
          name: "SC Rockstar Volleyball", badge: "Club",
          time: "3h ago",
          body: "Massive weekend for our 16U Open squad. 3 players recording career-high dig sets, Sofia commits to Pepperdine, and a first-place finish at the Red Rock Rave qualifier. This team is built different. 🏐🔥",
          reactions: 52,
        },
        {
          id: "cf2", initials: "RV", bg: "#1A6B3C", color: "white",
          name: "SC Rockstar Volleyball", badge: "Club",
          time: "5 days ago",
          body: "🚨 Coach alert: 8 D1 programs have viewed SC Rockstar 16U profiles on Scoutly this week including programs from the Big West, WCC, and Pac-12. Make sure your stats, film, and contact info are current. This is the window.",
          reactions: 89,
        },
        {
          id: "cf3", initials: "TB", bg: "#534AB7", color: "white",
          name: "Team Bot", badge: "AI Assistant",
          time: "Today at 9:14 AM",
          body: "👋 Good morning SC Rockstar 16U families!\n\n🥪 LUNCH ORDER REMINDER — submit by March 25\n🚗 CARPOOL COORDINATION — 3 families still need rides to Las Vegas\n💊 MEDICAL FORMS — 4 athletes haven't submitted yet\n\nQuestions? Just reply to this post.",
          reactions: 34,
        },
      ].map(post => (
        <div key={post.id} style={{ background: "white", border: "1px solid #e8e8e8", borderRadius: 10, padding: "14px 16px", marginBottom: 8 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: "50%", background: post.bg, color: post.color, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 12, flexShrink: 0 }}>{post.initials}</div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#111" }}>{post.name}</span>
                <span style={{ fontSize: 10, borderRadius: 10, padding: "2px 8px", fontWeight: 600, background: "#E6F1FB", color: "#0C447C" }}>{post.badge}</span>
              </div>
              <div style={{ fontSize: 11, color: "#999" }}>{post.time}</div>
            </div>
          </div>
          <p style={{ margin: 0, fontSize: 13, color: "#333", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{post.body}</p>
          <div style={{ fontSize: 12, color: "#999", marginTop: 8 }}>❤ {post.reactions} reactions</div>
        </div>
      ))}

      {/* Roster */}
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 16, marginBottom: 12 }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: "#111" }}>16U Open roster</span>
        <span style={{ fontSize: 12, color: "#999" }}>24 athletes</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
        {[
          { initials: "SR", bg: "#1A6B3C", color: "white", name: "Sofia Reyes", pos: "OH", year: "2029", isYou: true },
          { initials: "CL", bg: "#E6F1FB", color: "#0C447C", name: "Camila Linares", pos: "Libero", year: "2028", isYou: false },
          { initials: "BR", bg: "#FAEEDA", color: "#633806", name: "Brooke Rivera", pos: "DS", year: "2028", isYou: false },
          { initials: "TN", bg: "#EEEDFE", color: "#3C3489", name: "Taylor Nguyen", pos: "OH", year: "2027", isYou: false },
          { initials: "KB", bg: "#FAEEDA", color: "#633806", name: "Kayla Brooks", pos: "Setter", year: "2029", isYou: false },
          { initials: "AJ", bg: "#E8F5EE", color: "#0F4A28", name: "Aisha Johnson", pos: "MB", year: "2028", isYou: false },
          { initials: "EP", bg: "#FAECE7", color: "#712B13", name: "Emma Park", pos: "DS", year: "2029", isYou: false },
          { initials: "GK", bg: "#E6F1FB", color: "#0C447C", name: "Grace Kim", pos: "Libero", year: "2028", isYou: false },
        ].map(a => (
          <div key={a.name} style={{ background: "white", border: "1px solid #e8e8e8", borderRadius: 8, padding: "10px 12px", display: "flex", gap: 10, alignItems: "center" }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: a.bg, color: a.color, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 11, flexShrink: 0 }}>{a.initials}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#111" }}>{a.name}</span>
                {a.isYou && <span style={{ fontSize: 9, background: "#1A6B3C", color: "white", borderRadius: 4, padding: "1px 5px", fontWeight: 700 }}>You</span>}
              </div>
              <div style={{ fontSize: 11, color: "#999" }}>{a.pos}</div>
            </div>
            <span style={{ fontSize: 10, border: "1px solid #1A6B3C", color: "#1A6B3C", borderRadius: 10, padding: "2px 7px", fontWeight: 700, flexShrink: 0 }}>{a.year}</span>
          </div>
        ))}
      </div>
      <button style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "#1A6B3C", fontWeight: 600, padding: 0 }}>View full roster →</button>

      {/* Coaches */}
      <div style={{ fontSize: 14, fontWeight: 700, color: "#111", marginTop: 20, marginBottom: 12 }}>Coaching staff</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {[
          { initials: "KC", bg: "#E8F5EE", color: "#0F4A28", name: "Kim Collins", title: "Head Coach", sub: "Libero specialist · 12 years", verified: true },
          { initials: "DT", bg: "#E6F1FB", color: "#0C447C", name: "Dave Torres", title: "Assistant Coach", sub: "Setting specialist · 8 years", verified: false },
          { initials: "SM", bg: "#FAEEDA", color: "#633806", name: "Sarah Mitchell", title: "Assistant Coach", sub: "OH/RS specialist · 6 years", verified: false },
        ].map(c => (
          <div key={c.name} style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: c.bg, color: c.color, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13, flexShrink: 0 }}>{c.initials}</div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#111" }}>{c.name}</span>
                {c.verified && <span style={{ fontSize: 9, background: "#E8F5EE", color: "#0F4A28", borderRadius: 4, padding: "1px 5px", fontWeight: 700 }}>Verified</span>}
              </div>
              <div style={{ fontSize: 12, color: "#999" }}>{c.title}</div>
              <div style={{ fontSize: 11, color: "#555" }}>{c.sub}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── High School tab ──────────────────────────────────────────────────────────

function HSTab() {
  return (
    <div>
      {/* School header card */}
      <div style={{ background: "white", border: "1px solid #e8e8e8", borderRadius: 10, padding: "16px", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#111" }}>Mira Costa High School</div>
        </div>
        <div style={{ fontSize: 13, color: "#999", marginBottom: 8 }}>Varsity Volleyball · Manhattan Beach, CA</div>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px", background: "#F3F2EE", borderRadius: 20, marginBottom: 14 }}>
          <span style={{ fontSize: 12, color: "#666" }}>⏸ Off season — Fall season starts August</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          {[
            { val: "12", label: "athletes" },
            { val: "2", label: "coaches" },
            { val: "CIF SS", label: "Division 1" },
          ].map(s => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#1A6B3C" }}>{s.val}</div>
              <div style={{ fontSize: 10, color: "#999", marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* School feed */}
      <div style={{ fontSize: 14, fontWeight: 700, color: "#111", marginBottom: 12 }}>School updates</div>
      {[
        {
          id: "sf1",
          body: "Tryout dates announced for the 2026 fall season! 🏐\n\n📅 August 10-12, 2026\n📍 Mira Costa HS Main Gym\n\nAll incoming freshmen and transfer students welcome to try out. Current roster athletes — conditioning program starts July 14.\n\nQuestions? Email Coach Cameron Green at [email protected]",
          time: "1 week ago",
          reactions: 89, comments: 23,
        },
        {
          id: "sf2",
          body: "Congratulations to our 6 seniors on signing with incredible programs! Proud of everything you've accomplished in our program. We know you'll represent MC with the same heart and dedication that made you champions here. 🎓🏐",
          time: "2 weeks ago",
          reactions: 234, comments: 41,
        },
      ].map(post => (
        <div key={post.id} style={{ background: "white", border: "1px solid #e8e8e8", borderRadius: 10, padding: "14px 16px", marginBottom: 8 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: "50%", background: "#185FA5", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 12, flexShrink: 0 }}>MC</div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#111" }}>Mira Costa HS Volleyball</span>
                <span style={{ fontSize: 10, borderRadius: 10, padding: "2px 8px", fontWeight: 600, background: "#E6F1FB", color: "#0C447C" }}>School · Verified</span>
              </div>
              <div style={{ fontSize: 11, color: "#999" }}>{post.time}</div>
            </div>
          </div>
          <p style={{ margin: 0, fontSize: 13, color: "#333", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{post.body}</p>
          <div style={{ fontSize: 12, color: "#999", marginTop: 8 }}>❤ {post.reactions} reactions · {post.comments} comments</div>
        </div>
      ))}

      {/* HS Roster */}
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 16, marginBottom: 12 }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: "#111" }}>Varsity roster</span>
        <span style={{ fontSize: 12, color: "#999" }}>12 athletes</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
        {[
          { initials: "SR", bg: "#1A6B3C", color: "white", name: "Sofia Reyes", pos: "OH", year: "2029", isYou: true },
          { initials: "BR", bg: "#FAEEDA", color: "#633806", name: "Brooke Rivera", pos: "DS", year: "2028", isYou: false },
          { initials: "EP", bg: "#FAECE7", color: "#712B13", name: "Emma Park", pos: "DS", year: "2029", isYou: false },
          { initials: "LT", bg: "#E6F1FB", color: "#0C447C", name: "Lily Thompson", pos: "Setter", year: "2027", isYou: false },
          { initials: "ZW", bg: "#E8F5EE", color: "#0F4A28", name: "Zoe Williams", pos: "MB", year: "2028", isYou: false },
          { initials: "HL", bg: "#EEEDFE", color: "#3C3489", name: "Hannah Lee", pos: "Libero", year: "2028", isYou: false },
        ].map(a => (
          <div key={a.name} style={{ background: "white", border: "1px solid #e8e8e8", borderRadius: 8, padding: "10px 12px", display: "flex", gap: 10, alignItems: "center" }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: a.bg, color: a.color, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 11, flexShrink: 0 }}>{a.initials}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#111" }}>{a.name}</span>
                {a.isYou && <span style={{ fontSize: 9, background: "#1A6B3C", color: "white", borderRadius: 4, padding: "1px 5px", fontWeight: 700 }}>You</span>}
              </div>
              <div style={{ fontSize: 11, color: "#999" }}>{a.pos}</div>
            </div>
            <span style={{ fontSize: 10, border: "1px solid #1A6B3C", color: "#1A6B3C", borderRadius: 10, padding: "2px 7px", fontWeight: 700, flexShrink: 0 }}>{a.year}</span>
          </div>
        ))}
      </div>

      {/* School coaches */}
      <div style={{ fontSize: 14, fontWeight: 700, color: "#111", marginTop: 20, marginBottom: 12 }}>Coaching staff</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {[
          { initials: "CG", bg: "#185FA5", color: "white", name: "Cameron Green", title: "Head Coach", sub: "Mira Costa HS · 8 years" },
          { initials: "MR", bg: "#E6F1FB", color: "#0C447C", name: "Mike Rodriguez", title: "Assistant Coach", sub: "JV Head Coach" },
        ].map(c => (
          <div key={c.name} style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: c.bg, color: c.color, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13, flexShrink: 0 }}>{c.initials}</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#111" }}>{c.name}</div>
              <div style={{ fontSize: 12, color: "#999" }}>{c.title}</div>
              <div style={{ fontSize: 11, color: "#555" }}>{c.sub}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Connections tab ──────────────────────────────────────────────────────────

function ConnectionsTab() {
  return (
    <div>
      <div style={{ marginBottom: 4 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#111", margin: 0 }}>My Team</h2>
        <p style={{ fontSize: 13, color: "#999", marginTop: 4, marginBottom: 20 }}>Athletes and coaches you're connected with</p>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 20 }}>
        {[
          { val: "47", label: "Connections" },
          { val: "12", label: "Following" },
          { val: "8",  label: "Followers" },
        ].map(s => (
          <div key={s.label} style={{ background: "white", border: "1px solid #e8e8e8", borderRadius: 10, padding: 14, textAlign: "center" }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#1A6B3C" }}>{s.val}</div>
            <div style={{ fontSize: 11, color: "#999", marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Connections list */}
      <div style={{ fontSize: 14, fontWeight: 700, color: "#111", marginBottom: 12 }}>People you follow</div>
      {CONNECTIONS.map(c => (
        <div key={c.initials + c.name} style={{
          background: "white", border: "1px solid #e8e8e8", borderRadius: 10,
          padding: "12px 16px", display: "flex", gap: 12, alignItems: "center", marginBottom: 8,
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: "50%", background: c.bg, color: c.color,
            display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, flexShrink: 0,
          }}>
            {c.initials}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#111" }}>{c.name}</div>
            <div style={{ fontSize: 12, color: "#999" }}>{c.sub}</div>
          </div>
          <div style={{
            border: "1px solid #1A6B3C", color: "#1A6B3C", borderRadius: 20,
            padding: "4px 12px", fontSize: 11, fontWeight: 700, background: "white",
          }}>
            Following
          </div>
        </div>
      ))}

      <div style={{ fontSize: 12, color: "#1A6B3C", cursor: "pointer", marginTop: 12 }}>
        Find more athletes →
      </div>
    </div>
  );
}

// ─── Messages tab ─────────────────────────────────────────────────────────────

function MessagesTab() {
  const [conversations, setConversations] = useState<Conversation[]>(SEED_CONVERSATIONS);
  const [openConvId, setOpenConvId] = useState<string | null>(null);
  const [searchVal, setSearchVal] = useState("");
  const [inputVal, setInputVal] = useState("");

  const openConv = conversations.find(c => c.id === openConvId) || null;

  const sendMessage = () => {
    if (!inputVal.trim() || !openConvId) return;
    const newMsg: SeedMessage = { id: `m${Date.now()}`, from: "you", text: inputVal.trim() };
    setConversations(prev => prev.map(c =>
      c.id === openConvId ? { ...c, messages: [...c.messages, newMsg] } : c
    ));
    setInputVal("");
  };

  const filtered = conversations.filter(c =>
    c.name.toLowerCase().includes(searchVal.toLowerCase())
  );

  return (
    <div>
      <input
        type="text"
        placeholder="Search messages..."
        value={searchVal}
        onChange={e => setSearchVal(e.target.value)}
        style={{
          border: "1px solid #ddd", borderRadius: 20, padding: "8px 16px",
          fontSize: 13, width: "100%", boxSizing: "border-box", marginBottom: 8,
          outline: "none",
        }}
      />
      <p style={{ fontSize: 11, color: "#999", fontStyle: "italic", margin: "0 0 12px 4px" }}>
        Personal messages · For team updates see Club and High School tabs
      </p>

      {filtered.map(conv => (
        <div
          key={conv.id}
          onClick={() => setOpenConvId(conv.id)}
          style={{
            display: "flex", gap: 12, alignItems: "center",
            padding: "12px 16px", borderBottom: "1px solid #f5f5f5",
            cursor: "pointer", background: conv.unread ? "#fafafa" : "white",
          }}
          onMouseEnter={e => (e.currentTarget.style.background = "#fafaf8")}
          onMouseLeave={e => (e.currentTarget.style.background = conv.unread ? "#fafafa" : "white")}
        >
          {/* Avatar with optional unread dot */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            <div style={{
              width: 40, height: 40, borderRadius: "50%", background: conv.avatarBg,
              color: conv.avatarColor, display: "flex", alignItems: "center",
              justifyContent: "center", fontWeight: 700, fontSize: 13,
            }}>
              {conv.initials}
            </div>
            {conv.unread && (
              <span style={{
                position: "absolute", top: 0, left: 0, width: 8, height: 8,
                background: "#1A6B3C", borderRadius: "50%", border: "1.5px solid white",
              }} />
            )}
          </div>

          {/* Middle */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
              <span style={{ fontSize: 13, fontWeight: conv.unread ? 700 : 600, color: "#111" }}>{conv.name}</span>
              {conv.badge && (
                <span style={{
                  fontSize: 10, borderRadius: 10, padding: "2px 8px", fontWeight: 600,
                  background: conv.badge.bg, color: conv.badge.color,
                }}>
                  {conv.badge.label}
                </span>
              )}
            </div>
            <div style={{ fontSize: 12, color: "#999", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis", maxWidth: "100%" }}>
              {conv.preview}
            </div>
          </div>

          {/* Time */}
          <div style={{ fontSize: 11, color: "#aaa", flexShrink: 0 }}>{conv.time}</div>
        </div>
      ))}

      {/* Message modal */}
      {openConv && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 500,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <div style={{
            background: "white", borderRadius: 12,
            width: "min(480px, 92vw)", height: 520,
            display: "flex", flexDirection: "column", overflow: "hidden",
          }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", borderBottom: "1px solid #f0f0f0" }}>
              <div style={{
                width: 36, height: 36, borderRadius: "50%", background: openConv.avatarBg,
                color: openConv.avatarColor, display: "flex", alignItems: "center",
                justifyContent: "center", fontWeight: 700, fontSize: 12, flexShrink: 0,
              }}>
                {openConv.initials}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#111" }}>{openConv.name}</div>
                {openConv.badge && (
                  <span style={{ fontSize: 10, borderRadius: 10, padding: "2px 8px", fontWeight: 600, background: openConv.badge.bg, color: openConv.badge.color }}>
                    {openConv.badge.label}
                  </span>
                )}
              </div>
              <button
                onClick={() => setOpenConvId(null)}
                style={{ background: "none", border: "none", fontSize: 18, color: "#999", cursor: "pointer" }}
              >
                ×
              </button>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
              {openConv.messages.map(msg => (
                <div
                  key={msg.id}
                  style={{
                    alignSelf: msg.from === "you" ? "flex-end" : "flex-start",
                    background: msg.from === "you" ? "#1A6B3C" : "#f0f0f0",
                    color: msg.from === "you" ? "white" : "#111",
                    borderRadius: 12, padding: "8px 12px", fontSize: 13, maxWidth: "70%",
                  }}
                >
                  {msg.text}
                </div>
              ))}
            </div>

            {/* Input area */}
            <div style={{ display: "flex", gap: 8, padding: "12px 16px", borderTop: "1px solid #f0f0f0" }}>
              <input
                value={inputVal}
                onChange={e => setInputVal(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") sendMessage(); }}
                placeholder="Message..."
                style={{
                  flex: 1, border: "1px solid #ddd", borderRadius: 20, padding: "8px 14px",
                  fontSize: 13, outline: "none", fontFamily: "inherit",
                }}
              />
              <button
                onClick={sendMessage}
                style={{
                  width: 36, height: 36, borderRadius: "50%", background: "#1A6B3C",
                  border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}>
                  <path d="M22 2L11 13"/>
                  <path d="M22 2L15 22 11 13 2 9l20-7z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main network page ────────────────────────────────────────────────────────

const TAB_LABELS: Record<string, string> = {
  club: "Club",
  hs: "High School",
  messages: "Messages",
  connections: "Connections",
};
const TABS = ["club", "hs", "messages", "connections"];

function NetworkContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const activeTab = searchParams.get("tab") ?? "club";
  const setTab = (t: string) => router.replace(`/network?tab=${t}`);

  return (
    <div>
      {/* Sub-tab bar */}
      <div style={{
        display: "flex",
        overflowX: "auto",
        borderBottom: "1px solid #e8e8e8",
        background: "white",
        WebkitOverflowScrolling: "touch",
        scrollbarWidth: "none",
      }}>
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={tabStyle(activeTab === t)}
          >
            {TAB_LABELS[t]}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ paddingTop: 16 }}>
        {activeTab === "club" && <ClubTab />}
        {activeTab === "hs" && <HSTab />}
        {activeTab === "messages" && <MessagesTab />}
        {activeTab === "connections" && <ConnectionsTab />}
      </div>
    </div>
  );
}

export default function NetworkPage() {
  return (
    <Suspense fallback={<div style={{ padding: 20 }}>Loading...</div>}>
      <NetworkContent />
    </Suspense>
  );
}
