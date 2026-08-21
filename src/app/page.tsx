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
import CustomCursor from "@/components/CustomCursor";
import { FrameLoadingProvider } from "@/hooks/useFrameLoading";
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
      <Preloader />
      <CustomCursor />
      <ProgressIndicator />

      <main className="site-shell">
        <Navbar />
        <Hero />

        {destinations.map((dest, i) => (
          <div key={dest.id}>
            {/* Transition into map */}
            <SectionTransition
              label={`${mapLabels[i].from} → ${mapLabels[i].to}`}
              color={dest.color}
            />

            {/* Map segment */}
            <MapSection
              segmentIndex={i}
              fromLabel={mapLabels[i].from}
              toLabel={mapLabels[i].to}
            />

            {/* Transition into destination */}
            <SectionTransition
              label={`Arriving at ${dest.title}`}
              color={dest.color}
            />

            {/* Destination cinematic scene */}
            <DestinationScene destination={dest} index={i} />
          </div>
        ))}

        {/* Final transition */}
        <SectionTransition label="Your journey awaits" color="#d4a574" />

        <PackageCTA />
        <Footer />
      </main>
    </FrameLoadingProvider>
  );
}
