"use client";
import { useState, useRef } from "react";

const SHAKE_CSS = `@keyframes scoutly-shake {
  0%, 100% { transform: translateX(0); }
  20%       { transform: translateX(-8px); }
  40%       { transform: translateX(8px); }
  60%       { transform: translateX(-6px); }
  80%       { transform: translateX(6px); }
}`;

export default function PasswordGate({ onAuth }: { onAuth: () => void }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);
  const [shaking, setShaking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function submit() {
    if (value.trim() === "319") {
      sessionStorage.setItem("scoutly_auth", "true");
      onAuth();
    } else {
      setError(true);
      setShaking(true);
      setTimeout(() => setShaking(false), 400);
      inputRef.current?.focus();
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter") submit();
  }

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "#F3F2EE", zIndex: 9999,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <style>{SHAKE_CSS}</style>
      <div style={{
        background: "white", maxWidth: 360, width: "100%",
        borderRadius: 16, padding: 40,
        boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
        animation: shaking ? "scoutly-shake 0.4s ease" : "none",
        textAlign: "center",
      }}>
        {/* Logo mark */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, background: "#1A6B3C",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "white", fontWeight: 800, fontSize: 18,
          }}>S</div>
        </div>

        {/* Wordmark */}
        <div style={{ fontSize: 18, fontWeight: 700, color: "#1A6B3C", marginTop: 8 }}>
          Scoutly
        </div>

        {/* Private beta pill */}
        <div style={{ display: "flex", justifyContent: "center", marginTop: 6 }}>
          <span style={{
            background: "#E8F5EE", color: "#0F4A28", fontSize: 10, fontWeight: 700,
            borderRadius: 20, padding: "2px 10px",
          }}>Private beta</span>
        </div>

        {/* Prompt */}
        <div style={{ fontSize: 13, color: "#999", marginTop: 20 }}>
          Enter password to continue
        </div>

        {/* Input */}
        <input
          ref={inputRef}
          type="password"
          placeholder="Password"
          value={value}
          onChange={e => { setValue(e.target.value); setError(false); }}
          onKeyDown={handleKey}
          style={{
            display: "block", width: "100%", marginTop: 12,
            border: `1px solid ${error ? "#e24b4a" : "#ddd"}`,
            borderRadius: 8, padding: "10px 14px",
            fontSize: 14, outline: "none", boxSizing: "border-box",
            fontFamily: "inherit",
          }}
          onFocus={e => { if (!error) e.currentTarget.style.borderColor = "#1A6B3C"; }}
          onBlur={e => { if (!error) e.currentTarget.style.borderColor = "#ddd"; }}
        />

        {/* Error message */}
        {error && (
          <div style={{ fontSize: 12, color: "#e24b4a", marginTop: 4, textAlign: "left" }}>
            Incorrect password. Try again.
          </div>
        )}

        {/* Submit button */}
        <button
          onClick={submit}
          style={{
            display: "block", width: "100%", marginTop: 12,
            background: "#1A6B3C", color: "white",
            border: "none", borderRadius: 20, padding: 11,
            fontSize: 14, fontWeight: 700, cursor: "pointer",
          }}
        >
          Enter
        </button>
      </div>
    </div>
  );
}
