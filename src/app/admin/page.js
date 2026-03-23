"use client";

import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";
import { Pie, Bar } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function AdminPage() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(setStats)
      .catch((err) => setError(err.message));
  }, []);

  if (error) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center">
        <h1 className="text-3xl font-bold text-sky-900">Admin Dashboard</h1>
        <p className="mt-4 text-red-600">Error loading stats: {error}</p>
      </main>
    );
  }

  if (!stats) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center">
        <h1 className="text-3xl font-bold text-sky-900">Admin Dashboard</h1>
        <p className="mt-4 text-gray-600">Loading...</p>
      </main>
    );
  }

  /* ---------- Stat cards ---------- */
  const cards = [
    { label: "Total Invited", value: stats.total_invited },
    { label: "Responded", value: stats.total_responded },
    { label: "Attending", value: stats.total_attending },
    { label: "Plus-Ones", value: stats.total_plus_ones },
  ];

  /* ---------- Pie chart: Response Status ---------- */
  const pieData = {
    labels: ["Attending", "Declined", "No Response"],
    datasets: [
      {
        data: [stats.total_attending, stats.total_declined, stats.not_responded],
        backgroundColor: ["#0c4a6e", "#f59e0b", "#cbd5e1"],
        borderColor: ["#0c4a6e", "#f59e0b", "#cbd5e1"],
        borderWidth: 1,
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: { position: "bottom" },
    },
  };

  /* ---------- Bar chart: By Family ---------- */
  const familyLabels = stats.families.map((f) => f.family_name || `Group ${f.group_id}`);
  const attendingCounts = stats.families.map((f) => Number(f.attending_count));
  const notAttendingCounts = stats.families.map(
    (f) => Number(f.member_count) - Number(f.attending_count)
  );

  const barData = {
    labels: familyLabels,
    datasets: [
      {
        label: "Attending",
        data: attendingCounts,
        backgroundColor: "#0c4a6e",
      },
      {
        label: "Not Attending",
        data: notAttendingCounts,
        backgroundColor: "#cbd5e1",
      },
    ],
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: { position: "bottom" },
    },
    scales: {
      x: { stacked: true },
      y: { stacked: true, beginAtZero: true },
    },
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="mb-8 text-center text-4xl font-bold text-sky-900">
        Admin Dashboard
      </h1>

      {/* Stat cards */}
      <div className="mb-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl bg-white p-6 text-center shadow"
          >
            <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              {card.label}
            </p>
            <p className="mt-2 text-4xl font-bold text-sky-900">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-8 md:grid-cols-2">
        {/* Pie */}
        <div className="rounded-2xl bg-white p-6 shadow">
          <h2 className="mb-4 text-center text-xl font-semibold text-sky-900">
            Response Status
          </h2>
          <Pie data={pieData} options={pieOptions} />
        </div>

        {/* Bar */}
        <div className="rounded-2xl bg-white p-6 shadow">
          <h2 className="mb-4 text-center text-xl font-semibold text-sky-900">
            By Family
          </h2>
          <Bar data={barData} options={barOptions} />
        </div>
      </div>
    </main>
  );
}
