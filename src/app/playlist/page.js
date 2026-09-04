"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart } from "@phosphor-icons/react";
import FamilyFinder from "@/components/FamilyFinder";
import { Button, Card, Field, Notice, PageHeader, Reveal, inputClass, EASE } from "@/components/ui";

const MAX_VOTES = 5;

export default function PlaylistPage() {
  const [groupId, setGroupId] = useState(null);
  const [familyName, setFamilyName] = useState("");
  const [loadingIdentity, setLoadingIdentity] = useState(true);
  const [songs, setSongs] = useState([]);
  const [myVotesUsed, setMyVotesUsed] = useState(0);
  const [error, setError] = useState("");
  const [songTitle, setSongTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchSongs = useCallback(async (gid) => {
    const res = await fetch(`/api/songs?group_id=${encodeURIComponent(gid)}`);
    const json = await res.json();
    if (!json.ok) {
      setError(json.error || "Failed to load songs");
      return false;
    }
    setSongs(json.songs);
    setMyVotesUsed(json.my_votes_used);
    setError("");
    return true;
  }, []);

  // Reuse the family the guest already identified as this session.
  useEffect(() => {
    let active = true;
    fetch("/api/guest-group")
      .then((r) => r.json())
      .then(async (json) => {
        if (active && json.ok && json.group) {
          setGroupId(json.group.group_id);
          setFamilyName(json.group.family_name);
          await fetchSongs(json.group.group_id);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoadingIdentity(false);
      });
    return () => {
      active = false;
    };
  }, [fetchSongs]);

  function handleSelected(payload) {
    setGroupId(payload.group.group_id);
    setFamilyName(payload.group.family_name);
    fetchSongs(payload.group.group_id);
  }

  async function switchFamily() {
    await fetch("/api/guest-group", { method: "DELETE" }).catch(() => {});
    setGroupId(null);
    setFamilyName("");
    setSongs([]);
    setMyVotesUsed(0);
    setError("");
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
          group_id: groupId,
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
      await fetchSongs(groupId);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleVote(songId) {
    setError("");
    const targetSong = songs.find((s) => s.id === songId);

    // Check if trying to vote (not unvote) and already at limit
    if (targetSong && !targetSong.voted_by_me && myVotesUsed >= MAX_VOTES) {
      setError(`You've used all ${MAX_VOTES} votes. Remove one to free it up.`);
      return;
    }

    const res = await fetch("/api/songs/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        group_id: groupId,
        song_id: songId,
      }),
    });
    const json = await res.json();
    if (!json.ok) {
      setError(json.error || "Vote failed");
      return;
    }
    await fetchSongs(groupId);
  }

  // ---------- Find-your-family screen ----------
  if (!groupId) {
    return (
      <main className="min-h-screen px-4 pb-16">
        <PageHeader title="Playlist" subtitle="Help us build the soundtrack" />
        <div className="mx-auto max-w-2xl">
          <Reveal>
            <Card inner="px-6 py-8 sm:px-10 sm:py-10">
              <div className="mb-6 text-center">
                <h2 className="font-display text-3xl font-light text-ink">Find your group</h2>
                <p className="mt-2 text-sm text-ink-soft">
                  Search your name to request songs and vote on the list.
                </p>
              </div>
              {loadingIdentity ? (
                <p className="py-4 text-center text-sm text-ink-soft">Loading...</p>
              ) : (
                <FamilyFinder onSelected={handleSelected} autoFocus />
              )}
            </Card>
          </Reveal>
        </div>
      </main>
    );
  }

  // ---------- Playlist screen ----------
  return (
    <main className="min-h-screen px-4 pb-16">
      <PageHeader title="Playlist" subtitle="Help us build the soundtrack">
        <div className="mt-6 flex flex-col items-center gap-2">
          <span className="rounded-full bg-paper-deep px-4 py-1.5 text-sm text-ink ring-1 ring-ink/10">
            {myVotesUsed} of {MAX_VOTES} votes used
          </span>
          {familyName && (
            <p className="text-xs text-ink-soft">
              Voting as the {familyName} family.{" "}
              <button
                type="button"
                onClick={switchFamily}
                className="cursor-pointer underline decoration-ink/30 underline-offset-4 hover:text-ink"
              >
                Not you?
              </button>
            </p>
          )}
        </div>
      </PageHeader>

      <div className="mx-auto max-w-2xl">
        {error && (
          <Notice tone="error" className="mb-6">
            {error}
          </Notice>
        )}

        {/* Request a song */}
        <Reveal>
          <Card inner="px-6 py-8 sm:px-8">
            <h2 className="font-display text-3xl font-light text-ink">Request a song</h2>
            <form onSubmit={handleAddSong} className="mt-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Song title">
                  <input
                    className={inputClass}
                    value={songTitle}
                    onChange={(e) => setSongTitle(e.target.value)}
                    placeholder="Song title"
                    required
                  />
                </Field>
                <Field label="Artist (optional)">
                  <input
                    className={inputClass}
                    value={artist}
                    onChange={(e) => setArtist(e.target.value)}
                    placeholder="Artist"
                  />
                </Field>
              </div>
              <Button type="submit" arrow className="w-full" disabled={submitting}>
                {submitting ? "Adding..." : "Add to the list"}
              </Button>
            </form>
          </Card>
        </Reveal>

        {/* Song list */}
        <div className="mt-10">
          {songs.length === 0 ? (
            <Reveal className="py-12 text-center">
              <p className="font-display text-3xl font-light italic text-ink">No requests yet</p>
              <p className="mt-2 text-sm text-ink-soft">Be the first to add a song.</p>
            </Reveal>
          ) : (
            <ol className="space-y-2.5">
              <AnimatePresence initial={false}>
                {songs.map((song, index) => {
                  const rank = index + 1;
                  const isTopTen = rank <= 10;
                  return (
                    <motion.li
                      key={song.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5, ease: EASE }}
                      className="flex items-center gap-4 rounded-2xl bg-white px-4 py-3.5 ring-1 ring-ink/10 sm:px-5"
                    >
                      <span
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-display text-xl ${
                          isTopTen ? "bg-butter-soft text-ink" : "bg-paper-deep text-ink-soft"
                        }`}
                      >
                        {rank}
                      </span>

                      <div className="min-w-0 flex-1">
                        <p className="truncate font-display text-xl text-ink">{song.song_title}</p>
                        {song.artist && (
                          <p className="truncate text-sm text-ink-soft">{song.artist}</p>
                        )}
                        <p className="mt-0.5 text-xs text-ink-soft/80">
                          Requested by {song.requested_by}
                        </p>
                      </div>

                      <div className="shrink-0 text-center">
                        <p className="font-display text-2xl leading-none text-ink">{song.votes}</p>
                        <p className="mt-1 text-[10px] uppercase tracking-[0.15em] text-ink-soft">
                          {song.votes === 1 ? "vote" : "votes"}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleVote(song.id)}
                        className={`flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full transition-all duration-500 ease-[var(--ease-soft)] active:scale-90 ${
                          song.voted_by_me
                            ? "bg-ink text-white"
                            : "bg-white text-ink-soft ring-1 ring-ink/10 hover:text-ink hover:ring-ink/30"
                        }`}
                        aria-pressed={!!song.voted_by_me}
                        aria-label={song.voted_by_me ? "Remove your vote" : "Vote for this song"}
                        title={song.voted_by_me ? "Remove vote" : "Vote for this song"}
                      >
                        <Heart size={20} weight={song.voted_by_me ? "fill" : "light"} />
                      </button>
                    </motion.li>
                  );
                })}
              </AnimatePresence>
            </ol>
          )}
        </div>
      </div>
    </main>
  );
}
