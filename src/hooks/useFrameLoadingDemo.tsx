"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";

/**
 * Drop-in replacement for FrameLoadingProvider that simulates loading.
 * Use this during development when you don't have real frame assets yet.
 *
 * In page.tsx, swap:
 *   import { FrameLoadingProvider } from "@/hooks/useFrameLoading";
 * with:
 *   import { FrameLoadingProvider } from "@/hooks/useFrameLoadingDemo";
 */

interface FrameLoadingState {
  progress: number;
  totalFrames: number;
  loadedFrames: number;
  currentDestination: string;
  isReady: boolean;
  isLoading: boolean;
  destinationProgress: Record<string, number>;
}

const defaultState: FrameLoadingState = {
  progress: 0,
  totalFrames: 120,
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

const DESTINATIONS = ["hero", "shimla", "manali", "spiti", "ladakh"];
const SIM_DURATION = 4500; // Total simulated loading time in ms

export function FrameLoadingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, setState] = useState<FrameLoadingState>(defaultState);
  const startTime = useRef(0);

  useEffect(() => {
    startTime.current = Date.now();

    const destProgress: Record<string, number> = {};
    DESTINATIONS.forEach((d) => (destProgress[d] = 0));

    setState((prev) => ({
      ...prev,
      isLoading: true,
      destinationProgress: { ...destProgress },
    }));

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime.current;
      const raw = Math.min(elapsed / SIM_DURATION, 1);
      // Ease-out curve for natural feel
      const progress = 1 - Math.pow(1 - raw, 2.5);

      // Determine which destination is "loading"
      const destIndex = Math.min(
        Math.floor(progress * DESTINATIONS.length),
        DESTINATIONS.length - 1
      );
      const currentDest = DESTINATIONS[destIndex];

      // Update per-dest progress
      const newDestProgress: Record<string, number> = {};
      DESTINATIONS.forEach((d, i) => {
        if (i < destIndex) newDestProgress[d] = 1;
        else if (i === destIndex) {
          const segStart = i / DESTINATIONS.length;
          const segEnd = (i + 1) / DESTINATIONS.length;
          newDestProgress[d] = Math.min(
            (progress - segStart) / (segEnd - segStart),
            1
          );
        } else {
          newDestProgress[d] = 0;
        }
      });

      const loadedFrames = Math.round(progress * 120);

      setState({
        progress,
        totalFrames: 120,
        loadedFrames,
        currentDestination: currentDest,
        isReady: progress >= 1,
        isLoading: true,
        destinationProgress: newDestProgress,
      });

      if (progress >= 1) {
        clearInterval(interval);
      }
    }, 30);

    return () => clearInterval(interval);
  }, []);

  return (
    <FrameLoadingContext.Provider value={state}>
      {children}
    </FrameLoadingContext.Provider>
  );
}
