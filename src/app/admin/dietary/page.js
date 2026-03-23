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
      .then((data) => setDietary(data.dietary))
      .catch((err) => setError(err.message));
  }, []);

  function exportCSV() {
    if (!dietary || dietary.length === 0) return;

    const rows = [["Dietary Restriction", "Count"]];
    dietary.forEach((d) => {
      rows.push([`"${d.diet_restrictions.replace(/"/g, '""')}"`, d.count]);
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

  const chartData = {
    labels: dietary.map((d) => d.diet_restrictions),
    datasets: [
      {
        label: "Guests",
        data: dietary.map((d) => d.count),
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
            {dietary.length} unique restriction{dietary.length !== 1 ? "s" : ""}{" "}
            reported
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
          {/* Chart */}
          <div className="mb-8 rounded-2xl bg-white p-6 shadow">
            <h2 className="mb-4 font-[family-name:var(--font-cormorant)] text-xl font-semibold text-sky-900">
              Restrictions by Count
            </h2>
            <div style={{ minHeight: Math.max(200, dietary.length * 40) }}>
              <Bar data={chartData} options={chartOptions} />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-hidden rounded-2xl bg-white shadow">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-6 py-3 font-[family-name:var(--font-cormorant)] text-sm font-semibold uppercase tracking-wide text-gray-600">
                    Restriction
                  </th>
                  <th className="px-6 py-3 text-right font-[family-name:var(--font-cormorant)] text-sm font-semibold uppercase tracking-wide text-gray-600">
                    Count
                  </th>
                </tr>
              </thead>
              <tbody>
                {dietary.map((d, i) => (
                  <tr
                    key={d.diet_restrictions}
                    className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="px-6 py-3 text-gray-800">
                      {d.diet_restrictions}
                    </td>
                    <td className="px-6 py-3 text-right font-semibold text-sky-900">
                      {d.count}
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
