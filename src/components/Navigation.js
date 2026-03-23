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
    <nav className={`sticky top-0 z-50 pt-8 pb-4 ${pathname === "/" ? "bg-amber-200" : "bg-sky-200"}`}>
      <div className="max-w-6xl mx-auto px-4 text-center">
        {/* Couple Names */}
        <p className="font-[family-name:var(--font-cormorant)] text-sm tracking-[0.2em] uppercase text-sky-800 mb-1">The Wedding of</p>
        <h1 className="font-[family-name:var(--font-cormorant)] text-3xl md:text-4xl font-light tracking-[0.3em] uppercase text-sky-900 mb-2">
          Tori Campbell & Connor Quinn
        </h1>

        {/* Date & Location */}
        <p className="text-xs md:text-sm tracking-[0.2em] uppercase text-sky-800 mb-6">
          May 22, 2027 &nbsp;&middot;&nbsp; Dover, OH
        </p>

        {/* Navigation Links */}
        <div className="flex justify-center items-center space-x-8 md:space-x-14">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-xs md:text-sm tracking-[0.15em] uppercase transition-colors cursor-pointer pb-1 ${
                pathname === link.href
                  ? "text-sky-900 relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-px after:bg-sky-900"
                  : "text-sky-900/60 hover:text-sky-900 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-px after:bg-sky-900 hover:after:w-full after:transition-all after:duration-300"
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
