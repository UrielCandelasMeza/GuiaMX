import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";
import { C, FONT, SHADOW_STRIPE } from "../lib/theme";
import { fadeIn, staggerDelay } from "../lib/animations";
import { BrowserFrame } from "../components/BrowserFrame";
import { VideoNavbar } from "../components/VideoNavbar";
import { Caption } from "../components/Caption";

type EstadoPaso = "COMPLETADO" | "EN_PROGRESO" | "PENDIENTE";

const PASOS: { titulo: string; desc: string; estado: EstadoPaso }[] = [
  { titulo: "Reúne tus documentos", desc: "Acta de nacimiento, CURP, INE, comprobante de domicilio y fotos", estado: "COMPLETADO" },
  { titulo: "Agenda cita en SRE", desc: "Ve a citas.sre.gob.mx y selecciona oficina y horario disponible", estado: "EN_PROGRESO" },
  { titulo: "Llena la forma SPT", desc: "Descarga y completa el formato oficial SPT antes de tu cita", estado: "PENDIENTE" },
  { titulo: "Realiza el pago", desc: "Paga $1,875 en banco o en línea y conserva tu comprobante", estado: "PENDIENTE" },
  { titulo: "Preséntate a tu cita", desc: "Lleva original y copia de todos los documentos a la SRE", estado: "PENDIENTE" },
];

const STATUS_CONFIG = {
  COMPLETADO: { bg: C.green50, color: C.green700, border: "#BBF7D0", dot: C.green500, label: "Completado" },
  EN_PROGRESO: { bg: C.brand50, color: "#1D4ED8", border: C.brand100, dot: C.brand600, label: "En progreso" },
  PENDIENTE: { bg: C.surface2, color: C.inkSec, border: C.border, dot: C.inkMuted, label: "Pendiente" },
} as const;

function PasoRow({
  paso,
  index,
  frame,
  startFrame,
}: {
  paso: (typeof PASOS)[number];
  index: number;
  frame: number;
  startFrame: number;
}) {
  const cfg = STATUS_CONFIG[paso.estado];
  const opacity = spring({ frame: Math.max(0, frame - startFrame), fps: 30, config: { damping: 22, stiffness: 160 }, from: 0, to: 1 });
  const tx = spring({ frame: Math.max(0, frame - startFrame), fps: 30, config: { damping: 22, stiffness: 160 }, from: 20, to: 0 });

  return (
    <div
      style={{
        display: "flex",
        gap: 16,
        paddingBottom: 20,
        opacity,
        transform: `translateX(${tx}px)`,
      }}
    >
      {/* Left: step number + line */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 32, flexShrink: 0 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: paso.estado === "COMPLETADO" ? C.ink : paso.estado === "EN_PROGRESO" ? C.brand100 : C.surface2,
            border: `2px solid ${paso.estado === "COMPLETADO" ? C.ink : paso.estado === "EN_PROGRESO" ? C.brand600 : C.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {paso.estado === "COMPLETADO" ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          ) : (
            <span style={{ fontFamily: FONT, fontSize: 12, fontWeight: 700, color: paso.estado === "EN_PROGRESO" ? C.brand600 : C.inkMuted }}>
              {index + 1}
            </span>
          )}
        </div>
        {index < PASOS.length - 1 && (
          <div
            style={{
              width: 2,
              flex: 1,
              minHeight: 20,
              background: paso.estado === "COMPLETADO" ? C.ink : C.border,
              borderRadius: 1,
              marginTop: 4,
            }}
          />
        )}
      </div>

      {/* Right: content */}
      <div style={{ flex: 1, paddingTop: 4 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <span
            style={{
              fontFamily: FONT,
              fontSize: 14,
              fontWeight: 700,
              color: paso.estado === "COMPLETADO" ? C.inkMuted : C.ink,
              textDecoration: paso.estado === "COMPLETADO" ? "line-through" : "none",
            }}
          >
            {paso.titulo}
          </span>
          <span
            style={{
              padding: "3px 10px",
              background: cfg.bg,
              color: cfg.color,
              border: `1px solid ${cfg.border}`,
              borderRadius: 100,
              fontFamily: FONT,
              fontSize: 11,
              fontWeight: 700,
            }}
          >
            {cfg.label}
          </span>
        </div>
        <p style={{ fontFamily: FONT, fontSize: 12, color: C.inkSec, lineHeight: 1.55 }}>
          {paso.desc}
        </p>
      </div>
    </div>
  );
}

export function MisTramites() {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const pageOpacity = fadeIn(frame, 0, 15);
  const completedCount = PASOS.filter((p) => p.estado === "COMPLETADO").length;
  const progressPct = (completedCount / PASOS.length) * 100;

  const progressWidth = interpolate(frame, [20, 60], [0, progressPct], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

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
        <BrowserFrame url="guiamx.railway.app/tramites/mis-tramites">
          <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <VideoNavbar active="mis-tramites" />

            <div style={{ flex: 1, background: C.surface, overflowY: "hidden", padding: "28px 36px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 24, height: "100%" }}>

                {/* Left: tramite card */}
                <div>
                  <h1 style={{ fontFamily: FONT, fontSize: 20, fontWeight: 800, color: C.ink, letterSpacing: -0.5, marginBottom: 20 }}>
                    Mis trámites
                  </h1>

                  <div
                    style={{
                      background: C.white,
                      border: `1px solid ${C.border}`,
                      borderRadius: 10,
                      boxShadow: SHADOW_STRIPE,
                      overflow: "hidden",
                    }}
                  >
                    {/* Card accent */}
                    <div style={{ height: 4, background: C.brand600 }} />
                    <div style={{ padding: "18px 20px" }}>
                      {/* Status badge */}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                        <span
                          style={{
                            padding: "3px 10px",
                            background: C.brand50,
                            color: "#1D4ED8",
                            border: `1px solid ${C.brand100}`,
                            borderRadius: 100,
                            fontFamily: FONT,
                            fontSize: 11,
                            fontWeight: 700,
                          }}
                        >
                          EN PROGRESO
                        </span>
                        <span style={{ fontFamily: FONT, fontSize: 11, color: C.inkMuted }}>
                          {completedCount}/{PASOS.length} pasos
                        </span>
                      </div>

                      <h3 style={{ fontFamily: FONT, fontSize: 16, fontWeight: 800, color: C.ink, marginBottom: 4 }}>
                        Pasaporte mexicano
                      </h3>
                      <p style={{ fontFamily: FONT, fontSize: 12, color: C.inkSec, lineHeight: 1.5, marginBottom: 14 }}>
                        Iniciado el 15 de mayo, 2025
                      </p>

                      {/* Progress bar */}
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                          <span style={{ fontFamily: FONT, fontSize: 10, fontWeight: 700, color: C.inkMuted, letterSpacing: 0.8 }}>
                            AVANCE
                          </span>
                          <span style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, color: C.ink }}>
                            {Math.round(progressWidth)}%
                          </span>
                        </div>
                        <div style={{ height: 6, background: C.surface2, borderRadius: 3, overflow: "hidden" }}>
                          <div
                            style={{
                              height: "100%",
                              width: `${progressWidth}%`,
                              background: C.brand600,
                              borderRadius: 3,
                            }}
                          />
                        </div>
                      </div>

                      <div
                        style={{
                          marginTop: 14,
                          height: 34,
                          background: C.ink,
                          borderRadius: 6,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontFamily: FONT,
                          fontSize: 13,
                          fontWeight: 600,
                          color: C.white,
                        }}
                      >
                        Ver seguimiento
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: step timeline */}
                <div
                  style={{
                    background: C.white,
                    border: `1px solid ${C.border}`,
                    borderRadius: 10,
                    boxShadow: SHADOW_STRIPE,
                    padding: "24px 28px",
                    overflowY: "hidden",
                  }}
                >
                  <h2 style={{ fontFamily: FONT, fontSize: 16, fontWeight: 800, color: C.ink, marginBottom: 4 }}>
                    Pasos del trámite
                  </h2>
                  <p style={{ fontFamily: FONT, fontSize: 12, color: C.inkSec, marginBottom: 24 }}>
                    Pasaporte mexicano · SRE
                  </p>

                  {PASOS.map((paso, i) => (
                    <PasoRow
                      key={paso.titulo}
                      paso={paso}
                      index={i}
                      frame={frame}
                      startFrame={20 + staggerDelay(i, 9)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </BrowserFrame>
      </div>

      <Caption
        text="Seguimiento paso a paso — el asistente actualiza el estado automáticamente"
        frame={frame}
        totalFrames={durationInFrames}
      />
    </AbsoluteFill>
  );
}
