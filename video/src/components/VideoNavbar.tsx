import React from "react";
import { C, FONT } from "../lib/theme";

interface VideoNavbarProps {
  active?: "chat" | "tramites" | "mis-tramites";
  showUser?: boolean;
}

export function VideoNavbar({ active, showUser = true }: VideoNavbarProps) {
  const links = [
    { id: "chat", label: "Chat" },
    { id: "tramites", label: "Trámites" },
    { id: "mis-tramites", label: "Mis trámites" },
  ] as const;

  return (
    <div
      style={{
        height: 56,
        background: C.white,
        borderBottom: `1px solid ${C.border}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        paddingLeft: 24,
        paddingRight: 24,
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.ink} strokeWidth="1.75">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/>
          <path d="M2 17l10 5 10-5"/>
          <path d="M2 12l10 5 10-5"/>
        </svg>
        <span style={{ fontFamily: FONT, fontSize: 13, fontWeight: 600, color: C.ink, letterSpacing: -0.3 }}>
          GuíasMX
        </span>
      </div>

      {/* Nav links */}
      <nav style={{ display: "flex", gap: 24 }}>
        {links.map(({ id, label }) => (
          <span
            key={id}
            style={{
              fontFamily: FONT,
              fontSize: 13,
              fontWeight: 500,
              color: active === id ? C.ink : C.inkSec,
              textDecoration: active === id ? "underline" : "none",
              textUnderlineOffset: 4,
              textDecorationColor: C.ink,
              cursor: "pointer",
            }}
          >
            {label}
          </span>
        ))}
      </nav>

      {/* User avatar */}
      {showUser && (
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: C.ink,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: C.white,
            fontFamily: FONT,
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          MG
        </div>
      )}
    </div>
  );
}
