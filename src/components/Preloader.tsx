"use client";
import { useState, useEffect, useRef } from "react";
import { useFrameLoading } from "@/hooks/useFrameLoading";

const DESTINATION_LABELS: Record<string, string> = {
  hero: "Preparing the view",
  shimla: "Shimla — The Queen of Hills",
  manali: "Manali — Where Rivers Run White",
  spiti: "Spiti — The Middle Land",
  ladakh: "Ladakh — The Last Horizon",
};

const ROUTE_DOTS = ["Shimla", "Manali", "Spiti", "Ladakh"];

// Deterministic values — avoids SSR/client hydration mismatch from Math.random().
// Few and slow: a calm dust drift, not a particle storm.
const PRELOADER_PARTICLES = Array.from({ length: 8 }, (_, i) => ({
  left: `${((i * 61 + 13) % 100).toFixed(2)}%`,
  top: `${((i * 47 + 7) % 100).toFixed(2)}%`,
  animationDelay: `${((i * 0.9) % 8).toFixed(2)}s`,
  animationDuration: `${9 + (i % 4) * 2}s`,
  opacity: 0.1 + (i % 4) * 0.03,
  width: `${2 + (i % 2)}px`,
  height: `${2 + (i % 2)}px`,
}));

export default function Preloader() {
  const { progress, isReady, currentDestination, destinationProgress } =
    useFrameLoading();
  const [revealed, setRevealed] = useState(false);
  const [hidden, setHidden] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isReady) return;
    setRevealed(true);
    const timer = setTimeout(() => setHidden(true), 1400);
    return () => clearTimeout(timer);
  }, [isReady]);

  // Lock scroll during loading
  useEffect(() => {
    if (!hidden) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [hidden]);

  if (hidden) return null;

  const pct = Math.round(progress * 100);
  const destLabel =
    DESTINATION_LABELS[currentDestination] || "Loading frames…";

  return (
    <div
      ref={containerRef}
      className={`preloader ${revealed ? "preloader--revealed" : ""}`}
      aria-live="polite"
      aria-label="Loading site assets"
    >
      {/* Ambient background particles */}
      <div className="preloader__particles">
        {PRELOADER_PARTICLES.map((particle, i) => (
          <span
            key={i}
            className="preloader__particle"
            style={particle}
          />
        ))}
      </div>

      {/* Center content */}
      <div className="preloader__content">
        {/* Logo */}
        <div className="preloader__brand">
          <span className="preloader__brand-name">Drishya Trails</span>
          <span className="preloader__brand-line" />
          <span className="preloader__brand-tagline">
            The Himalayan Highway
          </span>
        </div>

        {/* Route visualization */}
        <div className="preloader__route">
          {ROUTE_DOTS.map((name, i) => {
            const destId = name.toLowerCase().replace(" valley", "");
            const destProg = destinationProgress[destId] || 0;
            const isActive = currentDestination === destId;
            const isDone = destProg >= 1;

            return (
              <div key={name} className="preloader__route-stop">
                <div
                  className={`preloader__route-dot ${
                    isDone
                      ? "preloader__route-dot--done"
                      : isActive
                      ? "preloader__route-dot--active"
                      : ""
                  }`}
                >
                  {isDone && (
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 10 10"
                      className="preloader__check"
                    >
                      <path
                        d="M2 5.5L4 7.5L8 3"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
                <span className="preloader__route-name">{name}</span>
                {i < ROUTE_DOTS.length - 1 && (
                  <div className="preloader__route-line">
                    <div
                      className="preloader__route-line-fill"
                      style={{
                        width: `${isDone ? 100 : isActive ? destProg * 100 : 0}%`,
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="preloader__progress">
          <div className="preloader__bar">
            <div
              className="preloader__bar-fill"
              style={{ width: `${pct}%` }}
            />
            <div
              className="preloader__bar-glow"
              style={{ left: `${pct}%` }}
            />
          </div>
          <div className="preloader__meta">
            <span className="preloader__status">{destLabel}</span>
            <span className="preloader__pct">{pct}%</span>
          </div>
        </div>
      </div>

      {/* Reveal curtains — split open when ready */}
      <div className="preloader__curtain preloader__curtain--left" />
      <div className="preloader__curtain preloader__curtain--right" />
    </div>
  );
}
