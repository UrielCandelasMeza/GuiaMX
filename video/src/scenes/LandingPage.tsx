import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { C, FONT, SHADOW_STRIPE } from "../lib/theme";
import { fadeIn, slideUp, staggerDelay } from "../lib/animations";
import { BrowserFrame } from "../components/BrowserFrame";
import { Caption } from "../components/Caption";

const STEPS = [
  {
    icon: "👤",
    num: "01",
    title: "Regístrate",
    desc: "Crea tu cuenta en minutos con tu correo. Sin trámites previos.",
  },
  {
    icon: "💬",
    num: "02",
    title: "Consulta al asistente",
    desc: "Describe en tus propias palabras el trámite que necesitas.",
  },
  {
    icon: "✅",
    num: "03",
    title: "Completa tu trámite",
    desc: "Lista personalizada de documentos, pasos y ventanillas.",
  },
];

const DOCS = ["CURP", "INE", "RFC", "EFirma", "Pasaporte", "NSS", "LLAVE MX", "Acta de nacimiento"];

export function LandingPage() {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Scroll effect: translate content upward over time
  const scrollY = interpolate(frame, [0, durationInFrames - 30], [0, -580], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const pageOpacity = fadeIn(frame, 0, 12);

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(135deg, #F7F9FC 0%, #EFF6FF 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ opacity: pageOpacity, transform: `scale(0.98)` }}>
        <BrowserFrame url="guiamx.railway.app">
          <div style={{ position: "relative", overflow: "hidden", height: "100%" }}>
            <div style={{ transform: `translateY(${scrollY}px)`, transition: "none" }}>

              {/* Gradient Banner */}
              <div
                style={{
                  background: "linear-gradient(90deg, #c026d3, #7c3aed, #6d28d9)",
                  padding: "10px 24px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 16,
                }}
              >
                <span style={{ fontFamily: FONT, fontSize: 13, fontWeight: 600, color: "white" }}>
                  Nuevo: asistente de IA para trámites del SAT y CURP disponible ahora
                </span>
                <span style={{ fontFamily: FONT, fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.75)" }}>
                  Pruébalo →
                </span>
              </div>

              {/* Navbar */}
              <div
                style={{
                  height: 56,
                  background: C.white,
                  borderBottom: `1px solid ${C.border}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingLeft: 32,
                  paddingRight: 32,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.ink} strokeWidth="1.75">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
                  </svg>
                  <span style={{ fontFamily: FONT, fontSize: 13, fontWeight: 600, color: C.ink }}>GuíasMX</span>
                </div>
                <div style={{ display: "flex", gap: 32 }}>
                  {["Trámites", "Iniciar sesión"].map((l) => (
                    <span key={l} style={{ fontFamily: FONT, fontSize: 13, color: C.inkSec }}>{l}</span>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <div style={{ padding: "8px 16px", borderRadius: 6, background: C.surface2, fontFamily: FONT, fontSize: 13, fontWeight: 600, color: C.ink }}>
                    Iniciar sesión
                  </div>
                  <div style={{ padding: "8px 16px", borderRadius: 6, background: C.ink, fontFamily: FONT, fontSize: 13, fontWeight: 600, color: C.white }}>
                    Registrarse
                  </div>
                </div>
              </div>

              {/* Hero */}
              <div style={{ background: C.white, padding: "72px 64px 80px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.ink }} />
                  <span style={{ fontFamily: FONT, fontSize: 10, fontWeight: 700, letterSpacing: 1.5, color: C.inkMuted, textTransform: "uppercase" }}>
                    DISPONIBLE PARA TODOS LOS CIUDADANOS MEXICANOS
                  </span>
                </div>

                <h1 style={{ fontFamily: FONT, fontSize: 58, fontWeight: 900, letterSpacing: -2, lineHeight: 1.03, maxWidth: 700, margin: "0 0 20px" }}>
                  <span style={{ color: C.ink }}>Realiza tus trámites </span>
                  <span style={{ color: C.inkSec }}>sin filas, sin confusión,</span>
                  <span style={{ color: C.ink }}> con IA.</span>
                </h1>

                <p style={{ fontFamily: FONT, fontSize: 17, color: C.inkSec, lineHeight: 1.65, maxWidth: 480, margin: "0 0 36px" }}>
                  GuíasMX te orienta en cualquier gestión gubernamental en México.
                  Reúne documentos, conoce los pasos exactos y sigue tu avance en tiempo real.
                </p>

                <div style={{ display: "flex", gap: 12 }}>
                  <div style={{ padding: "12px 28px", background: C.ink, borderRadius: 6, fontFamily: FONT, fontSize: 15, fontWeight: 700, color: C.white }}>
                    Comenzar gratis
                  </div>
                  <div style={{ padding: "12px 28px", background: C.surface2, borderRadius: 6, fontFamily: FONT, fontSize: 15, fontWeight: 600, color: C.ink }}>
                    Ver trámites →
                  </div>
                </div>

                <div style={{ marginTop: 28, display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 24, height: 1, background: C.border }} />
                  <span style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, color: C.inkMuted, letterSpacing: 1.2, textTransform: "uppercase" }}>
                    +16 documentos reconocidos · SAT · IMSS · SRE · INE
                  </span>
                </div>
              </div>

              {/* How it works */}
              <div
                style={{
                  background: C.surface,
                  borderTop: `1px solid ${C.border}`,
                  borderBottom: `1px solid ${C.border}`,
                  padding: "64px 64px",
                }}
              >
                <span style={{ fontFamily: FONT, fontSize: 10, fontWeight: 700, letterSpacing: 1.5, color: C.inkMuted, textTransform: "uppercase" }}>
                  CÓMO FUNCIONA
                </span>
                <h2 style={{ fontFamily: FONT, fontSize: 32, fontWeight: 800, color: C.ink, letterSpacing: -1, margin: "12px 0 40px", lineHeight: 1.1 }}>
                  Tres pasos para gestionar cualquier trámite
                </h2>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
                  {STEPS.map(({ num, title, desc, icon }) => (
                    <div
                      key={num}
                      style={{
                        background: C.white,
                        border: `1px solid ${C.border}`,
                        borderRadius: 10,
                        padding: "28px 24px",
                        boxShadow: SHADOW_STRIPE,
                      }}
                    >
                      <span style={{ fontFamily: FONT, fontSize: 10, fontWeight: 700, color: C.inkMuted, letterSpacing: 1.5, display: "block", marginBottom: 14 }}>
                        {num}
                      </span>
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          border: `1px solid ${C.border}`,
                          borderRadius: 8,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          marginBottom: 14,
                          fontSize: 17,
                        }}
                      >
                        {icon}
                      </div>
                      <h3 style={{ fontFamily: FONT, fontSize: 15, fontWeight: 700, color: C.ink, margin: "0 0 8px" }}>{title}</h3>
                      <p style={{ fontFamily: FONT, fontSize: 13, color: C.inkSec, lineHeight: 1.6, margin: 0 }}>{desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Docs trust band */}
              <div style={{ background: C.white, padding: "48px 64px", borderBottom: `1px solid ${C.border}` }}>
                <span style={{ fontFamily: FONT, fontSize: 10, fontWeight: 700, color: C.inkMuted, letterSpacing: 1.5, textTransform: "uppercase", display: "block", textAlign: "center", marginBottom: 28 }}>
                  DOCUMENTOS RECONOCIDOS
                </span>
                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "12px 32px" }}>
                  {DOCS.map((d) => (
                    <span key={d} style={{ fontFamily: FONT, fontSize: 14, fontWeight: 600, color: "#111" }}>{d}</span>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div style={{ background: C.surface, padding: "72px 64px", textAlign: "center" }}>
                <span style={{ fontFamily: FONT, fontSize: 10, fontWeight: 700, color: C.inkMuted, letterSpacing: 1.5, textTransform: "uppercase" }}>
                  EMPIEZA HOY
                </span>
                <h2 style={{ fontFamily: FONT, fontSize: 42, fontWeight: 900, color: C.ink, letterSpacing: -1.5, margin: "16px 0 16px", lineHeight: 1.08 }}>
                  Simplifica tus trámites{" "}
                  <span style={{ color: C.inkSec }}>de una vez por todas.</span>
                </h2>
                <p style={{ fontFamily: FONT, fontSize: 16, color: C.inkSec, maxWidth: 420, margin: "0 auto 32px" }}>
                  Regístrate gratis y accede a tu asistente personalizado de trámites.
                </p>
                <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
                  <div style={{ padding: "14px 32px", background: C.ink, borderRadius: 6, fontFamily: FONT, fontSize: 15, fontWeight: 700, color: C.white }}>
                    Crear cuenta gratis
                  </div>
                </div>
              </div>

            </div>
          </div>
        </BrowserFrame>
      </div>

      <Caption
        text="Plataforma de orientación ciudadana — acceso gratuito"
        frame={frame}
        totalFrames={durationInFrames}
      />
    </AbsoluteFill>
  );
}
