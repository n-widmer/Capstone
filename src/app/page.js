import Image from "next/image";
import FallingTulips from "@/components/FallingTulips";
import CountdownTimer from "@/components/CountdownTimer";
import { Button, Card, Reveal, Flourish } from "@/components/ui";
import { DATE_LABEL, SCHEDULE, VENUE, VENUE_ADDRESS, VENUE_MAPS_URL } from "@/lib/wedding";

export default function Home() {
  return (
    <main className="relative bg-butter">
      <FallingTulips />

      {/* Hero: names on the left, the two of them on the right */}
      <section className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-stretch gap-8 px-4 pb-8 pt-6 sm:px-6 lg:min-h-[calc(100dvh-5.5rem)] lg:grid-cols-12 lg:gap-12 lg:pb-16">
        <div className="order-2 flex flex-col justify-center py-6 lg:order-1 lg:col-span-5 lg:py-0">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.3em] text-ink-soft">
              {DATE_LABEL} &middot; Dover, Ohio
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="mt-5 font-display text-6xl font-light italic leading-[0.95] text-ink sm:text-7xl lg:text-8xl">
              Tori <span className="not-italic text-ink-soft">&amp;</span>
              <br />
              Connor
            </h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-7 max-w-md text-lg leading-relaxed text-ink-soft">
              We&apos;re getting married, and we would love for you to be there.
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Button href="/rsvp" size="lg" arrow>
                RSVP
              </Button>
              <Button href="#details" variant="secondary" size="lg">
                The Details
              </Button>
            </div>
          </Reveal>
        </div>

        <Reveal scale className="order-1 lg:order-2 lg:col-span-7">
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[2rem] bg-white/40 ring-1 ring-ink/10 shadow-lift sm:aspect-[5/6] lg:aspect-auto lg:h-full lg:min-h-[640px]">
            <Image
              src="/hero-photo.jpg"
              alt="Tori and Connor, kissing, her hand held out to show the ring"
              fill
              priority
              sizes="(min-width: 1024px) 58vw, 100vw"
              className="photo-mono object-cover object-[center_28%]"
            />
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/25 via-transparent to-transparent"
              aria-hidden="true"
            />
          </div>
        </Reveal>
      </section>

      {/* Countdown */}
      <section className="relative z-10 px-4 py-20 md:py-28">
        <Reveal>
          <p className="mb-10 text-center font-display text-2xl italic text-ink-soft md:text-3xl">
            Until we say I do
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <CountdownTimer />
        </Reveal>
      </section>

      {/* Venue and the day */}
      <section id="details" className="relative z-10 scroll-mt-24 bg-butter-soft px-4 py-20 md:py-28">
        <div className="mx-auto grid max-w-6xl gap-14 lg:grid-cols-2 lg:gap-20">
          <Reveal>
            <h2 className="font-display text-4xl font-light leading-tight text-ink md:text-5xl">
              {VENUE}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-ink-soft">{VENUE_ADDRESS}</p>
            <p className="mt-6 max-w-md text-base leading-relaxed text-ink-soft">
              Accessible parking is located near the cottage. Please save this for those who
              need to utilize it.
            </p>
            <div className="mt-8">
              <Button href={VENUE_MAPS_URL} external variant="secondary" arrow="up">
                Open in Maps
              </Button>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <h2 className="font-display text-4xl font-light leading-tight text-ink md:text-5xl">
              The Day
            </h2>
            <ol className="mt-6">
              {SCHEDULE.map((item, i) => (
                <li
                  key={item.label}
                  className={`flex items-baseline justify-between gap-6 py-4 ${
                    i > 0 ? "border-t border-ink/10" : ""
                  }`}
                >
                  <span className="font-display text-2xl text-ink md:text-3xl">{item.label}</span>
                  <span className="text-sm tracking-wide text-ink-soft">{item.time}</span>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
      </section>

      {/* Getting home safely */}
      <section className="relative z-10 px-4 py-20 md:py-28">
        <Reveal className="mx-auto max-w-3xl">
          <Card inner="px-8 py-10 text-center md:px-14 md:py-14">
            <Flourish className="mb-6" />
            <h2 className="font-display text-3xl font-light text-ink md:text-4xl">Please Note</h2>
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-ink">
              There WILL be a sheriff monitoring for drunk driving. We will also be providing a
              shuttle service to and from the hotel. If you choose not to use this PLEASE plan
              accordingly and arrange for safe transportation!!
            </p>
          </Card>
        </Reveal>
      </section>
    </main>
  );
}
