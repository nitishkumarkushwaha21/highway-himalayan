"use client";
import { useRef, useEffect, useState } from "react";
import { clamp, smoothstep } from "@/lib/animation";
import MapJourney from "./MapJourney";
import { useAudio } from "@/hooks/useAudio";

interface MapSectionProps {
  segmentIndex: number;
  fromLabel: string;
  toLabel: string;
}

export default function MapSection({
  segmentIndex,
  fromLabel,
  toLabel,
}: MapSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);
  const { chime } = useAudio();
  const chimedRef = useRef(false);

  useEffect(() => {
    const onScroll = () => {
      const section = sectionRef.current;
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const totalScroll = section.offsetHeight - window.innerHeight;
      const raw = clamp(-rect.top / totalScroll);
      setProgress(raw);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Gentle chime when the bus arrives at the pin; re-arm on the way out.
  useEffect(() => {
    if (progress > 0.9 && !chimedRef.current) {
      chimedRef.current = true;
      // higher pitch for later (higher-altitude) stops
      chime(560 + segmentIndex * 60);
    } else if (progress < 0.7) {
      chimedRef.current = false;
    }
  }, [progress, chime, segmentIndex]);

  const labelEnter = smoothstep(0.05, 0.25, progress);
  const labelExit = smoothstep(0.75, 0.95, progress);
  const labelOpacity = labelEnter * (1 - labelExit);

  return (
    <section
      ref={sectionRef}
      className="map-section"
      aria-label={`${fromLabel} to ${toLabel} map segment`}
      style={{ height: "calc(100vh + 300px)" }}
    >
      <div className="map-section__stage">
        <MapJourney
          segmentIndex={segmentIndex}
          segmentProgress={progress}
        />

        {/* Route label */}
        <div
          className="map-section__label"
          style={{
            opacity: labelOpacity,
            transform: `translateY(${(1 - labelEnter) * 30}px)`,
          }}
        >
          <span className="map-section__from">{fromLabel}</span>
          <span className="map-section__arrow">→</span>
          <span className="map-section__to">{toLabel}</span>
        </div>

        {/* Distance/altitude indicator */}
        <div
          className="map-section__info"
          style={{ opacity: labelOpacity }}
        >
          <div className="map-section__altitude-bar">
            <div
              className="map-section__altitude-fill"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
