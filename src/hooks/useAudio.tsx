"use client";
import {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback,
  useEffect,
} from "react";

/**
 * Procedural, subtle audio — everything is synthesized with the Web Audio API,
 * so there are no asset files to ship and nothing autoplays. Sound stays OFF
 * until the user opts in (browsers block autoplay anyway) and reduced-motion
 * users never hear it. Levels are deliberately low.
 */

interface AudioApi {
  enabled: boolean;
  toggle: () => void;
  whoosh: () => void;
  chime: (freq?: number) => void;
  click: () => void;
}

const AudioContextValue = createContext<AudioApi>({
  enabled: false,
  toggle: () => {},
  whoosh: () => {},
  chime: () => {},
  click: () => {},
});

export function useAudio() {
  return useContext(AudioContextValue);
}

type Ctx = AudioContext & { _started?: boolean };

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabled] = useState(false);
  const ctxRef = useRef<Ctx | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const ambientStopRef = useRef<(() => void) | null>(null);
  const reducedRef = useRef(false);

  useEffect(() => {
    reducedRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
  }, []);

  const ensureCtx = useCallback((): Ctx | null => {
    if (typeof window === "undefined") return null;
    if (!ctxRef.current) {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (!AC) return null;
      const ctx = new AC() as Ctx;
      const master = ctx.createGain();
      master.gain.value = 0.0001;
      master.connect(ctx.destination);
      ctxRef.current = ctx;
      masterRef.current = master;
    }
    return ctxRef.current;
  }, []);

  // Ambient bed: filtered noise (wind) + two detuned low sines (altitude drone).
  const startAmbient = useCallback(() => {
    const ctx = ctxRef.current;
    const master = masterRef.current;
    if (!ctx || !master || ambientStopRef.current) return;

    const bed = ctx.createGain();
    bed.gain.value = 0.6;
    bed.connect(master);

    // Wind — pink-ish noise through a lowpass that slowly drifts.
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuf = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = noiseBuf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.5;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuf;
    noise.loop = true;
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = "lowpass";
    noiseFilter.frequency.value = 480;
    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.5;
    noise.connect(noiseFilter).connect(noiseGain).connect(bed);
    noise.start();

    // Slow LFO on the wind filter so it breathes.
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.06;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 220;
    lfo.connect(lfoGain).connect(noiseFilter.frequency);
    lfo.start();

    // Low drone.
    const droneGain = ctx.createGain();
    droneGain.gain.value = 0.12;
    droneGain.connect(bed);
    const o1 = ctx.createOscillator();
    o1.type = "sine";
    o1.frequency.value = 55;
    const o2 = ctx.createOscillator();
    o2.type = "sine";
    o2.frequency.value = 55.4; // slight detune = movement
    o1.connect(droneGain);
    o2.connect(droneGain);
    o1.start();
    o2.start();

    ambientStopRef.current = () => {
      try {
        noise.stop();
        lfo.stop();
        o1.stop();
        o2.stop();
      } catch {
        /* already stopped */
      }
    };
  }, []);

  const toggle = useCallback(() => {
    if (reducedRef.current) return;
    if (!enabled) {
      const ctx = ensureCtx();
      if (!ctx) return;
      void ctx.resume();
      const master = masterRef.current!;
      const now = ctx.currentTime;
      master.gain.cancelScheduledValues(now);
      master.gain.setValueAtTime(Math.max(master.gain.value, 0.0001), now);
      master.gain.exponentialRampToValueAtTime(0.5, now + 1.2);
      startAmbient();
      setEnabled(true);
    } else {
      const ctx = ctxRef.current;
      const master = masterRef.current;
      if (ctx && master) {
        const now = ctx.currentTime;
        master.gain.cancelScheduledValues(now);
        master.gain.setValueAtTime(master.gain.value, now);
        master.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
      }
      window.setTimeout(() => {
        ambientStopRef.current?.();
        ambientStopRef.current = null;
      }, 700);
      setEnabled(false);
    }
  }, [enabled, ensureCtx, startAmbient]);

  // ---- one-shot UI sounds (no-ops until enabled) ----
  const blip = useCallback(
    (type: OscillatorType, freq: number, dur: number, peak: number) => {
      const ctx = ctxRef.current;
      const master = masterRef.current;
      if (!ctx || !master || !enabled) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, now);
      g.gain.exponentialRampToValueAtTime(peak, now + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
      osc.connect(g).connect(master);
      osc.start(now);
      osc.stop(now + dur + 0.02);
    },
    [enabled],
  );

  const whoosh = useCallback(() => {
    const ctx = ctxRef.current;
    const master = masterRef.current;
    if (!ctx || !master || !enabled) return;
    const now = ctx.currentTime;
    const bufferSize = Math.floor(0.6 * ctx.sampleRate);
    const buf = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.setValueAtTime(300, now);
    bp.frequency.exponentialRampToValueAtTime(1600, now + 0.5);
    bp.Q.value = 0.7;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(0.12, now + 0.18);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
    src.connect(bp).connect(g).connect(master);
    src.start(now);
    src.stop(now + 0.62);
  }, [enabled]);

  const chime = useCallback(
    (freq = 660) => {
      blip("sine", freq, 0.9, 0.16);
      blip("sine", freq * 2.01, 0.7, 0.06);
    },
    [blip],
  );

  const click = useCallback(() => blip("triangle", 340, 0.09, 0.1), [blip]);

  useEffect(() => {
    return () => {
      ambientStopRef.current?.();
      void ctxRef.current?.close();
    };
  }, []);

  return (
    <AudioContextValue.Provider
      value={{ enabled, toggle, whoosh, chime, click }}
    >
      {children}
    </AudioContextValue.Provider>
  );
}
