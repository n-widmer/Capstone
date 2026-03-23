"use client";

import { useState, useCallback } from "react";

export default function PlaylistPage() {
  const [code, setCode] = useState("");
  const [authed, setAuthed] = useState(false);
  const [groupId, setGroupId] = useState(null);
  const [songs, setSongs] = useState([]);
  const [myVotesUsed, setMyVotesUsed] = useState(0);
  const [maxVotes] = useState(5);
  const [error, setError] = useState("");
  const [songTitle, setSongTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchSongs = useCallback(async (accessCode) => {
    const res = await fetch(`/api/songs?code=${encodeURIComponent(accessCode)}`);
    const json = await res.json();
    if (!json.ok) {
      setError(json.error || "Failed to load songs");
      return false;
    }
    setGroupId(json.group_id);
    setSongs(json.songs);
    setMyVotesUsed(json.my_votes_used);
    setError("");
    return true;
  }, []);

  async function handleAuth() {
    setError("");
    const trimmed = code.trim();
    if (!trimmed) {
      setError("Please enter your access code");
      return;
    }
    const ok = await fetchSongs(trimmed);
    if (ok) setAuthed(true);
  }

  async function handleAddSong(e) {
    e.preventDefault();
    if (!songTitle.trim()) {
      setError("Song title is required");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/songs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_code: code.trim(),
          song_title: songTitle.trim(),
          artist: artist.trim(),
        }),
      });
      const json = await res.json();
      if (!json.ok) {
        setError(json.error || "Failed to add song");
        return;
      }
      setSongTitle("");
      setArtist("");
      await fetchSongs(code.trim());
    } finally {
      setSubmitting(false);
    }
  }

  async function handleVote(songId) {
    setError("");
    const targetSong = songs.find((s) => s.id === songId);

    // Check if trying to vote (not unvote) and already at limit
    if (targetSong && !targetSong.voted_by_me && myVotesUsed >= maxVotes) {
      setError(`You've used all ${maxVotes} votes! Unvote a song to free one up.`);
      return;
    }

    const res = await fetch("/api/songs/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        access_code: code.trim(),
        song_id: songId,
      }),
    });
    const json = await res.json();
    if (!json.ok) {
      setError(json.error || "Vote failed");
      return;
    }
    await fetchSongs(code.trim());
  }

  // ---------- Access code screen ----------
  if (!authed) {
    return (
      <main className="min-h-screen py-12 px-4">
        <div className="mx-auto max-w-2xl">
          {/* Header */}
          <div className="text-center mb-12 relative">
            <div className="absolute inset-0 flex items-center justify-center opacity-5">
              <div className="text-9xl">🎵</div>
            </div>
            <h1 className="font-[family-name:var(--font-cormorant)] text-5xl md:text-6xl text-sky-900 mb-4 relative">
              Wedding Playlist
            </h1>
            <div className="w-24 h-1 bg-sky-600 mx-auto mb-4"></div>
            <p className="text-xl text-gray-600 font-[family-name:var(--font-cormorant)] italic">
              Help us build the perfect soundtrack!
            </p>
          </div>

          {/* Access Code Card */}
          <div className="bg-white rounded-xl shadow-2xl border-4 border-double border-sky-400 p-8 mb-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-sky-300 opacity-50"></div>
            <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-sky-300 opacity-50"></div>

            <div className="text-center mb-6">
              <h2 className="text-2xl font-[family-name:var(--font-cormorant)] text-sky-800 mb-2">
                Enter Your Access Code
              </h2>
              <p className="text-gray-600">You'll find this on your invitation</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-sky-800 mb-2">
                  Access Code
                </label>
                <input
                  className="w-full rounded-lg border-2 border-sky-400 px-4 py-3 text-lg focus:border-sky-600 focus:ring-2 focus:ring-sky-200 transition-all duration-200"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAuth()}
                  placeholder="e.g. ABC123"
                />
              </div>
              <button
                className="w-full cursor-pointer rounded-lg bg-sky-800 px-6 py-4 text-lg font-bold text-white hover:bg-sky-900 hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl"
                onClick={handleAuth}
              >
                View Playlist
              </button>
              {error && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
                  <p className="text-red-700 font-medium">{error}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    );
  }

  // ---------- Playlist screen ----------
  return (
    <main className="min-h-screen py-12 px-4">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-[family-name:var(--font-cormorant)] text-5xl md:text-6xl text-sky-900 mb-4">
            Wedding Playlist
          </h1>
          <div className="w-24 h-1 bg-sky-600 mx-auto mb-4"></div>
          <p className="text-sm text-gray-600">
            Votes used:{" "}
            <span className={`font-bold ${myVotesUsed >= maxVotes ? "text-red-600" : "text-sky-800"}`}>
              {myVotesUsed}/{maxVotes}
            </span>
          </p>
        </div>

        {/* Error banner */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded mb-6">
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}

        {/* Request a Song form */}
        <div className="bg-white rounded-xl shadow-lg border-l-4 border-sky-600 p-6 mb-8">
          <h2 className="font-[family-name:var(--font-cormorant)] text-2xl text-sky-900 mb-4">
            Request a Song
          </h2>
          <form onSubmit={handleAddSong} className="space-y-3">
            <div>
              <label className="block text-sm font-semibold text-sky-800 mb-1">
                Song Title <span className="text-red-500">*</span>
              </label>
              <input
                className="w-full rounded-lg border-2 border-sky-400 px-4 py-3 focus:border-sky-600 focus:ring-2 focus:ring-sky-200 transition-all duration-200"
                value={songTitle}
                onChange={(e) => setSongTitle(e.target.value)}
                placeholder="Enter song title..."
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-sky-800 mb-1">
                Artist
              </label>
              <input
                className="w-full rounded-lg border-2 border-sky-400 px-4 py-3 focus:border-sky-600 focus:ring-2 focus:ring-sky-200 transition-all duration-200"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                placeholder="Enter artist name..."
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full cursor-pointer rounded-lg bg-sky-800 px-6 py-3 text-lg font-bold text-white hover:bg-sky-900 hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Adding..." : "Add Song"}
            </button>
          </form>
        </div>

        {/* Song List */}
        <div className="space-y-3">
          {songs.length === 0 ? (
            <p className="py-12 text-center text-gray-400">
              No songs requested yet. Be the first!
            </p>
          ) : (
            songs.map((song, index) => {
              const rank = index + 1;
              const isTopTen = rank <= 10;

              return (
                <div
                  key={song.id}
                  className={`bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center gap-4 transition-all ${
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

                  {/* Heart vote button */}
                  <button
                    onClick={() => handleVote(song.id)}
                    className="flex-shrink-0 cursor-pointer p-2 rounded-full transition-all hover:scale-110"
                    title={song.voted_by_me ? "Remove vote" : "Vote for this song"}
                  >
                    {song.voted_by_me ? (
                      <svg className="w-7 h-7 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                      </svg>
                    ) : (
                      <svg className="w-7 h-7 text-gray-300 hover:text-red-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    )}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </main>
  );
}
