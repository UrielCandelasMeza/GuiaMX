import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { C, FONT } from "../lib/theme";
import { fadeIn } from "../lib/animations";

export function Intro() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoOpacity = fadeIn(frame, 10, 20);
  const logoY = spring({ frame: frame - 10, fps, config: { damping: 18, stiffness: 120 }, from: 32, to: 0 });
  const subtitleOpacity = fadeIn(frame, 30, 20);
  const taglineOpacity = fadeIn(frame, 48, 20);
  const dividerScale = interpolate(frame, [40, 65], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: C.ink,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 0,
      }}
    >
      {/* Dot grid background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        }}
      />

      {/* Logo mark */}
      <div
        style={{
          opacity: logoOpacity,
          transform: `translateY(${logoY}px)`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 20,
        }}
      >
        {/* Icon */}
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 18,
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
          </svg>
        </div>

        {/* Brand name */}
        <span
          style={{
            fontFamily: FONT,
            fontSize: 52,
            fontWeight: 900,
            color: C.white,
            letterSpacing: -2,
            lineHeight: 1,
          }}
        >
          GuíasMX
        </span>
      </div>

      {/* Divider */}
      <div
        style={{
          marginTop: 28,
          width: 48,
          height: 2,
          background: "rgba(255,255,255,0.2)",
          borderRadius: 1,
          transform: `scaleX(${dividerScale})`,
          transformOrigin: "center",
        }}
      />

      {/* Subtitle */}
      <p
        style={{
          marginTop: 20,
          fontFamily: FONT,
          fontSize: 20,
          fontWeight: 500,
          color: "rgba(255,255,255,0.55)",
          letterSpacing: 0.2,
          opacity: subtitleOpacity,
        }}
      >
        Tu asistente de trámites gubernamentales
      </p>

      {/* Tag */}
      <div
        style={{
          marginTop: 32,
          opacity: taglineOpacity,
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 100,
          paddingLeft: 16,
          paddingRight: 16,
          paddingTop: 8,
          paddingBottom: 8,
        }}
      >
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22C55E" }} />
        <span
          style={{
            fontFamily: FONT,
            fontSize: 12,
            fontWeight: 600,
            color: "rgba(255,255,255,0.6)",
            letterSpacing: 1.2,
            textTransform: "uppercase",
          }}
        >
          Demo de producto · 2025
        </span>
      </div>
    </AbsoluteFill>
  );
}
