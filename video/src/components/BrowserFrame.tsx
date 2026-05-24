import React from "react";
import { C, FONT, SHADOW_LG } from "../lib/theme";

interface BrowserFrameProps {
  children: React.ReactNode;
  url?: string;
  scale?: number;
}

export function BrowserFrame({
  children,
  url = "guiamx.railway.app",
  scale = 1,
}: BrowserFrameProps) {
  return (
    <div
      style={{
        width: 1520,
        height: 920,
        borderRadius: 12,
        overflow: "hidden",
        boxShadow: "0 32px 80px rgba(0,0,0,0.28), 0 0 0 1px rgba(0,0,0,0.08)",
        display: "flex",
        flexDirection: "column",
        transform: `scale(${scale})`,
        transformOrigin: "top center",
      }}
    >
      {/* Chrome bar */}
      <div
        style={{
          height: 44,
          background: "#1C1C1E",
          display: "flex",
          alignItems: "center",
          paddingLeft: 16,
          paddingRight: 16,
          gap: 16,
          flexShrink: 0,
        }}
      >
        {/* Traffic lights */}
        <div style={{ display: "flex", gap: 8 }}>
          {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
            <div
              key={c}
              style={{ width: 12, height: 12, borderRadius: "50%", background: c }}
            />
          ))}
        </div>

        {/* URL bar */}
        <div
          style={{
            flex: 1,
            maxWidth: 500,
            margin: "0 auto",
            background: "rgba(255,255,255,0.1)",
            borderRadius: 6,
            height: 28,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
          }}
        >
          {/* Lock icon */}
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2.5">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          <span
            style={{
              fontFamily: FONT,
              fontSize: 12,
              color: "rgba(255,255,255,0.75)",
              letterSpacing: 0.1,
            }}
          >
            {url}
          </span>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: "hidden", position: "relative", background: C.white }}>
        {children}
      </div>
    </div>
  );
}
