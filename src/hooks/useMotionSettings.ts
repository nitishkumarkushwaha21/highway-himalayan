"use client";
import { useEffect, useState } from "react";

export interface MotionSettings {
  /** User prefers reduced motion, or we detected a coarse-pointer / low-power context. */
  reducedMotion: boolean;
  /** Touch/mobile viewport — skip heavy frame preloads. */
  isMobile: boolean;
  /** True once the media queries have been read on the client. */
  ready: boolean;
}

const defaults: MotionSettings = {
  reducedMotion: false,
  isMobile: false,
  ready: false,
};

export function useMotionSettings(): MotionSettings {
  const [settings, setSettings] = useState<MotionSettings>(defaults);

  useEffect(() => {
    const motionMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobileMq = window.matchMedia(
      "(max-width: 768px), (pointer: coarse)",
    );

    const read = () =>
      setSettings({
        reducedMotion: motionMq.matches,
        isMobile: mobileMq.matches,
        ready: true,
      });

    read();
    motionMq.addEventListener("change", read);
    mobileMq.addEventListener("change", read);
    return () => {
      motionMq.removeEventListener("change", read);
      mobileMq.removeEventListener("change", read);
    };
  }, []);

  return settings;
}
