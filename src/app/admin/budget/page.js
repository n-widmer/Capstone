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

const CATEGORIES = [
  "Venue",
  "Catering",
  "Photography",
  "Flowers",
  "DJ/Music",
  "Attire",
  "Decorations",
  "Transportation",
  "Other",
];

export default function BudgetPage() {
  const [expenses, setExpenses] = useState([]);
  const [settings, setSettings] = useState({});
  const [stats, setStats] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ category: "Venue", description: "", amount: "", paid: false });
  const [editBudget, setEditBudget] = useState(false);
  const [budgetInput, setBudgetInput] = useState("");

  async function loadData() {
    const [expRes, setRes, statsRes] = await Promise.all([
      fetch("/api/admin/budget").then((r) => r.json()),
      fetch("/api/admin/settings").then((r) => r.json()),
      fetch("/api/admin/stats").then((r) => r.json()),
    ]);
    setExpenses(expRes.expenses || []);
    setSettings(setRes);
    setStats(statsRes);
    setBudgetInput(setRes.wedding_budget || "25000");
  }

  useEffect(() => { loadData(); }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.amount || isNaN(form.amount)) return;

    if (editingId) {
      await fetch(`/api/admin/budget/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setEditingId(null);
    } else {
      await fetch("/api/admin/budget", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }
    setForm({ category: "Venue", description: "", amount: "", paid: false });
    loadData();
  }

  async function handleDelete(id) {
    await fetch(`/api/admin/budget/${id}`, { method: "DELETE" });
    loadData();
  }

  function startEdit(exp) {
    setEditingId(exp.id);
    setForm({
      category: exp.category,
      description: exp.description || "",
      amount: String(exp.amount),
      paid: !!exp.paid,
    });
  }

  async function saveBudget() {
    await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key_name: "wedding_budget", value: budgetInput }),
    });
    setEditBudget(false);
    loadData();
  }

  const totalBudget = Number(settings.wedding_budget || 0);
  const totalSpent = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const remaining = totalBudget - totalSpent;
  const totalAttending = stats?.total_attending || 0;
  const perGuest = totalAttending > 0 ? (totalSpent / totalAttending).toFixed(2) : "N/A";

  // Category breakdown for chart
  const categoryTotals = {};
  for (const exp of expenses) {
    categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + Number(exp.amount);
  }
  const chartLabels = Object.keys(categoryTotals);
  const chartData = Object.values(categoryTotals);

  const barData = {
    labels: chartLabels,
    datasets: [
      {
        label: "Spent",
        data: chartData,
        backgroundColor: "#0c4a6e",
      },
    ],
  };
  const barOptions = {
    indexAxis: "y",
    responsive: true,
    plugins: { legend: { display: false } },
    scales: { x: { beginAtZero: true } },
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="mb-8 text-center text-4xl font-bold text-sky-900">
        Budget Tracker
      </h1>

      {/* Summary Cards */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl bg-white p-6 text-center shadow">
          <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">Total Budget</p>
          {editBudget ? (
            <div className="mt-2 flex items-center gap-2 justify-center">
              <span className="text-xl">$</span>
              <input
                className="w-28 border rounded px-2 py-1 text-lg"
                value={budgetInput}
                onChange={(e) => setBudgetInput(e.target.value)}
              />
              <button onClick={saveBudget} className="text-sky-600 hover:text-sky-800 cursor-pointer text-sm">Save</button>
            </div>
          ) : (
            <p
              className="mt-2 text-3xl font-bold text-sky-900 cursor-pointer hover:text-sky-700"
              onClick={() => setEditBudget(true)}
              title="Click to edit"
            >
              ${totalBudget.toLocaleString()}
            </p>
          )}
        </div>
        <div className="rounded-2xl bg-white p-6 text-center shadow">
          <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">Total Spent</p>
          <p className="mt-2 text-3xl font-bold text-amber-600">${totalSpent.toLocaleString()}</p>
        </div>
        <div className="rounded-2xl bg-white p-6 text-center shadow">
          <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">Remaining</p>
          <p className={`mt-2 text-3xl font-bold ${remaining >= 0 ? "text-emerald-600" : "text-red-600"}`}>
            ${remaining.toLocaleString()}
          </p>
        </div>
        <div className="rounded-2xl bg-white p-6 text-center shadow">
          <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">Per Guest</p>
          <p className="mt-2 text-3xl font-bold text-sky-900">
            {perGuest === "N/A" ? perGuest : `$${perGuest}`}
          </p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Add/Edit Form */}
        <div className="lg:col-span-1">
          <div className="rounded-2xl bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-semibold text-sky-900">
              {editingId ? "Edit Expense" : "Add Expense"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Category</label>
                <select
                  className="w-full border rounded-lg px-3 py-2"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Description</label>
                <input
                  className="w-full border rounded-lg px-3 py-2"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="e.g. Deposit for venue"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full border rounded-lg px-3 py-2"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="cursor-pointer"
                  checked={form.paid}
                  onChange={(e) => setForm({ ...form, paid: e.target.checked })}
                />
                <span className="text-sm">Paid</span>
              </label>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-sky-900 text-white px-4 py-2 hover:bg-sky-800 cursor-pointer"
                >
                  {editingId ? "Update" : "Add"}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={() => { setEditingId(null); setForm({ category: "Venue", description: "", amount: "", paid: false }); }}
                    className="rounded-lg border px-4 py-2 hover:bg-gray-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Expense Table + Chart */}
        <div className="lg:col-span-2 space-y-8">
          {/* Category Chart */}
          {chartLabels.length > 0 && (
            <div className="rounded-2xl bg-white p-6 shadow">
              <h2 className="mb-4 text-xl font-semibold text-sky-900">Spending by Category</h2>
              <Bar data={barData} options={barOptions} />
            </div>
          )}

          {/* Expense List */}
          <div className="rounded-2xl bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-semibold text-sky-900">All Expenses</h2>
            {expenses.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No expenses added yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-gray-500">
                      <th className="pb-2 pr-4">Category</th>
                      <th className="pb-2 pr-4">Description</th>
                      <th className="pb-2 pr-4">Amount</th>
                      <th className="pb-2 pr-4">Status</th>
                      <th className="pb-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map((exp) => (
                      <tr key={exp.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 pr-4 font-medium">{exp.category}</td>
                        <td className="py-3 pr-4 text-gray-600">{exp.description || "—"}</td>
                        <td className="py-3 pr-4 font-mono">${Number(exp.amount).toLocaleString()}</td>
                        <td className="py-3 pr-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${exp.paid ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                            {exp.paid ? "Paid" : "Unpaid"}
                          </span>
                        </td>
                        <td className="py-3">
                          <button
                            onClick={() => startEdit(exp)}
                            className="text-sky-600 hover:text-sky-800 mr-3 cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(exp.id)}
                            className="text-red-500 hover:text-red-700 cursor-pointer"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
