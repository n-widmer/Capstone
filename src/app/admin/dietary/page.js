"use client";

import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function DietaryReportPage() {
  const [dietary, setDietary] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => setDietary(data.dietary || []))
      .catch((err) => setError(err.message));
  }, []);

  function exportCSV() {
    if (!dietary || dietary.length === 0) return;

    const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const rows = [["Guest", "Family", "Dietary Restriction"]];
    dietary.forEach((d) => {
      rows.push([
        esc(`${d.first_name} ${d.last_name}`),
        esc(d.family_name),
        esc(d.diet_restrictions),
      ]);
    });

    const csv = rows.map((r) => r.join(",")).join("\n");
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

  if (!dietary) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-gray-500">Loading dietary data...</p>
      </div>
    );
  }

  // Aggregate counts by restriction text (case-insensitive) for the overview chart.
  const counts = new Map();
  for (const d of dietary) {
    const label = d.diet_restrictions.trim();
    const norm = label.toLowerCase();
    const existing = counts.get(norm);
    if (existing) {
      existing.count += 1;
    } else {
      counts.set(norm, { label, count: 1 });
    }
  }
  const grouped = [...counts.values()].sort((a, b) => b.count - a.count);

  const chartData = {
    labels: grouped.map((d) => d.label),
    datasets: [
      {
        label: "Guests",
        data: grouped.map((d) => d.count),
        backgroundColor: "#0c4a6e",
        borderRadius: 4,
      },
    ],
  };

  const chartOptions = {
    indexAxis: "y",
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.raw} guest${ctx.raw !== 1 ? "s" : ""}`,
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: { stepSize: 1 },
        title: { display: true, text: "Number of Guests" },
      },
      y: {
        ticks: { autoSkip: false },
      },
    },
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-cormorant)] text-4xl font-bold text-sky-900">
            Dietary Report
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {dietary.length} guest{dietary.length !== 1 ? "s" : ""} reported a
            restriction
            {grouped.length > 0 && (
              <>
                {" "}
                &middot; {grouped.length} unique restriction
                {grouped.length !== 1 ? "s" : ""}
              </>
            )}
          </p>
        </div>
        <button
          onClick={exportCSV}
          disabled={dietary.length === 0}
          className="rounded-lg bg-sky-900 px-5 py-2.5 text-sm font-medium text-white shadow transition-colors hover:bg-sky-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Export CSV
        </button>
      </div>

      {dietary.length === 0 ? (
        <div className="rounded-2xl bg-white p-12 text-center shadow">
          <p className="text-gray-400">No dietary restrictions reported yet.</p>
        </div>
      ) : (
        <>
          {/* Overview chart */}
          <div className="mb-8 rounded-2xl bg-white p-6 shadow">
            <h2 className="mb-4 font-[family-name:var(--font-cormorant)] text-xl font-semibold text-sky-900">
              Restrictions by Count
            </h2>
            <div style={{ minHeight: Math.max(200, grouped.length * 40) }}>
              <Bar data={chartData} options={chartOptions} />
            </div>
          </div>

          {/* Per-guest table — who reported each restriction */}
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
                {dietary.map((d, i) => (
                  <tr
                    key={`${d.family_name}-${d.first_name}-${d.last_name}-${i}`}
                    className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="px-6 py-3 font-medium text-gray-800">
                      {d.first_name} {d.last_name}
                    </td>
                    <td className="px-6 py-3 text-gray-500">{d.family_name}</td>
                    <td className="px-6 py-3 text-gray-800">
                      {d.diet_restrictions}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
