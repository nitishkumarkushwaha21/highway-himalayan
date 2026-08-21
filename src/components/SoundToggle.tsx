"use client";
import { useAudio } from "@/hooks/useAudio";

export default function SoundToggle() {
  const { enabled, toggle } = useAudio();

  return (
    <button
      className={`sound-toggle ${enabled ? "sound-toggle--on" : ""}`}
      onClick={toggle}
      aria-pressed={enabled}
      aria-label={enabled ? "Mute ambient sound" : "Play ambient sound"}
    >
      <span className="sound-toggle__bars" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </span>
      <span className="sound-toggle__label">{enabled ? "Sound on" : "Sound"}</span>
    </button>
  );
}
