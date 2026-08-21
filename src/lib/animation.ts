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

/**
 * Maps raw scroll (px) to a 0-1 frame position that reveals to `hold`, parks
 * there through the reading beat (with a barely-there creep so it's not frozen),
 * then finishes to 1. Keeps motion — where blur hides — over the transitions,
 * and a clean, sharp frame under the text.
 */
export function holdMap(
  scroll: number,
  hold: number,
  revealEnd: number,
  holdEnd: number,
  finishEnd: number
): number {
  if (scroll <= revealEnd) {
    return lerp(0, hold, smoothstep(0, revealEnd, scroll));
  }
  if (scroll <= holdEnd) {
    const creep = 0.04 * clamp((scroll - revealEnd) / (holdEnd - revealEnd));
    return hold + creep;
  }
  return lerp(hold + 0.04, 1, smoothstep(holdEnd, finishEnd, scroll));
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
