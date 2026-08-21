export function clamp(v: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, v));
}

export function smoothstep(edge0: number, edge1: number, v: number): number {
  const x = clamp((v - edge0) / (edge1 - edge0));
  return x * x * (3 - 2 * x);
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export interface SegmentResult {
  enter: number;
  exit: number;
  active: number;
}

export function segmentInOut(
  scroll: number,
  enterStart: number,
  enterEnd: number,
  exitStart: number,
  exitEnd: number
): SegmentResult {
  const enter = smoothstep(enterStart, enterEnd, scroll);
  const exit = smoothstep(exitStart, exitEnd, scroll);
  return { enter, exit, active: enter * (1 - exit) };
}

export function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number {
  return outMin + ((value - inMin) / (inMax - inMin)) * (outMax - outMin);
}
