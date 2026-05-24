import React from "react";
import { FONT } from "../lib/theme";
import { interpolate } from "remotion";

interface CaptionProps {
  text: string;
  frame: number;
  totalFrames: number;
}

export function Caption({ text, frame, totalFrames }: CaptionProps) {
  const opacity = interpolate(
    frame,
    [0, 10, totalFrames - 10, totalFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <div
      style={{
        position: "absolute",
        bottom: 40,
        left: "50%",
        transform: "translateX(-50%)",
        background: "rgba(10,10,10,0.82)",
        backdropFilter: "blur(8px)",
        borderRadius: 8,
        paddingLeft: 20,
        paddingRight: 20,
        paddingTop: 10,
        paddingBottom: 10,
        opacity,
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          fontFamily: FONT,
          fontSize: 15,
          fontWeight: 500,
          color: "rgba(255,255,255,0.92)",
          letterSpacing: 0.1,
        }}
      >
        {text}
      </span>
    </div>
  );
}
