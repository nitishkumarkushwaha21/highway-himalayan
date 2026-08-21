"use client";
import { useRef, useEffect, useState } from "react";
import { useParallax } from "@/hooks/useParallax";
import { smoothstep, clamp } from "@/lib/animation";

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<(HTMLImageElement | null)[]>([]);
  const loadedRef = useRef<Set<number>>(new Set());
  const mouse = useParallax();
  const [scrollY, setScrollY] = useState(0);
  const [entered, setEntered] = useState(false);

  // Entrance animation
  useEffect(() => {
    const timer = setTimeout(() => setEntered(true), 200);
    return () => clearTimeout(timer);
  }, []);

  // Scroll tracking
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

  // Hero frame preloading (for hero video scrub)
  useEffect(() => {
    const count = 240;
    const images: (HTMLImageElement | null)[] = new Array(count).fill(null);
    imagesRef.current = images;
    let cancelled = false;

    const order: number[] = [];
    for (let i = 0; i < count; i += 10) order.push(i);
    for (let i = 0; i < count; i++) {
      if (!order.includes(i)) order.push(i);
    }

    const loadBatch = async (startIdx: number) => {
      if (cancelled) return;
      const batch = order.slice(startIdx, startIdx + 4);
      if (batch.length === 0) return;
      await Promise.all(
        batch.map(
          (idx) =>
            new Promise<void>((resolve) => {
              if (loadedRef.current.has(idx)) { resolve(); return; }
              const img = new Image();
              img.src = `/frames/hero/frame_${String(idx + 1).padStart(4, "0")}.webp`;
              img.onload = () => {
                if (!cancelled) { images[idx] = img; loadedRef.current.add(idx); }
                resolve();
              };
              img.onerror = () => resolve();
            })
        )
      );
      if (!cancelled) requestAnimationFrame(() => loadBatch(startIdx + 4));
    };
    loadBatch(0);
    return () => { cancelled = true; };
  }, []);

  // Draw hero frame
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const progress = smoothstep(0, 700, scrollY);
    const idx = Math.round(clamp(progress) * 239);

    let best = idx;
    if (!loadedRef.current.has(idx)) {
      for (let offset = 1; offset < 240; offset++) {
        if (loadedRef.current.has(idx - offset)) { best = idx - offset; break; }
        if (loadedRef.current.has(idx + offset)) { best = idx + offset; break; }
      }
    }

    const img = imagesRef.current[best];
    if (img) {
      canvas.width = 1920;
      canvas.height = 1080;
      ctx.clearRect(0, 0, 1920, 1080);
      ctx.drawImage(img, 0, 0, 1920, 1080);
    }
  }, [scrollY]);

  const fadeOut = smoothstep(200, 700, scrollY);
  const titleY = fadeOut * -140;
  const titleScale = 1 - fadeOut * 0.06;
  const subtitleY = fadeOut * 70;

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
          style={{
            transform: `translate3d(${mouse.x * -20}px, ${mouse.y * -10}px, 0) scale(1.15)`,
          }}
        />

        {/* Video frame canvas */}
        <canvas
          ref={canvasRef}
          className="hero__canvas"
          width={1920}
          height={1080}
        />

        <img
          src="/images/hero-clouds-fg.png"
          className="hero__mist-image"
          alt=""
          style={{
            transform: `translate3d(${mouse.x * 12}px, 0, 0)`,
            opacity: 1 - fadeOut * 0.6,
          }}
        />

        {/* Hero content */}
        <div
          className={`hero__content ${entered ? "hero__content--entered" : ""}`}
          style={{
            transform: `translate3d(-50%, calc(-50% + ${titleY}px), 0) scale(${titleScale})`,
            opacity: 1 - fadeOut,
          }}
        >
          <p className="hero__kicker">The Himalayan Highway</p>
          <h1 className="hero__title">
            <span className="hero__title-line">DRISHYA</span>
            <span className="hero__title-line hero__title-line--accent">TRAILS</span>
          </h1>
          <p className="hero__subtitle">Where the road becomes the story.</p>
        </div>

        {/* Route tags */}
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

        {/* Scroll prompt */}
        <div
          className="hero__scroll-prompt"
          style={{ opacity: entered ? 1 - fadeOut : 0 }}
        >
          <span>Scroll to begin</span>
          <div className="hero__scroll-arrow" />
        </div>

        <div className="hero__bottom-fade" />
      </div>
    </section>
  );
}
