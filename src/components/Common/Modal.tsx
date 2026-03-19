"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { ReactNode } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export default function Modal({ open, onClose, title, subtitle, children }: ModalProps) {
  // Gate portal on client mount — createPortal requires document
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!open || !mounted) return null;

  return createPortal(
    <>
      {/* Overlay — covers full viewport regardless of parent stacking contexts */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          top: 0, left: 0,
          width: "100vw", height: "100vh",
          background: "rgba(0,0,0,0.4)",
          zIndex: 1000,
        }}
      />

      {/* Modal card — centered in viewport */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: "fixed",
          top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 1001,
          background: "#fff",
          borderRadius: 12,
          width: "calc(100vw - 32px)",
          maxWidth: 400,
          maxHeight: "90vh",
          overflowY: "auto",
          padding: 20,
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "#111" }}>{title}</h2>
            {subtitle && (
              <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2, marginBottom: 0 }}>{subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            style={{ color: "#999", padding: 4, cursor: "pointer", background: "none", border: "none", flexShrink: 0, marginLeft: 8 }}
          >
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {children}
      </div>
    </>,
    document.body
  );
}
