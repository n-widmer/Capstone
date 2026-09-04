"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { EASE } from "@/components/ui";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/rsvp", label: "RSVP" },
  { href: "/menu", label: "Menu" },
  { href: "/registry", label: "Registry" },
  { href: "/photos", label: "Photos" },
  { href: "/things-to-do", label: "Things To Do" },
  { href: "/accommodations", label: "Lodging" },
  { href: "/playlist", label: "Playlist" },
];

export default function Navigation() {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);

  // Admin and the access gate carry their own chrome.
  const hidden = pathname.startsWith("/admin") || pathname === "/access";

  useEffect(() => setOpen(false), [pathname]);

  // The landing page is amber; everything else is sky blue.
  useEffect(() => {
    document.body.classList.toggle("amber", pathname === "/");
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (hidden) return null;

  return (
    <header className="sticky top-0 z-40 px-3 pt-3 sm:px-4 sm:pt-4">
      <nav
        className="mx-auto flex h-16 max-w-5xl items-center justify-between rounded-full bg-white/80 pl-6 pr-3 ring-1 ring-ink/10 shadow-lift backdrop-blur-xl"
        aria-label="Main"
      >
        <Link
          href="/"
          className="font-display text-2xl italic leading-none text-ink no-underline"
          aria-label="Tori and Connor, home"
        >
          T <span className="not-italic text-ink-soft">&amp;</span> C
        </Link>

        <ul className="hidden items-center gap-1 lg:flex">
          {/* RSVP has its own pill on desktop. */}
          {NAV_LINKS.filter((link) => link.href !== "/rsvp").map((link) => {
            const active = pathname === link.href;
            return (
              <li key={link.href} className="relative">
                <Link
                  href={link.href}
                  className={`block rounded-full px-3.5 py-2 text-[13px] tracking-wide transition-colors duration-500 ease-[var(--ease-soft)] ${
                    active ? "text-ink" : "text-ink-soft hover:text-ink"
                  }`}
                >
                  {link.label}
                </Link>
                {active && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute inset-x-3.5 -bottom-0.5 h-px bg-ink"
                    transition={{ duration: 0.5, ease: EASE }}
                  />
                )}
              </li>
            );
          })}
        </ul>

        <Link
          href="/rsvp"
          className="hidden rounded-full bg-ink px-5 py-2.5 text-[13px] font-medium tracking-wide text-white transition-all duration-500 ease-[var(--ease-soft)] hover:bg-ink/90 active:scale-[0.98] lg:block"
        >
          RSVP
        </Link>

        {/* Two lines that fold into an X. */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-ink lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
        >
          <span
            className={`absolute h-px w-5 bg-current transition-transform duration-500 ease-[var(--ease-soft)] ${
              open ? "rotate-45" : "-translate-y-[3px]"
            }`}
          />
          <span
            className={`absolute h-px w-5 bg-current transition-transform duration-500 ease-[var(--ease-soft)] ${
              open ? "-rotate-45" : "translate-y-[3px]"
            }`}
          />
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="fixed inset-0 -z-10 flex flex-col items-center justify-center bg-paper/95 backdrop-blur-2xl lg:hidden"
          >
            <ul className="flex flex-col items-center gap-5">
              {NAV_LINKS.map((link, i) => (
                <motion.li
                  key={link.href}
                  initial={reduce ? false : { opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 12 }}
                  transition={{ duration: 0.6, delay: 0.05 + i * 0.05, ease: EASE }}
                >
                  <Link
                    href={link.href}
                    className={`font-display text-4xl font-light ${
                      pathname === link.href ? "italic text-ink" : "text-ink-soft"
                    }`}
                  >
                    {link.label}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
