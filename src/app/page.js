import Image from "next/image";
import Link from "next/link";
import FallingTulips from "@/components/FallingTulips";
import CountdownTimer from "@/components/CountdownTimer";

export default function Home() {
  const venueAddress = "3931 State Route 39 NW Dover, OH 44622";
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venueAddress)}`;

  return (
    <main className="relative flex min-h-screen flex-col items-center py-8 bg-amber-200">
      <FallingTulips />
      {/* Hero Image - Cropped Landscape View */}
      <div className="relative w-full max-w-5xl h-[600px] md:h-[950px] overflow-hidden mb-12">
        <Image
          src="/hero-photo.jpg"
          alt="Tori and Connor"
          fill
          className="object-cover object-[center_10%]"
          style={{ filter: "grayscale(100%)" }}
          priority
        />
      </div>

      <CountdownTimer />

      {/* Venue & Date Section */}
      <div className="text-center px-4 mb-16 max-w-3xl mx-auto">
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="w-16 h-px bg-sky-800/40"></div>
          <span className="font-[family-name:var(--font-cormorant)] text-sm tracking-[0.25em] uppercase text-sky-800">The Celebration</span>
          <div className="w-16 h-px bg-sky-800/40"></div>
        </div>

        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-[family-name:var(--font-cormorant)] text-3xl md:text-4xl text-sky-900 hover:text-sky-700 transition-colors cursor-pointer block mb-3"
        >
          Yellowbrick on 39
        </a>

        <p className="font-[family-name:var(--font-cormorant)] text-sm tracking-widest uppercase text-sky-700/80 mb-8">
          {venueAddress}
        </p>

        <Link
          href="/rsvp"
          className="font-[family-name:var(--font-cormorant)] inline-block px-10 py-3 border border-sky-900 text-sky-900 text-sm tracking-[0.2em] uppercase hover:bg-sky-900 hover:text-white transition-all cursor-pointer"
        >
          RSVP
        </Link>
      </div>

      {/* Wedding Details */}
      <div className="max-w-3xl mx-auto px-4 mb-16">
        <div className="flex items-center justify-center gap-4 mb-10">
          <div className="w-16 h-px bg-sky-800/40"></div>
          <span className="font-[family-name:var(--font-cormorant)] text-sm tracking-[0.25em] uppercase text-sky-800">Details</span>
          <div className="w-16 h-px bg-sky-800/40"></div>
        </div>

        <div className="space-y-10 text-center">
          {/* Parking */}
          <div>
            <h2 className="font-[family-name:var(--font-cormorant)] text-2xl text-sky-900 mb-3">Parking</h2>
            <p className="font-[family-name:var(--font-cormorant)] text-sky-800/70 leading-relaxed max-w-xl mx-auto">
              Accessible parking is located near the cottage. Please save this for those who need to utilize it.
            </p>
          </div>

          <div className="w-12 h-px bg-sky-800/20 mx-auto"></div>

          {/* Important Notice */}
          <div>
            <h2 className="font-[family-name:var(--font-cormorant)] text-2xl text-sky-900 mb-3">Please Note</h2>
            <p className="font-[family-name:var(--font-cormorant)] text-sky-800/70 leading-relaxed max-w-xl mx-auto">
              <strong>There WILL be a sheriff monitoring for drunk driving. We will also be providing a shuttle service to and from the hotel. If you choose not to use this PLEASE plan accordingly and arrange for safe transportation!!</strong>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
