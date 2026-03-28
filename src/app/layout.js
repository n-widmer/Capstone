import "./globals.css";
import { Cormorant_Garamond } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import Navigation from "@/components/Navigation";
import PageTransition from "@/components/PageTransition";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "600"],
  variable: "--font-cormorant",
});

export const metadata = {
  title: "Tori & Connor's Wedding",
  description:
    "Wedding website for Tori & Connor — RSVP, venue info, accommodations, and more.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`antialiased bg-sky-200 min-h-screen ${cormorant.variable} font-[family-name:var(--font-cormorant)]`}>
        <Navigation />
        <PageTransition>{children}</PageTransition>
        <Analytics />
      </body>
    </html>
  );
}
