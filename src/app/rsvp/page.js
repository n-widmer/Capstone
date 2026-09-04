"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "@phosphor-icons/react";
import FamilyFinder from "@/components/FamilyFinder";
import {
  Button,
  Card,
  Field,
  Flourish,
  Notice,
  PageHeader,
  Reveal,
  inputClass,
  EASE,
} from "@/components/ui";

function MemberRow({ name, checked, disabled, onChange }) {
  return (
    <label
      className={`flex cursor-pointer items-center gap-4 rounded-2xl px-5 py-4 ring-1 transition-all duration-500 ease-[var(--ease-soft)] ${
        checked ? "bg-dusk-soft ring-dusk" : "bg-white ring-ink/10 hover:ring-ink/25"
      } ${disabled ? "cursor-default" : ""}`}
    >
      <input
        type="checkbox"
        className="h-5 w-5 cursor-pointer rounded"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
      />
      <span className="font-display text-2xl text-ink">{name}</span>
    </label>
  );
}

export default function RSVPPage() {
  const [data, setData] = useState(null);
  const [loadingIdentity, setLoadingIdentity] = useState(true);
  const [error, setError] = useState("");
  const [showExisting, setShowExisting] = useState(false);
  const [mode, setMode] = useState("create"); // "create" | "view" | "modify"
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(null); // null | "submitted" | "updated"

  const [attendingIds, setAttendingIds] = useState([]);
  const [plusOneByUser, setPlusOneByUser] = useState({});
  const [dietByUser, setDietByUser] = useState({}); // user_id -> dietary restriction text
  const [dress, setDress] = useState("");
  const [songTitle, setSongTitle] = useState("");
  const [songArtist, setSongArtist] = useState("");

  // Populate all form state from a group payload (from the finder or the
  // remembered-identity fetch).
  function applyGroup(json) {
    setData(json);

    const plusMap = {};
    const dietMap = {};
    for (const m of json.members) {
      if (Number(m.plus_one_allowed) === 1 && Number(m.plus_one) === 1) {
        plusMap[m.user_id] = m.plus_one_name || "";
      }
      if (m.diet_restrictions) {
        dietMap[m.user_id] = m.diet_restrictions;
      }
    }
    setPlusOneByUser(plusMap);
    setDietByUser(dietMap);

    // default: select everyone already marked attending
    const attendingFromDb = json.members
      .filter((m) => Number(m.attending) === 1)
      .map((m) => m.user_id);
    const hasAnyRsvpRows = json.members.some((m) => m.attending !== null);
    setAttendingIds(hasAnyRsvpRows ? attendingFromDb : []);

    if (json.rsvp_meta) {
      setDress(json.rsvp_meta.dress_code || "");
      setSongTitle(json.rsvp_meta.song_recommendations || "");
      setSongArtist("");
    } else {
      setDress("");
      setSongTitle("");
      setSongArtist("");
    }

    setMode("create");
    setDone(null);
    setShowExisting(!!json.rsvp?.exists);
  }

  // On load, reuse the family the guest already identified as this session.
  useEffect(() => {
    let active = true;
    fetch("/api/guest-group")
      .then((r) => r.json())
      .then((json) => {
        if (active && json.ok && json.group) applyGroup(json);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoadingIdentity(false);
      });
    return () => {
      active = false;
    };
  }, []);

  async function switchFamily() {
    setError("");
    try {
      await fetch("/api/guest-group", { method: "DELETE" });
    } catch {
      /* clearing the cookie is best-effort */
    }
    setData(null);
    setShowExisting(false);
    setMode("create");
    setDone(null);
    setAttendingIds([]);
    setPlusOneByUser({});
    setDietByUser({});
    setDress("");
    setSongTitle("");
    setSongArtist("");
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

    const emptyPlusOnes = Object.entries(plusOneByUser).filter(
      ([, name]) => String(name).trim().length === 0
    );

    if (emptyPlusOnes.length > 0) {
      setError("Please enter a name for each selected plus-one (or uncheck it).");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          group_id: data.group.group_id,
          attending_user_ids: attendingIds,
          plus_ones: plusOneByUser,
          diets: dietByUser,
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

      setDone(json.modified ? "updated" : "submitted");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // Determine the group members that can bring a plus-one
  const eligiblePlusOneUsers = (data?.members ?? []).filter(
    (m) => Number(m.plus_one_allowed) === 1 && attendingIds.includes(m.user_id)
  );

  // Members who are attending; each can list their own dietary restriction
  const attendingMembers = (data?.members ?? []).filter((m) => attendingIds.includes(m.user_id));

  const readOnly = mode === "view";
  const anyoneComing = attendingIds.length > 0;

  return (
    <main className="min-h-screen px-4 pb-16">
      <PageHeader title="RSVP" subtitle="We can't wait to celebrate with you" />

      <div className="mx-auto max-w-2xl">
        {/* Find-your-family (shown until a family is selected) */}
        {!data && (
          <Reveal>
            <Card inner="px-6 py-8 sm:px-10 sm:py-10">
              <div className="mb-6 text-center">
                <h2 className="font-display text-3xl font-light text-ink">Find your invitation</h2>
                <p className="mt-2 text-sm text-ink-soft">
                  Search your name to pull up everyone on your invitation.
                </p>
              </div>

              {loadingIdentity ? (
                <p className="py-4 text-center text-sm text-ink-soft">Loading...</p>
              ) : (
                <FamilyFinder onSelected={applyGroup} autoFocus />
              )}
            </Card>
          </Reveal>
        )}

        {/* Already-submitted prompt */}
        <AnimatePresence>
          {showExisting && data && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 backdrop-blur-sm"
            >
              <motion.div
                initial={{ opacity: 0, y: 16, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                transition={{ duration: 0.5, ease: EASE }}
                className="w-full max-w-md"
              >
                <Card inner="px-8 py-10 text-center">
                  <Flourish className="mb-6" />
                  <h2 className="font-display text-3xl font-light text-ink">
                    We already have your RSVP
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                    The <strong className="font-medium text-ink">{data.group.family_name}</strong>{" "}
                    family has already replied
                    {data.rsvp.submitted_by && (
                      <>
                        , submitted by{" "}
                        <strong className="font-medium text-ink">{data.rsvp.submitted_by}</strong>
                      </>
                    )}
                    .
                  </p>

                  <div className="mt-7 flex gap-3">
                    <Button
                      variant="secondary"
                      className="flex-1"
                      onClick={() => {
                        setMode("view");
                        setShowExisting(false);
                      }}
                    >
                      View
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={() => {
                        setMode("modify");
                        setShowExisting(false);
                      }}
                    >
                      Modify
                    </Button>
                  </div>
                  <p className="mt-4 text-xs text-ink-soft">
                    You can make changes anytime before the deadline.
                  </p>
                </Card>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Confirmation */}
        <AnimatePresence>
          {done && data && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: EASE }}
              className="mb-6"
            >
              <Card tone="dusk" inner="px-8 py-10 text-center">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-ink text-white">
                  <Check size={22} weight="light" />
                </span>
                <h2 className="mt-5 font-display text-3xl font-light text-ink">
                  {anyoneComing ? "See you there" : "We'll miss you"}
                </h2>
                <p className="mt-2 text-sm text-ink-soft">
                  Your RSVP has been {done}. You can come back and change it anytime before the
                  deadline.
                </p>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {data && (
          <section className="space-y-6">
            {/* Who's coming */}
            <Reveal>
              <Card inner="px-6 py-8 sm:px-8">
                <div className="mb-1 flex items-start justify-between gap-4">
                  <h2 className="font-display text-3xl font-light text-ink">
                    {data.group.family_name} Family
                  </h2>
                  <button
                    type="button"
                    onClick={switchFamily}
                    className="mt-2 shrink-0 cursor-pointer text-sm text-ink-soft underline decoration-ink/30 underline-offset-4 transition-colors hover:text-ink"
                  >
                    Not you?
                  </button>
                </div>
                <p className="mb-5 text-sm text-ink-soft">Who will be joining us?</p>

                <div className="space-y-2.5">
                  {data.members.map((m) => (
                    <MemberRow
                      key={m.user_id}
                      name={m.name}
                      checked={attendingIds.includes(m.user_id)}
                      disabled={readOnly}
                      onChange={() => toggleMember(m.user_id)}
                    />
                  ))}
                </div>
              </Card>
            </Reveal>

            {/* Details */}
            <Reveal delay={0.05}>
              <Card inner="space-y-7 px-6 py-8 sm:px-8">
                {eligiblePlusOneUsers.length > 0 && (
                  <div className="space-y-4 rounded-2xl bg-paper-deep p-5">
                    <div>
                      <h3 className="font-display text-2xl text-ink">Plus-ones</h3>
                      <p className="mt-1 text-sm text-ink-soft">
                        If someone is bringing a guest, enter their guest&apos;s name.
                      </p>
                    </div>

                    {eligiblePlusOneUsers.map((m) => {
                      const hasEntry = Object.prototype.hasOwnProperty.call(plusOneByUser, m.user_id);
                      const value = hasEntry ? (plusOneByUser[m.user_id] ?? "") : "";

                      return (
                        <div key={m.user_id} className="space-y-2">
                          <label className="flex cursor-pointer items-center gap-3">
                            <input
                              type="checkbox"
                              className="h-5 w-5 cursor-pointer rounded"
                              checked={hasEntry}
                              disabled={readOnly}
                              onChange={(e) => {
                                const isChecked = e.target.checked;
                                setPlusOneByUser((prev) => {
                                  const next = { ...prev };
                                  if (!isChecked) {
                                    delete next[m.user_id];
                                  } else if (!Object.prototype.hasOwnProperty.call(next, m.user_id)) {
                                    next[m.user_id] = "";
                                  }
                                  return next;
                                });
                              }}
                            />
                            <span className="text-base text-ink">{m.name}</span>
                            <span className="text-sm text-ink-soft">is bringing a guest</span>
                          </label>

                          <AnimatePresence>
                            {hasEntry && (
                              <motion.input
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                transition={{ duration: 0.3, ease: EASE }}
                                className={inputClass}
                                value={value}
                                disabled={readOnly}
                                placeholder={`Guest name for ${m.name}`}
                                onChange={(e) => {
                                  const newVal = e.target.value;
                                  setPlusOneByUser((prev) => ({ ...prev, [m.user_id]: newVal }));
                                }}
                              />
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div>
                  <h3 className="font-display text-2xl text-ink">Dietary restrictions</h3>
                  {attendingMembers.length === 0 ? (
                    <p className="mt-1 text-sm italic text-ink-soft">
                      Select who&apos;s attending above to note any dietary needs for each guest.
                    </p>
                  ) : (
                    <div className="mt-1 space-y-4">
                      <p className="text-sm text-ink-soft">
                        List anything for each guest so we can flag it to the caterer.
                      </p>
                      {attendingMembers.map((m) => (
                        <Field key={m.user_id} label={m.name}>
                          <input
                            className={inputClass}
                            value={dietByUser[m.user_id] ?? ""}
                            onChange={(e) =>
                              setDietByUser((prev) => ({ ...prev, [m.user_id]: e.target.value }))
                            }
                            placeholder="Allergies or dietary needs (optional)"
                            disabled={readOnly}
                          />
                        </Field>
                      ))}
                    </div>
                  )}
                </div>

                <Field label="Dress code questions (optional)">
                  <input
                    className={inputClass}
                    value={dress}
                    onChange={(e) => setDress(e.target.value)}
                    placeholder="Any questions about attire?"
                    disabled={readOnly}
                  />
                </Field>

                <Field label="Song request" hint="One song you'd love to hear on the dance floor.">
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <input
                      className={inputClass}
                      value={songTitle}
                      onChange={(e) => setSongTitle(e.target.value)}
                      placeholder="Song title"
                      disabled={readOnly}
                    />
                    <input
                      className={inputClass}
                      value={songArtist}
                      onChange={(e) => setSongArtist(e.target.value)}
                      placeholder="Artist (optional)"
                      disabled={readOnly}
                    />
                  </div>
                </Field>

                {error && <Notice tone="error">{error}</Notice>}

                {!readOnly && (
                  <Button size="lg" arrow className="w-full" onClick={submit} disabled={submitting}>
                    {submitting ? "Sending..." : mode === "modify" ? "Update RSVP" : "Send RSVP"}
                  </Button>
                )}

                {readOnly && (
                  <div className="flex flex-col items-center gap-3 text-center">
                    <p className="text-sm text-ink-soft">You&apos;re viewing your reply.</p>
                    <Button variant="secondary" onClick={() => setMode("modify")}>
                      Make a change
                    </Button>
                  </div>
                )}
              </Card>
            </Reveal>
          </section>
        )}
      </div>
    </main>
  );
}
