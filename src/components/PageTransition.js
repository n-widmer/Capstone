"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";

const EASE = [0.16, 1, 0.3, 1];

// On every route change a sky-blue curtain drops over the page and lifts to
// reveal the new one. The App Router swaps children instantly, so the curtain
// is what makes the change feel like a page turn rather than a flicker.
export default function PageTransition({ children }) {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const firstRender = useRef(true);

  useEffect(() => {
    firstRender.current = false;
  }, []);

  return (
    <div className="relative z-10">
      <AnimatePresence initial={false}>
        {!reduce && (
          <motion.div
            key={`curtain-${pathname}`}
            className="pointer-events-none fixed inset-0 z-[70] origin-top bg-paper"
            initial={{ scaleY: 1 }}
            animate={{ scaleY: 0 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.05 }}
          />
        )}
      </AnimatePresence>

      <motion.div
        key={pathname}
        initial={reduce || firstRender.current ? false : { opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.25, ease: EASE }}
      >
        {children}
      </motion.div>
    </div>
  );
}
