"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const next = searchParams.get("next") || "/";

  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submitAccessCode() {
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
      setError(json?.error || "Invalid access code");
      return;
    }

    router.replace(next);
  }

  return (
    <main className="min-h-screen py-12 px-4">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="text-center mb-12 relative">
          <div className="absolute inset-0 flex items-center justify-center opacity-5">
            <div className="text-9xl">💌</div>
          </div>
          <h1 className="text-5xl md:text-6xl font-serif text-sky-900 mb-4 relative">
            Access Code
          </h1>
          <div className="w-24 h-1 bg-sky-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600 font-serif italic">
            Enter your invitation code to continue
          </p>
        </div>

        {/* Access Code Card */}
        <div className="bg-white rounded-xl shadow-2xl border-4 border-double border-sky-400 p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-sky-300 opacity-50"></div>
          <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-sky-300 opacity-50"></div>

          <div className="text-center mb-6">
            <h2 className="text-2xl font-serif text-sky-800 mb-2">
              Enter Your Access Code
            </h2>
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
              className="w-full cursor-pointer rounded-lg bg-sky-800 px-6 py-4 text-lg font-bold text-white hover:bg-sky-900 hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-60 disabled:hover:scale-100"
              onClick={submitAccessCode}
              disabled={loading || !code.trim()}
            >
              {loading ? "Checking..." : "Continue"}
            </button>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}