"use client";
import { useRef, useEffect, useState } from "react";
import { useParallax } from "@/hooks/useParallax";
import { useFramePlayer } from "@/hooks/useFramePlayer";
import { useMotionSettings } from "@/hooks/useMotionSettings";
import { clamp, smoothstep, holdMap } from "@/lib/animation";
import DecorativeFrame from "@/components/DecorativeFrame";
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
  const mouse = useParallax();
  const [scroll, setScroll] = useState(0);
  const { reducedMotion, isMobile } = useMotionSettings();
  const disableFrames = reducedMotion || isMobile;

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

  // Reveal to the clip's sharpest "arrival" frame, hold there through the
  // reading beat (blurry middle frames only flash past during motion), then
  // finish the fly-through on exit.
  const frameProgress = holdMap(scroll, destination.holdFrac, 380, 1080, 1460);
  const { canvasRef } = useFramePlayer({
    framePath: destination.framePath,
    frameCount: destination.frameCount,
    progress: frameProgress,
    disabled: disableFrames,
  });

  // Text beats: gentle, well-separated windows so nothing flashes past.
  const titleEnter = smoothstep(150, 480, scroll);
  const titleExit = smoothstep(720, 980, scroll);
  const factsEnter = smoothstep(820, 1080, scroll);
  const factsExit = smoothstep(1240, 1440, scroll);
  const tagsEnter = smoothstep(980, 1200, scroll);
  const tagsExit = smoothstep(1300, 1480, scroll);
  const sceneExit = smoothstep(1320, 1500, scroll);

  const parallaxScale = reducedMotion ? 0 : 1;
  const bgY = mouse.y * -8 * parallaxScale;
  const bgX = mouse.x * -12 * parallaxScale;
  const fgX = mouse.x * 15 * parallaxScale;
  const fgY = mouse.y * 10 * parallaxScale;

  const titleActive = titleEnter * (1 - titleExit);
  const factsActive = factsEnter * (1 - factsExit);
  const tagsActive = tagsEnter * (1 - tagsExit);

  // Shimla and Manali already have busy, cloud-heavy frames — the extra mist
  // overlay made them look overcrowded, so it's dropped for those two.
  const midLayerSrc =
    destination.id === "spiti"
      ? "/images/spiti-dust.png"
      : destination.id === "ladakh"
        ? "/images/ladakh-water.png"
        : null;

  return (
    <section
      ref={sectionRef}
      id={destination.id}
      className="dest-scene"
      aria-label={`${destination.title} destination`}
      style={{ height: "calc(100vh + 1500px)" }}
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

        {!disableFrames && (
          <canvas
            ref={canvasRef}
            className="dest-scene__canvas"
            width={1920}
            height={1080}
            style={{
              opacity: clamp(frameProgress * 1.8),
              transform: `translate3d(${mouse.x * 6 * parallaxScale}px, ${mouse.y * 4 * parallaxScale}px, 0) scale(${1.02 + frameProgress * 0.06})`,
            }}
          />
        )}

        {midLayerSrc && (
          <img
            src={midLayerSrc}
            className="dest-scene__mid-img"
            alt=""
            style={{
              opacity: 0.3 + frameProgress * 0.3,
              transform: `translate3d(${mouse.x * 6 * parallaxScale}px, ${-frameProgress * 30}px, 0)`,
            }}
          />
        )}

        <img
          src={`/images/${destination.id}-fg.png`}
          className="dest-scene__fg-img"
          alt=""
          style={{
            transform: `translate3d(${fgX}px, ${fgY}px, 0)`,
            opacity: 1 - sceneExit * 0.5,
          }}
        />

        <div
          className="dest-scene__tint"
          style={{
            background: `radial-gradient(ellipse at 50% 60%, transparent 30%, ${destination.color}33 100%)`,
            opacity: 0.3 + frameProgress * 0.25,
          }}
        />

        <div className="dest-scene__vignette" />

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

        <DecorativeFrame color={destination.color} />
      </div>
    </section>
  );
}
