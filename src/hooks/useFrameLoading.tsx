"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { destinations } from "@/lib/destinations";

interface FrameLoadingState {
  /** 0-1 overall progress */
  progress: number;
  /** Total frames to load */
  totalFrames: number;
  /** Frames loaded so far */
  loadedFrames: number;
  /** Which destination is currently loading */
  currentDestination: string;
  /** Fully loaded and ready */
  isReady: boolean;
  /** Loading has started */
  isLoading: boolean;
  /** Per-destination progress: { shimla: 0.4, manali: 0, ... } */
  destinationProgress: Record<string, number>;
}

const defaultState: FrameLoadingState = {
  progress: 0,
  totalFrames: 0,
  loadedFrames: 0,
  currentDestination: "",
  isReady: false,
  isLoading: false,
  destinationProgress: {},
};

const FrameLoadingContext = createContext<FrameLoadingState>(defaultState);

export function useFrameLoading() {
  return useContext(FrameLoadingContext);
}

/**
 * How many frames to actually preload per destination during the initial load.
 * We load keyframes (every Nth) first for fast scrubbing, then fill the rest lazily.
 */
const PRELOAD_KEYFRAME_STEP = 10; // load every 10th frame = ~24 frames per destination
const HERO_PRELOAD_COUNT = 12;

export function FrameLoadingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, setState] = useState<FrameLoadingState>(defaultState);
  const hasStarted = useRef(false);

  const preloadFrames = useCallback(async () => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    // Build the loading manifest
    const manifest: { dest: string; src: string }[] = [];

    // Hero keyframes first
    for (let i = 1; i <= 240; i += PRELOAD_KEYFRAME_STEP) {
      manifest.push({
        dest: "hero",
        src: `/frames/hero/frame_${String(i).padStart(4, "0")}.webp`,
      });
    }

    // Then each destination's keyframes
    for (const dest of destinations) {
      for (let i = 1; i <= dest.frameCount; i += PRELOAD_KEYFRAME_STEP) {
        manifest.push({
          dest: dest.id,
          src: `${dest.framePath}${String(i).padStart(4, "0")}.webp`,
        });
      }
    }

    const totalFrames = manifest.length;
    let loadedFrames = 0;
    const destProgress: Record<string, number> = {
      hero: 0,
      ...Object.fromEntries(destinations.map((d) => [d.id, 0])),
    };
    const destTotals: Record<string, number> = {};
    const destLoaded: Record<string, number> = {};

    // Count per-destination totals
    for (const item of manifest) {
      destTotals[item.dest] = (destTotals[item.dest] || 0) + 1;
      destLoaded[item.dest] = 0;
    }

    setState((prev) => ({
      ...prev,
      isLoading: true,
      totalFrames,
      currentDestination: "hero",
      destinationProgress: { ...destProgress },
    }));

    // Load in batches of 4 concurrently
    const BATCH_SIZE = 4;
    let currentDest = "hero";

    for (let i = 0; i < manifest.length; i += BATCH_SIZE) {
      const batch = manifest.slice(i, i + BATCH_SIZE);

      await Promise.all(
        batch.map(
          (item) =>
            new Promise<void>((resolve) => {
              const img = new Image();
              img.onload = () => {
                loadedFrames++;
                destLoaded[item.dest] = (destLoaded[item.dest] || 0) + 1;
                destProgress[item.dest] =
                  destLoaded[item.dest] / destTotals[item.dest];

                if (item.dest !== currentDest) {
                  currentDest = item.dest;
                }

                setState((prev) => ({
                  ...prev,
                  loadedFrames,
                  progress: loadedFrames / totalFrames,
                  currentDestination: currentDest,
                  destinationProgress: { ...destProgress },
                }));

                resolve();
              };
              img.onerror = () => {
                // Count as loaded even on error to prevent stalling
                loadedFrames++;
                resolve();
              };
              img.src = item.src;
            })
        )
      );
    }

    // Small delay for the reveal animation to feel intentional
    await new Promise((r) => setTimeout(r, 600));

    setState((prev) => ({
      ...prev,
      isReady: true,
      progress: 1,
      loadedFrames: totalFrames,
    }));
  }, []);

  useEffect(() => {
    // Start preloading after a brief moment to let the preloader render
    const timer = setTimeout(preloadFrames, 300);
    return () => clearTimeout(timer);
  }, [preloadFrames]);

  return (
    <FrameLoadingContext.Provider value={state}>
      {children}
    </FrameLoadingContext.Provider>
  );
}
