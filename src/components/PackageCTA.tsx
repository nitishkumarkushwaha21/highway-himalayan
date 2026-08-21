"use client";
import { useRef, useEffect, useState } from "react";
import { smoothstep, clamp } from "@/lib/animation";
import { destinations } from "@/lib/destinations";

export default function PackageCTA() {
  const sectionRef = useRef<HTMLElement>(null);
  const [scroll, setScroll] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const section = sectionRef.current;
      if (!section) return;
      const rect = section.getBoundingClientRect();
      setScroll(clamp(-rect.top, -400, 600));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const enter = smoothstep(-200, 200, scroll);

  return (
    <section
      ref={sectionRef}
      id="book"
      className="cta-section"
      aria-label="Trip package details"
    >
      <div
        className="cta-section__content"
        style={{
          opacity: enter,
          transform: `translateY(${(1 - enter) * 60}px)`,
        }}
      >
        <p className="cta-section__kicker">The complete journey</p>
        <h2 className="cta-section__title">
          Four stops. One road.
          <br />
          Fourteen days.
        </h2>
        <p className="cta-section__subtitle">
          The complete Himalayan Highway package — Shimla to Ladakh by road.
        </p>

        {/* Route summary */}
        <div className="cta-section__route">
          {destinations.map((dest, i) => (
            <div key={dest.id} className="cta-section__stop">
              <div
                className="cta-section__stop-dot"
                style={{ background: dest.color }}
              />
              <span className="cta-section__stop-name">{dest.title}</span>
              {i < destinations.length - 1 && (
                <span className="cta-section__stop-line" />
              )}
            </div>
          ))}
        </div>

        {/* Includes */}
        <div className="cta-section__includes">
          {[
            "14 nights — heritage hotels & mountain camps",
            "Private panoramic bus",
            "All meals, permits & oxygen support",
            "Local guides at every stop",
            "Satellite communication kit",
          ].map((item) => (
            <div key={item} className="cta-section__include">
              <span className="cta-section__check">✓</span>
              <span>{item}</span>
            </div>
          ))}
        </div>

        {/* Price and CTA */}
        <div className="cta-section__action">
          <div className="cta-section__price">
            <span className="cta-section__currency">₹</span>
            <span className="cta-section__amount">89,000</span>
            <span className="cta-section__per">/ person</span>
          </div>
          <button className="cta-section__button">
            Begin Your Journey
            <span className="cta-section__arrow">→</span>
          </button>
        </div>
      </div>
    </section>
  );
}
