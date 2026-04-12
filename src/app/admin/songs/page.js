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

                {/* Spotify search link */}
                <a
                  href={`https://open.spotify.com/search/${encodeURIComponent(song.song_title + (song.artist ? " " + song.artist : ""))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 p-2 rounded-full hover:bg-green-50 transition-colors"
                  title="Find on Spotify"
                >
                  <svg className="w-6 h-6 text-green-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                  </svg>
                </a>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
