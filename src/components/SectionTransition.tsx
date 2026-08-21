"use client";
import { useRef, useEffect, useState } from "react";
import { clamp, smoothstep } from "@/lib/animation";

interface SectionTransitionProps {
  /** Label to display during transition */
  label?: string;
  /** Accent color */
  color?: string;
  children?: React.ReactNode;
}

export default function SectionTransition({
  label,
  color = "#d4a574",
  children,
}: SectionTransitionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [scroll, setScroll] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setScroll(clamp(-rect.top / (el.offsetHeight - window.innerHeight)));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const fadeIn = smoothstep(0, 0.3, scroll);
  const fadeOut = smoothstep(0.7, 1, scroll);
  const opacity = fadeIn * (1 - fadeOut);

  return (
    <div
      ref={ref}
      className="section-transition"
      style={{ height: "50vh" }}
    >
      <div className="section-transition__stage">
        {/* Top gradient from previous section */}
        <div
          className="section-transition__gradient-top"
          style={{ opacity: 1 - fadeIn }}
        />

        {/* Center label */}
        {label && (
          <div
            className="section-transition__label"
            style={{
              opacity,
              transform: `translateY(${(1 - fadeIn) * 30 - fadeOut * 30}px)`,
              color,
            }}
          >
            <span className="section-transition__line" style={{ background: color }} />
            <span>{label}</span>
            <span className="section-transition__line" style={{ background: color }} />
          </div>
        )}

        {/* Bottom gradient into next section */}
        <div
          className="section-transition__gradient-bottom"
          style={{ opacity: fadeOut }}
        />
      </div>
    </div>
  );
}
