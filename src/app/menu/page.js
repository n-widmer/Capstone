import { Card, Flourish, PageHeader, Reveal } from "@/components/ui";
import { SCHEDULE } from "@/lib/wedding";

const COURSES = [
  {
    title: "Appetizers",
    note: "Served during cocktail hour",
    items: ["Cheese & Crackers", "Fresh Fruit with Dip", "Sliced Meats & Crackers"],
  },
  {
    title: "Buffet Dinner",
    note: "Served upstairs",
    items: ["Roasted Red Pepper, Spinach, and Mozzarella Stuffed Chicken", "Spaghetti and Meatballs"],
  },
  {
    title: "Accompaniments",
    items: [
      "Signature Mashed Potatoes",
      "Glazed Baby Carrots",
      "Caribbean Blend Veggies",
      "Family Style Salad with House Dressing",
      "Rolls & Butter",
    ],
  },
  {
    title: "Desserts",
    items: ["Wedding Cake", "Cupcakes & Cookies"],
  },
  {
    title: "Beverages",
    items: ["Iced Tea", "Lemonade", "Coffee & Decaf", "Ice Water at Every Table"],
  },
];

export default function MenuPage() {
  return (
    <main className="min-h-screen px-4 pb-16">
      <PageHeader title="The Menu" subtitle="Catered by Theo's Catering" />

      {/* The day, as a row */}
      <Reveal className="mx-auto mb-14 max-w-4xl">
        <ol className="grid grid-cols-2 gap-x-6 gap-y-8 text-center sm:grid-cols-5">
          {SCHEDULE.map((item) => (
            <li key={item.label}>
              <p className="font-display text-2xl text-ink md:text-3xl">{item.time}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.2em] text-ink-soft">{item.label}</p>
            </li>
          ))}
        </ol>
      </Reveal>

      {/* The printed menu */}
      <Reveal className="mx-auto max-w-2xl">
        <Card tone="paper" inner="relative overflow-hidden px-7 py-14 text-center sm:px-14 sm:py-16">
          <span
            className="pointer-events-none absolute inset-3 rounded-[1.1rem] border border-ink/15"
            aria-hidden="true"
          />
          <img
            src="/art/sprig.jpg"
            alt=""
            className="pointer-events-none absolute -bottom-2 -left-4 w-40 mix-blend-multiply opacity-90 sm:w-52"
            aria-hidden="true"
          />
          <img
            src="/art/sprig.jpg"
            alt=""
            className="pointer-events-none absolute -bottom-2 -right-4 w-40 -scale-x-100 mix-blend-multiply opacity-90 sm:w-52"
            aria-hidden="true"
          />
          {COURSES.map((course, i) => (
            <section key={course.title} className={i > 0 ? "mt-14" : ""}>
              <h2 className="font-display text-2xl font-bold uppercase tracking-[0.18em] text-ink md:text-3xl">
                {course.title}
              </h2>
              <span className="mx-auto mt-3 block h-px w-10 bg-ink/30" aria-hidden="true" />
              {course.note && <p className="mt-3 text-sm italic text-ink-soft">{course.note}</p>}
              <ul className="mt-5 space-y-2.5">
                {course.items.map((item) => (
                  <li key={item} className="font-display text-xl leading-snug text-ink md:text-2xl">
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          ))}

          <Flourish className="mt-14" />
          <p className="mt-6 font-display text-2xl italic text-ink-soft">Bon Appétit</p>
        </Card>
      </Reveal>

      {/* The bar */}
      <div className="mx-auto mt-10 grid max-w-2xl gap-6 md:grid-cols-2">
        <Reveal>
          <Card inner="h-full px-7 py-8">
            <h3 className="font-display text-2xl font-semibold text-ink">Open Bar</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              Complimentary beer, wine, and cocktails. Guests 21+ will be ID&apos;d.
            </p>
          </Card>
        </Reveal>
        <Reveal delay={0.05}>
          <Card tone="dusk" inner="h-full px-7 py-8">
            <h3 className="font-display text-2xl font-semibold text-ink">BYOB Welcome!</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              Feel free to bring your own liquor, beer, or wine. It must be kept behind the bar.
            </p>
          </Card>
        </Reveal>
      </div>
    </main>
  );
}
