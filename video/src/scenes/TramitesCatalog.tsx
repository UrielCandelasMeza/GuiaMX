import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from "remotion";
import { C, FONT, SHADOW_STRIPE, SHADOW_MD } from "../lib/theme";
import { fadeIn, staggerDelay } from "../lib/animations";
import { BrowserFrame } from "../components/BrowserFrame";
import { VideoNavbar } from "../components/VideoNavbar";
import { Caption } from "../components/Caption";

const TRAMITES = [
  {
    nombre: "Pasaporte mexicano",
    desc: "Obtén tu pasaporte para viajes internacionales a través de la SRE.",
    costo: "$1,875",
    steps: 5,
    docs: 4,
    color: "#EFF6FF",
    badge: "Popular",
  },
  {
    nombre: "RFC — Persona física",
    desc: "Registro ante el SAT para actividades económicas y obligaciones fiscales.",
    costo: "Gratuito",
    steps: 4,
    docs: 3,
    color: "#F0FDF4",
    badge: null,
  },
  {
    nombre: "CURP",
    desc: "Obtén o recupera tu Clave Única de Registro de Población.",
    costo: "Gratuito",
    steps: 2,
    docs: 2,
    color: "#FFF7ED",
    badge: "Rápido",
  },
  {
    nombre: "Renovación de INE",
    desc: "Renovación de credencial para votar ante el INE/RENAPO.",
    costo: "Gratuito",
    steps: 3,
    docs: 3,
    color: "#FDF4FF",
    badge: null,
  },
  {
    nombre: "NSS — IMSS",
    desc: "Obtén tu Número de Seguridad Social para servicios médicos del IMSS.",
    costo: "Gratuito",
    steps: 3,
    docs: 2,
    color: "#F0FDF4",
    badge: null,
  },
  {
    nombre: "Licencia de conducir CDMX",
    desc: "Tramita o renueva tu licencia de conducir en la Ciudad de México.",
    costo: "$600",
    steps: 5,
    docs: 4,
    color: "#FFF7ED",
    badge: null,
  },
] as const;

function TramiteCard({
  tramite,
  frame,
  startFrame,
}: {
  tramite: (typeof TRAMITES)[number];
  frame: number;
  startFrame: number;
}) {
  const opacity = spring({ frame: Math.max(0, frame - startFrame), fps: 30, config: { damping: 20, stiffness: 140 }, from: 0, to: 1 });
  const ty = spring({ frame: Math.max(0, frame - startFrame), fps: 30, config: { damping: 20, stiffness: 140 }, from: 20, to: 0 });

  return (
    <div
      style={{
        background: C.white,
        border: `1px solid ${C.border}`,
        borderRadius: 10,
        padding: "20px 20px",
        boxShadow: SHADOW_STRIPE,
        opacity,
        transform: `translateY(${ty}px)`,
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      {/* Color accent top strip */}
      <div style={{ height: 4, borderRadius: 2, background: tramite.color === "#EFF6FF" ? "#2563EB" : tramite.color === "#F0FDF4" ? "#16a34a" : tramite.color === "#FFF7ED" ? "#ea580c" : tramite.color === "#FDF4FF" ? "#9333ea" : "#6b7280", marginBottom: 4 }} />

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
        <h3 style={{ fontFamily: FONT, fontSize: 14, fontWeight: 700, color: C.ink, lineHeight: 1.3 }}>
          {tramite.nombre}
        </h3>
        {tramite.badge && (
          <span
            style={{
              padding: "2px 8px",
              background: tramite.badge === "Popular" ? C.brand100 : "#F0FDF4",
              color: tramite.badge === "Popular" ? C.brand800 : C.green700,
              borderRadius: 100,
              fontFamily: FONT,
              fontSize: 10,
              fontWeight: 700,
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            {tramite.badge}
          </span>
        )}
      </div>

      <p style={{ fontFamily: FONT, fontSize: 12, color: C.inkSec, lineHeight: 1.55, flex: 1 }}>
        {tramite.desc}
      </p>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 8, borderTop: `1px solid ${C.border}` }}>
        <span style={{ fontFamily: FONT, fontSize: 13, fontWeight: 700, color: C.ink }}>
          {tramite.costo}
        </span>
        <div style={{ display: "flex", gap: 10 }}>
          <span style={{ fontFamily: FONT, fontSize: 11, color: C.inkMuted }}>{tramite.steps} pasos</span>
          <span style={{ fontFamily: FONT, fontSize: 11, color: C.inkMuted }}>{tramite.docs} docs</span>
        </div>
      </div>

      <div
        style={{
          height: 32,
          border: `1px solid ${C.border}`,
          borderRadius: 6,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: FONT,
          fontSize: 12,
          fontWeight: 600,
          color: C.inkSec,
        }}
      >
        Ver detalle →
      </div>
    </div>
  );
}

export function TramitesCatalog() {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const pageOpacity = fadeIn(frame, 0, 15);

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
        <BrowserFrame url="guiamx.railway.app/tramites">
          <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <VideoNavbar active="tramites" />

            <div style={{ flex: 1, background: C.surface, overflowY: "hidden", padding: "28px 36px" }}>
              {/* Header */}
              <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontFamily: FONT, fontSize: 22, fontWeight: 800, color: C.ink, letterSpacing: -0.5, marginBottom: 6 }}>
                  Catálogo de trámites
                </h1>
                <p style={{ fontFamily: FONT, fontSize: 13, color: C.inkSec }}>
                  Explora todos los trámites disponibles y encuentra el que necesitas.
                </p>
              </div>

              {/* Search bar */}
              <div
                style={{
                  height: 40,
                  border: `1.5px solid ${C.border}`,
                  borderRadius: 8,
                  background: C.white,
                  display: "flex",
                  alignItems: "center",
                  paddingLeft: 14,
                  gap: 10,
                  marginBottom: 24,
                  boxShadow: SHADOW_STRIPE,
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.inkMuted} strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <span style={{ fontFamily: FONT, fontSize: 13, color: C.inkMuted }}>
                  Buscar trámite por nombre o descripción...
                </span>
              </div>

              {/* Grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: 16,
                }}
              >
                {TRAMITES.map((t, i) => (
                  <TramiteCard
                    key={t.nombre}
                    tramite={t}
                    frame={frame}
                    startFrame={10 + staggerDelay(i, 8)}
                  />
                ))}
              </div>
            </div>
          </div>
        </BrowserFrame>
      </div>

      <Caption
        text="Catálogo público de trámites — accesible sin autenticación"
        frame={frame}
        totalFrames={durationInFrames}
      />
    </AbsoluteFill>
  );
}
