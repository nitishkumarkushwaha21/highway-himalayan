"use client";
import { useEffect, useState } from "react";
import { destinations } from "@/lib/destinations";

const sections = [
  { id: "hero", label: "Start" },
  ...destinations.map((d) => ({ id: d.id, label: d.title })),
  { id: "book", label: "Book" },
];

export default function ProgressIndicator() {
  const [activeId, setActiveId] = useState("hero");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      // Show after scrolling past hero
      setVisible(window.scrollY > window.innerHeight * 0.5);

      // Find which section is most in view
      let best = "hero";
      let bestScore = -Infinity;

      for (const section of sections) {
        const el = document.getElementById(section.id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        const center = rect.top + rect.height / 2;
        const viewCenter = window.innerHeight / 2;
        const score = -Math.abs(center - viewCenter);
        if (score > bestScore) {
          bestScore = score;
          best = section.id;
        }
      }
      setActiveId(best);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`progress-indicator ${visible ? "progress-indicator--visible" : ""}`}
      aria-label="Journey progress"
    >
      {sections.map((section, i) => (
        <a
          key={section.id}
          href={`#${section.id}`}
          className={`progress-indicator__dot ${
            activeId === section.id ? "progress-indicator__dot--active" : ""
          }`}
          aria-label={section.label}
          title={section.label}
        >
          <span className="progress-indicator__pip" />
          <span className="progress-indicator__label">{section.label}</span>
        </a>
      ))}
    </nav>
  );
}
