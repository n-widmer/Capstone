"use client";

import { useEffect, useState } from "react";

function familyHasResponded(family) {
  return family.members.some((m) => m.attending !== null && m.attending !== undefined);
}

function matchesSearch(family, query) {
  const q = query.toLowerCase();
  if (family.family_name?.toLowerCase().includes(q)) return true;
  return family.members.some(
    (m) =>
      m.first_name?.toLowerCase().includes(q) ||
      m.last_name?.toLowerCase().includes(q)
  );
}

function AttendingBadge({ attending }) {
  if (attending === null || attending === undefined) {
    return (
      <span className="inline-block rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-600">
        No Response
      </span>
    );
  }
  if (Number(attending) === 1) {
    return (
      <span className="inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
        Attending
      </span>
    );
  }
  return (
    <span className="inline-block rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
      Declined
    </span>
  );
}

export default function AdminGuestsPage() {
  const [families, setFamilies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [expanded, setExpanded] = useState(new Set());

  useEffect(() => {
    fetch("/api/admin/guests")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!data.ok) throw new Error(data.error || "Unknown error");
        setFamilies(data.families);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  function toggleExpand(groupId) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  }

  const filtered = families.filter((f) => {
    if (search && !matchesSearch(f, search)) return false;
    if (filter === "responded" && !familyHasResponded(f)) return false;
    if (filter === "pending" && familyHasResponded(f)) return false;
    return true;
  });

  if (error) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-red-600">Error loading guest list: {error}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-gray-500">Loading guest list...</p>
      </div>
    );
  }

  const totalGuests = families.reduce((sum, f) => sum + f.members.length, 0);
  const totalResponded = families.filter(familyHasResponded).length;

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-2 font-[family-name:var(--font-cormorant)] text-4xl font-bold text-sky-900">
        Guest List
      </h1>
      <p className="mb-8 text-sm text-gray-500">
        {families.length} families &middot; {totalGuests} guests &middot;{" "}
        {totalResponded} responded
      </p>

      {/* Search & Filter */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-800 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-800 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
        >
          <option value="all">All Families</option>
          <option value="responded">Responded</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      {/* Family Cards */}
      {filtered.length === 0 ? (
        <p className="py-12 text-center text-gray-400">No families match your search.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((family) => {
            const responded = familyHasResponded(family);
            const isOpen = expanded.has(family.group_id);

            return (
              <div
                key={family.group_id}
                className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
              >
                {/* Header row */}
                <button
                  onClick={() => toggleExpand(family.group_id)}
                  className="flex w-full cursor-pointer items-center justify-between px-5 py-4 text-left transition-colors hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-[family-name:var(--font-cormorant)] text-lg font-semibold text-sky-900">
                      {family.family_name || `Group ${family.group_id}`}
                    </span>
                    <span className="text-xs text-gray-400">
                      {family.members.length} member{family.members.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {responded ? (
                      <span className="inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                        Responded
                      </span>
                    ) : (
                      <span className="inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
                        Pending
                      </span>
                    )}
                    <svg
                      className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {/* Expanded detail */}
                {isOpen && (
                  <div className="border-t border-gray-100 bg-gray-50 px-5 py-4">
                    <p className="mb-3 text-xs text-gray-500">
                      Access Code:{" "}
                      <span className="font-mono font-semibold text-sky-800">
                        {family.access_code}
                      </span>
                    </p>

                    <div className="space-y-2">
                      {family.members.map((m) => (
                        <div
                          key={m.user_id}
                          className="flex items-center justify-between rounded-lg bg-white px-4 py-2.5 shadow-sm"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-800">
                              {m.first_name} {m.last_name}
                            </span>
                            {m.diet_restrictions && (
                              <span
                                title={m.diet_restrictions}
                                className="cursor-help text-base"
                                aria-label={`Dietary: ${m.diet_restrictions}`}
                              >
                                🍽
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {Number(m.plus_one) === 1 && (
                              <span className="text-xs text-gray-500">
                                +1{m.plus_one_name ? `: ${m.plus_one_name}` : ""}
                              </span>
                            )}
                            <AttendingBadge attending={m.attending} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
