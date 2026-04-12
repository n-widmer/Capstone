"use client";

import { useEffect, useState, useCallback } from "react";

export default function AdminLodgingPage() {
  const [embeds, setEmbeds] = useState([]);
  const [reservations, setReservations] = useState({}); // { [lodging_embed_id]: { family_name, guest_names } }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [embedCode, setEmbedCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [confirmId, setConfirmId] = useState(null);       // embed id pending removal from site
  const [clearingId, setClearingId] = useState(null);     // embed id pending guest removal

  // Re-inject the Airbnb SDK script so it picks up newly rendered embed divs
  function loadAirbnbSDK() {
    const existing = document.querySelector('script[src*="airbnb_jssdk"]');
    if (existing) existing.remove();
    const script = document.createElement("script");
    script.src = "https://www.airbnb.com/embeddable/airbnb_jssdk";
    script.async = true;
    document.body.appendChild(script);
  }

  const fetchEmbeds = useCallback(async () => {
    try {
      const [embedRes, resRes] = await Promise.all([
        fetch("/api/admin/lodging"),
        fetch("/api/admin/lodging/reservations"),
      ]);
      const embedData = await embedRes.json();
      const resData = await resRes.json();
      if (!embedData.ok) throw new Error(embedData.error || "Failed to load");
      setEmbeds(embedData.embeds);
      setReservations(resData.ok ? resData.reservations : {});
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmbeds();
  }, [fetchEmbeds]);

  // Load SDK after embeds render so the divs exist when it runs
  useEffect(() => {
    if (embeds.length > 0) {
      loadAirbnbSDK();
    }
  }, [embeds]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/admin/lodging", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ embed_code: embedCode }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Failed to add listing");
      setEmbedCode("");
      await fetchEmbeds();
    } catch (e) {
      setSubmitError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  // Remove the listing from the site entirely
  async function confirmDelete() {
    try {
      const res = await fetch("/api/admin/lodging", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: confirmId }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Failed to delete");
      await fetchEmbeds();
    } catch (e) {
      setError(e.message);
    } finally {
      setConfirmId(null);
    }
  }

  // Remove guests from a listing and make it reservable again
  async function confirmClearGuests() {
    try {
      const res = await fetch("/api/admin/lodging/reservations", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lodging_embed_id: clearingId }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Failed to remove guests");
      await fetchEmbeds();
    } catch (e) {
      setError(e.message);
    } finally {
      setClearingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-4xl">

      {/* Confirm remove listing modal */}
      {confirmId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full mx-4">
            <h3 className="font-[family-name:var(--font-cormorant)] text-2xl text-sky-900 mb-2">
              Remove Listing?
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              This will remove the listing from the lodging page. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmId(null)}
                className="cursor-pointer flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="cursor-pointer flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700 transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm remove guests modal */}
      {clearingId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full mx-4">
            <h3 className="font-[family-name:var(--font-cormorant)] text-2xl text-sky-900 mb-2">
              Remove Guests?
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              This will clear all guests from this listing and make it available to reserve again.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setClearingId(null)}
                className="cursor-pointer flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmClearGuests}
                className="cursor-pointer flex-1 rounded-lg bg-amber-600 px-4 py-2 text-sm font-bold text-white hover:bg-amber-700 transition-colors"
              >
                Remove Guests
              </button>
            </div>
          </div>
        </div>
      )}

      <h1 className="font-[family-name:var(--font-cormorant)] text-4xl font-bold text-sky-900 mb-2">
        Lodging
      </h1>
      <p className="mb-6 text-sm text-gray-500">
        Manage Airbnb listings displayed on the lodging page.
      </p>

      {/* How to get the embed code */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-8">
        <h2 className="text-sm font-semibold text-amber-900 mb-3">How to get the embed code</h2>
        <ol className="space-y-2 text-sm text-amber-800 list-decimal list-inside">
          <li>Go to the Airbnb listing you want to add</li>
          <li>Click the <strong>Share</strong> button on the listing page</li>
          <li>Select <strong>Embed</strong></li>
          <li>Copy the full embed code that appears</li>
          <li>Paste it into the box below and click <strong>Add Listing</strong></li>
        </ol>
      </div>

      {/* Add new listing form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="font-[family-name:var(--font-cormorant)] text-2xl text-sky-900 mb-4">
          Add a Listing
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Airbnb Embed Code <span className="text-red-500">*</span>
            </label>
            <textarea
              value={embedCode}
              onChange={(e) => setEmbedCode(e.target.value)}
              placeholder="Paste the full Airbnb embed code here..."
              rows={6}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-sky-400"
              required
            />
          </div>
          {submitError && (
            <p className="text-red-600 text-sm">{submitError}</p>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="cursor-pointer rounded-lg bg-sky-900 px-6 py-2 text-sm text-white hover:bg-sky-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Adding..." : "Add Listing"}
          </button>
        </form>
      </div>

      {/* Current listings */}
      <div>
        <h2 className="font-[family-name:var(--font-cormorant)] text-2xl text-sky-900 mb-4">
          Current Listings
        </h2>

        {loading ? (
          <p className="text-gray-400 text-sm">Loading...</p>
        ) : error ? (
          <p className="text-red-600 text-sm">{error}</p>
        ) : embeds.length === 0 ? (
          <p className="text-gray-400 text-sm py-8 text-center">No listings added yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {embeds.map((embed) => {
              const reservation = reservations[embed.id];
              return (
                <div
                  key={embed.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                >
                  {/* Airbnb embed — responsive wrapper clips on small screens */}
                  <div className="p-3">
                    <div className="overflow-hidden rounded-lg mx-auto" style={{ width: "350px" }}>
                      <div
                        className="airbnb-embed-frame"
                        data-id={embed.embed_id}
                        data-view="home"
                        data-hide-price="true"
                        style={{ width: "350px", height: "230px" }}
                      >
                        <a href={`https://www.airbnb.com/rooms/${embed.embed_id}`}>
                          View on Airbnb
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Reservation info */}
                  <div className="px-4 pb-2">
                    {reservation ? (
                      <div className="bg-sky-50 border border-sky-200 rounded-lg px-3 py-2">
                        <p className="text-xs font-semibold text-sky-800 mb-1">
                          Reserved — {reservation.family_name} Family
                        </p>
                        <ul className="space-y-0.5">
                          {reservation.guest_names.map((name) => (
                            <li key={name} className="text-xs text-sky-700">
                              • {name}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 italic">No reservation yet</p>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="px-3 pb-3 pt-2 flex gap-2">
                    {reservation && (
                      <button
                        onClick={() => setClearingId(embed.id)}
                        className="cursor-pointer flex-1 rounded-lg bg-amber-500 py-1.5 text-xs font-bold text-white hover:bg-amber-600 transition-colors"
                      >
                        Remove Guests
                      </button>
                    )}
                    <button
                      onClick={() => setConfirmId(embed.id)}
                      className="cursor-pointer flex-1 rounded-lg bg-red-600 py-1.5 text-xs font-bold text-white hover:bg-red-700 transition-colors"
                    >
                      Remove Listing
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
