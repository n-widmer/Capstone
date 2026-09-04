"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { Reveal } from "@/components/ui";
import { STORY } from "@/lib/wedding";

// A vertical line draws down the middle as the guest scrolls; each chapter
// sits to one side of it. Chapters without words show a soft placeholder.
export default function OurStory() {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 70%", "end 60%"] });
  const scaleY = useTransform(scrollYProgress, [0, 1], [reduce ? 1 : 0, 1]);

  return (
    <section className="relative px-4 py-24 md:py-32">
      <Reveal className="mx-auto mb-16 max-w-2xl text-center md:mb-24">
        <h2 className="font-display text-5xl font-light leading-[1.05] text-ink md:text-6xl">
          Our Story
        </h2>
      </Reveal>

      <div ref={ref} className="relative mx-auto max-w-5xl">
        {/* The line */}
        <div className="absolute left-5 top-0 h-full w-px bg-ink/10 md:left-1/2" aria-hidden="true">
          <motion.div className="h-full w-full origin-top bg-ink/50" style={{ scaleY }} />
        </div>

        <ol className="space-y-16 md:space-y-24">
          {STORY.map((chapter, i) => {
            const left = i % 2 === 0;
            return (
              <li key={chapter.title} className="relative md:grid md:grid-cols-2 md:gap-16">
                {/* Node */}
                <span
                  className="absolute left-5 top-2 h-3 w-3 -translate-x-1/2 rounded-full bg-butter ring-4 ring-paper md:left-1/2"
                  aria-hidden="true"
                />

                <Reveal
                  className={`pl-12 md:pl-0 ${
                    left ? "md:col-start-1 md:pr-16 md:text-right" : "md:col-start-2 md:pl-16"
                  }`}
                >
                  {chapter.date && (
                    <p className="text-xs uppercase tracking-[0.3em] text-ink-soft">{chapter.date}</p>
                  )}
                  <h3 className="mt-2 font-display text-3xl font-light text-ink md:text-4xl">
                    {chapter.title}
                  </h3>
                  {chapter.body ? (
                    <p className="mt-4 max-w-md text-base leading-relaxed text-ink-soft md:ml-auto">
                      {chapter.body}
                    </p>
                  ) : (
                    <p className="mt-4 font-display text-xl italic text-ink-soft">Coming soon</p>
                  )}
                  {chapter.photo && (
                    <div
                      className={`relative mt-6 aspect-[4/5] w-56 overflow-hidden rounded-[1.5rem] ring-1 ring-ink/10 shadow-lift sm:w-64 ${
                        left ? "md:ml-auto" : ""
                      }`}
                    >
                      <Image
                        src={chapter.photo}
                        alt={chapter.title}
                        fill
                        sizes="256px"
                        className="photo-mono object-cover object-[60%_45%]"
                      />
                    </div>
                  )}
                </Reveal>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
