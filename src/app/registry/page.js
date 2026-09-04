import Image from "next/image";
import { ArrowUpRight, House } from "@phosphor-icons/react/dist/ssr";
import { Card, Flourish, PageHeader, Reveal, Tilt } from "@/components/ui";

const STORES = [
  {
    name: "Amazon",
    href: "https://www.amazon.com/wedding/guest-view/33DL72QMR1KES",
    logo: "/logos/amazon.svg",
    blurb: "Gift ideas and our gift card fund.",
    cta: "Shop on Amazon",
  },
  {
    name: "Walmart",
    href: "https://www.walmart.com/registry/WR/0afce135-2924-4b49-98a2-63d12cbb21c6",
    logo: "/logos/walmart.svg",
    blurb: "Home essentials and more.",
    cta: "Shop on Walmart",
  },
];

function StoreCard({ store }) {
  return (
    <a
      href={store.href}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-[1.75rem] bg-ink/[0.04] p-1.5 ring-1 ring-ink/10 shadow-lift transition-transform duration-700 ease-[var(--ease-soft)] hover:-translate-y-1"
    >
      <div className="flex h-full flex-col items-center rounded-[calc(1.75rem-0.375rem)] bg-card px-8 py-10 text-center shadow-[inset_0_1px_0_rgb(255_255_255/0.8)]">
        <div className="relative h-16 w-32">
          <Image src={store.logo} alt={`${store.name} logo`} fill className="object-contain" />
        </div>
        <h2 className="mt-6 font-display text-3xl font-light text-ink">{store.name} Registry</h2>
        <p className="mt-2 text-sm text-ink-soft">{store.blurb}</p>
        <span className="mt-7 inline-flex items-center gap-3 rounded-full bg-ink py-3 pl-6 pr-2 text-sm font-medium tracking-wide text-white transition-all duration-500 ease-[var(--ease-soft)] group-hover:bg-ink/90">
          <span>{store.cta}</span>
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-card/15 transition-transform duration-500 ease-[var(--ease-soft)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
            <ArrowUpRight size={16} weight="light" />
          </span>
        </span>
      </div>
    </a>
  );
}

export default function RegistryPage() {
  return (
    <main className="min-h-screen px-4 pb-16">
      <PageHeader title="Registry">
        <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-ink-soft">
          Your presence at our wedding is the greatest gift of all. If you wish to honor us with
          a gift, we&apos;ve registered at the stores below.
        </p>
      </PageHeader>

      <div className="mx-auto max-w-4xl space-y-8">
        <div className="grid gap-6 md:grid-cols-2">
          {STORES.map((store, i) => (
            <Reveal key={store.name} delay={i * 0.05}>
              <Tilt>
                <StoreCard store={store} />
              </Tilt>
            </Reveal>
          ))}
        </div>

        {/* House fund */}
        <Reveal>
          <a
            href="https://paypal.me/ToriCampbell02"
            target="_blank"
            rel="noopener noreferrer"
            className="group block"
          >
            <Card tone="butter" inner="flex flex-col items-center gap-6 px-8 py-10 text-center md:flex-row md:text-left md:px-12">
              <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-card text-ink ring-1 ring-ink/10">
                <House size={28} weight="light" />
              </span>
              <div className="flex-1">
                <h2 className="font-display text-3xl font-light text-ink">House Fund</h2>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-soft">
                  If you&apos;d prefer to contribute to our new home, we&apos;d be incredibly
                  grateful.
                </p>
              </div>
              <span className="inline-flex shrink-0 items-center gap-3 rounded-full py-3 pl-6 pr-2 text-sm font-medium tracking-wide text-ink ring-1 ring-ink/25 transition-all duration-500 ease-[var(--ease-soft)] group-hover:bg-ink/5 group-hover:ring-ink/40">
                <span>Contribute</span>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink/5 transition-transform duration-500 ease-[var(--ease-soft)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
                  <ArrowUpRight size={16} weight="light" />
                </span>
              </span>
            </Card>
          </a>
        </Reveal>

        {/* Thank you */}
        <Reveal className="pt-8 text-center">
          <Flourish className="mb-6" />
          <p className="mx-auto max-w-xl font-display text-2xl italic leading-relaxed text-ink md:text-3xl">
            &ldquo;Thank you for celebrating this special day with us. Your love and support mean
            the world.&rdquo;
          </p>
          <p className="mt-4 text-sm uppercase tracking-[0.25em] text-ink-soft">Tori & Connor</p>
        </Reveal>
      </div>
    </main>
  );
}
