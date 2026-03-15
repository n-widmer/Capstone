"use client";

import { useState } from "react";

// ─── Photo list ───────────────────────────────────────────────────────────────
// To add photos: add an entry to this array.
//
// LOCAL FILES:  place the image in /public/photos/ and set src to "/photos/filename.jpg"
//
// DATABASE:     replace this array with a fetch call in a useEffect and store
//               the result in state — the rest of the component stays the same.
const photos = [
  { src: null, alt: "Photo 1" },
  { src: null, alt: "Photo 2" },
  { src: null, alt: "Photo 3" },
];


export default function PhotoLoop() {
  // current is the index of the photo being displayed 
  const [current, setCurrent] = useState(0);

  // move to the previous photo wrap from the first photo back to the last
  function prev() {
    setCurrent((i) => (i === 0 ? photos.length - 1 : i - 1));
  }

  // move to the next photo wrap from the last photo back to the first
  function next() {
    setCurrent((i) => (i === photos.length - 1 ? 0 : i + 1));
  }

  const photo = photos[current];

  return (
    <div className="relative w-full max-w-3xl mx-auto">

      {/* photo display area aspect-video keeps a 16:9 ratio at any screen width */}
      <div className="relative aspect-video bg-gray-200 rounded-xl overflow-hidden flex items-center justify-center">
        {photo.src ? (
          <img
            src={photo.src}
            alt={photo.alt}
            className="w-full h-full object-cover"
          />
        ) : (
          // placeholder shown until real photos are added
          <span className="text-gray-400 text-sm">
            Photo {current + 1} of {photos.length}
          </span>
        )}
      </div>

      {/* previous arrow */}
      <button
        onClick={prev}
        className="absolute left-3 top-1/2 -translate-y-1/2 cursor-pointer flex items-center justify-center w-10 h-10 rounded-full bg-white/80 hover:bg-white transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      {/* next arrow */}
      <button
        onClick={next}
        className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer flex items-center justify-center w-10 h-10 rounded-full bg-white/80 hover:bg-white transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      {/* dot indicators one dot per photo filled for the selected photo clicking a dot jumps directly to that photo */}
      <div className="mt-3 flex justify-center gap-2">
        {photos.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`cursor-pointer h-2 w-2 rounded-full transition-colors ${
              i === current ? "bg-black" : "bg-gray-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
