"use client";

import { useState } from "react";

export default function RSVPPage() {
  const [code, setCode] = useState("");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [showExisting, setShowExisting] = useState(false);
  const [mode, setMode] = useState("create"); // "create" | "view" | "modify"

  const [attendingIds, setAttendingIds] = useState([]);
  const [plusOne, setPlusOne] = useState(false);
  const [plusOneName, setPlusOneName] = useState("");
  const [diet, setDiet] = useState("");
  const [dress, setDress] = useState("");
  const [songTitle, setSongTitle] = useState("");
  const [songArtist, setSongArtist] = useState("");

  async function lookup() {
    setError("");
    setData(null);
    setShowExisting(false);
    setMode("create");

    const res = await fetch(`/api/groups?code=${encodeURIComponent(code.trim())}`);
    const json = await res.json();

    if (!json.ok) {
      setError(json.error || "Lookup failed");
      return;
    }

    setData(json);

    // default: select everyone attending
    const attendingFromDb = json.members
      .filter((m) => Number(m.attending) === 1)
      .map((m) => m.user_id);

    const hasAnyRsvpRows = json.members.some((m) => m.attending !== null);

    setAttendingIds(hasAnyRsvpRows ? attendingFromDb : []);

    if (json.rsvp_meta) {
      setPlusOne(Number(json.rsvp_meta.plus_one) === 1);
      setPlusOneName(json.rsvp_meta.plus_one_name || "");
      setDiet(json.rsvp_meta.diet_restrictions || "");
      setDress(json.rsvp_meta.dress_code || "");
      setSongTitle(json.rsvp_meta.song_recommendations || "");
      setSongArtist("");
    } else {
      setPlusOne(false);
      setPlusOneName("");
      setDiet("");
      setDress("");
      setSongTitle("");
      setSongArtist("");
    }

    if (json.rsvp?.exists) {
      setShowExisting(true);
    }
  }

  function toggleMember(uid) {
    setAttendingIds((prev) =>
      prev.includes(uid) ? prev.filter((x) => x !== uid) : [...prev, uid]
    );
  }

  async function submit() {
    setError("");

    const res = await fetch("/api/rsvp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        access_code: code.trim(),
        attending_user_ids: attendingIds,
        plus_one: plusOne ? 1 : 0,
        plus_one_name: plusOneName,
        diet_restrictions: diet,
        dress_code: dress,
        song_recommendations: songTitle,
        song_title: songTitle,
        song_artist: songArtist,
      }),
    });

    const json = await res.json();
    if (!json.ok) {
      setError(json.error || "Submit failed");
      return;
    }

    alert(json.modified ? "RSVP updated!" : "RSVP submitted!");
  }

  // Determine if anyone in the group can bring a plus-one
  const canBringPlusOne = data?.members?.some((m) => m.plus_one_allowed) ?? false;

  return (
    <main className="min-h-screen py-12 px-4">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="text-center mb-12 relative">
          <div className="absolute inset-0 flex items-center justify-center opacity-5">
            <div className="text-9xl">💌</div>
          </div>
          <h1 className="text-5xl md:text-6xl font-serif text-sky-900 mb-4 relative">
            RSVP
          </h1>
          <div className="w-24 h-1 bg-sky-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600 font-serif italic">
            We can't wait to celebrate with you!
          </p>
        </div>

        {/* Access Code Card */}
        <div className="bg-white rounded-xl shadow-2xl border-4 border-double border-sky-400 p-8 mb-8 relative overflow-hidden">
          {/* Decorative corners */}
          <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-sky-300 opacity-50"></div>
          <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-sky-300 opacity-50"></div>

          <div className="text-center mb-6">
            <h2 className="text-2xl font-serif text-sky-800 mb-2">Enter Your Access Code</h2>
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
                placeholder="e.g. ABC123"
              />
            </div>
            <button
              className="w-full cursor-pointer rounded-lg bg-sky-800 px-6 py-4 text-lg font-bold text-white hover:bg-sky-900 hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl"
              onClick={lookup}
            >
              Continue to RSVP
            </button>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            )}
          </div>
        </div>

      {/* Existing RSVP popup */}
      {showExisting && data && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 z-50">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border-4 border-sky-400 p-8 relative">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-sky-700 rounded-full p-4 border-4 border-white shadow-lg">
              <span className="text-3xl">📋</span>
            </div>

            <div className="mt-8 text-center">
              <h2 className="text-2xl font-serif text-sky-900 font-semibold mb-3">
                RSVP Already Submitted
              </h2>
              <p className="text-gray-700 leading-relaxed">
                We already have an RSVP for the <b className="text-sky-800">{data.group.family_name}</b> family
                {data.rsvp.submitted_by && (
                  <>
                    {" "}submitted by <b className="text-sky-700">{data.rsvp.submitted_by}</b>
                  </>
                )}
                .
              </p>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                className="flex-1 cursor-pointer rounded-lg border-2 border-sky-500 px-4 py-3 font-semibold text-sky-700 hover:bg-sky-50 hover:scale-[1.02] transition-all duration-200"
                onClick={() => {
                  setMode("view");
                  setShowExisting(false);
                }}
              >
                View
              </button>
              <button
                className="flex-1 cursor-pointer rounded-lg bg-sky-800 px-4 py-3 font-bold text-white hover:bg-sky-900 hover:scale-[1.02] transition-all duration-200 shadow-md"
                onClick={() => {
                  setMode("modify");
                  setShowExisting(false);
                }}
              >
                Modify
              </button>
            </div>

            <p className="mt-4 text-center text-sm text-gray-500 italic">
              You can make changes using the same access code
            </p>
          </div>
        </div>
      )}

      {data && (
        <section className="space-y-6">
          {/* Group Members */}
          <div className="bg-white rounded-xl shadow-lg border-l-4 border-sky-600 p-6">
            <h2 className="text-2xl font-serif text-sky-900 mb-2">
              {data.group.family_name} Family
            </h2>
            <p className="text-gray-600 mb-4">
              Who will be joining us?
            </p>

            <div className="space-y-3">
              {data.members.map((m) => (
                <label key={m.user_id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-sky-50 cursor-pointer transition-colors border border-gray-200">
                  <input
                    type="checkbox"
                    className="cursor-pointer w-5 h-5 text-sky-600 rounded focus:ring-sky-500 transition-all duration-200"
                    checked={attendingIds.includes(m.user_id)}
                    onChange={() => toggleMember(m.user_id)}
                    disabled={mode === "view"}
                  />
                  <span className="text-lg text-gray-800">{m.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Additional Details */}
          <div className="bg-white rounded-xl shadow-lg border-l-4 border-sky-500 p-6 space-y-4">
            {canBringPlusOne && (
              <div className="bg-sky-50 p-4 rounded-lg border border-sky-300">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="cursor-pointer w-5 h-5 text-sky-600 rounded focus:ring-sky-500 transition-all duration-200"
                    checked={plusOne}
                    onChange={(e) => setPlusOne(e.target.checked)}
                    disabled={mode === "view"}
                  />
                  <span className="text-lg font-medium text-gray-800">Bringing a plus-one?</span>
                </label>

                {plusOne && (
                  <input
                    className="mt-3 w-full rounded-lg border-2 border-sky-400 px-4 py-2 focus:border-sky-600 focus:ring-2 focus:ring-sky-200 transition-all duration-200"
                    value={plusOneName}
                    onChange={(e) => setPlusOneName(e.target.value)}
                    placeholder="Plus-one's name"
                    disabled={mode === "view"}
                  />
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-sky-800 mb-2">
                Dietary Restrictions / Allergies
              </label>
              <input
                className="w-full rounded-lg border-2 border-sky-400 px-4 py-3 focus:border-sky-600 focus:ring-2 focus:ring-sky-200 transition-all duration-200"
                value={diet}
                onChange={(e) => setDiet(e.target.value)}
                placeholder="Let us know about any dietary needs..."
                disabled={mode === "view"}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-sky-800 mb-2">
                Dress Code Notes (optional)
              </label>
              <input
                className="w-full rounded-lg border-2 border-sky-400 px-4 py-3 focus:border-sky-600 focus:ring-2 focus:ring-sky-200 transition-all duration-200"
                value={dress}
                onChange={(e) => setDress(e.target.value)}
                placeholder="Any questions about attire?"
                disabled={mode === "view"}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-sky-800 mb-2">
                Song Request
              </label>
              <div className="flex gap-2">
                <input
                  className="flex-1 rounded-lg border-2 border-sky-400 px-4 py-3 focus:border-sky-600 focus:ring-2 focus:ring-sky-200 transition-all duration-200"
                  value={songTitle}
                  onChange={(e) => setSongTitle(e.target.value)}
                  placeholder="Song title"
                  disabled={mode === "view"}
                />
                <input
                  className="flex-1 rounded-lg border-2 border-sky-400 px-4 py-3 focus:border-sky-600 focus:ring-2 focus:ring-sky-200 transition-all duration-200"
                  value={songArtist}
                  onChange={(e) => setSongArtist(e.target.value)}
                  placeholder="Artist (optional)"
                  disabled={mode === "view"}
                />
              </div>
            </div>

            {mode !== "view" && (
              <button
                className="w-full cursor-pointer rounded-lg bg-sky-800 px-6 py-4 text-lg font-bold text-white hover:bg-sky-900 hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl"
                onClick={submit}
              >
                {mode === "modify" ? "Update RSVP" : "Submit RSVP"}
              </button>
            )}

            {mode === "view" && (
              <p className="text-sm text-zinc-500">
                Viewing mode (editing disabled). Choose "Modify" to update.
              </p>
            )}
          </div>
        </section>
      )}
      </div>
    </main>
  );
}
