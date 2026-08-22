"use client";
import { useRef, useEffect, useState } from "react";
import { useParallax } from "@/hooks/useParallax";
import { useFramePlayer } from "@/hooks/useFramePlayer";
import { useMotionSettings } from "@/hooks/useMotionSettings";
import DecorativeFrame from "@/components/DecorativeFrame";
import { smoothstep, clamp } from "@/lib/animation";

const HERO_FRAME_COUNT = 240;

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const mouse = useParallax();
  const [scrollY, setScrollY] = useState(0);
  const [entered, setEntered] = useState(false);
  const { reducedMotion, isMobile } = useMotionSettings();
  const disableFrames = reducedMotion || isMobile;

  // Slow the hero scrub so the opening shot has room to read as cinematic.
  const frameProgress = smoothstep(0, 950, scrollY);
  const { canvasRef } = useFramePlayer({
    framePath: "/frames/hero/frame_",
    frameCount: HERO_FRAME_COUNT,
    progress: frameProgress,
    disabled: disableFrames,
  });

  useEffect(() => {
    const timer = setTimeout(() => setEntered(true), 200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const section = sectionRef.current;
      if (!section) return;
      const rect = section.getBoundingClientRect();
      setScrollY(clamp(-rect.top, 0, section.offsetHeight));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const fadeOut = smoothstep(450, 950, scrollY);
  const titleY = reducedMotion ? 0 : fadeOut * -140;
  const titleScale = reducedMotion ? 1 : 1 - fadeOut * 0.06;
  const subtitleY = reducedMotion ? 0 : fadeOut * 70;
  const parallaxBg = reducedMotion
    ? "translate3d(0,0,0) scale(1.15)"
    : `translate3d(${mouse.x * -20}px, ${mouse.y * -10}px, 0) scale(1.15)`;
  const parallaxMist = reducedMotion
    ? "translate3d(0,0,0)"
    : `translate3d(${mouse.x * 12}px, 0, 0)`;

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="hero"
      aria-label="Hero introduction"
    >
      <div className="hero__stage">
        <img
          src="/images/hero-bg.png"
          className="hero__bg-image"
          alt=""
          style={{ transform: parallaxBg }}
        />

        {!disableFrames && (
          <canvas
            ref={canvasRef}
            className="hero__canvas"
            width={1920}
            height={1080}
          />
        )}

        <img
          src="/images/hero-clouds-fg.png"
          className="hero__mist-image"
          alt=""
          style={{
            transform: parallaxMist,
            opacity: 1 - fadeOut * 0.6,
          }}
        />

        <div
          className={`hero__content ${entered ? "hero__content--entered" : ""}`}
          style={{
            transform: `translate3d(-50%, calc(-50% + ${titleY}px), 0) scale(${titleScale})`,
            opacity: 1 - fadeOut,
          }}
        >
          <p className="hero__kicker">The Himalayan Highway</p>
          <h1 className="hero__title" aria-label="Drishya Trails">
            <span className="hero__title-line">DRISHYA</span>
            <span className="hero__title-line hero__title-line--accent">TRAILS</span>
          </h1>
          <p className="hero__subtitle">Where the road becomes the story.</p>
        </div>

        <div
          className={`hero__tags ${entered ? "hero__tags--entered" : ""}`}
          style={{
            transform: `translate3d(-50%, ${subtitleY}px, 0)`,
            opacity: 1 - fadeOut,
          }}
        >
          {["Shimla", "Manali", "Spiti", "Ladakh"].map((name, i) => (
            <span key={name} className="hero__tag" style={{ animationDelay: `${1.2 + i * 0.12}s` }}>
              {name}
            </span>
          ))}
        </div>

        <div
          className="hero__scroll-prompt"
          style={{ opacity: entered ? 1 - fadeOut : 0 }}
        >
          <span>Scroll to begin</span>
          <div className="hero__scroll-arrow" />
        </div>

        <div className="hero__bottom-fade" />
        <DecorativeFrame />
      </div>
    </section>
  );
}
