"use client";

import { useEffect, useState, useCallback } from "react";

export default function AdminPhotosPage() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchPhotos = useCallback(async () => {
    try {
      const res = await fetch("/api/photos?admin=true");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Unknown error");
      setPhotos(data.photos);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  async function handleAction(photoId, action) {
    setActionLoading(photoId);
    try {
      const res = await fetch("/api/admin/photos", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photo_id: photoId, action }),
      });
      const data = await res.json();
      if (!data.ok) {
        setError(data.error || "Action failed");
        return;
      }
      await fetchPhotos();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  }

  if (error) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-red-600">Error loading photos: {error}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-gray-500">Loading photos...</p>
      </div>
    );
  }

  const pending = photos.filter((p) => !p.approved);
  const approved = photos.filter((p) => p.approved);

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="font-[family-name:var(--font-cormorant)] text-4xl font-bold text-sky-900 mb-2">
        Photo Moderation
      </h1>
      <p className="mb-8 text-sm text-gray-500">
        {photos.length} total photo{photos.length !== 1 ? "s" : ""} &middot;{" "}
        {pending.length} pending approval
      </p>

      {/* Pending Section */}
      <section className="mb-12">
        <h2 className="font-[family-name:var(--font-cormorant)] text-2xl text-sky-900 mb-4 flex items-center gap-2">
          Pending Approval
          {pending.length > 0 && (
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-100 text-amber-800 text-sm font-bold">
              {pending.length}
            </span>
          )}
        </h2>

        {pending.length === 0 ? (
          <p className="py-8 text-center text-gray-400">
            No photos pending approval.
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {pending.map((photo) => (
              <div
                key={photo.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
              >
                <div className="aspect-square relative">
                  <img
                    src={`/gallery/${photo.filename}`}
                    alt={photo.caption || "Pending photo"}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="p-3">
                  {photo.caption && (
                    <p className="text-sm text-gray-700 truncate mb-1">
                      {photo.caption}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mb-3">
                    by {photo.uploaded_by}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAction(photo.id, "approve")}
                      disabled={actionLoading === photo.id}
                      className="flex-1 cursor-pointer rounded-lg bg-green-600 px-3 py-2 text-xs font-bold text-white hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleAction(photo.id, "reject")}
                      disabled={actionLoading === photo.id}
                      className="flex-1 cursor-pointer rounded-lg bg-red-600 px-3 py-2 text-xs font-bold text-white hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Approved Section */}
      <section>
        <h2 className="font-[family-name:var(--font-cormorant)] text-2xl text-sky-900 mb-4">
          Approved Photos
        </h2>

        {approved.length === 0 ? (
          <p className="py-8 text-center text-gray-400">
            No approved photos yet.
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {approved.map((photo) => (
              <div
                key={photo.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
              >
                <div className="aspect-square relative">
                  <img
                    src={`/gallery/${photo.filename}`}
                    alt={photo.caption || "Approved photo"}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="p-3">
                  {photo.caption && (
                    <p className="text-sm text-gray-700 truncate mb-1">
                      {photo.caption}
                    </p>
                  )}
                  <p className="text-xs text-gray-400">
                    by {photo.uploaded_by} &middot; {photo.category}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
