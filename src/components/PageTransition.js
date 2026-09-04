"use client";

import { motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";

// Each route arrives with a soft rise. No exit animation: the App Router swaps
// children before an exit could play, so faking one only delays the page.
export default function PageTransition({ children }) {
  const pathname = usePathname();
  const reduce = useReducedMotion();

  return (
    <motion.div
      key={pathname}
      initial={reduce ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
