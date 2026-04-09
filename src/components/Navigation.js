"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function Navigation() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/rsvp", label: "RSVP" },
    { href: "/menu", label: "Menu" },
    { href: "/registry", label: "Registry" },
    { href: "/photos", label: "Photos" },
    { href: "/things-to-do", label: "Things To Do" },
    { href: "/playlist", label: "Playlist" },
  ];

  return (
    <nav className={`sticky top-0 z-50 pt-8 pb-4 ${pathname === "/" ? "bg-amber-200" : "bg-sky-200"}`}>
      <div className="max-w-6xl mx-auto px-4 text-center relative">
        {/* Hamburger toggle - mobile only */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden absolute right-4 top-0 text-sky-900 z-50"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
        >
          {menuOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
            </svg>
          )}
        </button>

        {/* Couple Names */}
        <p className="font-[family-name:var(--font-cormorant)] text-sm tracking-[0.2em] uppercase text-sky-800 mb-1">The Wedding of</p>
        <Link href="/admin/login" className="font-[family-name:var(--font-cormorant)] text-3xl md:text-4xl font-light tracking-[0.3em] uppercase text-sky-900 mb-2 block no-underline hover:no-underline">
          Tori Campbell & Connor Quinn
        </Link>

        {/* Date & Location */}
        <p className="text-xs md:text-sm tracking-[0.2em] uppercase text-sky-800 mb-6">
          May 22, 2027 &nbsp;&middot;&nbsp; Dover, OH
        </p>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex justify-center items-center md:space-x-14">
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

        {/* Mobile Menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="md:hidden flex flex-col items-center gap-6 pt-2 pb-4"
            >
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`text-sm tracking-[0.15em] uppercase transition-colors ${
                    pathname === link.href
                      ? "text-sky-900 border-b border-sky-900 pb-1"
                      : "text-sky-900/60 hover:text-sky-900"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
