"use client";

import { useState, useEffect, useCallback } from "react";

const CATEGORIES = ["all", "engagement", "wedding", "guest"];

export default function PhotoGalleryPage() {
  const [photos, setPhotos] = useState([]);
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Upload form state
  const [showUpload, setShowUpload] = useState(false);
  const [accessCode, setAccessCode] = useState("");
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState("");

  // Lightbox state
  const [lightbox, setLightbox] = useState(null);

  const fetchPhotos = useCallback(async (cat) => {
    setLoading(true);
    try {
      const params = cat && cat !== "all" ? `?category=${cat}` : "";
      const res = await fetch(`/api/photos${params}`);
      const json = await res.json();
      if (!json.ok) {
        setError(json.error || "Failed to load photos");
        return;
      }
      setPhotos(json.photos);
      setError("");
    } catch (e) {
      setError("Failed to load photos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPhotos(category);
  }, [category, fetchPhotos]);

  async function handleUpload(e) {
    e.preventDefault();
    if (!file) {
      setUploadMsg("Please select a file");
      return;
    }
    if (!accessCode.trim()) {
      setUploadMsg("Please enter your access code");
      return;
    }

    setUploading(true);
    setUploadMsg("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("access_code", accessCode.trim());
      fd.append("caption", caption.trim());

      const res = await fetch("/api/photos/upload", {
        method: "POST",
        body: fd,
      });
      const json = await res.json();
      if (!json.ok) {
        setUploadMsg(json.error || "Upload failed");
        return;
      }
      setUploadMsg("Photo uploaded! It will appear after approval.");
      setFile(null);
      setCaption("");
      // Reset file input
      const fileInput = document.getElementById("photo-file-input");
      if (fileInput) fileInput.value = "";
      await fetchPhotos(category);
    } catch {
      setUploadMsg("Upload failed — please try again");
    } finally {
      setUploading(false);
    }
  }

  return (
    <main className="min-h-screen py-12 px-4">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="font-[family-name:var(--font-cormorant)] text-5xl md:text-6xl text-sky-900 mb-4">
            Photo Gallery
          </h1>
          <div className="w-24 h-1 bg-sky-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600 font-[family-name:var(--font-cormorant)] italic">
            Moments captured, memories cherished
          </p>
        </div>

        {/* Category Filters + Upload Toggle */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`cursor-pointer rounded-full px-5 py-2 text-sm font-semibold tracking-wide uppercase transition-all duration-200 ${
                category === cat
                  ? "bg-sky-800 text-white shadow-md"
                  : "bg-white text-sky-800 border-2 border-sky-300 hover:border-sky-600 hover:bg-sky-50"
              }`}
            >
              {cat}
            </button>
          ))}
          <button
            onClick={() => setShowUpload((v) => !v)}
            className="cursor-pointer rounded-full px-5 py-2 text-sm font-semibold tracking-wide uppercase bg-amber-100 text-amber-800 border-2 border-amber-300 hover:bg-amber-200 transition-all duration-200"
          >
            {showUpload ? "Close Upload" : "Upload Photo"}
          </button>
        </div>

        {/* Upload Form */}
        {showUpload && (
          <div className="bg-white rounded-xl shadow-lg border-l-4 border-sky-600 p-6 mb-10 max-w-lg mx-auto">
            <h2 className="font-[family-name:var(--font-cormorant)] text-2xl text-sky-900 mb-4">
              Share Your Photo
            </h2>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-sky-800 mb-1">
                  Access Code <span className="text-red-500">*</span>
                </label>
                <input
                  className="w-full rounded-lg border-2 border-sky-400 px-4 py-3 focus:border-sky-600 focus:ring-2 focus:ring-sky-200 transition-all duration-200"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  placeholder="e.g. ABC123"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-sky-800 mb-1">
                  Photo <span className="text-red-500">*</span>
                </label>
                <input
                  id="photo-file-input"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-sky-100 file:text-sky-800 hover:file:bg-sky-200 file:cursor-pointer"
                />
                <p className="text-xs text-gray-400 mt-1">JPEG, PNG, or WebP. Max 10 MB.</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-sky-800 mb-1">
                  Caption
                </label>
                <input
                  className="w-full rounded-lg border-2 border-sky-400 px-4 py-3 focus:border-sky-600 focus:ring-2 focus:ring-sky-200 transition-all duration-200"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Add a caption..."
                />
              </div>
              <button
                type="submit"
                disabled={uploading}
                className="w-full cursor-pointer rounded-lg bg-sky-800 px-6 py-3 text-lg font-bold text-white hover:bg-sky-900 hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? "Uploading..." : "Upload"}
              </button>
              {uploadMsg && (
                <div
                  className={`p-3 rounded text-sm font-medium ${
                    uploadMsg.includes("uploaded")
                      ? "bg-green-50 text-green-700 border-l-4 border-green-400"
                      : "bg-red-50 text-red-700 border-l-4 border-red-400"
                  }`}
                >
                  {uploadMsg}
                </div>
              )}
            </form>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded mb-6 max-w-lg mx-auto">
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-16">
            <p className="text-gray-500">Loading photos...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && photos.length === 0 && (
          <p className="py-16 text-center text-gray-400 text-lg">
            No photos yet. Be the first to share a moment!
          </p>
        )}

        {/* Masonry Grid */}
        {!loading && photos.length > 0 && (
          <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="break-inside-avoid group relative overflow-hidden rounded-xl shadow-md cursor-pointer transition-transform duration-300 hover:scale-[1.02]"
                onClick={() => setLightbox(photo)}
              >
                <img
                  src={`/gallery/${photo.filename}`}
                  alt={photo.caption || "Wedding photo"}
                  className="w-full block"
                  loading="lazy"
                />
                {/* Hover overlay with caption */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                  {photo.caption && (
                    <p className="text-white text-sm font-medium mb-1">
                      {photo.caption}
                    </p>
                  )}
                  <p className="text-white/70 text-xs">
                    by {photo.uploaded_by}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Lightbox */}
        {lightbox && (
          <div
            className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
            onClick={() => setLightbox(null)}
          >
            <button
              onClick={() => setLightbox(null)}
              className="absolute top-6 right-6 cursor-pointer text-white/80 hover:text-white transition-colors z-10"
              aria-label="Close lightbox"
            >
              <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div
              className="max-w-5xl max-h-[90vh] relative"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={`/gallery/${lightbox.filename}`}
                alt={lightbox.caption || "Wedding photo"}
                className="max-w-full max-h-[85vh] object-contain rounded-lg"
              />
              {(lightbox.caption || lightbox.uploaded_by) && (
                <div className="mt-4 text-center">
                  {lightbox.caption && (
                    <p className="text-white text-lg font-[family-name:var(--font-cormorant)]">
                      {lightbox.caption}
                    </p>
                  )}
                  <p className="text-white/60 text-sm mt-1">
                    Uploaded by {lightbox.uploaded_by}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
