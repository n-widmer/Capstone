"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ArrowUpRight } from "@phosphor-icons/react";
import { COUPLE, DATE_LABEL, VENUE } from "@/lib/wedding";

export const EASE = [0.16, 1, 0.3, 1];

// Fade-up on enter. Wrap anything that should arrive gently as it scrolls in.
export function Reveal({ children, delay = 0, className = "", once = true, scale = false }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={
        reduce ? false : { opacity: 0, y: scale ? 0 : 28, scale: scale ? 1.04 : 1, filter: "blur(6px)" }
      }
      whileInView={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      viewport={{ once, amount: 0.2 }}
      transition={{ duration: 0.9, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

// Small tulip between two hairlines. The site's one flourish.
export function Flourish({ className = "" }) {
  return (
    <div className={`flex items-center justify-center gap-4 ${className}`} aria-hidden="true">
      <span className="h-px w-12 bg-ink/15" />
      <img src="/tulips/BlueTulip.png" alt="" className="h-12 w-auto opacity-90" />
      <span className="h-px w-12 bg-ink/15" />
    </div>
  );
}

export function PageHeader({ title, subtitle, children }) {
  return (
    <Reveal className="mx-auto max-w-2xl px-4 pt-14 pb-12 text-center md:pt-20 md:pb-16">
      <h1 className="font-display text-5xl font-light leading-[1.05] text-ink md:text-7xl">{title}</h1>
      {subtitle && (
        <p className="mt-4 font-display text-xl italic text-ink-soft md:text-2xl">{subtitle}</p>
      )}
      {children}
      <Flourish className="mt-8" />
    </Reveal>
  );
}

// Double-bezel card: a soft outer tray with a white inner core.
export function Card({ children, className = "", inner = "", tone = "white" }) {
  const core =
    tone === "butter"
      ? "bg-butter-soft"
      : tone === "dusk"
        ? "bg-dusk-soft"
        : tone === "paper"
          ? "bg-sky-50"
          : "bg-white";
  return (
    <div className={`rounded-[1.75rem] bg-ink/[0.04] p-1.5 ring-1 ring-ink/10 shadow-lift ${className}`}>
      <div
        className={`rounded-[calc(1.75rem-0.375rem)] ${core} shadow-[inset_0_1px_0_rgb(255_255_255/0.8)] ${inner}`}
      >
        {children}
      </div>
    </div>
  );
}

export const inputClass =
  "w-full rounded-xl border border-linen bg-white px-4 py-3 text-base text-ink placeholder:text-ink-soft/60 transition-[border-color,box-shadow] duration-500 ease-[var(--ease-soft)] focus:border-dusk focus:outline-none focus:ring-4 focus:ring-dusk/25 disabled:cursor-not-allowed disabled:opacity-60";

export function Field({ label, hint, error, children, className = "" }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-sm font-medium text-ink">{label}</span>
      {children}
      {hint && !error && <span className="mt-1.5 block text-xs text-ink-soft">{hint}</span>}
      {error && <span className="mt-1.5 block text-xs text-red-700">{error}</span>}
    </label>
  );
}

const buttonBase =
  "group inline-flex items-center justify-center gap-3 rounded-full font-medium tracking-wide transition-all duration-500 ease-[var(--ease-soft)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none disabled:active:scale-100";

const buttonVariants = {
  primary: "bg-ink text-white hover:bg-ink/90 shadow-lift",
  secondary: "bg-transparent text-ink ring-1 ring-ink/25 hover:bg-ink/5 hover:ring-ink/40",
  ghost: "bg-transparent text-ink-soft hover:text-ink",
};

const buttonSizes = {
  md: "px-6 py-3 text-sm",
  lg: "px-8 py-4 text-base",
  sm: "px-4 py-2 text-sm",
};

// `arrow` nests a trailing icon in its own circle ("up" for external links).
export function Button({
  href,
  variant = "primary",
  size = "md",
  arrow,
  external,
  className = "",
  children,
  ...rest
}) {
  const classes = `${buttonBase} ${buttonVariants[variant]} ${buttonSizes[size]} ${arrow ? "pr-2" : ""} ${className}`;
  const Icon = arrow === "up" ? ArrowUpRight : ArrowRight;
  const content = (
    <>
      <span>{children}</span>
      {arrow && (
        <span
          className={`flex h-8 w-8 items-center justify-center rounded-full transition-transform duration-500 ease-[var(--ease-soft)] group-hover:translate-x-0.5 group-hover:scale-105 ${
            variant === "primary" ? "bg-white/15" : "bg-ink/5"
          } ${arrow === "up" ? "group-hover:-translate-y-0.5" : ""}`}
        >
          <Icon size={16} weight="light" />
        </span>
      )}
    </>
  );
  if (href) {
    if (external) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className={classes} {...rest}>
          {content}
        </a>
      );
    }
    return (
      <Link href={href} className={classes} {...rest}>
        {content}
      </Link>
    );
  }
  return (
    <button type="button" className={`cursor-pointer ${classes}`} {...rest}>
      {content}
    </button>
  );
}

const noticeTones = {
  error: "bg-red-50 text-red-800 ring-red-200",
  success: "bg-dusk-soft text-ink ring-dusk/40",
  info: "bg-butter-soft text-ink ring-butter/60",
};

export function Notice({ tone = "info", children, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      className={`rounded-xl px-4 py-3 text-sm ring-1 ${noticeTones[tone]} ${className}`}
      role={tone === "error" ? "alert" : "status"}
    >
      {children}
    </motion.div>
  );
}

// Pill toggle used for gallery filters and section switchers.
export function Pill({ active, children, className = "", ...rest }) {
  return (
    <button
      type="button"
      className={`cursor-pointer rounded-full px-5 py-2 text-sm font-medium transition-all duration-500 ease-[var(--ease-soft)] active:scale-[0.98] ${
        active
          ? "bg-ink text-white shadow-lift"
          : "bg-transparent text-ink-soft ring-1 ring-ink/15 hover:text-ink hover:ring-ink/35"
      } ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

export function Skeleton({ className = "" }) {
  return <div className={`animate-pulse rounded-2xl bg-ink/[0.06] ${className}`} />;
}

export function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin") || pathname === "/access") return null;
  return (
    <footer className="px-6 pb-10 pt-28 text-center">
      <Flourish className="mb-8" />
      {/* Quiet admin entrance for the couple. */}
      <Link
        href="/admin/login"
        className="font-display text-3xl italic text-ink no-underline hover:no-underline"
      >
        {COUPLE}
      </Link>
      <p className="mt-3 text-xs uppercase tracking-[0.25em] text-ink-soft">{DATE_LABEL}</p>
      <p className="mt-1 text-sm text-ink-soft">{VENUE}, Dover, Ohio</p>
    </footer>
  );
}
