"use client";

import { useState } from "react";

export default function RSVPPage() {
  const [code, setCode] = useState("");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [showExisting, setShowExisting] = useState(false);
  const [mode, setMode] = useState("create"); // "create" | "view" | "modify"

  const [attendingIds, setAttendingIds] = useState([]);
  const [plusOneByUser, setPlusOneByUser] = useState({});
  const [diet, setDiet] = useState("");
  const [dress, setDress] = useState("");
  const [songs, setSongs] = useState("");

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

    const map = {};
    for (const m of json.members) {
      if (Number(m.plus_one_allowed) === 1 && Number(m.plus_one) === 1) {
        map[m.user_id] = m.plus_one_name || "";
      }
    }
    setPlusOneByUser(map);

    // default: select everyone attending
    const attendingFromDb = json.members
      .filter((m) => Number(m.attending) === 1)
      .map((m) => m.user_id);

    const hasAnyRsvpRows = json.members.some((m) => m.attending !== null);

    setAttendingIds(hasAnyRsvpRows ? attendingFromDb : []);

    if (json.rsvp_meta) {
      setDiet(json.rsvp_meta.diet_restrictions || "");
      setDress(json.rsvp_meta.dress_code || "");
      setSongs(json.rsvp_meta.song_recommendations || "");
    } else {
      setDiet("");
      setDress("");
      setSongs("");
    }

    if (json.rsvp?.exists) {
      setShowExisting(true);
    }
  }

  function toggleMember(uid) {
    setAttendingIds((prev) => {
      const next = prev.includes(uid) ? prev.filter((x) => x !== uid) : [...prev, uid];

      // If they are now NOT attending, remove any plus-one entry for them
      if (!next.includes(uid)) {
        setPlusOneByUser((prevPlus) => {
          const copy = { ...prevPlus };
          delete copy[uid];
          return copy;
        });
      }

      return next;
    });
  }

  async function submit() {
    setError("");

    const emptyPlusOnes = Object.entries(plusOneByUser)
      .filter(([_, name]) => String(name).trim().length === 0);

    if (emptyPlusOnes.length > 0) {
      setError("Please enter a name for each selected plus-one (or uncheck it).");
      return;
    }

    const res = await fetch("/api/rsvp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        access_code: code.trim(),
        attending_user_ids: attendingIds,
        plus_ones: plusOneByUser,
        diet_restrictions: diet,
        dress_code: dress,
        song_recommendations: songs,
      }),
    });

    const json = await res.json();
    if (!json.ok) {
      setError(json.error || "Submit failed");
      return;
    }

    alert(json.modified ? "RSVP updated!" : "RSVP submitted!");
  }

  // Determine the group members that can bring a plus-one
  const eligiblePlusOneUsers =
    (data?.members ?? []).filter(
      (m) => Number(m.plus_one_allowed) === 1 && attendingIds.includes(m.user_id)
    );

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col p-6">
      <h1 className="text-3xl font-bold">RSVP</h1>
      <p className="mt-2 text-gray-600">Enter your access code to RSVP for your group.</p>

      <div className="mt-6 rounded-xl border p-4">
        <label className="text-sm font-medium">Group Access Code</label>
        <input
          className="mt-1 w-full rounded-md border px-3 py-2"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="e.g. TEST123"
        />
        <button
          className="mt-3 cursor-pointer rounded-md bg-black px-4 py-2 text-white hover:bg-gray-800 transition-colors"
          onClick={lookup}
        >
          Continue
        </button>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>

      {showExisting && data && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-5">
            <h2 className="text-lg font-semibold">RSVP already submitted</h2>
            <p className="mt-2 text-sm text-zinc-700">
              We already have an RSVP for <b>{data.group.family_name}</b>
              {data.rsvp.submitted_by ? (
                <>
                  {" "}
                  submitted by <b>{data.rsvp.submitted_by}</b>
                </>
              ) : null}
              .
            </p>

            <div className="mt-4 flex gap-2">
              <button
                className="flex-1 cursor-pointer rounded-md border px-3 py-2 hover:bg-gray-100 transition-colors"
                onClick={() => {
                  setMode("view");
                  setShowExisting(false);
                }}
              >
                View
              </button>
              <button
                className="flex-1 cursor-pointer rounded-md bg-black px-3 py-2 text-white hover:bg-gray-800 transition-colors"
                onClick={() => {
                  setMode("modify");
                  setShowExisting(false);
                }}
              >
                Modify
              </button>
            </div>

            <p className="mt-3 text-xs text-zinc-500">
              Modifying uses the same access code.
            </p>
          </div>
        </div>
      )}

      {data && (
        <section className="mt-6 space-y-4">
          <div className="rounded-xl border p-4">
            <h2 className="font-medium">Group: {data.group.family_name}</h2>
            <p className="text-sm text-zinc-600">
              Select who is attending.
            </p>

            <div className="mt-3 space-y-2">
              {data.members.map((m) => (
                <label key={m.user_id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="cursor-pointer"
                    checked={attendingIds.includes(m.user_id)}
                    onChange={() => toggleMember(m.user_id)}
                    disabled={mode === "view"}
                  />
                  <span>{m.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="rounded-xl border p-4 space-y-3">
            {eligiblePlusOneUsers.length > 0 && (
              <div className="rounded-xl border p-4 space-y-3">
                <h3 className="font-medium">Plus-ones</h3>
                <p className="text-sm text-zinc-600">
                  If someone is bringing a guest, enter their guest’s name.
                </p>

                {eligiblePlusOneUsers.map((m) => {
                  const hasEntry = Object.prototype.hasOwnProperty.call(plusOneByUser, m.user_id);
                  const value = hasEntry ? (plusOneByUser[m.user_id] ?? "") : "";

                  return (
                    <div key={m.user_id} className="space-y-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          className="cursor-pointer"
                          checked={hasEntry}
                          disabled={mode === "view"}
                          onChange={(e) => {
                            const isChecked = e.target.checked;
                            setPlusOneByUser((prev) => {
                              const next = { ...prev };
                              if (!isChecked) {
                                delete next[m.user_id];
                              } else {
                                // create an empty slot so the input shows and they can type
                                if (!Object.prototype.hasOwnProperty.call(next, m.user_id)) {
                                  next[m.user_id] = "";
                                }
                              }
                              return next;
                            });
                          }}
                        />
                        <span className="font-medium">{m.name}</span>
                        <span className="text-sm text-zinc-600">plus-one</span>
                      </label>

                      {hasEntry && (
                        <input
                          className="w-full rounded-md border px-3 py-2"
                          value={value}
                          disabled={mode === "view"}
                          placeholder={`Guest name for ${m.name}`}
                          onChange={(e) => {
                            const newVal = e.target.value;
                            setPlusOneByUser((prev) => ({ ...prev, [m.user_id]: newVal }));
                          }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <input
              className="w-full rounded-md border px-3 py-2"
              value={diet}
              onChange={(e) => setDiet(e.target.value)}
              placeholder="Dietary restrictions / allergies"
              disabled={mode === "view"}
            />
            <input
              className="w-full rounded-md border px-3 py-2"
              value={dress}
              onChange={(e) => setDress(e.target.value)}
              placeholder="Dress code notes (optional)"
              disabled={mode === "view"}
            />
            <input
              className="w-full rounded-md border px-3 py-2"
              value={songs}
              onChange={(e) => setSongs(e.target.value)}
              placeholder="Song recommendations (optional)"
              disabled={mode === "view"}
            />

            {mode !== "view" && (
              <button
                className="cursor-pointer rounded-md bg-black px-4 py-2 text-white hover:bg-gray-800 transition-colors"
                onClick={submit}
              >
                {mode === "modify" ? "Update RSVP" : "Submit RSVP"}
              </button>
            )}

            {mode === "view" && (
              <p className="text-sm text-zinc-500">
                Viewing mode (editing disabled). Choose “Modify” to update.
              </p>
            )}
          </div>
        </section>
      )}
    </main>
  );
}