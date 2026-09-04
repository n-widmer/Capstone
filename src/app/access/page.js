"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { Button, Card, Field, Flourish, Notice, inputClass, EASE } from "@/components/ui";
import { DATE_LABEL } from "@/lib/wedding";

function AccessPageContent() {
  const searchParams = useSearchParams();
  const reduce = useReducedMotion();
  const next = searchParams.get("next") || "/";

  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [opening, setOpening] = useState(false);

  async function submitAccessCode(e) {
    e?.preventDefault();
    if (!code.trim() || loading) return;
    setError("");
    setLoading(true);

    const res = await fetch("/api/guest-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ access_code: code.trim() }),
    });

    const json = await res.json().catch(() => null);
    setLoading(false);

    if (!res.ok || !json?.ok) {
      setError(json?.error || "That code didn't match. Check your invitation and try again.");
      return;
    }

    // Let the card lift away before the page turns.
    setOpening(true);
    setTimeout(() => window.location.assign(next), reduce ? 0 : 650);
  }

  return (
    <main className="relative flex min-h-[100dvh] items-center justify-center px-4 py-16">
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 24, filter: "blur(6px)" }}
        animate={
          opening
            ? { opacity: 0, y: -40, scale: 0.96, filter: "blur(8px)" }
            : { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }
        }
        transition={{ duration: opening ? 0.65 : 1, ease: EASE }}
        className="relative z-10 w-full max-w-md"
      >
        <Card inner="px-7 py-10 text-center sm:px-10 sm:py-12">
          <p className="text-xs uppercase tracking-[0.3em] text-ink-soft">You&apos;re invited</p>
          <h1 className="mt-4 font-display text-5xl font-light italic leading-none text-ink sm:text-6xl">
            Tori <span className="not-italic text-ink-soft">&amp;</span> Connor
          </h1>
          <p className="mt-4 font-display text-lg text-ink-soft">
            {DATE_LABEL} &middot; Dover, Ohio
          </p>

          <Flourish className="my-8" />

          <form onSubmit={submitAccessCode} className="space-y-4 text-left">
            <Field label="Access code" hint="You'll find this on your invitation.">
              <input
                className={inputClass}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter your access code"
                autoFocus
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
              />
            </Field>

            {error && <Notice tone="error">{error}</Notice>}

            <Button type="submit" size="lg" arrow className="w-full" disabled={loading || !code.trim()}>
              {loading ? "Checking..." : "Open the invitation"}
            </Button>
          </form>
        </Card>
      </motion.div>
    </main>
  );
}

export default function AccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[100dvh] items-center justify-center">
          <p className="font-display text-2xl italic text-ink-soft">One moment...</p>
        </div>
      }
    >
      <AccessPageContent />
    </Suspense>
  );
}
