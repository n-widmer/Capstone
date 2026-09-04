"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button, Field, Notice, inputClass, EASE } from "@/components/ui";

// Lets a guest find their wedding group by searching their name, then remembers
// the selection for the session (via /api/guest-group). Calls onSelected with
// the chosen group's full payload. Renders the search UI only; the caller
// supplies any surrounding card/modal chrome.
export default function FamilyFinder({ onSelected, autoFocus = false }) {
  const [q, setQ] = useState("");
  const [matches, setMatches] = useState(null);
  const [error, setError] = useState("");
  const [searching, setSearching] = useState(false);
  const [selectingId, setSelectingId] = useState(null);

  async function search(e) {
    e?.preventDefault();
    setError("");
    setMatches(null);
    const term = q.trim();
    if (term.length < 2) {
      setError("Please enter at least 2 letters of your name.");
      return;
    }
    setSearching(true);
    try {
      const res = await fetch(`/api/groups/search?q=${encodeURIComponent(term)}`);
      const json = await res.json();
      if (!json.ok) {
        setError(json.error || "Search failed. Please try again.");
        return;
      }
      setMatches(json.matches);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSearching(false);
    }
  }

  async function choose(groupId) {
    setError("");
    setSelectingId(groupId);
    try {
      const res = await fetch("/api/guest-group", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ group_id: groupId }),
      });
      const json = await res.json();
      if (!json.ok) {
        setError(json.error || "Could not load your family. Please try again.");
        return;
      }
      onSelected(json);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSelectingId(null);
    }
  }

  return (
    <div className="space-y-5">
      <form onSubmit={search}>
        <Field label="Your first or last name">
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              autoFocus={autoFocus}
              className={inputClass}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Start typing your name"
              autoComplete="name"
            />
            <Button
              type="submit"
              disabled={searching || q.trim().length < 2}
              className="shrink-0 sm:px-7"
            >
              {searching ? "Searching..." : "Find me"}
            </Button>
          </div>
        </Field>
      </form>

      {error && <Notice tone="error">{error}</Notice>}

      <AnimatePresence mode="wait">
        {matches && matches.length === 0 && (
          <motion.p
            key="none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-sm italic text-ink-soft"
          >
            No one found for &ldquo;{q.trim()}&rdquo;. Try your last name, or double-check the
            spelling.
          </motion.p>
        )}

        {matches && matches.length > 0 && (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="space-y-2"
          >
            <p className="text-sm text-ink-soft">
              {matches.length === 1 ? "Is this you?" : "Select your group:"}
            </p>
            {matches.map((m, i) => (
              <motion.button
                key={m.group_id}
                type="button"
                onClick={() => choose(m.group_id)}
                disabled={selectingId !== null}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.05, ease: EASE }}
                className="w-full cursor-pointer rounded-2xl bg-white px-5 py-4 text-left ring-1 ring-ink/10 transition-all duration-500 ease-[var(--ease-soft)] hover:bg-dusk-soft hover:ring-dusk active:scale-[0.99] disabled:opacity-60"
              >
                <p className="font-display text-2xl text-ink">{m.family_name} Family</p>
                <p className="mt-0.5 text-sm text-ink-soft">{m.members.join(", ")}</p>
                {selectingId === m.group_id && (
                  <p className="mt-1 text-xs text-ink-soft">Loading...</p>
                )}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
