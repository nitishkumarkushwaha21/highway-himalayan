"use client";
import { useEffect, useRef, useState } from "react";
import { lerp } from "@/lib/animation";

export function useParallax(smoothing = 0.08) {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReduced) return;

    const onPointerMove = (e: PointerEvent) => {
      targetRef.current = {
        x: e.clientX / window.innerWidth - 0.5,
        y: e.clientY / window.innerHeight - 0.5,
      };
    };

    const tick = () => {
      currentRef.current.x = lerp(
        currentRef.current.x,
        targetRef.current.x,
        smoothing
      );
      currentRef.current.y = lerp(
        currentRef.current.y,
        targetRef.current.y,
        smoothing
      );

      setMouse({ ...currentRef.current });

      if (
        Math.abs(currentRef.current.x - targetRef.current.x) > 0.001 ||
        Math.abs(currentRef.current.y - targetRef.current.y) > 0.001
      ) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    const onMove = (e: PointerEvent) => {
      onPointerMove(e);
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove, { passive: true });

    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, [smoothing]);

  return mouse;
}
