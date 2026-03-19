"use client";
import { useState } from "react";
import Image from "next/image";

interface Props {
  title: string;
  duration: string;
  youtubeId?: string;
  label?: string;
}

export default function ClipPreview({ title, duration, youtubeId, label }: Props) {
  const [hovered, setHovered] = useState(false);
  const [thumbError, setThumbError] = useState(false);

  const handleClick = () => {
    if (youtubeId) {
      window.open(`https://www.youtube.com/watch?v=${youtubeId}`, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div
      onClick={youtubeId ? handleClick : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#111",
        borderRadius: 8,
        overflow: "hidden",
        position: "relative",
        aspectRatio: "16/9",
        cursor: youtubeId ? "pointer" : "default",
        marginTop: 10,
      }}
    >
      {/* Real YouTube thumbnail */}
      {youtubeId && !thumbError && (
        <Image
          src={`https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`}
          alt={title}
          fill
          sizes="(max-width: 640px) 100vw, 600px"
          style={{ objectFit: "cover" }}
          onError={() => setThumbError(true)}
        />
      )}

      {/* Gradient overlay — always shown (dims thumbnail on hover, full bg when no thumbnail) */}
      <div style={{
        position: "absolute", inset: 0,
        background: youtubeId && !thumbError
          ? `rgba(0,0,0,${hovered ? 0.35 : 0.15})`
          : "linear-gradient(135deg, #1A6B3C33 0%, #00000066 100%)",
        transition: "background 0.15s",
      }} />

      {/* Play button */}
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        transform: `translate(-50%,-50%) scale(${hovered ? 1.05 : 1})`,
        transition: "transform 0.15s ease",
        width: 44, height: 44, borderRadius: "50%",
        background: hovered ? "rgba(0,0,0,0.8)" : "rgba(0,0,0,0.6)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 1,
      }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="white">
          <polygon points="5,2 14,8 5,14" />
        </svg>
      </div>

      {/* Label badge — bottom left */}
      <div style={{
        position: "absolute", bottom: 8, left: 8,
        background: "rgba(0,0,0,0.65)", color: "white",
        fontSize: 10, padding: "2px 7px", borderRadius: 4,
        zIndex: 1,
      }}>
        {label ?? title}
      </div>

      {/* Duration badge — bottom right */}
      <div style={{
        position: "absolute", bottom: 8, right: 8,
        background: "rgba(0,0,0,0.6)", color: "white",
        fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 4,
        zIndex: 1,
      }}>
        {duration}
      </div>
    </div>
  );
}
