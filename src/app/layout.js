import "./globals.css";
import { Cormorant_Garamond, Jost } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import Navigation from "@/components/Navigation";
import PageTransition from "@/components/PageTransition";
import FallingTulips from "@/components/FallingTulips";
import Preloader from "@/components/Preloader";
import { Footer } from "@/components/ui";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const jost = Jost({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-jost",
  display: "swap",
});

export const metadata = {
  title: "Tori & Connor's Wedding",
  description:
    "Wedding website for Tori & Connor. RSVP, venue info, accommodations, and more.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${jost.variable}`}>
      <body className="min-h-screen bg-paper text-ink antialiased">
        <Preloader />
        <FallingTulips />
        <Navigation />
        <PageTransition>{children}</PageTransition>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
