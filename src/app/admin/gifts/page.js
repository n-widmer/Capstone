"use client";

import { useEffect, useState } from "react";

const GIFT_TYPES = ["gift", "card", "cash"];

export default function GiftsPage() {
  const [gifts, setGifts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [filter, setFilter] = useState("all");
  const [thankYouFilter, setThankYouFilter] = useState("all");
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    guest_name: "",
    gift_type: "gift",
    description: "",
    amount: "",
    notes: "",
    thank_you_sent: false,
  });

  async function loadData() {
    try {
      const res = await fetch("/api/admin/gifts");
      if (!res.ok) throw new Error("Failed to load gifts");
      const data = await res.json();
      setGifts(data.gifts || []);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.guest_name.trim()) return;
    setError("");

    try {
      const url = editingId ? `/api/admin/gifts/${editingId}` : "/api/admin/gifts";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Failed to save gift");
      }
      setEditingId(null);
      setForm({ guest_name: "", gift_type: "gift", description: "", amount: "", notes: "", thank_you_sent: false });
      loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this gift?")) return;
    setError("");
    try {
      const res = await fetch(`/api/admin/gifts/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete gift");
      loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  async function toggleThankYou(gift) {
    setError("");
    try {
      const res = await fetch(`/api/admin/gifts/${gift.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guest_name: gift.guest_name,
          gift_type: gift.gift_type,
          description: gift.description,
          amount: gift.amount,
          notes: gift.notes,
          thank_you_sent: !gift.thank_you_sent,
        }),
      });
      if (!res.ok) throw new Error("Failed to update");
      loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  function startEdit(gift) {
    setEditingId(gift.id);
    setForm({
      guest_name: gift.guest_name,
      gift_type: gift.gift_type,
      description: gift.description || "",
      amount: gift.amount ? String(gift.amount) : "",
      notes: gift.notes || "",
      thank_you_sent: !!gift.thank_you_sent,
    });
  }

  const totalGifts = gifts.length;
  const totalCashValue = gifts
    .filter((g) => (g.gift_type === "cash" || g.gift_type === "card") && g.amount)
    .reduce((sum, g) => sum + Number(g.amount), 0);
  const thankYousSent = gifts.filter((g) => g.thank_you_sent).length;
  const thankYousPending = totalGifts - thankYousSent;

  const filtered = gifts.filter((g) => {
    if (filter !== "all" && g.gift_type !== filter) return false;
    if (thankYouFilter === "sent" && !g.thank_you_sent) return false;
    if (thankYouFilter === "pending" && g.thank_you_sent) return false;
    return true;
  });

  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <div className="mb-8 flex items-center justify-center gap-4">
        <h1 className="text-center text-4xl font-bold text-sky-900">
          Gift Tracker
        </h1>
        {gifts.length > 0 && (
          <a
            href="/api/admin/export?type=gifts"
            download
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
          >
            Export CSV
          </a>
        )}
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded">
          <p className="text-red-700 font-medium">{error}</p>
        </div>
      )}

      {/* Summary Cards */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl bg-white p-6 text-center shadow">
          <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">Total Gifts</p>
          <p className="mt-2 text-3xl font-bold text-sky-900">{totalGifts}</p>
        </div>
        <div className="rounded-2xl bg-white p-6 text-center shadow">
          <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">Cash/Card Value</p>
          <p className="mt-2 text-3xl font-bold text-amber-600">${totalCashValue.toLocaleString()}</p>
        </div>
        <div className="rounded-2xl bg-white p-6 text-center shadow">
          <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">Thank Yous Sent</p>
          <p className="mt-2 text-3xl font-bold text-emerald-600">{thankYousSent}</p>
        </div>
        <div className="rounded-2xl bg-white p-6 text-center shadow">
          <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">Pending</p>
          <p className="mt-2 text-3xl font-bold text-red-500">{thankYousPending}</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Add/Edit Form */}
        <div className="lg:col-span-1">
          <div className="rounded-2xl bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-semibold text-sky-900">
              {editingId ? "Edit Gift" : "Add Gift"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Guest Name</label>
                <input
                  className="w-full border rounded-lg px-3 py-2"
                  value={form.guest_name}
                  onChange={(e) => setForm({ ...form, guest_name: e.target.value })}
                  placeholder="e.g. Smith Family"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Type</label>
                <select
                  className="w-full border rounded-lg px-3 py-2"
                  value={form.gift_type}
                  onChange={(e) => setForm({ ...form, gift_type: e.target.value })}
                >
                  {GIFT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Description</label>
                <input
                  className="w-full border rounded-lg px-3 py-2"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="e.g. KitchenAid mixer"
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
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Notes</label>
                <input
                  className="w-full border rounded-lg px-3 py-2"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Optional notes"
                />
              </div>
              {editingId && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="cursor-pointer"
                    checked={form.thank_you_sent}
                    onChange={(e) => setForm({ ...form, thank_you_sent: e.target.checked })}
                  />
                  <span className="text-sm">Thank You Sent</span>
                </label>
              )}
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
                    onClick={() => {
                      setEditingId(null);
                      setForm({ guest_name: "", gift_type: "gift", description: "", amount: "", notes: "", thank_you_sent: false });
                    }}
                    className="rounded-lg border px-4 py-2 hover:bg-gray-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Gift List */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl bg-white p-6 shadow">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <h2 className="text-xl font-semibold text-sky-900">All Gifts</h2>
              <div className="flex gap-2">
                <select
                  className="border rounded-lg px-2 py-1 text-sm"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option value="all">All Types</option>
                  <option value="gift">Gifts</option>
                  <option value="card">Cards</option>
                  <option value="cash">Cash</option>
                </select>
                <select
                  className="border rounded-lg px-2 py-1 text-sm"
                  value={thankYouFilter}
                  onChange={(e) => setThankYouFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="sent">Sent</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>

            {filtered.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                {totalGifts === 0 ? "No gifts recorded yet" : "No gifts match filters"}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-gray-500">
                      <th className="pb-2 pr-4">Guest</th>
                      <th className="pb-2 pr-4">Type</th>
                      <th className="pb-2 pr-4">Description</th>
                      <th className="pb-2 pr-4">Amount</th>
                      <th className="pb-2 pr-4">Thank You</th>
                      <th className="pb-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((gift) => (
                      <tr key={gift.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 pr-4 font-medium">{gift.guest_name}</td>
                        <td className="py-3 pr-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            gift.gift_type === "cash"
                              ? "bg-emerald-100 text-emerald-700"
                              : gift.gift_type === "card"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-purple-100 text-purple-700"
                          }`}>
                            {gift.gift_type.charAt(0).toUpperCase() + gift.gift_type.slice(1)}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-gray-600">{gift.description || "—"}</td>
                        <td className="py-3 pr-4 font-mono">
                          {gift.amount ? `$${Number(gift.amount).toLocaleString()}` : "—"}
                        </td>
                        <td className="py-3 pr-4">
                          <button
                            onClick={() => toggleThankYou(gift)}
                            className={`px-2 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                              gift.thank_you_sent
                                ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                                : "bg-amber-100 text-amber-700 hover:bg-amber-200"
                            }`}
                          >
                            {gift.thank_you_sent ? "Sent" : "Pending"}
                          </button>
                        </td>
                        <td className="py-3">
                          <button
                            onClick={() => startEdit(gift)}
                            className="text-sky-600 hover:text-sky-800 mr-3 cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(gift.id)}
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
