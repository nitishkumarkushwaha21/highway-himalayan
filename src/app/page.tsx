"use client";

import Hero from "@/components/Hero";
import MapSection from "@/components/MapSection";
import DestinationScene from "@/components/DestinationScene";
import SectionTransition from "@/components/SectionTransition";
import PackageCTA from "@/components/PackageCTA";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Preloader from "@/components/Preloader";
import ProgressIndicator from "@/components/ProgressIndicator";
import SoundToggle from "@/components/SoundToggle";
import { FrameLoadingProvider } from "@/hooks/useFrameLoading";
import { AudioProvider } from "@/hooks/useAudio";
import { destinations } from "@/lib/destinations";

const mapLabels = [
  { from: "Delhi", to: "Shimla" },
  { from: "Shimla", to: "Manali" },
  { from: "Manali", to: "Spiti" },
  { from: "Spiti", to: "Ladakh" },
];

export default function Home() {
  return (
    <FrameLoadingProvider>
      <AudioProvider>
      <Preloader />
      <ProgressIndicator />
      <SoundToggle />

      <main className="site-shell">
        <Navbar />
        <Hero />

        {destinations.map((dest, i) => (
          <div key={dest.id}>
            <SectionTransition
              label={`${mapLabels[i].from} → ${mapLabels[i].to} · Arriving at ${dest.title}`}
              color={dest.color}
            />
            <MapSection
              segmentIndex={i}
              fromLabel={mapLabels[i].from}
              toLabel={mapLabels[i].to}
            />
            <DestinationScene destination={dest} index={i} />
          </div>
        ))}

        {/* Final transition */}
        <SectionTransition label="Your journey awaits" color="#d4a574" />

        <PackageCTA />
        <Footer />
      </main>
      </AudioProvider>
    </FrameLoadingProvider>
  );
}
