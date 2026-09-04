"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { WEDDING_DATE } from "@/lib/wedding";

const EASE = [0.16, 1, 0.3, 1];

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

// A number that rolls when it changes.
function Rolling({ text, className, reduce }) {
  return (
    <span className={`relative inline-block h-[1em] overflow-hidden leading-none ${className}`}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={text}
          initial={reduce ? false : { y: "0.6em", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={reduce ? { opacity: 0 } : { y: "-0.6em", opacity: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="block"
        >
          {text}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function Small({ value, label, reduce }) {
  return (
    <div className="flex flex-col items-center">
      <Rolling
        text={String(value).padStart(2, "0")}
        reduce={reduce}
        className="font-display text-4xl font-light tabular-nums text-ink sm:text-5xl"
      />
      <span className="mt-2 text-[0.6rem] uppercase tracking-[0.25em] text-ink-soft sm:text-xs">
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
  if (!time) return <div className={`h-64 ${className}`} aria-hidden="true" />;

  return (
    <div
      className={`flex flex-col items-center ${className}`}
      role="timer"
      aria-label="Countdown to the wedding"
    >
      <Rolling
        text={String(time.days)}
        reduce={reduce}
        className="font-display text-[7rem] font-light italic tabular-nums text-ink sm:text-[10rem] md:text-[13rem]"
      />
      <span className="mt-2 text-xs uppercase tracking-[0.35em] text-ink-soft sm:text-sm">
        days to go
      </span>

      <div className="mt-10 flex items-start gap-8 sm:gap-12">
        <Small value={time.hours} label="Hours" reduce={reduce} />
        <span className="mt-1 h-10 w-px bg-ink/15 sm:h-12" aria-hidden="true" />
        <Small value={time.minutes} label="Minutes" reduce={reduce} />
        <span className="mt-1 h-10 w-px bg-ink/15 sm:h-12" aria-hidden="true" />
        <Small value={time.seconds} label="Seconds" reduce={reduce} />
      </div>
    </div>
  );
}
