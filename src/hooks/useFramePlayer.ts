"use client";
import { useEffect, useRef, useCallback } from "react";
import { clamp } from "@/lib/animation";

interface FramePlayerOptions {
  framePath: string;
  frameCount: number;
  progress: number;
  width?: number;
  height?: number;
}

export function useFramePlayer({
  framePath,
  frameCount,
  progress,
  width = 1920,
  height = 1080,
}: FramePlayerOptions) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<(HTMLImageElement | null)[]>([]);
  const loadedRef = useRef<Set<number>>(new Set());
  const currentFrameRef = useRef(0);

  // Preload frames
  useEffect(() => {
    const images: (HTMLImageElement | null)[] = new Array(frameCount).fill(null);
    imagesRef.current = images;

    // Load frames in priority order: first, last, then fill in
    const loadOrder: number[] = [];

    // First 10 frames
    for (let i = 0; i < Math.min(10, frameCount); i++) loadOrder.push(i);
    // Last 10
    for (let i = Math.max(10, frameCount - 10); i < frameCount; i++) loadOrder.push(i);
    // Middle keyframes every 10th
    for (let i = 10; i < frameCount - 10; i += 10) loadOrder.push(i);
    // Fill remaining
    for (let i = 0; i < frameCount; i++) {
      if (!loadOrder.includes(i)) loadOrder.push(i);
    }

    let cancelled = false;

    const loadFrame = (index: number): Promise<void> => {
      return new Promise((resolve) => {
        if (cancelled || loadedRef.current.has(index)) {
          resolve();
          return;
        }
        const img = new Image();
        const padded = String(index + 1).padStart(4, "0");
        img.src = `${framePath}${padded}.webp`;
        img.onload = () => {
          if (!cancelled) {
            images[index] = img;
            loadedRef.current.add(index);
          }
          resolve();
        };
        img.onerror = () => resolve();
      });
    };

    // Load in batches of 6
    const loadBatch = async (startIdx: number) => {
      const batch = loadOrder.slice(startIdx, startIdx + 6);
      if (batch.length === 0 || cancelled) return;
      await Promise.all(batch.map(loadFrame));
      if (!cancelled) {
        requestAnimationFrame(() => loadBatch(startIdx + 6));
      }
    };

    loadBatch(0);

    return () => {
      cancelled = true;
    };
  }, [framePath, frameCount]);

  // Draw current frame
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const frameIndex = Math.round(clamp(progress) * (frameCount - 1));
    currentFrameRef.current = frameIndex;

    // Find the closest loaded frame
    let bestFrame = frameIndex;
    if (!loadedRef.current.has(frameIndex)) {
      // Search nearby
      for (let offset = 1; offset < frameCount; offset++) {
        if (loadedRef.current.has(frameIndex - offset)) {
          bestFrame = frameIndex - offset;
          break;
        }
        if (loadedRef.current.has(frameIndex + offset)) {
          bestFrame = frameIndex + offset;
          break;
        }
      }
    }

    const img = imagesRef.current[bestFrame];
    if (img) {
      canvas.width = width;
      canvas.height = height;
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
    }
  }, [progress, frameCount, width, height]);

  return { canvasRef };
}
