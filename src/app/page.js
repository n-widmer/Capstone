import Hero from "@/components/Hero";
import CountdownTimer from "@/components/CountdownTimer";
import OurStory from "@/components/OurStory";
import { Button, Card, Reveal, Flourish, Marquee } from "@/components/ui";
import { SCHEDULE, VENUE, VENUE_ADDRESS, VENUE_MAPS_URL } from "@/lib/wedding";

export default function Home() {
  return (
    <main className="relative">
      <Hero />

      <Marquee />

      {/* Countdown */}
      <section className="relative overflow-hidden px-4 py-24 text-center md:py-32">
        <img
          src="/art/wash.jpg"
          alt=""
          className="pointer-events-none absolute left-1/2 top-1/2 h-[34rem] w-[54rem] max-w-none -translate-x-1/2 -translate-y-1/2 object-cover opacity-80 mix-blend-multiply [mask-image:radial-gradient(closest-side,black_55%,transparent)]"
          aria-hidden="true"
        />
        <Reveal className="relative">
          <p className="mb-2 font-display text-2xl italic text-ink-soft md:text-3xl">
            Until we say I do
          </p>
          <CountdownTimer />
        </Reveal>
      </section>

      <OurStory />

      {/* Venue and the day */}
      <section
        id="details"
        className="relative scroll-mt-24 bg-butter-soft/80 px-4 py-24 backdrop-blur-sm md:py-32"
      >
        <div className="mx-auto grid max-w-6xl gap-16 lg:grid-cols-2 lg:gap-24">
          <Reveal>
            <h2 className="font-display text-5xl font-light leading-[1.05] text-ink md:text-6xl">
              {VENUE}
            </h2>
            <p className="mt-5 text-base leading-relaxed text-ink-soft">{VENUE_ADDRESS}</p>
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
            <h2 className="font-display text-5xl font-light leading-[1.05] text-ink md:text-6xl">
              The Day
            </h2>
            <ol className="mt-8">
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
      <section className="relative px-4 py-24 md:py-32">
        <Reveal className="mx-auto max-w-3xl">
          <Card inner="px-8 py-10 text-center md:px-14 md:py-14">
            <Flourish className="mb-6" />
            <h2 className="font-display text-3xl font-semibold text-ink md:text-4xl">Please Note</h2>
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
