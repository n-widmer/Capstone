"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "@phosphor-icons/react";
import FamilyFinder from "@/components/FamilyFinder";
import {
  Button,
  Card,
  Field,
  Notice,
  PageHeader,
  Pill,
  Reveal,
  Skeleton,
  inputClass,
  EASE,
} from "@/components/ui";

const CATEGORIES = [
  { key: "all", label: "All" },
  { key: "engagement", label: "Engagement" },
  { key: "wedding", label: "Wedding" },
  { key: "guest", label: "From Guests" },
];

export default function PhotoGalleryPage() {
  const [photos, setPhotos] = useState([]);
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Upload form state
  const [showUpload, setShowUpload] = useState(false);
  const [groupId, setGroupId] = useState(null);
  const [familyName, setFamilyName] = useState("");
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
    } catch {
      setError("Failed to load photos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPhotos(category);
  }, [category, fetchPhotos]);

  // Reuse the family the guest already identified as this session.
  useEffect(() => {
    let active = true;
    fetch("/api/guest-group")
      .then((r) => r.json())
      .then((json) => {
        if (active && json.ok && json.group) {
          setGroupId(json.group.group_id);
          setFamilyName(json.group.family_name);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  // Close the lightbox on Escape.
  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e) => e.key === "Escape" && setLightbox(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox]);

  function handleSelected(payload) {
    setGroupId(payload.group.group_id);
    setFamilyName(payload.group.family_name);
    setUploadMsg("");
  }

  async function switchFamily() {
    await fetch("/api/guest-group", { method: "DELETE" }).catch(() => {});
    setGroupId(null);
    setFamilyName("");
  }

  async function handleUpload(e) {
    e.preventDefault();
    if (!groupId) {
      setUploadMsg("Please find your name first");
      return;
    }
    if (!file) {
      setUploadMsg("Please select a file");
      return;
    }

    setUploading(true);
    setUploadMsg("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("group_id", String(groupId));
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
      setUploadMsg("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  const uploadOk = uploadMsg.includes("uploaded");

  return (
    <main className="min-h-screen px-4 pb-16">
      <PageHeader title="Photos" subtitle="Moments captured, memories cherished" />

      <div className="mx-auto max-w-6xl">
        {/* Filters + upload toggle */}
        <Reveal className="mb-10 flex flex-wrap items-center justify-center gap-2.5">
          {CATEGORIES.map((cat) => (
            <Pill key={cat.key} active={category === cat.key} onClick={() => setCategory(cat.key)}>
              {cat.label}
            </Pill>
          ))}
          <span className="mx-1 hidden h-6 w-px bg-ink/15 sm:block" aria-hidden="true" />
          <Button variant="secondary" size="sm" onClick={() => setShowUpload((v) => !v)}>
            {showUpload ? "Close" : "Share a photo"}
          </Button>
        </Reveal>

        {/* Upload form */}
        <AnimatePresence initial={false}>
          {showUpload && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="overflow-hidden"
            >
              <Card className="mx-auto mb-12 max-w-lg" inner="px-6 py-8 sm:px-8">
                <h2 className="font-display text-3xl font-light text-ink">Share your photo</h2>

                {!groupId ? (
                  <>
                    <p className="mb-5 mt-2 text-sm text-ink-soft">
                      Find your name so we know who shared the photo.
                    </p>
                    <FamilyFinder onSelected={handleSelected} />
                  </>
                ) : (
                  <form onSubmit={handleUpload} className="mt-5 space-y-5">
                    <div className="flex items-center justify-between rounded-xl bg-paper-deep px-4 py-2.5">
                      <p className="text-sm text-ink">
                        Sharing as the <strong className="font-medium">{familyName}</strong> family
                      </p>
                      <button
                        type="button"
                        onClick={switchFamily}
                        className="cursor-pointer text-xs text-ink-soft underline decoration-ink/30 underline-offset-4 hover:text-ink"
                      >
                        Not you?
                      </button>
                    </div>
                    <Field label="Photo" hint="JPEG, PNG, or WebP. Max 10 MB.">
                      <input
                        id="photo-file-input"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        className="block w-full text-sm text-ink-soft file:mr-4 file:cursor-pointer file:rounded-full file:border-0 file:bg-ink file:px-5 file:py-2.5 file:text-sm file:font-medium file:text-white hover:file:bg-ink/90"
                      />
                    </Field>
                    <Field label="Caption (optional)">
                      <input
                        className={inputClass}
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        placeholder="Add a caption"
                      />
                    </Field>
                    <Button type="submit" arrow className="w-full" disabled={uploading}>
                      {uploading ? "Uploading..." : "Upload"}
                    </Button>
                  </form>
                )}

                {uploadMsg && (
                  <Notice tone={uploadOk ? "success" : "error"} className="mt-5">
                    {uploadMsg}
                  </Notice>
                )}
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <Notice tone="error" className="mx-auto mb-6 max-w-lg">
            {error}
          </Notice>
        )}

        {/* Loading */}
        {loading && (
          <div className="columns-2 gap-4 space-y-4 md:columns-3 lg:columns-4">
            {[220, 300, 180, 260, 240, 320, 200, 280].map((h, i) => (
              <Skeleton key={i} className="break-inside-avoid" style={{ height: h }} />
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && photos.length === 0 && (
          <Reveal className="mx-auto max-w-md py-16 text-center">
            <p className="font-display text-3xl font-light italic text-ink">Nothing here yet</p>
            <p className="mt-3 text-sm text-ink-soft">
              Be the first to share a moment. Photos appear once the couple approves them.
            </p>
          </Reveal>
        )}

        {/* Masonry */}
        {!loading && photos.length > 0 && (
          <div className="columns-2 gap-4 space-y-4 md:columns-3 lg:columns-4">
            {photos.map((photo, i) => (
              <motion.button
                key={photo.id}
                type="button"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: Math.min(i, 8) * 0.04, ease: EASE }}
                className="group relative block w-full cursor-pointer break-inside-avoid overflow-hidden rounded-2xl bg-paper-deep ring-1 ring-ink/10 shadow-lift"
                onClick={() => setLightbox(photo)}
              >
                <img
                  src={`/api/photos/${photo.id}/image`}
                  alt={photo.caption || "Wedding photo"}
                  className="block w-full transition-transform duration-1000 ease-[var(--ease-soft)] group-hover:scale-[1.03]"
                  loading="lazy"
                />
                <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-ink/70 via-transparent to-transparent p-4 text-left opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                  {photo.caption && <p className="text-sm text-white">{photo.caption}</p>}
                  <p className="text-xs text-white/70">by {photo.uploaded_by}</p>
                </div>
              </motion.button>
            ))}
          </div>
        )}

        {/* Lightbox */}
        <AnimatePresence>
          {lightbox && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/90 p-4 backdrop-blur-sm"
              onClick={() => setLightbox(null)}
              role="dialog"
              aria-modal="true"
            >
              <button
                type="button"
                onClick={() => setLightbox(null)}
                className="absolute right-5 top-5 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                aria-label="Close"
              >
                <X size={20} weight="light" />
              </button>
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.5, ease: EASE }}
                className="relative max-h-[90vh] max-w-5xl"
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  src={`/api/photos/${lightbox.id}/image`}
                  alt={lightbox.caption || "Wedding photo"}
                  className="max-h-[82vh] max-w-full rounded-2xl object-contain"
                />
                {(lightbox.caption || lightbox.uploaded_by) && (
                  <div className="mt-4 text-center">
                    {lightbox.caption && (
                      <p className="font-display text-xl text-white">{lightbox.caption}</p>
                    )}
                    <p className="mt-1 text-xs text-white/60">Shared by {lightbox.uploaded_by}</p>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
