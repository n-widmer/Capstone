"use client";

import { useEffect, useState, useCallback } from "react";
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

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function AdminPage() {
  const [stats, setStats] = useState(null);
  const [settings, setSettings] = useState(null);
  const [activity, setActivity] = useState([]);
  const [error, setError] = useState(null);
  const [showNonResponders, setShowNonResponders] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/stats").then((r) => r.ok ? r.json() : Promise.reject(`HTTP ${r.status}`)),
      fetch("/api/admin/settings").then((r) => r.ok ? r.json() : Promise.reject(`HTTP ${r.status}`)),
      fetch("/api/admin/activity").then((r) => r.ok ? r.json() : Promise.reject(`HTTP ${r.status}`)),
    ])
      .then(([statsData, settingsData, activityData]) => {
        setStats(statsData);
        setSettings(settingsData);
        setActivity(activityData.activity || []);
      })
      .catch((err) => setError(String(err)));
  }, []);

  // Activity feed polling — pauses when tab is hidden
  const fetchActivity = useCallback(() => {
    fetch("/api/admin/activity")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => data && setActivity(data.activity || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchActivity();
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchActivity]);

  if (error) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center">
        <h1 className="text-3xl font-bold text-sky-900">Admin Dashboard</h1>
        <p className="mt-4 text-red-600">Error loading stats: {error}</p>
      </main>
    );
  }

  if (!stats || !settings) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center">
        <h1 className="text-3xl font-bold text-sky-900">Admin Dashboard</h1>
        <p className="mt-4 text-gray-600">Loading...</p>
      </main>
    );
  }

  /* ---------- Countdown ---------- */
  const deadline = settings.rsvp_deadline ? new Date(settings.rsvp_deadline + "T23:59:59") : null;
  const daysLeft = deadline ? Math.max(0, Math.ceil((deadline - Date.now()) / 86400000)) : null;
  const familiesResponded = Number(stats.families_responded || 0);
  const totalFamilies = Number(stats.total_families || 1);
  const responsePercent = Math.round((familiesResponded / totalFamilies) * 100);

  const nonResponders = (stats.families || []).filter(
    (f) => Number(f.responded_count) === 0
  );

  /* ---------- Stat cards ---------- */
  const cards = [
    { label: "Total Invited", value: stats.total_invited },
    { label: "Responded", value: stats.total_responded },
    { label: "Attending", value: stats.total_attending },
    { label: "Plus-Ones", value: stats.total_plus_ones },
  ];

  /* ---------- Pie chart ---------- */
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
  const pieOptions = { responsive: true, plugins: { legend: { position: "bottom" } } };

  /* ---------- Bar chart ---------- */
  const familyLabels = stats.families.map((f) => f.family_name || `Group ${f.group_id}`);
  const attendingCounts = stats.families.map((f) => Number(f.attending_count));
  const notAttendingCounts = stats.families.map(
    (f) => Number(f.member_count) - Number(f.attending_count)
  );
  const barData = {
    labels: familyLabels,
    datasets: [
      { label: "Attending", data: attendingCounts, backgroundColor: "#0c4a6e" },
      { label: "Not Attending", data: notAttendingCounts, backgroundColor: "#cbd5e1" },
    ],
  };
  const barOptions = {
    responsive: true,
    plugins: { legend: { position: "bottom" } },
    scales: { x: { stacked: true }, y: { stacked: true, beginAtZero: true } },
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="mb-8 text-center text-4xl font-bold text-sky-900">
        Admin Dashboard
      </h1>

      {/* RSVP Countdown + Progress */}
      <div className="mb-8 rounded-2xl bg-gradient-to-r from-sky-900 to-sky-700 p-8 text-white shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <p className="text-sm uppercase tracking-wider text-sky-200">RSVP Deadline</p>
            {daysLeft !== null ? (
              <>
                <p className="text-5xl font-bold mt-1">{daysLeft} <span className="text-2xl font-normal">days left</span></p>
                <p className="text-sky-300 text-sm mt-1">
                  {deadline.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                </p>
              </>
            ) : (
              <p className="text-xl mt-1">No deadline set</p>
            )}
          </div>
          <div className="flex-1 max-w-md">
            <div className="flex justify-between text-sm mb-2">
              <span>{familiesResponded} of {totalFamilies} families responded</span>
              <span>{responsePercent}%</span>
            </div>
            <div className="w-full bg-sky-950 rounded-full h-4">
              <div
                className="bg-amber-500 h-4 rounded-full transition-all duration-500"
                style={{ width: `${responsePercent}%` }}
              />
            </div>
          </div>
        </div>

        {nonResponders.length > 0 && (
          <div className="mt-6 border-t border-sky-600 pt-4">
            <button
              onClick={() => setShowNonResponders(!showNonResponders)}
              className="text-sm text-sky-200 hover:text-white transition-colors cursor-pointer underline"
            >
              {showNonResponders ? "Hide" : "Show"} {nonResponders.length} non-responders
            </button>
            {showNonResponders && (
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {nonResponders.map((f) => (
                  <div key={f.group_id} className="bg-sky-800/50 rounded-lg px-4 py-2 text-sm flex justify-between">
                    <span>{f.family_name}</span>
                    <span className="text-sky-300 font-mono text-xs">
                      {f.access_code || "—"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Stat cards */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-2xl bg-white p-6 text-center shadow">
            <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">{card.label}</p>
            <p className="mt-2 text-4xl font-bold text-sky-900">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Charts + Activity Feed */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Pie */}
        <div className="rounded-2xl bg-white p-6 shadow">
          <h2 className="mb-4 text-center text-xl font-semibold text-sky-900">Response Status</h2>
          <Pie data={pieData} options={pieOptions} />
        </div>

        {/* Bar */}
        <div className="rounded-2xl bg-white p-6 shadow">
          <h2 className="mb-4 text-center text-xl font-semibold text-sky-900">By Family</h2>
          <Bar data={barData} options={barOptions} />
        </div>

        {/* Activity Feed */}
        <div className="rounded-2xl bg-white p-6 shadow">
          <h2 className="mb-4 text-center text-xl font-semibold text-sky-900">Recent Activity</h2>
          {activity.length === 0 ? (
            <p className="text-center text-gray-500 text-sm py-8">No RSVP activity yet</p>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {activity.map((item, i) => (
                <div
                  key={item.id + "-" + i}
                  className="border-l-4 border-sky-200 pl-4 py-2 hover:bg-sky-50 rounded-r-lg transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <p className="font-semibold text-sky-900 text-sm">{item.family_name}</p>
                    <span className="text-xs text-gray-400">{timeAgo(item.timestamp)}</span>
                  </div>
                  <p className="text-xs text-gray-600">
                    {item.member_name} — {item.attending ? "attending" : "declined"}
                  </p>
                  <p className="text-xs text-gray-400">
                    {item.attending_count}/{item.member_count} attending
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
