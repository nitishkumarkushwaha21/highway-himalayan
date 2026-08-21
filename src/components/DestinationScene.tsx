"use client";
import { useRef, useEffect, useState, useMemo } from "react";
import { useParallax } from "@/hooks/useParallax";
import { clamp, smoothstep, lerp } from "@/lib/animation";
import type { Destination } from "@/lib/destinations";

interface DestinationSceneProps {
  destination: Destination;
  index: number;
}

export default function DestinationScene({
  destination,
  index,
}: DestinationSceneProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<(HTMLImageElement | null)[]>([]);
  const loadedSetRef = useRef<Set<number>>(new Set());
  const mouse = useParallax();
  const [scroll, setScroll] = useState(0);

  // Scroll tracking
  useEffect(() => {
    const onScroll = () => {
      const section = sectionRef.current;
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const totalScroll = section.offsetHeight - window.innerHeight;
      setScroll(clamp(-rect.top, 0, totalScroll));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Frame preloading
  useEffect(() => {
    const count = destination.frameCount;
    const images: (HTMLImageElement | null)[] = new Array(count).fill(null);
    imagesRef.current = images;
    let cancelled = false;

    // Priority load order: every 10th first, then fill
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
          (frameIdx) =>
            new Promise<void>((resolve) => {
              if (loadedSetRef.current.has(frameIdx)) { resolve(); return; }
              const img = new Image();
              const padded = String(frameIdx + 1).padStart(4, "0");
              img.src = `${destination.framePath}${padded}.webp`;
              img.onload = () => {
                if (!cancelled) {
                  images[frameIdx] = img;
                  loadedSetRef.current.add(frameIdx);
                }
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
  }, [destination.framePath, destination.frameCount]);

  // Draw frame on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const frameProgress = smoothstep(0, 900, scroll);
    const frameIndex = Math.round(clamp(frameProgress) * (destination.frameCount - 1));

    // Find closest loaded frame
    let best = frameIndex;
    if (!loadedSetRef.current.has(frameIndex)) {
      for (let offset = 1; offset < destination.frameCount; offset++) {
        if (loadedSetRef.current.has(frameIndex - offset)) { best = frameIndex - offset; break; }
        if (loadedSetRef.current.has(frameIndex + offset)) { best = frameIndex + offset; break; }
      }
    }

    const img = imagesRef.current[best];
    if (img) {
      canvas.width = 1920;
      canvas.height = 1080;
      ctx.clearRect(0, 0, 1920, 1080);
      ctx.drawImage(img, 0, 0, 1920, 1080);
    }
  }, [scroll, destination.frameCount]);

  // Animation segments
  const frameProgress = smoothstep(0, 900, scroll);
  const titleEnter = smoothstep(50, 350, scroll);
  const titleHold = smoothstep(350, 500, scroll);
  const titleExit = smoothstep(500, 720, scroll);
  const factsEnter = smoothstep(420, 680, scroll);
  const factsExit = smoothstep(780, 980, scroll);
  const tagsEnter = smoothstep(600, 800, scroll);
  const tagsExit = smoothstep(900, 1100, scroll);
  const sceneExit = smoothstep(1000, 1200, scroll);

  // Parallax
  const bgY = mouse.y * -8;
  const bgX = mouse.x * -12;
  const fgX = mouse.x * 15;
  const fgY = mouse.y * 10;

  const titleActive = titleEnter * (1 - titleExit);
  const factsActive = factsEnter * (1 - factsExit);
  const tagsActive = tagsEnter * (1 - tagsExit);

  const midLayerSrc =
    destination.id === "spiti"
      ? "/images/spiti-dust.png"
      : destination.id === "ladakh"
        ? "/images/ladakh-water.png"
        : `/images/${destination.id}-mist.png`;

  return (
    <section
      ref={sectionRef}
      id={destination.id}
      className="dest-scene"
      aria-label={`${destination.title} destination`}
      style={{ height: "calc(100vh + 1200px)" }}
    >
      <div className="dest-scene__stage">
        <img
          src={`/images/${destination.id}-bg.png`}
          className="dest-scene__bg-img"
          alt=""
          style={{
            transform: `translate3d(${bgX}px, ${bgY}px, 0) scale(1.15)`,
          }}
        />

        {/* Frame canvas */}
        <canvas
          ref={canvasRef}
          className="dest-scene__canvas"
          width={1920}
          height={1080}
          style={{
            opacity: clamp(frameProgress * 1.8),
            transform: `translate3d(${mouse.x * 6}px, ${mouse.y * 4}px, 0) scale(${1.02 + frameProgress * 0.06})`,
          }}
        />

        <img
          src={midLayerSrc}
          className="dest-scene__mid-img"
          alt=""
          style={{
            opacity: 0.3 + frameProgress * 0.3,
            transform: `translate3d(${mouse.x * 6}px, ${-frameProgress * 30}px, 0)`,
          }}
        />

        <img
          src={`/images/${destination.id}-fg.png`}
          className="dest-scene__fg-img"
          alt=""
          style={{
            transform: `translate3d(${fgX}px, ${fgY}px, 0)`,
            opacity: 1 - sceneExit * 0.5,
          }}
        />

        {/* Color tint overlay */}
        <div
          className="dest-scene__tint"
          style={{
            background: `radial-gradient(ellipse at 50% 60%, transparent 30%, ${destination.color}33 100%)`,
            opacity: 0.3 + frameProgress * 0.25,
          }}
        />

        {/* Vignette */}
        <div className="dest-scene__vignette" />

        {/* ──── Title Panel ──── */}
        <div
          className="dest-scene__panel dest-scene__title-panel"
          style={{
            opacity: titleActive,
            transform: `translate3d(-50%, calc(-50% + ${(1 - titleEnter) * 70 - titleExit * 90}px), 0)`,
          }}
        >
          <span className="dest-scene__kicker">{destination.kicker}</span>
          <h2 className="dest-scene__title">{destination.title}</h2>
          <p className="dest-scene__subtitle">{destination.subtitle}</p>
        </div>

        {/* ──── Body + Facts Panel ──── */}
        <div
          className="dest-scene__panel dest-scene__facts-panel"
          style={{
            opacity: factsActive,
            transform: `translate3d(-50%, calc(-50% + ${(1 - factsEnter) * 70 - factsExit * 90}px), 0)`,
          }}
        >
          <p className="dest-scene__body">{destination.body}</p>
          <dl className="dest-scene__facts">
            {destination.facts.map((fact, i) => (
              <div key={i} className="dest-scene__fact">
                <dt>{fact.value}</dt>
                <dd>{fact.label}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* ──── Tags ──── */}
        <div
          className="dest-scene__tags"
          style={{
            opacity: tagsActive,
            transform: `translate3d(-50%, ${(1 - tagsEnter) * 40}px, 0)`,
          }}
        >
          {destination.tags.map((tag, i) => (
            <span
              key={tag}
              className="dest-scene__tag"
              style={{
                borderColor: `${destination.color}66`,
                color: destination.color,
                transitionDelay: `${i * 60}ms`,
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Destination number */}
        <div className="dest-scene__index" style={{ color: destination.color }}>
          <span className="dest-scene__index-num">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="dest-scene__index-total">/ 04</span>
        </div>
      </div>
    </section>
  );
}
