import "./globals.css";

export const metadata = {
  title: "Tori & Connor's Wedding",
  description:
    "Wedding website for Tori & Connor — RSVP, venue info, accommodations, and more.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
