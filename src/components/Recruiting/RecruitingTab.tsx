"use client";
import { useState } from "react";
import { useApp } from "@/context/AppContext";
import Pipeline from "./Pipeline";
import SchoolList from "./SchoolList";
import AddSchoolModal from "./AddSchoolModal";
import EmailGenerator from "./EmailGenerator";
import EmailsSentModal from "./EmailsSentModal";
import ResponsesModal from "./ResponsesModal";
import RecruitingTipsModal from "./RecruitingTipsModal";
import InfoIcon from "@/components/Common/InfoIcon";

export default function RecruitingTab() {
  const { schools, selectedSchoolId } = useApp();
  const [addOpen, setAddOpen] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const [emailsSentOpen, setEmailsSentOpen] = useState(false);
  const [responsesOpen, setResponsesOpen] = useState(false);
  const [tipsOpen, setTipsOpen] = useState(false);

  const selectedSchool = schools.find(s => s.id === selectedSchoolId) || null;

  return (
    <div>
      {/* Pipeline */}
      <Pipeline school={selectedSchool} />

      {/* Coach Outreach */}
      <div className="card">
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
            Coach outreach
          </div>
          <button
            onClick={() => setTipsOpen(true)}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center" }}
            title="Recruiting tips"
          >
            <InfoIcon />
          </button>
        </div>

        {/* Generate outreach email — primary action */}
        <button
          className="btn-primary"
          onClick={() => setEmailOpen(true)}
          style={{ width: "100%", borderRadius: 20, padding: "9px 16px", fontSize: 13, marginBottom: 10 }}
        >
          Generate outreach email
        </button>

        {/* Emails sent row */}
        <button
          onClick={() => setEmailsSentOpen(true)}
          style={{
            display: "flex", alignItems: "center", gap: 10, width: "100%",
            padding: "10px 0", background: "none", border: "none",
            borderTop: "1px solid #F0F0EE", cursor: "pointer", textAlign: "left",
          }}
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#555" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <span style={{ flex: 1, fontSize: 13, color: "#333" }}>Emails sent</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#0F4A28", background: "#E8F5EE", borderRadius: 20, padding: "2px 8px" }}>5</span>
          <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="#999" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Responses received row */}
        <button
          onClick={() => setResponsesOpen(true)}
          style={{
            display: "flex", alignItems: "center", gap: 10, width: "100%",
            padding: "10px 0", background: "none", border: "none",
            borderTop: "1px solid #F0F0EE", cursor: "pointer", textAlign: "left",
          }}
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#555" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
          <span style={{ flex: 1, fontSize: 13, color: "#333" }}>Responses received</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#0F4A28", background: "#E8F5EE", borderRadius: 20, padding: "2px 8px" }}>2</span>
          <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="#999" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* School List — includes view toggle and Add button */}
      <SchoolList onAdd={() => setAddOpen(true)} />

      {/* Modals */}
      <AddSchoolModal open={addOpen} onClose={() => setAddOpen(false)} />
      <EmailGenerator open={emailOpen} onClose={() => setEmailOpen(false)} />
      <EmailsSentModal open={emailsSentOpen} onClose={() => setEmailsSentOpen(false)} />
      <ResponsesModal open={responsesOpen} onClose={() => setResponsesOpen(false)} />
      <RecruitingTipsModal open={tipsOpen} onClose={() => setTipsOpen(false)} />
    </div>
  );
}
