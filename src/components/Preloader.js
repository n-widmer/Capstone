"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

export const INTRO_KEY = "tc-intro-seen";
const EASE = [0.16, 1, 0.3, 1];

// True on the first page of a visit, before the preloader has run. Hero uses
// it to hold its own entrance until the curtain lifts.
export function introPending() {
  if (typeof window === "undefined") return false;
  try {
    return !window.sessionStorage.getItem(INTRO_KEY);
  } catch {
    return false;
  }
}

// The monogram draws itself once per visit, then the page rises underneath.
export default function Preloader() {
  const reduce = useReducedMotion();
  const [show, setShow] = useState(true);

  useEffect(() => {
    if (reduce || !introPending()) {
      setShow(false);
      return;
    }
    const t = setTimeout(() => {
      try {
        window.sessionStorage.setItem(INTRO_KEY, "1");
      } catch {}
      setShow(false);
    }, 1750);
    return () => clearTimeout(t);
  }, [reduce]);

  useEffect(() => {
    document.body.style.overflow = show ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="intro"
          className="fixed inset-0 z-[90] flex origin-top items-center justify-center bg-paper"
          initial={{ scaleY: 1 }}
          exit={{ scaleY: 0 }}
          transition={{ duration: 0.9, ease: EASE }}
          aria-hidden="true"
        >
          <motion.svg
            viewBox="0 0 320 160"
            className="w-56 sm:w-72"
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <text
              x="50%"
              y="58%"
              textAnchor="middle"
              dominantBaseline="middle"
              className="draw-text"
              style={{
                fontFamily: "var(--font-cormorant)",
                fontStyle: "italic",
                fontWeight: 300,
                fontSize: 120,
                fill: "var(--color-ink)",
                stroke: "var(--color-ink)",
                strokeWidth: 1.2,
              }}
            >
              T &amp; C
            </text>
          </motion.svg>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
