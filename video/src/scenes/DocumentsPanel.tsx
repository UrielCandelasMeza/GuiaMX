import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { C, FONT, SHADOW_MD } from "../lib/theme";
import { fadeIn, staggerDelay } from "../lib/animations";
import { BrowserFrame } from "../components/BrowserFrame";
import { VideoNavbar } from "../components/VideoNavbar";
import { Caption } from "../components/Caption";

const DOCUMENTS = [
  { label: "INE", checked: true },
  { label: "CURP", checked: true },
  { label: "Acta de nacimiento", checked: true },
  { label: "NSS", checked: true },
  { label: "Pasaporte", checked: false },
  { label: "Comprobante de domicilio", checked: false },
  { label: "EFirma", checked: false },
  { label: "RFC", checked: false },
  { label: "LLAVE MX", checked: false },
] as const;

function DocItem({
  label,
  checked,
  frame,
  startFrame,
}: {
  label: string;
  checked: boolean;
  frame: number;
  startFrame: number;
}) {
  const opacity = spring({
    frame: Math.max(0, frame - startFrame),
    fps: 30,
    config: { damping: 22, stiffness: 160 },
    from: 0,
    to: 1,
  });
  const tx = spring({
    frame: Math.max(0, frame - startFrame),
    fps: 30,
    config: { damping: 22, stiffness: 160 },
    from: 16,
    to: 0,
  });

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 0",
        borderBottom: `1px solid ${C.border}`,
        opacity,
        transform: `translateX(${tx}px)`,
      }}
    >
      <span style={{ fontFamily: FONT, fontSize: 13, color: checked ? C.ink : C.inkMuted, fontWeight: checked ? 600 : 400 }}>
        {label}
      </span>
      <div
        style={{
          width: 20,
          height: 20,
          borderRadius: 5,
          background: checked ? C.ink : "transparent",
          border: `1.5px solid ${checked ? C.ink : C.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {checked && (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        )}
      </div>
    </div>
  );
}

export function DocumentsPanel() {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Panel slides in from right at frame 10
  const panelX = spring({ frame: frame - 8, fps, config: { damping: 22, stiffness: 160 }, from: 320, to: 0 });
  const overlayOpacity = interpolate(frame, [8, 25], [0, 0.25], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const pageOpacity = fadeIn(frame, 0, 12);

  const checkedCount = DOCUMENTS.filter((d) => d.checked).length;

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(135deg, #F7F9FC 0%, #EFF6FF 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ opacity: pageOpacity, transform: "scale(0.98)" }}>
        <BrowserFrame url="guiamx.railway.app/chat">
          <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <VideoNavbar active="chat" />

            <div style={{ flex: 1, background: "#F8FAFC", position: "relative", overflow: "hidden" }}>
              {/* Blurred background content */}
              <div style={{ padding: "32px", opacity: 0.35 }}>
                <div style={{ maxWidth: 500, margin: "0 auto" }}>
                  {/* Simulated previous messages */}
                  {[
                    { user: true, text: "Necesito tramitar mi pasaporte" },
                    { user: false, text: "Para tramitar tu Pasaporte mexicano necesitas reunir tus documentos..." },
                  ].map(({ user, text }, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: user ? "flex-end" : "flex-start", marginBottom: 14 }}>
                      <div
                        style={{
                          maxWidth: "70%",
                          background: user ? C.brand600 : C.white,
                          border: user ? "none" : `1px solid ${C.slate200}`,
                          borderRadius: 12,
                          padding: "10px 14px",
                          fontFamily: FONT,
                          fontSize: 13,
                          color: user ? C.white : C.ink,
                        }}
                      >
                        {text}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Overlay */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(0,0,0,0.15)",
                  opacity: overlayOpacity,
                }}
              />

              {/* Side panel */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  bottom: 0,
                  width: 320,
                  background: C.white,
                  borderLeft: `1px solid ${C.border}`,
                  transform: `translateX(${panelX}px)`,
                  boxShadow: "-8px 0 24px rgba(0,0,0,0.08)",
                  display: "flex",
                  flexDirection: "column",
                  overflowY: "hidden",
                }}
              >
                {/* Panel header */}
                <div
                  style={{
                    padding: "16px 20px",
                    borderBottom: `1px solid ${C.border}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <span style={{ fontFamily: FONT, fontSize: 14, fontWeight: 700, color: C.ink, display: "block" }}>
                      Mis documentos
                    </span>
                    <span style={{ fontFamily: FONT, fontSize: 12, color: C.inkMuted }}>
                      {checkedCount} de {DOCUMENTS.length} registrados
                    </span>
                  </div>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: C.surface2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.inkSec} strokeWidth="2.5">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </div>
                </div>

                {/* Progress bar */}
                <div style={{ padding: "14px 20px 0", borderBottom: `1px solid ${C.border}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, color: C.ink, letterSpacing: 0.5 }}>
                      PROGRESO
                    </span>
                    <span style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, color: C.inkSec }}>
                      {Math.round((checkedCount / DOCUMENTS.length) * 100)}%
                    </span>
                  </div>
                  <div
                    style={{
                      height: 5,
                      borderRadius: 3,
                      background: C.surface2,
                      marginBottom: 14,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${(checkedCount / DOCUMENTS.length) * 100}%`,
                        background: C.ink,
                        borderRadius: 3,
                      }}
                    />
                  </div>
                </div>

                {/* Document list */}
                <div style={{ flex: 1, padding: "0 20px", overflowY: "hidden" }}>
                  {DOCUMENTS.map(({ label, checked }, i) => (
                    <DocItem
                      key={label}
                      label={label}
                      checked={checked}
                      frame={frame}
                      startFrame={15 + staggerDelay(i, 7)}
                    />
                  ))}
                </div>

                {/* Add button */}
                <div style={{ padding: "16px 20px", borderTop: `1px solid ${C.border}` }}>
                  <div
                    style={{
                      height: 38,
                      background: C.ink,
                      borderRadius: 6,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    <span style={{ fontFamily: FONT, fontSize: 13, fontWeight: 600, color: C.white }}>
                      Agregar documento
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Input bar placeholder */}
            <div
              style={{
                background: C.white,
                borderTop: `1px solid ${C.slate200}`,
                padding: "12px 32px",
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  height: 40,
                  border: `1.5px solid ${C.border}`,
                  borderRadius: 8,
                  maxWidth: 720,
                  margin: "0 auto",
                  display: "flex",
                  alignItems: "center",
                  paddingLeft: 12,
                }}
              >
                <span style={{ fontFamily: FONT, fontSize: 13, color: C.inkMuted }}>
                  Escribe o habla tu consulta sobre trámites...
                </span>
              </div>
            </div>
          </div>
        </BrowserFrame>
      </div>

      <Caption
        text="Panel de documentos — el asistente los usa como contexto para sus recomendaciones"
        frame={frame}
        totalFrames={durationInFrames}
      />
    </AbsoluteFill>
  );
}
