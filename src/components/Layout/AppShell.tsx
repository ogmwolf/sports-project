"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import TopNav from "./TopNav";
import LeftSidebar from "./LeftSidebar";
import RightSidebar from "./RightSidebar";
import BottomNav from "./BottomNav";
import ToastContainer from "@/components/Common/Toast";
import PasswordGate from "@/components/PasswordGate";
import type { ReactNode } from "react";

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [authed, setAuthed] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setAuthed(sessionStorage.getItem("scoutly_auth") === "true");
    setChecked(true);
  }, []);

  if (!checked) return null;

  if (!authed) {
    return <PasswordGate onAuth={() => setAuthed(true)} />;
  }

  if (pathname === "/onboarding") {
    return (
      <>
        {children}
        <ToastContainer />
      </>
    );
  }

  return (
    <>
      <TopNav />
      <div className="page-body">
        <div className="page-columns">
          <aside className="col-left">
            <LeftSidebar />
          </aside>
          <main className="col-main">
            {children}
          </main>
          <aside className="col-right">
            <RightSidebar />
          </aside>
        </div>
      </div>
      <BottomNav />
      <ToastContainer />
    </>
  );
}
