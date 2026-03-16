import Image from "next/image";
import Link from "next/link";

export default function Home() {
  const venueAddress = "3931 State Route 39 NW Dover, OH 44622";
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venueAddress)}`;

  return (
    <main className="relative flex min-h-screen flex-col items-center bg-gradient-to-b from-sky-100 to-amber-100 py-12">
      {/* Hero Image with Black & White Filter */}
      <div className="relative w-full max-w-2xl mb-12 px-4">
        <div className="relative">
          <Image
            src="/hero-photo.jpg"
            alt="Tori and Connor"
            width={800}
            height={600}
            className="rounded-lg shadow-2xl border-4 border-emerald-400"
            style={{ filter: "grayscale(100%)" }}
            priority
          />
        </div>
      </div>

      {/* Wedding Details */}
      <div className="text-center space-y-6 px-4 mb-12">
        <h1 className="text-5xl md:text-6xl font-serif font-light tracking-wide text-emerald-800">
          Tori Campbell & Connor Quinn
        </h1>

        <div className="flex flex-col items-center space-y-3">
          <p className="text-2xl md:text-3xl font-light text-sky-600">
            May 22, 2027
          </p>

          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xl md:text-2xl text-sky-700 hover:text-sky-900 hover:underline transition-colors cursor-pointer font-medium"
          >
            Yellowbrick on 39
          </a>

          <p className="text-sm text-emerald-700">
            {venueAddress}
          </p>
        </div>
      </div>

      {/* RSVP Button */}
      <div className="mb-12">
        <Link
          href="/rsvp"
          className="inline-block px-8 py-4 bg-amber-500 text-emerald-900 text-lg font-semibold rounded-lg hover:bg-amber-600 transition-colors cursor-pointer shadow-lg border-2 border-emerald-500"
        >
          RSVP Here
        </Link>
      </div>

      {/* Venue Information */}
      <div className="max-w-3xl mx-auto px-4 space-y-8 mb-12">
        {/* Parking */}
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-emerald-500">
          <h2 className="text-xl font-semibold mb-3 text-emerald-800">Parking</h2>
          <p className="text-gray-700">
            Accessible parking is located near the cottage. Please save this for those who need to utilize it.
          </p>
        </div>

        {/* Hotel & Shuttle - Placeholder */}
        <div className="bg-sky-50 p-6 rounded-lg shadow-md border-l-4 border-sky-500">
          <h2 className="text-xl font-semibold mb-3 text-sky-800">Accommodations</h2>
          <p className="text-gray-700 mb-3">
            <strong className="text-sky-700">Hotel Block & Shuttle Information:</strong> Coming soon! We'll provide details about our hotel block and shuttle service to and from the venue.
          </p>
          <p className="text-gray-700">
            <strong className="text-sky-700">Airbnb Options:</strong> Information about local Airbnb accommodations will be available soon.
          </p>
        </div>

        {/* Important Notice */}
        <div className="bg-amber-50 border-l-4 border-amber-600 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-3 text-amber-900">Please Note</h2>
          <p className="text-gray-700">
            There will be a sheriff monitoring for drunk driving. Please plan accordingly and arrange for safe transportation.
          </p>
        </div>
      </div>
    </main>
  );
}
