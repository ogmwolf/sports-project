"use client";
import { useState } from "react";

export default function InfoIcon() {
  const [hovered, setHovered] = useState(false);
  const stroke = hovered ? "#555" : "#999";

  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ cursor: "pointer", display: "block", flexShrink: 0 }}
    >
      <circle cx="8" cy="8" r="7" stroke={stroke} strokeWidth="1.2" />
      <line x1="8" y1="7" x2="8" y2="11.5" stroke={stroke} strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="8" cy="5" r="0.7" fill={stroke} />
    </svg>
  );
}
