"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";

const TULIP_IMAGES = ["/tulips/WhiteTulip.png", "/tulips/YellowTulip.png", "/tulips/BlueTulip.png"];

function makeTulips(count, viewportHeight) {
  return Array.from({ length: count }, (_, i) => {
    const onScreenAtLoad = i < Math.ceil(count / 3);
    return {
      id: i,
      x: Math.random() * 92 + 2,
      size: 34 + Math.random() * 56,
      rotation: -30 + Math.random() * 60,
      speed: 0.6 + Math.random() * 1.2,
      rotSpeed: (Math.random() - 0.5) * 0.08,
      startY: onScreenAtLoad ? Math.random() * viewportHeight * 0.85 : -(60 + Math.random() * 200),
      appearAt: onScreenAtLoad ? 0 : Math.random() * 1400,
      image: TULIP_IMAGES[i % TULIP_IMAGES.length],
      opacity: 0.35 + Math.random() * 0.35,
      swayDelay: -(Math.random() * 6),
    };
  });
}

function Tulip({ t, scrollY, still }) {
  const y = useTransform(scrollY, (v) =>
    still ? t.startY : t.startY + Math.max(0, v - t.appearAt) * t.speed
  );
  const rotate = useTransform(scrollY, (v) =>
    still ? t.rotation : t.rotation + Math.max(0, v - t.appearAt) * t.rotSpeed
  );
  const opacity = useTransform(scrollY, (v) => (v >= t.appearAt ? t.opacity : 0));

  return (
    <motion.div
      className="absolute top-0 will-change-transform"
      style={{ left: `${t.x}%`, width: t.size, height: t.size * 2, y, rotate, opacity }}
    >
      <img
        src={t.image}
        alt=""
        className="sway h-full w-full object-contain"
        style={{ animationDelay: `${t.swayDelay}s` }}
        draggable={false}
      />
    </motion.div>
  );
}

// Tulips drift down as the guest scrolls, driven by motion values so nothing
// re-renders per frame. Randomness is generated on the client after mount so
// server and client markup match.
export default function FallingTulips({ count } = {}) {
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const [tulips, setTulips] = useState([]);

  useEffect(() => {
    const n = count ?? (window.innerWidth < 768 ? 12 : 22);
    setTulips(makeTulips(n, window.innerHeight));
  }, [count]);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      {tulips.map((t) => (
        <Tulip key={t.id} t={t} scrollY={scrollY} still={!!reduce} />
      ))}
    </div>
  );
}
