"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { WEDDING_DATE } from "@/lib/wedding";

function getTimeLeft() {
  const diff = WEDDING_DATE - new Date();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff / 3_600_000) % 24),
    minutes: Math.floor((diff / 60_000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function Unit({ value, label, reduce }) {
  const text = String(value).padStart(2, "0");
  return (
    <div className="flex flex-col items-center">
      <div className="relative h-[1em] overflow-hidden font-display text-4xl font-light leading-none tabular-nums text-ink sm:text-6xl md:text-7xl">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={text}
            initial={reduce ? false : { y: "0.5em", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { y: "-0.5em", opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="block"
          >
            {text}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="mt-3 text-[0.6rem] uppercase tracking-[0.2em] text-ink-soft sm:text-xs sm:tracking-[0.25em]">
        {label}
      </span>
    </div>
  );
}

export default function CountdownTimer({ className = "" }) {
  const reduce = useReducedMotion();
  const [time, setTime] = useState(null);

  useEffect(() => {
    setTime(getTimeLeft());
    const id = setInterval(() => setTime(getTimeLeft()), 1000);
    return () => clearInterval(id);
  }, []);

  // Reserve the height before mount so the page never jumps.
  if (!time) return <div className={`h-28 ${className}`} aria-hidden="true" />;

  return (
    <div
      className={`flex items-start justify-center gap-4 sm:gap-10 md:gap-14 ${className}`}
      role="timer"
      aria-label="Countdown to the wedding"
    >
      <Unit value={time.days} label="Days" reduce={reduce} />
      <span className="mt-1 h-10 w-px bg-ink/15 sm:mt-2 sm:h-16" aria-hidden="true" />
      <Unit value={time.hours} label="Hours" reduce={reduce} />
      <span className="mt-1 h-10 w-px bg-ink/15 sm:mt-2 sm:h-16" aria-hidden="true" />
      <Unit value={time.minutes} label="Minutes" reduce={reduce} />
      <span className="mt-1 h-10 w-px bg-ink/15 sm:mt-2 sm:h-16" aria-hidden="true" />
      <Unit value={time.seconds} label="Seconds" reduce={reduce} />
    </div>
  );
}
