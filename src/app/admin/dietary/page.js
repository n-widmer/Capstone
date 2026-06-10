"use client";

import { useEffect, useMemo, useState } from "react";

function hasRestriction(d) {
  return !!(d.diet_restrictions && d.diet_restrictions.trim());
}

export default function DietaryReportPage() {
  const [guests, setGuests] = useState(null);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // "all" | "with"

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => setGuests(data.dietary || []))
      .catch((err) => setError(err.message));
  }, []);

  const withCount = useMemo(
    () => (guests || []).filter(hasRestriction).length,
    [guests]
  );

  const rows = useMemo(() => {
    if (!guests) return [];
    const q = search.trim().toLowerCase();
    return guests
      .filter((d) => (filter === "with" ? hasRestriction(d) : true))
      .filter((d) => {
        if (!q) return true;
        const haystack = `${d.first_name} ${d.last_name} ${d.family_name} ${
          d.diet_restrictions || ""
        }`.toLowerCase();
        return haystack.includes(q);
      })
      // Guests with an actual restriction always sort to the top.
      .sort((a, b) => Number(hasRestriction(b)) - Number(hasRestriction(a)));
  }, [guests, search, filter]);

  function exportCSV() {
    if (rows.length === 0) return;
    const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const csv = [
      ["Guest", "Family", "Dietary Restriction"],
      ...rows.map((d) => [
        esc(`${d.first_name} ${d.last_name}`),
        esc(d.family_name),
        esc(d.diet_restrictions || ""),
      ]),
    ]
      .map((r) => r.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "dietary_restrictions.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  if (error) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-red-600">Error loading dietary data: {error}</p>
      </div>
    );
  }

  if (!guests) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-gray-500">Loading dietary data...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-[family-name:var(--font-cormorant)] text-4xl font-bold text-sky-900">
            Dietary Report
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {withCount} guest{withCount !== 1 ? "s" : ""} reported a restriction
          </p>
        </div>
        <button
          onClick={exportCSV}
          disabled={rows.length === 0}
          className="rounded-lg bg-sky-900 px-5 py-2.5 text-sm font-medium text-white shadow transition-colors hover:bg-sky-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Export CSV
        </button>
      </div>

      {/* Search + filter */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          placeholder="Search by guest, family, or restriction..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-800 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-800 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
        >
          <option value="all">All attending guests</option>
          <option value="with">With restrictions only</option>
        </select>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl bg-white p-12 text-center shadow">
          <p className="text-gray-400">
            {search.trim()
              ? "No guests match your search."
              : "No dietary restrictions reported yet."}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl bg-white shadow">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-6 py-3 font-[family-name:var(--font-cormorant)] text-sm font-semibold uppercase tracking-wide text-gray-600">
                  Guest
                </th>
                <th className="px-6 py-3 font-[family-name:var(--font-cormorant)] text-sm font-semibold uppercase tracking-wide text-gray-600">
                  Family
                </th>
                <th className="px-6 py-3 font-[family-name:var(--font-cormorant)] text-sm font-semibold uppercase tracking-wide text-gray-600">
                  Restriction
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((d, i) => (
                <tr
                  key={`${d.family_name}-${d.first_name}-${d.last_name}-${i}`}
                  className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="px-6 py-3 font-medium text-gray-800">
                    {d.first_name} {d.last_name}
                  </td>
                  <td className="px-6 py-3 text-gray-500">{d.family_name}</td>
                  <td className="px-6 py-3 text-gray-800">
                    {hasRestriction(d) ? (
                      d.diet_restrictions
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
