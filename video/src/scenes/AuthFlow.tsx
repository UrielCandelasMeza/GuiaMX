import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { C, FONT, SHADOW_MD } from "../lib/theme";
import { fadeIn, typeText } from "../lib/animations";
import { BrowserFrame } from "../components/BrowserFrame";
import { Caption } from "../components/Caption";

function InputField({
  label,
  value,
  type = "text",
  focused = false,
}: {
  label: string;
  value: string;
  type?: string;
  focused?: boolean;
}) {
  const displayValue = type === "password" ? "•".repeat(value.length) : value;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label
        style={{
          fontFamily: FONT,
          fontSize: 11,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: 0.8,
          color: C.ink,
        }}
      >
        {label}
      </label>
      <div
        style={{
          height: 40,
          borderRadius: 6,
          border: `1.5px solid ${focused ? C.ink : C.border}`,
          background: C.white,
          paddingLeft: 12,
          paddingRight: 12,
          display: "flex",
          alignItems: "center",
          boxShadow: focused ? `0 0 0 3px rgba(10,10,10,0.07)` : "none",
          position: "relative",
        }}
      >
        <span
          style={{
            fontFamily: FONT,
            fontSize: 14,
            color: C.ink,
            letterSpacing: type === "password" ? 3 : 0,
          }}
        >
          {displayValue}
          {focused && (
            <span
              style={{
                display: "inline-block",
                width: 1.5,
                height: 16,
                background: C.ink,
                marginLeft: 1,
                verticalAlign: "middle",
              }}
            />
          )}
        </span>
      </div>
    </div>
  );
}

export function AuthFlow() {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const EMAIL = "maria.garcia@cdmx.mx";
  const PASSWORD = "Secure1234";

  // Phase 1: Page appears (0-20f)
  // Phase 2: Email types (20-100f) = ~80f for ~40 chars
  // Phase 3: Password types (110-150f)
  // Phase 4: Loading state (160-180f)

  const pageOpacity = fadeIn(frame, 0, 15);

  const emailText = typeText(EMAIL, frame, 20, 35, fps);
  const emailFocused = frame >= 18 && frame < 110;

  const passwordText = typeText(PASSWORD, frame, 110, 40, fps);
  const passwordFocused = frame >= 108 && frame < 165;

  const buttonLoading = frame >= 165;
  const buttonScale = spring({ frame: frame - 162, fps, config: { damping: 20, stiffness: 200 }, from: 1, to: buttonLoading ? 0.97 : 1 });

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
        <BrowserFrame url="guiamx.railway.app/login">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              height: "100%",
            }}
          >
            {/* Left panel */}
            <div
              style={{
                background: C.surface,
                borderRight: `1px solid ${C.border}`,
                padding: "56px 48px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              {/* Logo */}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.ink} strokeWidth="1.75">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
                </svg>
                <span style={{ fontFamily: FONT, fontSize: 15, fontWeight: 700, color: C.ink }}>GuíasMX</span>
              </div>

              {/* Content */}
              <div>
                <h1 style={{ fontFamily: FONT, fontSize: 30, fontWeight: 900, color: C.ink, letterSpacing: -1, lineHeight: 1.1, marginBottom: 14 }}>
                  GuiaMX
                </h1>
                <p style={{ fontFamily: FONT, fontSize: 15, color: C.inkSec, lineHeight: 1.7, maxWidth: 280 }}>
                  Accede a tu asistente de trámites gubernamentales y consulta el estado de tus gestiones.
                </p>
              </div>

              {/* Footer tag */}
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ flex: 1, height: 1, background: C.border }} />
                <span style={{ fontFamily: FONT, fontSize: 10, fontWeight: 700, color: C.inkMuted, letterSpacing: 1.2, textTransform: "uppercase" }}>
                  Gobierno de México
                </span>
                <div style={{ flex: 1, height: 1, background: C.border }} />
              </div>
            </div>

            {/* Right panel — form */}
            <div
              style={{
                background: C.white,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "48px 56px",
              }}
            >
              <div style={{ width: "100%", maxWidth: 360 }}>
                <h2 style={{ fontFamily: FONT, fontSize: 24, fontWeight: 800, color: C.ink, letterSpacing: -0.7, marginBottom: 6 }}>
                  Iniciar sesión
                </h2>
                <p style={{ fontFamily: FONT, fontSize: 14, color: C.inkSec, marginBottom: 32 }}>
                  Ingresa tus datos para continuar.
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  <InputField
                    label="Correo electrónico"
                    value={emailText}
                    focused={emailFocused}
                  />
                  <InputField
                    label="Contraseña"
                    value={passwordText}
                    type="password"
                    focused={passwordFocused}
                  />

                  {/* Submit button */}
                  <div
                    style={{
                      marginTop: 8,
                      height: 44,
                      background: C.ink,
                      borderRadius: 6,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transform: `scale(${buttonScale})`,
                      boxShadow: SHADOW_MD,
                    }}
                  >
                    {buttonLoading ? (
                      <span style={{ fontFamily: FONT, fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.7)" }}>
                        Verificando…
                      </span>
                    ) : (
                      <span style={{ fontFamily: FONT, fontSize: 14, fontWeight: 700, color: C.white }}>
                        Iniciar sesión
                      </span>
                    )}
                  </div>

                  <p style={{ fontFamily: FONT, fontSize: 13, color: C.inkSec, textAlign: "center" }}>
                    ¿No tienes cuenta?{" "}
                    <span style={{ fontWeight: 700, color: C.brand600 }}>Regístrate</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </BrowserFrame>
      </div>

      <Caption
        text="Autenticación segura con JWT · contraseñas hasheadas con bcrypt"
        frame={frame}
        totalFrames={durationInFrames}
      />
    </AbsoluteFill>
  );
}
