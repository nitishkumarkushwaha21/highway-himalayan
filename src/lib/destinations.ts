export interface Destination {
  id: string;
  kicker: string;
  title: string;
  subtitle: string;
  body: string;
  facts: { label: string; value: string }[];
  tags: string[];
  color: string;
  accentGradient: string;
  frameCount: number;
  framePath: string;
  /**
   * 0-1 position of the sharpest "arrival" frame in the clip. The scrubber
   * holds here during the text-reading beat so the frame people actually
   * stare at is always clean — the blurrier middle frames only flash past
   * during motion, where blur is far less noticeable. Auto-picked via
   * ffmpeg blurdetect over the 30–85% reveal window.
   */
  holdFrac: number;
}

export const destinations: Destination[] = [
  {
    id: "shimla",
    kicker: "First stop",
    title: "Shimla",
    subtitle: "The Queen of Hills",
    body: "Colonial charm meets mountain air. Walk the Ridge at sunrise, ride the UNESCO toy train through 102 tunnels, and watch the valley light shift from gold to violet.",
    facts: [
      { label: "Founded", value: "1864" },
      { label: "Elevation", value: "2,276 m" },
      { label: "Highlight", value: "Toy Train — UNESCO Heritage" },
    ],
    tags: ["Heritage", "Hill Station", "Golden Hour"],
    color: "#d4a574",
    accentGradient: "linear-gradient(135deg, #d4a574 0%, #8b6914 100%)",
    frameCount: 240,
    framePath: "/frames/shimla/frame_",
    holdFrac: 0.385,
  },
  {
    id: "manali",
    kicker: "Second stop",
    title: "Manali",
    subtitle: "Where Rivers Run White",
    body: "Apple orchards, the roaring Beas, and snow that never feels far away. Rohtang is the gateway — everything after this point is raw altitude.",
    facts: [
      { label: "Elevation", value: "2,050 m" },
      { label: "Rohtang Pass", value: "3,978 m" },
      { label: "River", value: "Beas — origin point" },
    ],
    tags: ["Adventure", "Snow Peaks", "River Valley"],
    color: "#a8d5e2",
    accentGradient: "linear-gradient(135deg, #a8d5e2 0%, #4a90a4 100%)",
    frameCount: 240,
    framePath: "/frames/manali/frame_",
    holdFrac: 0.418,
  },
  {
    id: "spiti",
    kicker: "Third stop",
    title: "Spiti",
    subtitle: "The Middle Land",
    body: "A cold desert between Tibet and India where monasteries cling to cliffs and the night sky is the clearest you'll ever see. This is where the road tests you.",
    facts: [
      { label: "Key Monastery", value: "4,166 m" },
      { label: "Population", value: "~12,000" },
      { label: "Sun", value: "250 sunny days/year" },
    ],
    tags: ["Monastery", "Stargazing", "Moonscape"],
    color: "#b8a089",
    accentGradient: "linear-gradient(135deg, #b8a089 0%, #6b5a47 100%)",
    frameCount: 240,
    framePath: "/frames/spiti/frame_",
    holdFrac: 0.351,
  },
  {
    id: "ladakh",
    kicker: "Final destination",
    title: "Ladakh",
    subtitle: "The Last Horizon",
    body: "Pangong Lake changes color five times before noon. Prayer flags mark every pass. The silence at 5,000 meters is the loudest thing you'll hear on this trip.",
    facts: [
      { label: "Pangong Lake", value: "4,350 m" },
      { label: "Khardung La", value: "5,359 m" },
      { label: "Lake length", value: "134 km" },
    ],
    tags: ["Pangong Lake", "High Passes", "Prayer Flags"],
    color: "#2e5c8a",
    accentGradient: "linear-gradient(135deg, #2e5c8a 0%, #0077b6 100%)",
    frameCount: 240,
    framePath: "/frames/ladakh/frame_",
    holdFrac: 0.787,
  },
];

export const mapSegments = [
  { from: null, to: "shimla", label: "Start → Shimla" },
  { from: "shimla", to: "manali", label: "Shimla → Manali" },
  { from: "manali", to: "spiti", label: "Manali → Spiti" },
  { from: "spiti", to: "ladakh", label: "Spiti → Ladakh" },
];
