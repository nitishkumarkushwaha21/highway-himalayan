"use client";
import { useEffect, useRef } from "react";
import { clamp } from "@/lib/animation";

interface FramePlayerOptions {
  framePath: string;
  frameCount: number;
  progress: number;
  width?: number;
  height?: number;
  /** Skip preloading entirely — used for reduced-motion / mobile fallbacks. */
  disabled?: boolean;
}

const KEYFRAME_STEP = 10;
const BATCH_SIZE = 4;

function buildLoadOrder(count: number): number[] {
  const seen = new Uint8Array(count);
  const order: number[] = [];
  for (let i = 0; i < count; i += KEYFRAME_STEP) {
    order.push(i);
    seen[i] = 1;
  }
  for (let i = 0; i < count; i++) {
    if (!seen[i]) order.push(i);
  }
  return order;
}

export function useFramePlayer({
  framePath,
  frameCount,
  progress,
  width = 1920,
  height = 1080,
  disabled = false,
}: FramePlayerOptions) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<(HTMLImageElement | null)[]>([]);
  const loadedRef = useRef<Set<number>>(new Set());
  const lastDrawnRef = useRef<number>(-1);

  useEffect(() => {
    if (disabled) return;
    const images: (HTMLImageElement | null)[] = new Array(frameCount).fill(null);
    imagesRef.current = images;
    loadedRef.current = new Set();
    lastDrawnRef.current = -1;

    const order = buildLoadOrder(frameCount);
    let cancelled = false;
    let cursor = 0;

    const loadNext = () => {
      if (cancelled || cursor >= order.length) return;
      const batch = order.slice(cursor, cursor + BATCH_SIZE);
      cursor += BATCH_SIZE;

      Promise.all(
        batch.map(
          (idx) =>
            new Promise<void>((resolve) => {
              const img = new Image();
              img.decoding = "async";
              img.src = `${framePath}${String(idx + 1).padStart(4, "0")}.webp`;
              img.onload = () => {
                if (!cancelled) {
                  images[idx] = img;
                  loadedRef.current.add(idx);
                }
                resolve();
              };
              img.onerror = () => resolve();
            }),
        ),
      ).then(() => {
        if (!cancelled) requestAnimationFrame(loadNext);
      });
    };

    loadNext();
    return () => {
      cancelled = true;
    };
  }, [framePath, frameCount, disabled]);

  useEffect(() => {
    if (disabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const target = Math.round(clamp(progress) * (frameCount - 1));

    let best = target;
    if (!loadedRef.current.has(target)) {
      if (lastDrawnRef.current >= 0) {
        best = lastDrawnRef.current;
      }
      for (let offset = 1; offset < frameCount; offset++) {
        if (loadedRef.current.has(target - offset)) {
          best = target - offset;
          break;
        }
        if (loadedRef.current.has(target + offset)) {
          best = target + offset;
          break;
        }
      }
    }

    const img = imagesRef.current[best];
    if (!img) return;

    if (canvas.width !== width) canvas.width = width;
    if (canvas.height !== height) canvas.height = height;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0, width, height);
    lastDrawnRef.current = best;
  }, [progress, frameCount, width, height, disabled]);

  return { canvasRef };
}
