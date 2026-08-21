"use client";
import { useRef, useEffect, useState, useMemo } from "react";
import { clamp, smoothstep, lerp } from "@/lib/animation";
import { destinations } from "@/lib/destinations";

interface MapJourneyProps {
  /** Which segment (0-3) is currently active */
  segmentIndex: number;
  /** 0-1 progress within the current map segment */
  segmentProgress: number;
}

// SVG path control points for each destination on the map
// These map to positions on a 1200x2400 SVG viewBox (vertical map)
const pinPositions = [
  { x: 600, y: 450, label: "Shimla" },
  { x: 480, y: 900, label: "Manali" },
  { x: 700, y: 1500, label: "Spiti" },
  { x: 550, y: 2050, label: "Ladakh" },
];

// The full route path (cubic bezier through all points)
const routePath = `M 600,200 
  C 580,300 620,380 600,450 
  C 570,550 430,750 480,900 
  C 530,1050 750,1300 700,1500 
  C 650,1700 500,1900 550,2050`;

export default function MapJourney({
  segmentIndex,
  segmentProgress,
}: MapJourneyProps) {
  const pathRef = useRef<SVGPathElement>(null);
  const [busPos, setBusPos] = useState({ x: 600, y: 200, angle: 0 });

  // Calculate the overall progress along the full path (0 to 1)
  const overallProgress = useMemo(() => {
    // Each segment is 25% of the path
    const base = segmentIndex * 0.25;
    return clamp(base + segmentProgress * 0.25, 0, 1);
  }, [segmentIndex, segmentProgress]);

  // Get bus position along the SVG path
  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;

    const totalLength = path.getTotalLength();
    const distance = overallProgress * totalLength;
    const point = path.getPointAtLength(distance);

    // Get a slightly ahead point for angle calculation
    const aheadDist = Math.min(distance + 5, totalLength);
    const ahead = path.getPointAtLength(aheadDist);
    const angle = Math.atan2(ahead.y - point.y, ahead.x - point.x) * (180 / Math.PI);

    setBusPos({ x: point.x, y: point.y, angle });
  }, [overallProgress]);

  return (
    <div className="map-journey">
      <svg
        viewBox="0 0 1200 2400"
        className="map-journey__svg"
        aria-label="Route map from Shimla to Ladakh"
      >
        {/* Terrain gradient background */}
        <defs>
          <linearGradient id="terrainGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2d5a27" /> {/* Green foothills */}
            <stop offset="30%" stopColor="#4a7a3f" />
            <stop offset="50%" stopColor="#8b9a7b" /> {/* Transition */}
            <stop offset="70%" stopColor="#a89279" /> {/* Brown barren */}
            <stop offset="100%" stopColor="#3a6b8a" /> {/* Lake blue tint */}
          </linearGradient>

          <filter id="routeGlow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Bus marker */}
          <filter id="busShadow">
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#000" floodOpacity="0.4" />
          </filter>
        </defs>

        {/* Terrain background */}
        <image
          href="/images/map-terrain.png"
          x="0"
          y="0"
          width="1200"
          height="2400"
          opacity="0.15"
          preserveAspectRatio="xMidYMid slice"
        />

        {/* Mountain texture hints */}
        {[300, 600, 900, 1200, 1500, 1800].map((y, i) => (
          <ellipse
            key={i}
            cx={400 + (i % 3) * 200}
            cy={y}
            rx={180 + (i % 2) * 60}
            ry={40 + (i % 3) * 20}
            fill="rgba(255,255,255,0.04)"
          />
        ))}

        {/* Route path — background (full, dim) */}
        <path
          d={routePath}
          fill="none"
          stroke="rgba(245,234,214,0.18)"
          strokeWidth="9"
          strokeDasharray="22 16"
          strokeLinecap="round"
        />

        {/* Route path — traveled portion (bright) */}
        <path
          ref={pathRef}
          d={routePath}
          fill="none"
          stroke="rgba(245,234,214,0.75)"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={`${overallProgress * 3200} 3200`}
          filter="url(#routeGlow)"
        />

        {/* Destination pins */}
        {pinPositions.map((pin, i) => {
          const isReached = overallProgress >= (i + 1) * 0.25 - 0.02;
          const isActive =
            segmentIndex === i && segmentProgress > 0.8;
          const dest = destinations[i];

          return (
            <g key={pin.label} className="map-journey__pin">
              {/* Pulse ring for active pin */}
              {isActive && (
                <>
                  <circle
                    cx={pin.x}
                    cy={pin.y}
                    r="120"
                    fill="none"
                    stroke={dest.color}
                    strokeWidth="4"
                    opacity="0.5"
                    className="map-journey__pulse"
                  />
                  <circle
                    cx={pin.x}
                    cy={pin.y}
                    r="90"
                    fill="none"
                    stroke={dest.color}
                    strokeWidth="3"
                    opacity="0.7"
                    className="map-journey__pulse"
                  />
                </>
              )}

              {/* Soft halo behind pin */}
              <circle
                cx={pin.x}
                cy={pin.y + 14}
                r="62"
                fill={dest.color}
                opacity={isReached ? 0.25 : 0.08}
                style={{ transition: "opacity 0.6s ease" }}
              />

              {/* Pin icon */}
              <image
                href={`/images/pin-${dest.id}.png`}
                x={pin.x - 80}
                y={pin.y - 140}
                width="160"
                height="160"
                opacity={isReached ? 1 : 0.55}
                preserveAspectRatio="xMidYMid meet"
                style={{ transition: "opacity 0.6s ease" }}
              />

              {/* Label */}
              <text
                x={pin.x + 96}
                y={pin.y + 14}
                fill="rgba(245,234,214,0.95)"
                fontSize="56"
                fontWeight="600"
                fontFamily="var(--font-body)"
                style={{
                  paintOrder: "stroke",
                  stroke: "rgba(26,23,20,0.8)",
                  strokeWidth: 7,
                }}
              >
                {pin.label}
              </text>
            </g>
          );
        })}

        {/* Bus */}
        <g
          transform={`translate(${busPos.x}, ${busPos.y}) rotate(${busPos.angle})`}
          filter="url(#busShadow)"
        >
          <image
            href="/images/bus-side.png"
            x="-70"
            y="-48"
            width="140"
            height="96"
            preserveAspectRatio="xMidYMid meet"
          />
        </g>
      </svg>
    </div>
  );
}
