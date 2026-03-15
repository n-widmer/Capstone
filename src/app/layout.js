// Anything placed here will appear on all pages automatically.

import "./globals.css";          
import Header from "@/components/header"; // shared header component
                                         
export const metadata = {
  title: "Tori & Connor's Wedding",
  description:
    "Wedding website for Tori & Connor — RSVP, venue info, accommodations, and more.",
};

// RootLayout receives `children` which represents whichever page is currently being visited.
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased"> {/* antialiased smooths out font rendering */}
        <Header />   {/* rendered above every page */}
        {children}   {/* the actual page content (e.g. Home, RSVP, etc.) renders here */}
      </body>
    </html>
  );
}
