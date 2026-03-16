"use client";

import { useEffect, useRef, useCallback } from "react";

// SVG tulip in different colors
function TulipSVG({ color }) {
  const colors = {
    pink: { petal: "#f472b6", petalDark: "#ec4899", stem: "#16a34a" },
    red: { petal: "#ef4444", petalDark: "#dc2626", stem: "#15803d" },
    yellow: { petal: "#facc15", petalDark: "#eab308", stem: "#16a34a" },
    white: { petal: "#fef9ef", petalDark: "#fde68a", stem: "#22c55e" },
    purple: { petal: "#c084fc", petalDark: "#a855f7", stem: "#15803d" },
  };

  const c = colors[color] || colors.pink;

  return (
    <svg viewBox="0 0 40 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 35 Q18 55 20 75" stroke={c.stem} strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M19 50 Q10 45 8 52 Q10 56 18 53" fill={c.stem} opacity="0.8" />
      <path d="M21 55 Q30 50 32 57 Q30 61 22 58" fill={c.stem} opacity="0.8" />
      <ellipse cx="13" cy="20" rx="8" ry="16" fill={c.petalDark} transform="rotate(-15 13 20)" />
      <ellipse cx="27" cy="20" rx="8" ry="16" fill={c.petalDark} transform="rotate(15 27 20)" />
      <ellipse cx="16" cy="18" rx="7" ry="15" fill={c.petal} transform="rotate(-8 16 18)" />
      <ellipse cx="24" cy="18" rx="7" ry="15" fill={c.petal} transform="rotate(8 24 18)" />
      <ellipse cx="20" cy="16" rx="6" ry="14" fill={c.petal} opacity="0.9" />
    </svg>
  );
}

const TULIP_COLORS = ["pink", "red", "yellow", "white", "purple"];

function generateTulips() {
  const viewportHeight = window.innerHeight;
  const pageHeight = document.documentElement.scrollHeight;
  const maxScroll = Math.max(1, pageHeight - viewportHeight);

  return Array.from({ length: 30 }, (_, i) => {
    const appearAtScroll = i < 10 ? 0 : Math.random() * maxScroll * 0.5;
    const speed = 1.5 + Math.random() * 2.0;

    return {
      id: i,
      x: Math.random() * 92 + 2,
      size: 30 + Math.random() * 50,
      rotation: -30 + Math.random() * 60,
      speed,
      rotationSpeed: (Math.random() - 0.5) * 0.15,
      startY: i < 10 ? Math.random() * viewportHeight * 0.8 : -(50 + Math.random() * 150),
      appearAtScroll,
      color: TULIP_COLORS[Math.floor(Math.random() * TULIP_COLORS.length)],
      opacity: 0.3 + Math.random() * 0.4,
    };
  });
}

export default function FallingTulips() {
  const containerRef = useRef(null);
  const tulipsRef = useRef([]);
  const rafId = useRef(null);

  const updatePositions = useCallback(() => {
    const container = containerRef.current;
    const tulips = tulipsRef.current;
    if (!container || !tulips.length) return;

    const sy = window.scrollY;
    const children = container.children;

    for (let i = 0; i < children.length && i < tulips.length; i++) {
      const t = tulips[i];
      const effectiveScroll = Math.max(0, sy - t.appearAtScroll);
      const y = t.startY + effectiveScroll * t.speed;
      const rot = t.rotation + effectiveScroll * t.rotationSpeed;
      const visible = sy >= t.appearAtScroll;
      children[i].style.transform = `translateY(${y}px) rotate(${rot}deg)`;
      children[i].style.opacity = visible ? t.opacity : 0;
    }
  }, []);

  // Generate tulips and set up scroll listener
  useEffect(() => {
    // Generate fresh tulips every time the component mounts
    const tulips = generateTulips();
    tulipsRef.current = tulips;

    // Build DOM directly for immediate rendering (no state delay)
    const container = containerRef.current;
    if (!container) return;

    // Clear any old tulips
    container.innerHTML = "";

    tulips.forEach((t) => {
      const div = document.createElement("div");
      div.className = "absolute will-change-transform";
      div.style.left = `${t.x}%`;
      div.style.top = "0";
      div.style.width = `${t.size}px`;
      div.style.height = `${t.size * 2}px`;
      div.style.opacity = t.appearAtScroll === 0 ? t.opacity : 0;
      div.style.transform = `translateY(${t.startY}px) rotate(${t.rotation}deg)`;

      // Create SVG tulip
      const colors = {
        pink: { petal: "#f472b6", petalDark: "#ec4899", stem: "#16a34a" },
        red: { petal: "#ef4444", petalDark: "#dc2626", stem: "#15803d" },
        yellow: { petal: "#facc15", petalDark: "#eab308", stem: "#16a34a" },
        white: { petal: "#fef9ef", petalDark: "#fde68a", stem: "#22c55e" },
        purple: { petal: "#c084fc", petalDark: "#a855f7", stem: "#15803d" },
      };
      const c = colors[t.color] || colors.pink;

      div.innerHTML = `<svg viewBox="0 0 40 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 35 Q18 55 20 75" stroke="${c.stem}" stroke-width="2.5" stroke-linecap="round" fill="none"/>
        <path d="M19 50 Q10 45 8 52 Q10 56 18 53" fill="${c.stem}" opacity="0.8"/>
        <path d="M21 55 Q30 50 32 57 Q30 61 22 58" fill="${c.stem}" opacity="0.8"/>
        <ellipse cx="13" cy="20" rx="8" ry="16" fill="${c.petalDark}" transform="rotate(-15 13 20)"/>
        <ellipse cx="27" cy="20" rx="8" ry="16" fill="${c.petalDark}" transform="rotate(15 27 20)"/>
        <ellipse cx="16" cy="18" rx="7" ry="15" fill="${c.petal}" transform="rotate(-8 16 18)"/>
        <ellipse cx="24" cy="18" rx="7" ry="15" fill="${c.petal}" transform="rotate(8 24 18)"/>
        <ellipse cx="20" cy="16" rx="6" ry="14" fill="${c.petal}" opacity="0.9"/>
      </svg>`;

      container.appendChild(div);
    });

    // Scroll handler
    function onScroll() {
      if (rafId.current) return;
      rafId.current = requestAnimationFrame(() => {
        updatePositions();
        rafId.current = null;
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    // Run once immediately to position based on current scroll
    updatePositions();

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [updatePositions]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-10 overflow-hidden"
      aria-hidden="true"
    />
  );
}
