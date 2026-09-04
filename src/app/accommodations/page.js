"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "@phosphor-icons/react";
import FamilyFinder from "@/components/FamilyFinder";
import { Button, Card, Flourish, Notice, PageHeader, Reveal, Skeleton, EASE } from "@/components/ui";

export default function AccommodationsPage() {
  const [embeds, setEmbeds] = useState([]);
  const [loadingEmbeds, setLoadingEmbeds] = useState(true);

  const [reservingEmbed, setReservingEmbed] = useState(null); // { id, embed_id } of the listing being reserved
  const [identityGroup, setIdentityGroup] = useState(null); // remembered family for the session
  const [codeError, setCodeError] = useState(null);
  const [loadingGroup, setLoadingGroup] = useState(false);
  const [group, setGroup] = useState(null); // { group, members } chosen for this reservation
  const [selectedIds, setSelectedIds] = useState([]); // user_ids of selected guests
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [reservedEmbedIds, setReservedEmbedIds] = useState(new Set());

  function loadAirbnbSDK() {
    const existing = document.querySelector('script[src*="airbnb_jssdk"]');
    if (existing) existing.remove();
    const script = document.createElement("script");
    script.src = "https://www.airbnb.com/embeddable/airbnb_jssdk";
    script.async = true;
    document.body.appendChild(script);
  }

  useEffect(() => {
    fetch("/api/lodging")
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) {
          setEmbeds(data.embeds);
          const alreadyReserved = new Set(
            data.embeds.filter((e) => e.is_reserved).map((e) => e.id)
          );
          setReservedEmbedIds(alreadyReserved);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingEmbeds(false));
  }, []);

  // Reuse the family the guest already identified as this session.
  useEffect(() => {
    let active = true;
    fetch("/api/guest-group")
      .then((r) => r.json())
      .then((json) => {
        if (active && json.ok && json.group) setIdentityGroup(json);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (embeds.length > 0) {
      loadAirbnbSDK();
    }
  }, [embeds]);

  // open the modal for a specific listing
  function openReserve(embed) {
    setReservingEmbed(embed);
    setCodeError(null);
    setGroup(null);
    setSelectedIds([]);
    setSubmitError(null);
    setSubmitSuccess(false);
    // If we already know who they are, skip straight to the reservation check.
    if (identityGroup) {
      proceedWithGroup(identityGroup);
    }
  }

  // Called only by Cancel; never modifies reservedEmbedIds
  function cancelModal() {
    setReservingEmbed(null);
  }

  // Called only by Done after a successful reservation
  function completeReservation() {
    if (reservingEmbed) {
      setReservedEmbedIds((prev) => new Set([...prev, reservingEmbed.id]));
    }
    setReservingEmbed(null);
  }

  // Confirm a family can reserve (no existing reservation) and move to guest selection.
  async function proceedWithGroup(payload) {
    setCodeError(null);
    setLoadingGroup(true);
    try {
      const checkRes = await fetch(
        `/api/lodging/check?group_id=${encodeURIComponent(payload.group.group_id)}`
      );
      const check = await checkRes.json();
      if (!check.ok) {
        setCodeError(check.error || "Could not verify reservation status. Please try again.");
        return;
      }
      if (check.hasReservation) {
        setCodeError("Your family already has a reservation at one of the listings.");
        return;
      }
      setGroup(payload);
      setSelectedIds(payload.members.map((m) => m.user_id));
    } catch {
      setCodeError("Something went wrong. Please try again.");
    } finally {
      setLoadingGroup(false);
    }
  }

  function handleSelected(payload) {
    setIdentityGroup(payload);
    proceedWithGroup(payload);
  }

  function toggleMember(uid) {
    setSelectedIds((prev) => (prev.includes(uid) ? prev.filter((x) => x !== uid) : [...prev, uid]));
  }

  // submit the reservation
  async function handleReserve() {
    if (selectedIds.length === 0) {
      setSubmitError("Please select at least one guest.");
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/lodging/reserve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          group_id: group.group.group_id,
          lodging_embed_id: reservingEmbed.id,
          guest_ids: selectedIds,
        }),
      });
      const json = await res.json();
      if (!json.ok) {
        setSubmitError(json.error || "Failed to save reservation");
        return;
      }
      setSubmitSuccess(true);
    } catch {
      setSubmitError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen px-4 pb-16">
      <PageHeader title="Lodging" subtitle="Places to stay near the venue" />

      <div className="mx-auto max-w-5xl">
        {/* Shuttle notice */}
        <Reveal className="mx-auto max-w-3xl">
          <Card tone="butter" inner="px-8 py-9 text-center md:px-12">
            <h2 className="font-display text-3xl font-light text-ink">Shuttle service</h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-ink">
              We will be providing a complimentary shuttle service to and from the hotel on the
              day of the wedding. If you choose not to use the shuttle, please plan accordingly
              and arrange for safe transportation. Please note there{" "}
              <strong className="font-medium">will</strong> be a sheriff monitoring for drunk
              driving.
            </p>
          </Card>
        </Reveal>

        {/* Airbnb intro */}
        <Reveal className="mx-auto mt-24 max-w-2xl text-center">
          <h2 className="font-display text-4xl font-light text-ink md:text-5xl">Airbnb rentals</h2>
          <p className="mt-4 text-base leading-relaxed text-ink-soft">
            We have handpicked a few nearby Airbnb rentals for your convenience. These are great
            options for families or groups looking to stay close to the venue. Reserve one here
            so we know where everyone is, then book it on Airbnb.
          </p>
        </Reveal>

        {/* Listings */}
        <div className="mt-12 flex flex-wrap items-start justify-center gap-8">
          {loadingEmbeds &&
            [0, 1].map((i) => <Skeleton key={i} className="h-[520px] w-full max-w-[450px]" />)}

          {!loadingEmbeds && embeds.length === 0 && (
            <p className="py-10 font-display text-2xl italic text-ink-soft">
              Listings coming soon.
            </p>
          )}

          {embeds.map((embed, i) => {
            const reserved = reservedEmbedIds.has(embed.id);
            return (
              <Reveal key={embed.id} delay={i * 0.05} className="w-full max-w-[450px]">
                <Card inner="overflow-hidden">
                  {/* Embed: fixed native size, clipped to card width on narrow screens */}
                  <div className="overflow-hidden rounded-t-[calc(1.75rem-0.375rem)]" style={{ height: 450 }}>
                    <div
                      className="airbnb-embed-frame"
                      data-id={embed.embed_id}
                      data-view="home"
                      data-hide-price="true"
                      style={{ width: 450, height: 450 }}
                    >
                      <a href={`https://www.airbnb.com/rooms/${embed.embed_id}`}>View On Airbnb</a>
                    </div>
                  </div>

                  <div className="p-4">
                    <Button
                      className="w-full"
                      variant={reserved ? "secondary" : "primary"}
                      disabled={reserved}
                      onClick={() => !reserved && openReserve(embed)}
                    >
                      {reserved ? "Reserved" : "Reserve this listing"}
                    </Button>
                  </div>
                </Card>
              </Reveal>
            );
          })}
        </div>
      </div>

      {/* Reservation modal */}
      <AnimatePresence>
        {reservingEmbed && (
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
              <Card inner="max-h-[90vh] overflow-y-auto px-7 py-9 sm:px-9">
                {submitSuccess ? (
                  <div className="py-2 text-center">
                    <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-ink text-white">
                      <Check size={22} weight="light" />
                    </span>
                    <h2 className="mt-5 font-display text-3xl font-light text-ink">
                      Reservation saved
                    </h2>
                    <p className="mt-2 text-sm text-ink-soft">
                      We&apos;ve noted that the{" "}
                      <strong className="font-medium text-ink">{group?.group?.family_name}</strong>{" "}
                      family will be staying at this listing.
                    </p>
                    <Button className="mt-7" onClick={completeReservation}>
                      Done
                    </Button>
                  </div>
                ) : !group ? (
                  /* Step 1: Identify the family */
                  <>
                    <div className="mb-6 text-center">
                      <Flourish className="mb-5" />
                      <h2 className="font-display text-3xl font-light text-ink">
                        Reserve this listing
                      </h2>
                      <p className="mt-1 text-sm text-ink-soft">Find your name to get started</p>
                    </div>

                    <div className="space-y-4">
                      {loadingGroup ? (
                        <p className="py-4 text-center text-sm text-ink-soft">
                          Checking your reservation...
                        </p>
                      ) : (
                        <FamilyFinder onSelected={handleSelected} />
                      )}

                      {codeError && <Notice tone="error">{codeError}</Notice>}

                      <Button variant="ghost" className="w-full" onClick={cancelModal}>
                        Cancel
                      </Button>
                    </div>
                  </>
                ) : (
                  /* Step 2: Select family members */
                  <>
                    <div className="mb-6">
                      <h2 className="font-display text-3xl font-light text-ink">
                        {group.group.family_name} Family
                      </h2>
                      <p className="mt-1 text-sm text-ink-soft">
                        Who will be staying at this listing?
                      </p>
                    </div>

                    <div className="mb-6 space-y-2">
                      {group.members.map((m) => {
                        const checked = selectedIds.includes(m.user_id);
                        return (
                          <label
                            key={m.user_id}
                            className={`flex cursor-pointer items-center gap-3 rounded-2xl px-4 py-3 ring-1 transition-all duration-500 ease-[var(--ease-soft)] ${
                              checked ? "bg-dusk-soft ring-dusk" : "bg-card ring-ink/10 hover:ring-ink/25"
                            }`}
                          >
                            <input
                              type="checkbox"
                              className="h-5 w-5 cursor-pointer rounded"
                              checked={checked}
                              onChange={() => toggleMember(m.user_id)}
                            />
                            <span className="text-base text-ink">{m.name}</span>
                          </label>
                        );
                      })}
                    </div>

                    {submitError && (
                      <Notice tone="error" className="mb-4">
                        {submitError}
                      </Notice>
                    )}

                    <div className="flex gap-3">
                      <Button variant="secondary" className="flex-1" onClick={() => setGroup(null)}>
                        Back
                      </Button>
                      <Button
                        className="flex-1"
                        onClick={handleReserve}
                        disabled={submitting || selectedIds.length === 0}
                      >
                        {submitting ? "Saving..." : "Confirm"}
                      </Button>
                    </div>

                    <Button variant="ghost" className="mt-2 w-full" onClick={cancelModal}>
                      Cancel
                    </Button>
                  </>
                )}
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
