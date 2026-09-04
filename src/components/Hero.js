"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui";
import { introPending } from "@/components/Preloader";
import { DATE_LABEL } from "@/lib/wedding";

const EASE = [0.16, 1, 0.3, 1];
const WORDS = ["Tori", "&", "Connor"];

// The names rise out of a mask one letter at a time.
function Names({ reduce, hold }) {
  let index = 0;
  return (
    <h1
      className="font-display text-[4.6rem] font-light italic leading-[0.88] text-ink sm:text-[6.5rem] lg:text-[9.5rem]"
      aria-label="Tori and Connor"
    >
      {WORDS.map((word, w) => (
        <span key={word} className="mr-[0.22em] inline-block overflow-hidden pb-[0.12em] align-top last:mr-0">
          {word.split("").map((ch, c) => {
            const i = index++;
            return (
              <motion.span
                key={`${w}-${c}`}
                aria-hidden="true"
                className={`inline-block ${word === "&" ? "not-italic text-ink-soft" : ""}`}
                initial={reduce ? false : { y: "110%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 1.1, delay: hold + 0.35 + i * 0.045, ease: EASE }}
              >
                {ch}
              </motion.span>
            );
          })}
        </span>
      ))}
    </h1>
  );
}

export default function Hero() {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  // On the first page of a visit the preloader plays first; hold the entrance.
  const [hold] = useState(() => (introPending() ? 1.4 : 0));
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const photoY = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "28%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "-40%"]);
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section ref={ref} className="relative min-h-[100dvh] overflow-hidden">
      {/* Photo: slow settle on load, parallax on scroll */}
      <motion.div className="absolute inset-0" style={{ y: photoY }}>
        <motion.div
          className="relative h-full w-full"
          initial={reduce ? false : { scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 7, delay: hold, ease: EASE }}
        >
          <Image
            src="/hero-photo.jpg"
            alt="Tori and Connor, kissing, her hand held out to show the ring"
            fill
            priority
            sizes="100vw"
            className="photo-mono object-cover object-[58%_32%]"
          />
        </motion.div>
      </motion.div>

      {/* The photo melts into the amber page */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-butter from-[4%] via-butter/55 via-[34%] to-transparent to-[68%]"
        aria-hidden="true"
      />

      <motion.div
        className="relative z-10 mx-auto flex min-h-[100dvh] max-w-7xl flex-col justify-end px-6 pb-14 sm:px-10 lg:px-14 lg:pb-20"
        style={{ y: textY, opacity: fade }}
      >
        <motion.p
          className="mb-5 text-xs uppercase tracking-[0.35em] text-ink-soft"
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: hold + 0.2, ease: EASE }}
        >
          {DATE_LABEL} &middot; Dover, Ohio
        </motion.p>

        <Names reduce={reduce} hold={hold} />

        <motion.div
          className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-5 lg:mt-10"
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: hold + 1.2, ease: EASE }}
        >
          <p className="max-w-sm text-base leading-relaxed text-ink sm:text-lg">
            We&apos;re getting married, and we would love for you to be there.
          </p>
          <div className="flex items-center gap-3">
            <Button href="/rsvp" size="lg" arrow>
              RSVP
            </Button>
            <Button href="#details" variant="secondary" size="lg">
              The Details
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
