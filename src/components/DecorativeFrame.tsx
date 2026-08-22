"use client";

/**
 * A thin ornamental border with leaf/vine flourishes at each corner. Sits on
 * top of a scene to give a framed, "matted print" feel and a beautiful margin
 * without the heavy full-foliage overlays. Purely decorative.
 */
export default function DecorativeFrame({
  color = "#d4a574",
}: {
  color?: string;
}) {
  return (
    <div className="deco-frame" aria-hidden="true">
      <div className="deco-frame__border" />
      {(["tl", "tr", "bl", "br"] as const).map((pos) => (
        <svg
          key={pos}
          className={`deco-frame__corner deco-frame__corner--${pos}`}
          viewBox="0 0 120 120"
          fill="none"
          stroke={color}
        >
          {/* vine */}
          <path
            d="M4 40 C4 18 18 4 40 4"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.85"
          />
          {/* small leaves along the vine */}
          <path
            d="M14 20 C6 16 6 8 14 6 C16 14 22 16 20 22 C16 22 15 22 14 20Z"
            strokeWidth="1"
            fill={color}
            fillOpacity="0.14"
          />
          <path
            d="M30 10 C26 3 30 -2 37 1 C35 8 39 12 33 15 C31 13 30 12 30 10Z"
            strokeWidth="1"
            fill={color}
            fillOpacity="0.12"
          />
          <circle cx="4" cy="40" r="1.6" fill={color} stroke="none" />
          <circle cx="40" cy="4" r="1.6" fill={color} stroke="none" />
        </svg>
      ))}
    </div>
  );
}
