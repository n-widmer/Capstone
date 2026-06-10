"use client";

import { useState } from "react";

// Lets a guest find their wedding group by searching their name, then remembers
// the selection for the session (via /api/guest-group). Calls onSelected with
// the chosen group's full payload. Renders the search UI only — the caller
// supplies any surrounding card/modal chrome.
export default function FamilyFinder({ onSelected, autoFocus = false }) {
  const [q, setQ] = useState("");
  const [matches, setMatches] = useState(null);
  const [error, setError] = useState("");
  const [searching, setSearching] = useState(false);
  const [selectingId, setSelectingId] = useState(null);

  async function search() {
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
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-sky-800 mb-2">
          Search for your name
        </label>
        <div className="flex gap-2">
          <input
            autoFocus={autoFocus}
            className="flex-1 rounded-lg border-2 border-sky-400 px-4 py-3 text-lg focus:border-sky-600 focus:ring-2 focus:ring-sky-200 transition-all duration-200"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search()}
            placeholder="Your first or last name"
          />
          <button
            onClick={search}
            disabled={searching || q.trim().length < 2}
            className="cursor-pointer rounded-lg bg-sky-800 px-6 py-3 text-lg font-bold text-white hover:bg-sky-900 hover:scale-[1.02] transition-all duration-200 shadow-lg disabled:opacity-60 disabled:hover:scale-100"
          >
            {searching ? "Searching..." : "Search"}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
          <p className="text-red-700 font-medium">{error}</p>
        </div>
      )}

      {matches && matches.length === 0 && (
        <p className="text-gray-500 text-sm italic">
          No one found for &ldquo;{q.trim()}&rdquo;. Try your last name, or double-check the spelling.
        </p>
      )}

      {matches && matches.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            {matches.length === 1 ? "Is this you?" : "Select your group:"}
          </p>
          {matches.map((m) => (
            <button
              key={m.group_id}
              onClick={() => choose(m.group_id)}
              disabled={selectingId !== null}
              className="w-full text-left cursor-pointer rounded-lg border-2 border-sky-200 p-4 hover:border-sky-500 hover:bg-sky-50 transition-all duration-200 disabled:opacity-60"
            >
              <p className="font-semibold text-sky-900">{m.family_name} Family</p>
              <p className="text-sm text-gray-500">{m.members.join(", ")}</p>
              {selectingId === m.group_id && (
                <p className="text-xs text-sky-600 mt-1">Loading…</p>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
