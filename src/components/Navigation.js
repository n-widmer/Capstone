"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navigation() {
  const pathname = usePathname();

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/menu", label: "Menu" },
    { href: "/registry", label: "Registry" },
    { href: "/rsvp", label: "RSVP" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white border-b-2 border-amber-500 shadow-md">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-center items-center h-16 space-x-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-lg font-medium transition-colors cursor-pointer ${
                pathname === link.href
                  ? "text-amber-600 border-b-2 border-amber-600"
                  : "text-emerald-800 hover:text-sky-600"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
