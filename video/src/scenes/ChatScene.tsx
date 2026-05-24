import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { C, FONT, SHADOW_STRIPE } from "../lib/theme";
import { fadeIn, typeText } from "../lib/animations";
import { BrowserFrame } from "../components/BrowserFrame";
import { VideoNavbar } from "../components/VideoNavbar";
import { Caption } from "../components/Caption";

const USER_MSG = "Necesito tramitar mi pasaporte";
const AI_RESPONSE = `Para tramitar tu Pasaporte mexicano necesitas reunir:

📋 Documentos requeridos:
  • Acta de nacimiento certificada
  • CURP vigente (la tienes registrada ✓)
  • INE o identificación oficial (la tienes ✓)
  • Comprobante de domicilio (no mayor a 3 meses)
  • Fotografías tamaño infantil (6 piezas)

💰 Costo: $1,875 pesos
📍 Dónde: Secretaría de Relaciones Exteriores (SRE)
⏱  Tiempo estimado: 10 días hábiles

¿Quieres que registre el trámite de Pasaporte para hacer seguimiento paso a paso?`;

function LoadingDots({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <div style={{ display: "flex", gap: 5, padding: "10px 4px" }}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: C.slate400,
            animationName: "bounce",
          }}
        />
      ))}
    </div>
  );
}

function BotAvatar() {
  return (
    <div
      style={{
        width: 32,
        height: 32,
        borderRadius: "50%",
        background: C.brand100,
        border: `1px solid ${C.brand100}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.brand600} strokeWidth="2">
        <circle cx="12" cy="8" r="4"/>
        <path d="M4 20a8 8 0 0 1 16 0"/>
      </svg>
    </div>
  );
}

export function ChatScene() {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Timing:
  // 0-25: page appears, empty state
  // 25-70: user types message
  // 70-95: message sent (bubble appears), loading dots show
  // 95-300: AI response types in

  const pageOpacity = fadeIn(frame, 0, 15);

  const showEmptyState = frame < 50;
  const showUserTyping = frame >= 25 && frame < 72;
  const typingText = typeText(USER_MSG, frame, 25, 38, fps);
  const showUserBubble = frame >= 72;

  const showLoadingDots = frame >= 72 && frame < 98;
  const showAiResponse = frame >= 98;
  const aiText = typeText(AI_RESPONSE, frame, 98, 95, fps);

  const userBubbleOpacity = showUserBubble
    ? spring({ frame: frame - 72, fps, config: { damping: 20 }, from: 0, to: 1 })
    : 0;
  const userBubbleY = showUserBubble
    ? spring({ frame: frame - 72, fps, config: { damping: 20 }, from: 10, to: 0 })
    : 10;

  const aiBubbleOpacity = showAiResponse
    ? spring({ frame: frame - 98, fps, config: { damping: 20 }, from: 0, to: 1 })
    : 0;

  const examplePrompts = [
    "¿Qué documentos necesito para el RFC?",
    "¿Cómo obtengo mi CURP?",
    "¿Cuánto cuesta el pasaporte?",
  ];

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

            {/* Chat header */}
            <div
              style={{
                height: 52,
                background: C.white,
                borderBottom: `1px solid ${C.slate200}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingLeft: 24,
                paddingRight: 24,
                flexShrink: 0,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontFamily: FONT, fontSize: 14, fontWeight: 700, color: "#1A4A8A" }}>
                  Asistente de Trámites
                </span>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    background: C.green50,
                    borderRadius: 6,
                    paddingLeft: 10,
                    paddingRight: 10,
                    paddingTop: 4,
                    paddingBottom: 4,
                  }}
                >
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.green500 }} />
                  <span style={{ fontFamily: FONT, fontSize: 11, fontWeight: 600, color: C.green700 }}>
                    Conectado
                  </span>
                </div>
              </div>

              {/* Panel buttons */}
              <div style={{ display: "flex", gap: 8 }}>
                {["Mis trámites", "Mis documentos"].map((label) => (
                  <div
                    key={label}
                    style={{
                      padding: "6px 14px",
                      border: `1px solid ${C.border}`,
                      borderRadius: 6,
                      fontFamily: FONT,
                      fontSize: 12,
                      fontWeight: 600,
                      color: C.inkSec,
                      background: C.white,
                    }}
                  >
                    {label}
                  </div>
                ))}
              </div>
            </div>

            {/* Messages area */}
            <div
              style={{
                flex: 1,
                background: "#F8FAFC",
                padding: "24px 32px",
                overflowY: "hidden",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {showEmptyState && (
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 20,
                    opacity: interpolate(frame, [40, 55], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
                  }}
                >
                  {/* Bot icon */}
                  <div
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: "50%",
                      background: C.brand100,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={C.brand600} strokeWidth="1.5">
                      <circle cx="12" cy="8" r="4"/>
                      <path d="M4 20a8 8 0 0 1 16 0"/>
                    </svg>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <p style={{ fontFamily: FONT, fontSize: 18, fontWeight: 700, color: C.slate700, marginBottom: 6 }}>
                      Hola, soy tu asistente de trámites
                    </p>
                    <p style={{ fontFamily: FONT, fontSize: 13, color: C.slate500 }}>
                      Pregúntame sobre cualquier trámite gubernamental en México.
                    </p>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 8 }}>
                    {examplePrompts.map((p) => (
                      <div
                        key={p}
                        style={{
                          padding: "8px 16px",
                          borderRadius: 100,
                          border: `1px solid ${C.slate200}`,
                          fontFamily: FONT,
                          fontSize: 12,
                          color: C.slate500,
                        }}
                      >
                        {p}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Messages */}
              {!showEmptyState && (
                <div
                  style={{
                    maxWidth: 720,
                    width: "100%",
                    margin: "0 auto",
                    display: "flex",
                    flexDirection: "column",
                    gap: 16,
                  }}
                >
                  {/* User message */}
                  {showUserBubble && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        opacity: userBubbleOpacity,
                        transform: `translateY(${userBubbleY}px)`,
                      }}
                    >
                      <div
                        style={{
                          maxWidth: "75%",
                          background: C.brand600,
                          color: C.white,
                          borderRadius: "12px 12px 2px 12px",
                          padding: "10px 16px",
                          fontFamily: FONT,
                          fontSize: 14,
                          lineHeight: 1.5,
                        }}
                      >
                        {USER_MSG}
                      </div>
                    </div>
                  )}

                  {/* Loading dots */}
                  {showLoadingDots && (
                    <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
                      <BotAvatar />
                      <div
                        style={{
                          background: C.white,
                          border: `1px solid ${C.slate200}`,
                          borderRadius: "12px 12px 12px 2px",
                          padding: "10px 16px",
                        }}
                      >
                        <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                          {[0, 1, 2].map((i) => {
                            const dotFrame = (frame - 72 - i * 5) % 18;
                            const dotY = spring({ frame: dotFrame, fps, config: { damping: 10, stiffness: 200 }, from: 0, to: -4 });
                            return (
                              <div
                                key={i}
                                style={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: "50%",
                                  background: C.slate400,
                                  transform: `translateY(${dotY}px)`,
                                }}
                              />
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* AI response */}
                  {showAiResponse && (
                    <div
                      style={{
                        display: "flex",
                        gap: 10,
                        alignItems: "flex-start",
                        opacity: aiBubbleOpacity,
                      }}
                    >
                      <BotAvatar />
                      <div
                        style={{
                          maxWidth: "80%",
                          background: C.white,
                          border: `1px solid ${C.slate200}`,
                          borderRadius: "12px 12px 12px 2px",
                          padding: "12px 16px",
                          fontFamily: FONT,
                          fontSize: 13,
                          color: C.ink,
                          lineHeight: 1.7,
                          whiteSpace: "pre-wrap",
                          boxShadow: SHADOW_STRIPE,
                        }}
                      >
                        {aiText}
                        {/* Cursor blink */}
                        {aiText.length < AI_RESPONSE.length && (
                          <span
                            style={{
                              display: "inline-block",
                              width: 1.5,
                              height: 13,
                              background: C.ink,
                              marginLeft: 1,
                              verticalAlign: "middle",
                              opacity: Math.floor(frame / 8) % 2 === 0 ? 1 : 0,
                            }}
                          />
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Input bar */}
            <div
              style={{
                background: C.white,
                borderTop: `1px solid ${C.slate200}`,
                padding: "12px 32px",
                flexShrink: 0,
              }}
            >
              <div style={{ maxWidth: 720, margin: "0 auto" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    border: `1.5px solid ${showUserTyping ? C.ink : C.slate200}`,
                    borderRadius: 8,
                    padding: "8px 12px",
                    boxShadow: showUserTyping ? `0 0 0 3px rgba(10,10,10,0.06)` : "none",
                    background: C.white,
                  }}
                >
                  <span
                    style={{
                      flex: 1,
                      fontFamily: FONT,
                      fontSize: 13,
                      color: showUserTyping ? C.ink : C.inkMuted,
                    }}
                  >
                    {showUserTyping
                      ? typingText
                      : "Escribe o habla tu consulta sobre trámites..."}
                    {showUserTyping && (
                      <span
                        style={{
                          display: "inline-block",
                          width: 1.5,
                          height: 13,
                          background: C.ink,
                          marginLeft: 1,
                          verticalAlign: "middle",
                          opacity: Math.floor(frame / 6) % 2 === 0 ? 1 : 0,
                        }}
                      />
                    )}
                  </span>

                  {/* Mic button */}
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 6,
                      background: C.surface2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.inkSec} strokeWidth="2">
                      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                      <line x1="12" y1="19" x2="12" y2="23"/>
                      <line x1="8" y1="23" x2="16" y2="23"/>
                    </svg>
                  </div>

                  {/* Send button */}
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 6,
                      background: C.ink,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                      <line x1="22" y1="2" x2="11" y2="13"/>
                      <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                    </svg>
                  </div>
                </div>
                <p style={{ fontFamily: FONT, fontSize: 11, color: C.inkMuted, textAlign: "center", marginTop: 6 }}>
                  Enter para enviar · Shift + Enter para salto de línea
                </p>
              </div>
            </div>
          </div>
        </BrowserFrame>
      </div>

      <Caption
        text={
          frame < 75
            ? "Interfaz de chat en tiempo real vía WebSocket"
            : frame < 100
            ? "El asistente procesa la consulta con Azure OpenAI GPT-4.1 mini"
            : "Respuesta generada con function calling sobre la base de datos"
        }
        frame={frame}
        totalFrames={durationInFrames}
      />
    </AbsoluteFill>
  );
}
