"use client";

import { useEffect, useState } from "react";

export default function AdminSongsPage() {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/api/admin/songs")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!data.ok) throw new Error(data.error || "Unknown error");
        setSongs(data.songs);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (error) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-red-600">Error loading songs: {error}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-gray-500">Loading song requests...</p>
      </div>
    );
  }

  const totalVotes = songs.reduce((sum, s) => sum + s.votes, 0);

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex items-center justify-between mb-2">
        <h1 className="font-[family-name:var(--font-cormorant)] text-4xl font-bold text-sky-900">
          Song Requests
        </h1>
        <a
          href="/api/admin/export?type=songs"
          className="inline-flex items-center gap-2 rounded-lg bg-sky-800 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-900 transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export for DJ
        </a>
      </div>
      <p className="mb-8 text-sm text-gray-500">
        {songs.length} song{songs.length !== 1 ? "s" : ""} &middot; {totalVotes} total vote{totalVotes !== 1 ? "s" : ""}
      </p>

      {songs.length === 0 ? (
        <p className="py-12 text-center text-gray-400">No song requests yet.</p>
      ) : (
        <div className="space-y-3">
          {songs.map((song, index) => {
            const rank = index + 1;
            const isTopTen = rank <= 10;

            return (
              <div
                key={song.id}
                className={`overflow-hidden rounded-xl bg-white shadow-sm border border-gray-200 p-4 flex items-center gap-4 ${
                  isTopTen ? "border-l-4 border-l-amber-400" : ""
                }`}
              >
                {/* Rank */}
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                  isTopTen
                    ? "bg-amber-100 text-amber-800"
                    : "bg-gray-100 text-gray-500"
                }`}>
                  #{rank}
                </div>

                {/* Song Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{song.song_title}</p>
                  {song.artist && (
                    <p className="text-sm text-gray-500 truncate">{song.artist}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-0.5">
                    Requested by {song.requested_by}
                  </p>
                </div>

                {/* Vote count */}
                <div className="flex-shrink-0 text-center">
                  <p className="text-lg font-bold text-sky-800">{song.votes}</p>
                  <p className="text-xs text-gray-400">
                    {song.votes === 1 ? "vote" : "votes"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
