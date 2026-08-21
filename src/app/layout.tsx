import type { Metadata } from "next";
import "./globals.css";
import "./preloader.css";

export const metadata: Metadata = {
  title: "Drishya Trails — The Himalayan Highway",
  description:
    "Four stops. One road. Fourteen days. A cinematic journey from Shimla to Ladakh through the heart of the Himalayas.",
  icons: { icon: "data:," },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
