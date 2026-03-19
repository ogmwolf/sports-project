"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useApp } from "@/context/AppContext";
import type { School } from "@/context/AppContext";
import Pipeline from "@/components/Recruiting/Pipeline";
import SchoolList from "@/components/Recruiting/SchoolList";
import AddSchoolModal from "@/components/Recruiting/AddSchoolModal";

type RecruitingSubTab = "Pipeline" | "Outreach" | "NIL" | "Timeline";
const SUB_TABS: RecruitingSubTab[] = ["Pipeline", "Outreach", "NIL", "Timeline"];

const TAB_PARAM_MAP: Record<string, RecruitingSubTab> = {
  nil: "NIL",
  pipeline: "Pipeline",
  outreach: "Outreach",
  timeline: "Timeline",
};

// ─── OutreachTab ──────────────────────────────────────────────────────────────

function OutreachTab({ schools, showToast }: { schools: School[]; showToast: (msg: string) => void }) {
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>(
    schools.find(s => s.status === "Offered")?.id || schools[0]?.id || ""
  );
  const [subject, setSubject] = useState<string>("");
  const [body, setBody] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [generated, setGenerated] = useState<boolean>(false);
  const [sentLog, setSentLog] = useState<{ date: string; preview: string; body: string; expanded: boolean }[]>([
    { date: "March 1, 2026", preview: "Dear Coach Hunt, I'm a Class of 2029...", body: "Dear Coach Hunt,\n\nI'm a Class of 2029 outside hitter currently playing for SC Rockstar 16U. I've been following the Pepperdine program closely and would love the opportunity to be part of your team.\n\n— Sofia Reyes", expanded: false },
    { date: "March 8, 2026", preview: "Coach Hunt, just wanted to follow up...", body: "Coach Hunt,\n\nJust wanted to follow up on my previous email. I recently competed at Red Rock Rave #1 and had a strong weekend. My Scoutly profile has been updated with new film.\n\n— Sofia", expanded: false },
  ]);
  const [responses, setResponses] = useState<{ date: string; from: string; preview: string; body: string; expanded: boolean }[]>([
    { date: "March 3, 2026", from: "Coach Hunt", preview: "Sofia, great to hear from you. Your film is impressive and...", body: "Sofia,\n\nGreat to hear from you. Your film is impressive and we've had our eye on you. Let's set up a call with our recruiting coordinator next week.\n\n— Coach Hunt, Pepperdine", expanded: false },
  ]);
  const [manualSentOpen, setManualSentOpen] = useState<boolean>(false);
  const [manualRespOpen, setManualRespOpen] = useState<boolean>(false);
  const [manualSentDate, setManualSentDate] = useState<string>("");
  const [manualSentBody, setManualSentBody] = useState<string>("");
  const [manualRespDate, setManualRespDate] = useState<string>("");
  const [manualRespBody, setManualRespBody] = useState<string>("");

  const selectedSchool = schools.find(s => s.id === selectedSchoolId) || null;

  const visibleSentLog = selectedSchoolId === "pepperdine" ? sentLog : [];
  const visibleResponses = selectedSchoolId === "pepperdine" ? responses : [];

  const toggleSentExpanded = (i: number) => setSentLog(prev => prev.map((e, idx) => idx === i ? { ...e, expanded: !e.expanded } : e));
  const toggleRespExpanded = (i: number) => setResponses(prev => prev.map((e, idx) => idx === i ? { ...e, expanded: !e.expanded } : e));

  const handleSaveManualSent = () => {
    if (!manualSentBody.trim()) return;
    setSentLog(prev => [...prev, { date: manualSentDate || new Date().toLocaleDateString(), preview: manualSentBody.slice(0, 60) + "...", body: manualSentBody, expanded: false }]);
    setManualSentBody(""); setManualSentDate(""); setManualSentOpen(false);
    showToast("Email logged!");
  };

  const handleSaveManualResp = () => {
    if (!manualRespBody.trim()) return;
    setResponses(prev => [...prev, { date: manualRespDate || new Date().toLocaleDateString(), from: selectedSchool?.coach || "Coach", preview: manualRespBody.slice(0, 60) + "...", body: manualRespBody, expanded: false }]);
    setManualRespBody(""); setManualRespDate(""); setManualRespOpen(false);
    showToast("Response logged!");
  };

  const handleGenerate = async () => {
    if (!selectedSchool) return;
    setLoading(true);
    setGenerated(false);
    try {
      const res = await fetch("/api/generate-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ school: selectedSchool }),
      });
      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      const lines = (data.text as string).split("\n");
      const subjectLine = lines.find((l: string) => l.startsWith("Subject:"));
      const bodyStart = subjectLine ? lines.indexOf(subjectLine) + 1 : 0;
      setSubject(subjectLine ? subjectLine.replace("Subject:", "").trim() : "");
      setBody(lines.slice(bodyStart).join("\n").trim());
      setGenerated(true);
    } catch {
      showToast("Generation failed — check API key");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`);
    showToast("Copied!");
  };

  const handleGmail = () => {
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, "_blank");
  };

  const handleLogSent = () => {
    setSentLog(prev => [...prev, { date: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }), preview: body.slice(0, 60) + "...", body, expanded: false }]);
    showToast("Logged!");
  };

  return (
    <div>
      {/* 1. Header */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: "#111" }}>
          Email to {selectedSchool?.coach || "coach"} · {selectedSchool?.name || ""}
        </div>
        <div style={{ fontSize: 11, color: "#999", marginTop: 2 }}>AI-generated · unique to you</div>
      </div>

      {/* 2. Generate button */}
      <button
        onClick={handleGenerate}
        disabled={loading}
        style={{
          width: "100%", background: loading ? "#aaa" : "#1A6B3C", color: "white",
          border: "none", borderRadius: 20, padding: "12px", fontSize: 14, fontWeight: 700,
          cursor: loading ? "not-allowed" : "pointer", marginBottom: 8,
        }}
      >
        {loading ? "Writing your email..." : "✨ Generate my email"}
      </button>
      <p style={{ fontSize: 11, color: "#999", fontStyle: "italic", marginBottom: 16, textAlign: "center", lineHeight: 1.5 }}>
        Reads your profile, stats, film, and recent activity to write an email only you could send.
      </p>

      {/* Loading state */}
      {loading && (
        <div style={{ textAlign: "center", padding: "24px 0", fontSize: 13, color: "#999", fontStyle: "italic" }}>
          Sofia is writing your email...
        </div>
      )}

      {/* 3. Generated email fields */}
      {generated && !loading && (
        <div style={{ marginBottom: 24 }}>
          {/* Subject */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#999", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>Subject</div>
            <input
              value={subject}
              onChange={e => setSubject(e.target.value)}
              style={{ width: "100%", boxSizing: "border-box", border: "1px solid #ddd", borderRadius: 8, padding: "8px 12px", fontSize: 13, outline: "none", fontFamily: "inherit" }}
            />
          </div>

          {/* Body */}
          <div style={{ marginBottom: 8 }}>
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              style={{ width: "100%", boxSizing: "border-box", border: "1px solid #ddd", borderRadius: 8, padding: "12px", fontSize: 14, lineHeight: 1.6, minHeight: 280, resize: "vertical", outline: "none", fontFamily: "inherit" }}
            />
            {/* Word count */}
            <div style={{
              fontSize: 11,
              color: body.trim().split(/\s+/).filter(Boolean).length > 250 ? "#E53E3E"
                   : body.trim().split(/\s+/).filter(Boolean).length < 100 ? "#D97706"
                   : "#1A6B3C",
              marginTop: 4,
            }}>
              {body.trim().split(/\s+/).filter(Boolean).length} words
            </div>
          </div>

          {/* Action row */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
            {[
              { label: "📋 Copy", action: handleCopy },
              { label: "🔄 Regenerate", action: handleGenerate },
              { label: "📧 Open in Gmail", action: handleGmail },
              { label: "✓ Log as sent", action: handleLogSent },
            ].map(btn => (
              <button
                key={btn.label}
                onClick={btn.action}
                style={{
                  flex: 1, minWidth: 100, border: "1px solid #ddd", borderRadius: 8,
                  padding: "7px 8px", fontSize: 12, fontWeight: 600, background: "white",
                  color: "#333", cursor: "pointer",
                }}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 4. Select a school */}
      <div style={{ borderTop: "1px solid #f0f0f0", paddingTop: 16, marginBottom: 8 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#999", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>
          Select a school
        </div>
        <div style={{ position: "relative" }}>
          <select
            value={selectedSchoolId}
            onChange={e => setSelectedSchoolId(e.target.value)}
            style={{
              width: "100%", border: "1px solid #ddd", borderRadius: 8,
              padding: "10px 36px 10px 14px", fontSize: 14, color: "#111",
              background: "white", cursor: "pointer",
              appearance: "none", WebkitAppearance: "none",
              outline: "none", fontFamily: "inherit",
            }}
          >
            <optgroup label="── Active outreach ──">
              {schools.filter(s => s.status === "Contacted").map(s => (
                <option key={s.id} value={s.id}>{s.name} · {s.division} · {s.conference}</option>
              ))}
            </optgroup>
            <optgroup label="── In pipeline ──">
              {schools.filter(s => s.status === "Offered" || s.status === "Visited" || s.status === "Committed").map(s => (
                <option key={s.id} value={s.id}>{s.name} · {s.division} · {s.conference}</option>
              ))}
            </optgroup>
            <optgroup label="── Not yet contacted ──">
              {schools.filter(s => s.status === "Interested").map(s => (
                <option key={s.id} value={s.id}>{s.name} · {s.division} · {s.conference}</option>
              ))}
            </optgroup>
          </select>
          <svg
            viewBox="0 0 24 24" width="14" height="14" fill="none"
            stroke="#999" strokeWidth={2}
            style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
          >
            <path d="M6 9l6 6 6-6"/>
          </svg>
        </div>
      </div>

      {/* Sent log */}
      <div style={{ marginTop: 24, borderTop: "1px solid #f0f0f0", paddingTop: 16, width: "100%" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#111", marginBottom: 12 }}>
          Sent to this program
        </div>
        {visibleSentLog.length === 0 && (
          <div style={{ fontSize: 13, color: "#999" }}>No emails logged yet.</div>
        )}
        {visibleSentLog.map((entry, i) => (
          <div
            key={i}
            onClick={() => toggleSentExpanded(i)}
            style={{ padding: "10px 0", borderBottom: "1px solid #f5f5f5", cursor: "pointer" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
              <span style={{ fontSize: 12, color: "#999" }}>{entry.date}</span>
              <span style={{ fontSize: 11, color: "#1A6B3C" }}>{entry.expanded ? "▴" : "▾"}</span>
            </div>
            {!entry.expanded && <div style={{ fontSize: 12, color: "#555", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{entry.preview}</div>}
            {entry.expanded && (
              <div>
                <pre style={{ fontSize: 12, color: "#333", lineHeight: 1.6, whiteSpace: "pre-wrap", margin: "8px 0", fontFamily: "inherit" }}>{entry.body}</pre>
                <button onClick={e => { e.stopPropagation(); navigator.clipboard.writeText(entry.body); showToast("Copied!"); }} style={{ fontSize: 11, color: "#1A6B3C", background: "none", border: "none", cursor: "pointer", padding: 0, fontWeight: 700 }}>Copy</button>
              </div>
            )}
          </div>
        ))}

        {/* Manual log form */}
        {!manualSentOpen && (
          <button onClick={() => setManualSentOpen(true)} style={{ fontSize: 12, color: "#1A6B3C", background: "none", border: "none", cursor: "pointer", marginTop: 8, padding: 0, fontWeight: 600 }}>
            + Log a sent email manually
          </button>
        )}
        {manualSentOpen && (
          <div style={{ marginTop: 12, padding: "12px", background: "#F8F8F6", borderRadius: 8, border: "1px solid #ebebeb" }}>
            <input type="date" value={manualSentDate} onChange={e => setManualSentDate(e.target.value)} style={{ width: "100%", boxSizing: "border-box", border: "1px solid #ddd", borderRadius: 6, padding: "6px 10px", fontSize: 12, marginBottom: 8, fontFamily: "inherit" }} />
            <textarea value={manualSentBody} onChange={e => setManualSentBody(e.target.value)} placeholder="Email body..." style={{ width: "100%", boxSizing: "border-box", border: "1px solid #ddd", borderRadius: 6, padding: "8px 10px", fontSize: 12, lineHeight: 1.5, minHeight: 80, resize: "vertical", fontFamily: "inherit" }} />
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button onClick={handleSaveManualSent} style={{ padding: "6px 14px", borderRadius: 6, border: "none", background: "#1A6B3C", color: "white", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Save</button>
              <button onClick={() => setManualSentOpen(false)} style={{ padding: "6px 14px", borderRadius: 6, border: "1px solid #ddd", background: "none", fontSize: 12, cursor: "pointer" }}>Cancel</button>
            </div>
          </div>
        )}
      </div>

      {/* Responses */}
      <div style={{ marginTop: 24, borderTop: "1px solid #f0f0f0", paddingTop: 16, width: "100%" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#111", marginBottom: 12 }}>
          Responses from this program
        </div>
        {visibleResponses.length === 0 && (
          <div style={{ fontSize: 13, color: "#999" }}>No responses logged yet.</div>
        )}
        {visibleResponses.map((entry, i) => (
          <div key={i} onClick={() => toggleRespExpanded(i)} style={{ padding: "10px 0", borderBottom: "1px solid #f5f5f5", cursor: "pointer" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
              <span style={{ fontSize: 12, color: "#999" }}>{entry.date} — {entry.from}</span>
              <span style={{ fontSize: 11, color: "#1A6B3C" }}>{entry.expanded ? "▴" : "▾"}</span>
            </div>
            {!entry.expanded && <div style={{ fontSize: 12, color: "#555", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{entry.preview}</div>}
            {entry.expanded && <pre style={{ fontSize: 12, color: "#333", lineHeight: 1.6, whiteSpace: "pre-wrap", margin: "8px 0", fontFamily: "inherit" }}>{entry.body}</pre>}
          </div>
        ))}
        {!manualRespOpen && (
          <button onClick={() => setManualRespOpen(true)} style={{ fontSize: 12, color: "#1A6B3C", background: "none", border: "none", cursor: "pointer", marginTop: 8, padding: 0, fontWeight: 600 }}>
            + Log a response manually
          </button>
        )}
        {manualRespOpen && (
          <div style={{ marginTop: 12, padding: "12px", background: "#F8F8F6", borderRadius: 8, border: "1px solid #ebebeb" }}>
            <input type="date" value={manualRespDate} onChange={e => setManualRespDate(e.target.value)} style={{ width: "100%", boxSizing: "border-box", border: "1px solid #ddd", borderRadius: 6, padding: "6px 10px", fontSize: 12, marginBottom: 8, fontFamily: "inherit" }} />
            <textarea value={manualRespBody} onChange={e => setManualRespBody(e.target.value)} placeholder="Response body..." style={{ width: "100%", boxSizing: "border-box", border: "1px solid #ddd", borderRadius: 6, padding: "8px 10px", fontSize: 12, lineHeight: 1.5, minHeight: 80, resize: "vertical", fontFamily: "inherit" }} />
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button onClick={handleSaveManualResp} style={{ padding: "6px 14px", borderRadius: 6, border: "none", background: "#1A6B3C", color: "white", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Save</button>
              <button onClick={() => setManualRespOpen(false)} style={{ padding: "6px 14px", borderRadius: 6, border: "1px solid #ddd", background: "none", fontSize: 12, cursor: "pointer" }}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── NILTab ───────────────────────────────────────────────────────────────────

type NILSubTab = "Opportunities" | "News";

const NIL_POSITIONS = ["All", "OH", "Libero", "Setter", "MB", "DS", "Opp"];
const NIL_DIVISIONS = ["All", "D1", "D2", "D3"];

interface NILOpportunity {
  id: string;
  school: string;
  conference: string;
  division: string;
  badgeType: "Verified Program" | "Collective";
  positions: string[];
  gradYears: string;
  allocation: string;
  spots: number;
  deadline: string;
  requirements: string;
}

const NIL_OPPORTUNITIES: NILOpportunity[] = [
  {
    id: "ucla",
    school: "UCLA Bruins",
    conference: "Big Ten",
    division: "D1",
    badgeType: "Collective",
    positions: ["OH", "Libero"],
    gradYears: "2025, 2026",
    allocation: "$8,000 – $15,000",
    spots: 2,
    deadline: "April 15, 2026",
    requirements: "Minimum 2.8 GPA required. Must be enrolled or committed to UCLA. Includes 4 community engagement events per year and 2 sponsored social media posts per month.",
  },
  {
    id: "pepperdine",
    school: "Pepperdine Waves",
    conference: "WCC",
    division: "D1",
    badgeType: "Verified Program",
    positions: ["Setter", "DS"],
    gradYears: "2026, 2027",
    allocation: "$5,000 – $10,000",
    spots: 1,
    deadline: "May 1, 2026",
    requirements: "Must be enrolled at Pepperdine. Content creation for Waves Athletics social channels 3× per month. No competing brand deals in the same category during the contract period.",
  },
  {
    id: "stanford",
    school: "Stanford Cardinal",
    conference: "ACC",
    division: "D1",
    badgeType: "Collective",
    positions: ["MB", "OH"],
    gradYears: "2025, 2026",
    allocation: "$12,000 – $20,000",
    spots: 1,
    deadline: "March 31, 2026",
    requirements: "Stanford enrollment required. Minimum 3.0 GPA. Includes quarterly ambassador events, branded content creation, and two youth camp appearances per academic year.",
  },
  {
    id: "kentucky",
    school: "Kentucky Wildcats",
    conference: "SEC",
    division: "D1",
    badgeType: "Verified Program",
    positions: ["Libero", "DS"],
    gradYears: "2025, 2026, 2027",
    allocation: "$6,000 – $12,000",
    spots: 3,
    deadline: "April 30, 2026",
    requirements: "Must be actively rostered or committed to Kentucky. Two brand activation events per semester. All content requires compliance pre-approval. SEC disclosure rules apply.",
  },
  {
    id: "nebraska",
    school: "Nebraska Cornhuskers",
    conference: "Big Ten",
    division: "D1",
    badgeType: "Collective",
    positions: ["OH", "Setter", "MB", "Libero", "DS", "Opp"],
    gradYears: "2025, 2026",
    allocation: "$10,000 – $18,000",
    spots: 2,
    deadline: "April 20, 2026",
    requirements: "Open to all positions — strong preference for in-state ties. Nebraska enrollment required. Monthly appearances at Lincoln sponsor locations. Heavy focus on local brand partnerships.",
  },
  {
    id: "pennstate",
    school: "Penn State Nittany Lions",
    conference: "Big Ten",
    division: "D1",
    badgeType: "Collective",
    positions: ["OH", "MB"],
    gradYears: "2026, 2027",
    allocation: "$7,000 – $14,000",
    spots: 2,
    deadline: "May 15, 2026",
    requirements: "Penn State enrollment required. Four appearances per season at sponsor events. Social media partnership with We Are Penn State branding. Must maintain active varsity roster status.",
  },
];

interface NILStory {
  id: string;
  headline: string;
  source: string;
  sourceUrl: string;
  date: string;
  tag: string;
  body?: string;
}

function nilTagStyle(tag: string): React.CSSProperties {
  switch (tag) {
    case "NCAA":       return { background: "#E6F1FB", color: "#0C447C" };
    case "Collective": return { background: "#EEEDFE", color: "#3C3489" };
    case "Deal":       return { background: "#E8F5EE", color: "#0F4A28" };
    case "Revenue":    return { background: "#FAEEDA", color: "#633806" };
    case "Policy":     return { background: "#FAECE7", color: "#712B13" };
    default:           return { background: "#f0f0f0", color: "#555" };
  }
}

function NILTab({ showToast }: { showToast: (msg: string) => void }) {
  const [nilSubTab, setNilSubTab] = useState<NILSubTab>("Opportunities");
  const [posFilter, setPosFilter] = useState("All");
  const [divFilter, setDivFilter] = useState("All");
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [nilNews, setNilNews] = useState<NILStory[]>([]);
  const [nilSearch, setNilSearch] = useState("");
  const [newsLoading, setNewsLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem("nil-banner-dismissed")) {
      setBannerDismissed(true);
    }
  }, []);

  useEffect(() => {
    if (nilSubTab === "News" && nilNews.length === 0) {
      setNewsLoading(true);
      fetch("/api/nil")
        .then(r => r.json())
        .then((data: NILStory[]) => { setNilNews(data); setNewsLoading(false); })
        .catch(() => setNewsLoading(false));
    }
  }, [nilSubTab]); // eslint-disable-line react-hooks/exhaustive-deps

  const dismissBanner = () => {
    setBannerDismissed(true);
    if (typeof window !== "undefined") sessionStorage.setItem("nil-banner-dismissed", "1");
  };

  const filteredOpps = NIL_OPPORTUNITIES.filter(opp => {
    const posMatch = posFilter === "All" || opp.positions.includes(posFilter);
    const divMatch = divFilter === "All" || opp.division === divFilter;
    return posMatch && divMatch;
  });

  const filteredNews = nilNews.filter(story =>
    nilSearch === "" || story.headline.toLowerCase().includes(nilSearch.toLowerCase())
  );

  const pillBase: React.CSSProperties = {
    flexShrink: 0, border: "none", borderRadius: 20,
    padding: "4px 12px", fontSize: 12, fontWeight: 600,
    cursor: "pointer", transition: "all 0.15s",
  };

  return (
    <div>
      {/* NIL sub-tab bar */}
      <div style={{
        display: "flex", borderBottom: "1px solid #e8e8e8",
        background: "white", marginBottom: 0,
        overflowX: "auto", WebkitOverflowScrolling: "touch", scrollbarWidth: "none",
      }}>
        {(["Opportunities", "News"] as NILSubTab[]).map(tab => (
          <button
            key={tab}
            onClick={() => setNilSubTab(tab)}
            style={{
              flexShrink: 0, fontSize: 13, padding: "10px 16px",
              cursor: "pointer", background: "none", border: "none",
              borderBottom: nilSubTab === tab ? "2px solid #1A6B3C" : "2px solid transparent",
              color: nilSubTab === tab ? "#111" : "#999",
              fontWeight: nilSubTab === tab ? 600 : 400,
              whiteSpace: "nowrap",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── OPPORTUNITIES TAB ── */}
      {nilSubTab === "Opportunities" && (
        <div style={{ paddingTop: 16 }}>
          {/* Header */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#111" }}>NIL Opportunities</div>
            <div style={{ fontSize: 13, color: "#999", marginTop: 2 }}>
              Name Image Likeness deals available to college volleyball athletes
            </div>
          </div>

          {/* Eligibility banner */}
          {!bannerDismissed && (
            <div style={{
              background: "#FAEEDA", borderLeft: "3px solid #633806",
              borderRadius: 6, padding: "10px 14px", marginBottom: 16,
              fontSize: 12, color: "#633806", position: "relative",
            }}>
              <span style={{ marginRight: 6 }}>⚠️</span>
              NIL rules vary by state and institution. High school athletes in California may
              participate in NIL activities. Always verify eligibility with your school's compliance
              office before signing any agreement.
              <button
                onClick={dismissBanner}
                style={{
                  position: "absolute", top: 8, right: 10,
                  background: "none", border: "none", cursor: "pointer",
                  fontSize: 14, color: "#633806", lineHeight: 1, padding: 0,
                }}
                aria-label="Dismiss"
              >
                ×
              </button>
            </div>
          )}

          {/* Position filter pills */}
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#999", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>
              Position
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {NIL_POSITIONS.map(p => (
                <button
                  key={p}
                  onClick={() => setPosFilter(p)}
                  style={{
                    ...pillBase,
                    background: posFilter === p ? "#1A6B3C" : "#f0f0f0",
                    color: posFilter === p ? "#fff" : "#555",
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Division filter pills */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#999", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>
              Division
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {NIL_DIVISIONS.map(d => (
                <button
                  key={d}
                  onClick={() => setDivFilter(d)}
                  style={{
                    ...pillBase,
                    background: divFilter === d ? "#1A6B3C" : "#f0f0f0",
                    color: divFilter === d ? "#fff" : "#555",
                  }}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Opportunity cards */}
          {filteredOpps.length === 0 && (
            <div style={{ fontSize: 13, color: "#999", textAlign: "center", padding: "32px 0" }}>
              No opportunities match these filters.
            </div>
          )}
          {filteredOpps.map(opp => (
            <div
              key={opp.id}
              style={{
                background: "white", border: "1px solid #e8e8e8",
                borderRadius: 10, padding: 16, marginBottom: 10,
              }}
            >
              {/* Card header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#111" }}>{opp.school}</div>
                  <div style={{ fontSize: 11, color: "#999", marginTop: 2 }}>{opp.conference} · {opp.division}</div>
                </div>
                <span style={{
                  ...(opp.badgeType === "Verified Program"
                    ? { background: "#E8F5EE", color: "#0F4A28" }
                    : { background: "#EEEDFE", color: "#3C3489" }),
                  borderRadius: 20, padding: "2px 8px", fontSize: 10, fontWeight: 700,
                  whiteSpace: "nowrap", flexShrink: 0,
                }}>
                  {opp.badgeType}
                </span>
              </div>

              {/* Details grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 12px", marginBottom: 10 }}>
                {[
                  { label: "Position needed", value: opp.positions.join(", ") },
                  { label: "Grad years", value: opp.gradYears },
                  { label: "Allocation", value: opp.allocation, green: true },
                  { label: "Spots available", value: String(opp.spots) },
                  { label: "Deadline", value: opp.deadline },
                ].map(row => (
                  <div key={row.label}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "#999", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                      {row.label}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: row.green ? 700 : 400, color: row.green ? "#1A6B3C" : "#111", marginTop: 1 }}>
                      {row.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Requirements */}
              <div style={{ fontSize: 12, color: "#666", fontStyle: "italic", marginBottom: 12, lineHeight: 1.5 }}>
                {opp.requirements}
              </div>

              {/* CTA button */}
              <button
                onClick={() => showToast("Feature coming soon — NIL applications launching in phase 2")}
                style={{
                  width: "100%", background: "#1A6B3C", color: "white",
                  border: "none", borderRadius: 20, padding: 8,
                  fontSize: 13, fontWeight: 700, cursor: "pointer",
                }}
              >
                Express interest →
              </button>

              {/* Legal note */}
              <div style={{ fontSize: 10, color: "#999", fontStyle: "italic", marginTop: 8, textAlign: "center" }}>
                NIL eligibility varies by state. Consult your compliance office first.
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── NEWS TAB ── */}
      {nilSubTab === "News" && (
        <div style={{ paddingTop: 16 }}>
          {/* Header */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#111" }}>NIL News</div>
            <div style={{ fontSize: 13, color: "#999", marginTop: 2 }}>
              Latest Name Image Likeness news for college volleyball
            </div>
          </div>

          {/* Search bar */}
          <div style={{ position: "relative", marginBottom: 16 }}>
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: "#999", pointerEvents: "none" }}>
              🔍
            </span>
            <input
              type="text"
              placeholder="Search NIL news..."
              value={nilSearch}
              onChange={e => setNilSearch(e.target.value)}
              style={{
                width: "100%", boxSizing: "border-box",
                border: "1px solid #e8e8e8", borderRadius: 8,
                padding: "9px 12px 9px 36px", fontSize: 13,
                color: "#111", background: "white",
                outline: "none", fontFamily: "inherit",
              }}
            />
          </div>

          {/* Loading skeleton */}
          {newsLoading && (
            <div>
              {[1, 2, 3].map(i => (
                <div key={i} style={{ background: "white", border: "1px solid #e8e8e8", borderRadius: 10, padding: "14px 16px", marginBottom: 8 }}>
                  <div className="skeleton" style={{ height: 10, width: 60, borderRadius: 4, marginBottom: 8 }} />
                  <div className="skeleton" style={{ height: 14, width: "90%", borderRadius: 4, marginBottom: 6 }} />
                  <div className="skeleton" style={{ height: 14, width: "70%", borderRadius: 4, marginBottom: 8 }} />
                  <div className="skeleton" style={{ height: 10, width: 120, borderRadius: 4 }} />
                </div>
              ))}
            </div>
          )}

          {/* News cards */}
          {!newsLoading && filteredNews.length === 0 && (
            <div style={{ fontSize: 13, color: "#999", textAlign: "center", padding: "32px 0" }}>
              {nilSearch ? "No stories match your search." : "No NIL news available right now."}
            </div>
          )}
          {!newsLoading && filteredNews.map(story => (
            <NILNewsCard key={story.id} story={story} />
          ))}
        </div>
      )}
    </div>
  );
}

function NILNewsCard({ story }: { story: NILStory }) {
  const [hovered, setHovered] = useState(false);
  return (
    <a
      href={story.sourceUrl}
      target="_blank"
      rel="noopener noreferrer"
      style={{ textDecoration: "none", display: "block" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{
        background: "white", border: "1px solid #e8e8e8",
        borderRadius: 10, padding: "14px 16px", marginBottom: 8,
      }}>
        {/* Tag */}
        <span style={{
          ...nilTagStyle(story.tag),
          borderRadius: 20, padding: "2px 8px",
          fontSize: 10, fontWeight: 700,
          display: "inline-block", marginBottom: 6,
        }}>
          {story.tag}
        </span>
        {/* Headline */}
        <div style={{
          fontSize: 14, fontWeight: 700, lineHeight: 1.4,
          color: hovered ? "#1A6B3C" : "#111",
          transition: "color 0.15s",
        }}>
          {story.headline}
        </div>
        {/* Source + date */}
        <div style={{ fontSize: 11, color: "#999", marginTop: 4 }}>
          {story.source}{story.date ? ` · ${story.date}` : ""}
        </div>
      </div>
    </a>
  );
}

// ─── RecruitingContent ────────────────────────────────────────────────────────

function RecruitingContent() {
  const searchParams = useSearchParams();
  const { schools, selectedSchoolId, showToast } = useApp();

  const tabParam = searchParams.get("tab");
  const initialTab: RecruitingSubTab = tabParam && TAB_PARAM_MAP[tabParam] ? TAB_PARAM_MAP[tabParam] : "Pipeline";

  const [activeTab, setActiveTab] = useState<RecruitingSubTab>(initialTab);
  const [addOpen, setAddOpen] = useState(false);

  useEffect(() => {
    const p = searchParams.get("tab");
    if (p && TAB_PARAM_MAP[p]) {
      setActiveTab(TAB_PARAM_MAP[p]);
    }
  }, [searchParams]);

  const selectedSchool = schools.find(s => s.id === selectedSchoolId) || null;

  return (
    <div>
      {/* Sub-tab bar */}
      <div style={{
        display: "flex",
        overflowX: "auto",
        borderBottom: "1px solid #e8e8e8",
        background: "white",
        marginBottom: 0,
        WebkitOverflowScrolling: "touch",
        scrollbarWidth: "none",
      }}>
        {SUB_TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flexShrink: 0,
              fontSize: 13,
              padding: "10px 16px",
              cursor: "pointer",
              background: "none",
              border: "none",
              borderBottom: activeTab === tab ? "2px solid #1A6B3C" : "2px solid transparent",
              color: activeTab === tab ? "#111" : "#999",
              fontWeight: activeTab === tab ? 600 : 400,
              whiteSpace: "nowrap",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ paddingTop: 16 }}>

        {/* PIPELINE TAB */}
        {activeTab === "Pipeline" && (
          <div>
            <Pipeline school={selectedSchool} />
            <div style={{ marginTop: 16 }}>
              <SchoolList onAdd={() => setAddOpen(true)} />
            </div>
          </div>
        )}

        {/* OUTREACH TAB */}
        {activeTab === "Outreach" && (
          <OutreachTab schools={schools} showToast={showToast} />
        )}

        {/* NIL TAB */}
        {activeTab === "NIL" && (
          <NILTab showToast={showToast} />
        )}

        {/* TIMELINE TAB */}
        {activeTab === "Timeline" && (
          <div style={{
            background: "white", borderRadius: 12, border: "1px solid #e8e8e8",
            padding: "48px 24px", textAlign: "center",
          }}>
            <div style={{ fontSize: 32 }}>📅</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#111", margin: "12px 0 8px" }}>
              Recruiting Timeline
            </div>
            <p style={{ fontSize: 13, color: "#999", lineHeight: 1.6, maxWidth: 280, margin: "0 auto 20px" }}>
              Your personalized recruiting calendar with key dates and deadlines. Coming soon.
            </p>
            <button
              onClick={() => showToast("You're on the list!")}
              style={{
                border: "1px solid #1A6B3C", color: "#1A6B3C", background: "white",
                borderRadius: 8, padding: "8px 20px", fontSize: 13, cursor: "pointer",
              }}
            >
              Get notified when this launches →
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      <AddSchoolModal open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}

export default function RecruitingPage() {
  return (
    <Suspense fallback={<div style={{ padding: 20 }}>Loading...</div>}>
      <RecruitingContent />
    </Suspense>
  );
}
