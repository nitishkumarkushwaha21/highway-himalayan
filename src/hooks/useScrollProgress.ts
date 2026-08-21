"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { clamp, lerp } from "@/lib/animation";

interface ScrollProgressOptions {
  /** Extra scroll height beyond viewport (px). Default 3000 */
  scrollDistance?: number;
  /** Lerp factor for smooth scrolling. 0 = no smoothing, 1 = instant. Default 0.12 */
  smoothing?: number;
}

export function useScrollProgress(options: ScrollProgressOptions = {}) {
  const { scrollDistance = 3000, smoothing = 0.12 } = options;
  const sectionRef = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);
  const [smoothProgress, setSmoothProgress] = useState(0);
  const smoothRef = useRef(0);
  const targetRef = useRef(0);
  const rafRef = useRef<number>(0);
  const initializedRef = useRef(false);

  const tick = useCallback(() => {
    const section = sectionRef.current;
    if (!section) return;

    const rect = section.getBoundingClientRect();
    const totalScroll = section.offsetHeight - window.innerHeight;
    const rawScroll = clamp(-rect.top, 0, totalScroll);
    const rawProgress = clamp(rawScroll / totalScroll);

    targetRef.current = rawProgress;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (!initializedRef.current || prefersReduced) {
      smoothRef.current = rawProgress;
      initializedRef.current = true;
    } else {
      smoothRef.current = lerp(smoothRef.current, rawProgress, smoothing);
    }

    if (Math.abs(smoothRef.current - targetRef.current) < 0.0001) {
      smoothRef.current = targetRef.current;
    }

    setProgress(rawProgress);
    setSmoothProgress(smoothRef.current);

    if (Math.abs(smoothRef.current - targetRef.current) > 0.0001) {
      rafRef.current = requestAnimationFrame(tick);
    }
  }, [smoothing]);

  useEffect(() => {
    const onScroll = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(tick);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    tick();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, [tick]);

  return { sectionRef, progress, smoothProgress, scrollDistance };
}
