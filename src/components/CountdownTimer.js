"use client";

import { useState, useEffect } from "react";

const TARGET_DATE = new Date("2027-05-22T16:00:00-04:00");

function getTimeLeft() {
  const now = new Date();
  const diff = TARGET_DATE - now;

  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function pad(num, length = 2) {
  return String(num).padStart(length, "0");
}

function FlipDigit({ digit, prevDigit }) {
  const flipping = digit !== prevDigit;

  return (
    <span className="relative inline-block w-[1.6rem] h-[2.4rem] sm:w-[2.2rem] sm:h-[3.2rem] md:w-[2.8rem] md:h-[4rem]">
      {/* Static base card */}
      <span className="absolute inset-0 flex items-center justify-center rounded bg-sky-900 text-amber-300 font-[family-name:var(--font-cormorant)] text-2xl sm:text-3xl md:text-4xl font-semibold shadow-md">
        {digit}
      </span>

      {/* Flip overlay */}
      {flipping && (
        <span
          key={digit}
          className="absolute inset-0 flex items-center justify-center rounded bg-sky-900 text-amber-300 font-[family-name:var(--font-cormorant)] text-2xl sm:text-3xl md:text-4xl font-semibold shadow-md animate-flipDown origin-top"
        >
          {digit}
        </span>
      )}
    </span>
  );
}

function FlipUnit({ value, prevValue, digits, label }) {
  const curr = pad(value, digits);
  const prev = pad(prevValue, digits);

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="flex gap-[3px]">
        {curr.split("").map((d, i) => (
          <FlipDigit key={i} digit={d} prevDigit={prev[i]} />
        ))}
      </div>
      <span className="font-[family-name:var(--font-cormorant)] text-[0.6rem] sm:text-xs tracking-[0.2em] uppercase text-sky-800/70">
        {label}
      </span>
    </div>
  );
}

function Colon() {
  return (
    <span className="font-[family-name:var(--font-cormorant)] text-2xl sm:text-3xl md:text-4xl text-sky-900 font-semibold self-start mt-[0.15rem] sm:mt-[0.25rem] md:mt-[0.3rem] mx-0.5">
      :
    </span>
  );
}

export default function CountdownTimer() {
  const [mounted, setMounted] = useState(false);
  const [time, setTime] = useState(getTimeLeft);
  const [prevTime, setPrevTime] = useState(getTimeLeft);

  useEffect(() => {
    setMounted(true);
    const id = setInterval(() => {
      setTime((prev) => {
        setPrevTime(prev);
        return getTimeLeft();
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  if (!mounted) return null;

  return (
    <div className="mb-12 flex flex-col items-center">
      <style jsx>{`
        @keyframes flipDown {
          0% {
            transform: rotateX(0deg);
            opacity: 1;
          }
          50% {
            transform: rotateX(-90deg);
            opacity: 0.6;
          }
          100% {
            transform: rotateX(0deg);
            opacity: 1;
          }
        }
        .animate-flipDown {
          animation: flipDown 0.6s ease-in-out;
        }
      `}</style>

      <div className="flex items-start gap-2 sm:gap-3">
        <FlipUnit value={time.days} prevValue={prevTime.days} digits={3} label="Days" />
        <Colon />
        <FlipUnit value={time.hours} prevValue={prevTime.hours} digits={2} label="Hours" />
        <Colon />
        <FlipUnit value={time.minutes} prevValue={prevTime.minutes} digits={2} label="Minutes" />
        <Colon />
        <FlipUnit value={time.seconds} prevValue={prevTime.seconds} digits={2} label="Seconds" />
      </div>
    </div>
  );
}
