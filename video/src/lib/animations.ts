import { interpolate, spring } from "remotion";

export function fadeIn(frame: number, start = 0, duration = 15): number {
  return interpolate(frame, [start, start + duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
}

export function fadeOut(frame: number, start: number, duration = 10): number {
  return interpolate(frame, [start, start + duration], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
}

export function slideUp(
  frame: number,
  fps: number,
  start = 0,
  distance = 24
): number {
  const s = spring({ frame: frame - start, fps, config: { damping: 22, stiffness: 140 } });
  return interpolate(s, [0, 1], [distance, 0]);
}

export function scaleIn(frame: number, fps: number, start = 0): number {
  return spring({ frame: frame - start, fps, config: { damping: 20, stiffness: 120 }, from: 0.92, to: 1 });
}

export function typeText(
  full: string,
  frame: number,
  startFrame: number,
  cps = 40,
  fps = 30
): string {
  const elapsed = Math.max(0, frame - startFrame);
  const chars = Math.floor((elapsed / fps) * cps);
  return full.slice(0, chars);
}

export function staggerDelay(index: number, perItem = 6): number {
  return index * perItem;
}
