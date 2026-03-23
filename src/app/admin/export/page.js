"use client";

const exportCards = [
  {
    type: "guests",
    title: "Guest List",
    description: "All guests with family, RSVP status, plus-ones, dietary restrictions, dress code, and song recommendations.",
    icon: (
      <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    type: "dietary",
    title: "Dietary Restrictions",
    description: "Guests who reported dietary restrictions, grouped by family.",
    icon: (
      <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        <circle cx="12" cy="12" r="10" strokeWidth={1.5} />
      </svg>
    ),
  },
  {
    type: "songs",
    title: "Song Requests",
    description: "All requested songs with title, artist, vote count, and requesting family.",
    icon: (
      <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
      </svg>
    ),
  },
];

export default function ExportCenterPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-2 font-[family-name:var(--font-cormorant)] text-4xl font-bold text-sky-900">
        Export Center
      </h1>
      <p className="mb-8 text-sm text-gray-500">
        Download wedding data as CSV files for printing, sharing, or backup.
      </p>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {exportCards.map((card) => (
          <div
            key={card.type}
            className="flex flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-sky-50 text-sky-900">
              {card.icon}
            </div>
            <h2 className="mb-2 font-[family-name:var(--font-cormorant)] text-xl font-semibold text-sky-900">
              {card.title}
            </h2>
            <p className="mb-6 flex-1 text-sm leading-relaxed text-gray-500">
              {card.description}
            </p>
            <a
              href={`/api/admin/export?type=${card.type}`}
              download
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-sky-900 px-4 py-2.5 text-sm font-medium text-white shadow transition-colors hover:bg-sky-800"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download CSV
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
