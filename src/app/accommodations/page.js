"use client";

import { useEffect, useState } from "react";

export default function AccommodationsPage() {
  const [embeds, setEmbeds] = useState([]);

  const [reservingEmbed, setReservingEmbed] = useState(null); // { id, embed_id } of the listing being reserved
  const [accessCode, setAccessCode] = useState("");
  const [codeError, setCodeError] = useState(null);
  const [loadingGroup, setLoadingGroup] = useState(false);
  const [group, setGroup] = useState(null);          // { group_id, family_name, members }
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
    fetch("/api/admin/lodging")
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) {
          setEmbeds(data.embeds);
          const alreadyReserved = new Set(
            data.embeds.filter((e) => e.is_reserved).map((e) => e.id)
          );
          setReservedEmbedIds(alreadyReserved);
        }
      });
  }, []);

  useEffect(() => {
    if (embeds.length > 0) {
      loadAirbnbSDK();
    }
  }, [embeds]);

  // open the modal for a specific listing
  function openReserve(embed) {
    setReservingEmbed(embed);
    setAccessCode("");
    setCodeError(null);
    setGroup(null);
    setSelectedIds([]);
    setSubmitError(null);
    setSubmitSuccess(false);
  }

  function closeModal(markReserved = false) {
    if (markReserved && reservingEmbed) {
      setReservedEmbedIds((prev) => new Set([...prev, reservingEmbed.id]));
    }
    setReservingEmbed(null);
  }

  // look up family by access code
  async function lookupCode() {
    setCodeError(null);
    setLoadingGroup(true);
    try {
      const res = await fetch(`/api/groups?code=${encodeURIComponent(accessCode.trim())}`);
      const json = await res.json();
      if (!json.ok) {
        setCodeError(json.error || "Invalid access code");
        return;
      }
      setGroup(json);
      // select all members by default
      setSelectedIds(json.members.map((m) => m.user_id));
    } catch {
      setCodeError("Something went wrong. Please try again.");
    } finally {
      setLoadingGroup(false);
    }
  }

  function toggleMember(uid) {
    setSelectedIds((prev) =>
      prev.includes(uid) ? prev.filter((x) => x !== uid) : [...prev, uid]
    );
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
          access_code: accessCode.trim(),
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
    <main className="min-h-screen py-12">

      <div className="max-w-5xl mx-auto px-4">

        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="font-[family-name:var(--font-cormorant)] text-5xl md:text-6xl font-light tracking-wide text-sky-900 mb-3">
            Lodging
          </h1>
          <div className="w-32 h-px bg-sky-600 mx-auto mb-4"></div>
          <p className="text-lg text-sky-800/70 italic">
            Places to Stay Near the Venue
          </p>
        </div>

        {/* Shuttle Notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-8 py-6 mb-12 text-center">
          <h2 className="font-[family-name:var(--font-cormorant)] text-2xl text-sky-900 mb-2">
            Shuttle Service Available
          </h2>
          <p className="text-sky-800/70 text-sm leading-relaxed max-w-2xl mx-auto">
            We will be providing a complimentary shuttle service to and from the hotel on the day of the wedding.
            If you choose not to use the shuttle, please plan accordingly and arrange for safe transportation.
            Please note there <strong>will</strong> be a sheriff monitoring for drunk driving.
          </p>
        </div>

        {/* Airbnb Section Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-sky-100 p-8 text-center mb-10">
          <h2 className="font-[family-name:var(--font-cormorant)] text-3xl text-sky-900 mb-3">
            Airbnb Rentals
          </h2>
          <div className="w-16 h-px bg-sky-600 mx-auto mb-4"></div>
          <p className="text-sky-800/70 text-sm leading-relaxed max-w-2xl mx-auto">
            We have handpicked a few nearby Airbnb rentals for your convenience.
            These are great options for families or groups looking to stay close to the venue.
          </p>
        </div>

        {/* Airbnb Listings */}
        {embeds.length > 0 && (
          <div className="flex flex-wrap justify-center items-start gap-8 mb-16">
            {embeds.map((embed) => (
              <div key={embed.id} className="flex flex-col items-center gap-4 w-full md:w-auto">
                {/* Responsive wrapper — clips the fixed-size embed on small screens */}
                <div className="overflow-hidden rounded-lg w-full" style={{ maxWidth: "450px" }}>
                  <div
                    className="airbnb-embed-frame"
                    data-id={embed.embed_id}
                    data-view="home"
                    data-hide-price="true"
                    style={{ width: "450px", height: "300px" }}
                  >
                    <a href={`https://www.airbnb.com/rooms/${embed.embed_id}`}>
                      View On Airbnb
                    </a>
                  </div>
                </div>

                {/* Reserve button — greyed out once reserved */}
                <button
                  onClick={() => !reservedEmbedIds.has(embed.id) && openReserve(embed)}
                  disabled={reservedEmbedIds.has(embed.id)}
                  className={`w-full rounded-lg px-8 py-3 text-sm font-semibold transition-all duration-200 shadow-md ${
                    reservedEmbedIds.has(embed.id)
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "cursor-pointer bg-sky-800 text-white hover:bg-sky-900 hover:scale-[1.02]"
                  }`}
                  style={{ maxWidth: "450px" }}
                >
                  {reservedEmbedIds.has(embed.id) ? "Reserved" : "Reserve This Listing"}
                </button>
              </div>
            ))}
          </div>
        )}


      </div>

      {/* ——— Reservation Modal ——— */}
      {reservingEmbed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl border-4 border-double border-sky-400 w-full max-w-md relative overflow-y-auto max-h-[90vh]">

            {/* Decorative corners */}
            <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-sky-300 opacity-50 pointer-events-none"></div>
            <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-sky-300 opacity-50 pointer-events-none"></div>

            <div className="p-8">

              {/* Success state */}
              {submitSuccess ? (
                <div className="text-center py-4">
                  <div className="text-5xl mb-4">🏡</div>
                  <h2 className="font-[family-name:var(--font-cormorant)] text-3xl text-sky-900 mb-2">
                    Reservation Saved!
                  </h2>
                  <p className="text-sky-800/70 text-sm mb-6">
                    We&apos;ve noted that the <strong>{group?.group?.family_name}</strong> family will be staying at this listing.
                  </p>
                  <button
                    onClick={() => closeModal(true)}
                    className="cursor-pointer rounded-lg bg-sky-800 px-8 py-3 text-sm font-bold text-white hover:bg-sky-900 transition-colors"
                  >
                    Done
                  </button>
                </div>

              ) : !group ? (
                /* Step 1: Enter access code */
                <>
                  <div className="text-center mb-6">
                    <h2 className="font-[family-name:var(--font-cormorant)] text-3xl text-sky-900 mb-1">
                      Reserve This Listing
                    </h2>
                    <p className="text-gray-500 text-sm">Enter your access code to get started</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-sky-800 mb-2">
                        Access Code
                      </label>
                      <input
                        className="w-full rounded-lg border-2 border-sky-400 px-4 py-3 text-lg focus:border-sky-600 focus:ring-2 focus:ring-sky-200 transition-all duration-200"
                        value={accessCode}
                        onChange={(e) => setAccessCode(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && lookupCode()}
                        placeholder="e.g. ABC123"
                      />
                    </div>

                    {codeError && (
                      <div className="bg-red-50 border-l-4 border-red-400 p-3 rounded">
                        <p className="text-red-700 text-sm font-medium">{codeError}</p>
                      </div>
                    )}

                    <button
                      onClick={lookupCode}
                      disabled={loadingGroup || !accessCode.trim()}
                      className="cursor-pointer w-full rounded-lg bg-sky-800 px-6 py-3 text-sm font-bold text-white hover:bg-sky-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loadingGroup ? "Looking up..." : "Continue"}
                    </button>

                    <button
                      onClick={closeModal}
                      className="cursor-pointer w-full rounded-lg border border-gray-300 px-6 py-3 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </>

              ) : (
                /* Step 2: Select family members */
                <>
                  <div className="mb-6">
                    <h2 className="font-[family-name:var(--font-cormorant)] text-3xl text-sky-900 mb-1">
                      {group.group.family_name} Family
                    </h2>
                    <p className="text-gray-500 text-sm">Who will be staying at this listing?</p>
                  </div>

                  <div className="space-y-2 mb-6">
                    {group.members.map((m) => (
                      <label
                        key={m.user_id}
                        className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-sky-50 cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          className="cursor-pointer w-5 h-5 text-sky-600 rounded focus:ring-sky-500"
                          checked={selectedIds.includes(m.user_id)}
                          onChange={() => toggleMember(m.user_id)}
                        />
                        <span className="text-gray-800">{m.name}</span>
                      </label>
                    ))}
                  </div>

                  {submitError && (
                    <div className="bg-red-50 border-l-4 border-red-400 p-3 rounded mb-4">
                      <p className="text-red-700 text-sm font-medium">{submitError}</p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => setGroup(null)}
                      className="cursor-pointer flex-1 rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleReserve}
                      disabled={submitting || selectedIds.length === 0}
                      className="cursor-pointer flex-1 rounded-lg bg-sky-800 px-4 py-3 text-sm font-bold text-white hover:bg-sky-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? "Saving..." : "Confirm Reservation"}
                    </button>
                  </div>

                  <button
                    onClick={closeModal}
                    className="cursor-pointer w-full mt-3 text-sm text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                </>
              )}

            </div>
          </div>
        </div>
      )}

    </main>
  );
}
