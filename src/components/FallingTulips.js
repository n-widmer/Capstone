"use client";

import { useEffect, useRef, useCallback } from "react";

const TULIP_IMAGES = ["/tulips/WhiteTulip.png", "/tulips/YellowTulip.png", "/tulips/BlueTulip.png"];

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
      image: TULIP_IMAGES[Math.floor(Math.random() * TULIP_IMAGES.length)],
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

  useEffect(() => {
    const tulips = generateTulips();
    tulipsRef.current = tulips;

    const container = containerRef.current;
    if (!container) return;

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

      div.innerHTML = `<img src="${t.image}" alt="" style="width:100%;height:100%;object-fit:contain;" />`;

      container.appendChild(div);
    });

    function onScroll() {
      if (rafId.current) return;
      rafId.current = requestAnimationFrame(() => {
        updatePositions();
        rafId.current = null;
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
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
