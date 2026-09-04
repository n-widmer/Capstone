"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";

const TULIP_IMAGES = ["/tulips/WhiteTulip.png", "/tulips/YellowTulip.png", "/tulips/BlueTulip.png"];

// Three depth layers: far tulips are small, soft and slow; near ones are big
// and quick. Scroll adds parallax on top of the continuous fall.
const LAYERS = [
  { scale: 0.55, opacity: 0.35, blur: "blur-[1.5px]", fall: [34, 52], parallax: 0.12 },
  { scale: 0.9, opacity: 0.6, blur: "", fall: [24, 38], parallax: 0.3 },
  { scale: 1.4, opacity: 0.85, blur: "", fall: [16, 26], parallax: 0.55 },
];

function makeTulips(count) {
  return Array.from({ length: count }, (_, i) => {
    const layer = LAYERS[i % LAYERS.length];
    const duration = layer.fall[0] + Math.random() * (layer.fall[1] - layer.fall[0]);
    return {
      id: i,
      layer,
      x: Math.random() * 94 + 1,
      size: (36 + Math.random() * 36) * layer.scale,
      rotation: -35 + Math.random() * 70,
      duration,
      delay: -(Math.random() * duration),
      image: TULIP_IMAGES[Math.floor(Math.random() * TULIP_IMAGES.length)],
      swayDelay: -(Math.random() * 6),
    };
  });
}

function Tulip({ t, scrollY, still }) {
  const y = useTransform(scrollY, (v) => (still ? 0 : v * t.layer.parallax));

  return (
    <motion.div
      className={`absolute top-0 will-change-transform ${t.layer.blur}`}
      style={{ left: `${t.x}%`, width: t.size, height: t.size * 2, opacity: t.layer.opacity, y }}
    >
      <div
        className={still ? "" : "fall"}
        style={{
          "--fall-duration": `${t.duration}s`,
          "--fall-delay": `${t.delay}s`,
          transform: still ? `translate3d(0, ${((t.id * 37) % 100)}vh, 0)` : undefined,
        }}
      >
        <img
          src={t.image}
          alt=""
          className="sway h-full w-full object-contain"
          style={{
            width: t.size,
            height: t.size * 2,
            rotate: `${t.rotation}deg`,
            animationDelay: `${t.swayDelay}s`,
          }}
          draggable={false}
        />
      </div>
    </motion.div>
  );
}

// Randomness is generated on the client after mount so server and client
// markup match. Rendered once in the root layout, behind every page.
export default function FallingTulips({ count } = {}) {
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const [tulips, setTulips] = useState([]);

  useEffect(() => {
    const n = count ?? (window.innerWidth < 768 ? 14 : 27);
    setTulips(makeTulips(n));
  }, [count]);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      {tulips.map((t) => (
        <Tulip key={t.id} t={t} scrollY={scrollY} still={!!reduce} />
      ))}
    </div>
  );
}
