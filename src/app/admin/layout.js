"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const adminLinks = [
  { href: "/admin", label: "Overview", icon: "📊" },
  { href: "/admin/guests", label: "Guest List", icon: "👥" },
  { href: "/admin/dietary", label: "Dietary Report", icon: "🍽" },
  { href: "/admin/songs", label: "Song Requests", icon: "🎵" },
  { href: "/admin/photos", label: "Photos", icon: "📸" },
  { href: "/admin/budget", label: "Budget", icon: "💰" },
  { href: "/admin/gifts", label: "Gifts", icon: "🎁" },
  { href: "/admin/export", label: "Export Data", icon: "📥" },
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();

  if (pathname === "/admin/login") {
    return children;
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside className="w-64 bg-sky-900 text-white flex flex-col">
        <div className="p-6 border-b border-sky-700">
          <h2 className="font-[family-name:var(--font-cormorant)] text-xl font-light tracking-wide">
            Wedding Admin
          </h2>
          <p className="text-sky-300 text-xs mt-1">Tori & Connor</p>
        </div>

        <nav className="flex-1 py-4">
          {adminLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-6 py-3 text-sm transition-colors ${
                pathname === link.href
                  ? "bg-sky-800 text-white border-r-2 border-amber-400"
                  : "text-sky-200 hover:bg-sky-800 hover:text-white"
              }`}
            >
              <span>{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-sky-700">
          <button
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="w-full text-left text-sm text-sky-300 hover:text-white transition-colors cursor-pointer"
          >
            Sign Out
          </button>
          <Link
            href="/"
            className="block mt-2 text-sm text-sky-400 hover:text-white transition-colors"
          >
            Back to Website
          </Link>
        </div>
      </aside>

      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}
