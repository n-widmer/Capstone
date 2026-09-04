import { Card, PageHeader, Reveal } from "@/components/ui";
import { VENUE, VENUE_ADDRESS } from "@/lib/wedding";

const OUTDOORS = {
  title: "Outdoor Activities",
  description:
    "The Tuscarawas County area offers beautiful natural scenery perfect for exploring before or after the wedding.",
  items: [
    {
      name: "Zoar Wetland Arboretum",
      detail:
        "A peaceful nature preserve with walking trails and diverse plant life, just a short drive from Dover.",
    },
    {
      name: "Fort Laurens State Memorial",
      detail:
        "Ohio's only Revolutionary War fort site, featuring a museum and scenic grounds along the Tuscarawas River.",
    },
    {
      name: "Atwood Lake Park",
      detail:
        "A popular destination for hiking, fishing, and enjoying the outdoors at one of the Muskingum Watershed lakes.",
    },
    {
      name: "Dover City Park",
      detail:
        "A charming local park with walking paths, picnic areas, and a relaxing atmosphere in the heart of Dover.",
    },
  ],
};

const DINING = {
  title: "Restaurants & Dining",
  description:
    "Dover and the surrounding area have a wonderful selection of local restaurants and eateries to enjoy during your visit.",
  items: [
    {
      name: "Uncle Primo's",
      detail:
        "A local favorite for Italian-American cuisine, known for generous portions and a warm, family-friendly atmosphere.",
    },
    {
      name: "Park Street Pizza",
      detail:
        "A popular Dover pizzeria serving up hand-tossed pies, calzones, and subs in a casual, laid-back setting.",
    },
    {
      name: "Hoodletown Brewing Company",
      detail:
        "A craft brewery with a rotating tap list of locally brewed beers, great food, and a lively atmosphere perfect for a night out.",
    },
    {
      name: "Magoo's Pizza Pasta and More",
      detail:
        "A family-friendly spot known for their pizza, pasta dishes, and hearty Italian-American comfort food.",
    },
    {
      name: "J-N-G Grill",
      detail:
        "A local grill serving up burgers, sandwiches, and classic American fare with a hometown feel.",
    },
  ],
};

const SHOPPING = {
  title: "Shopping & Entertainment",
  description:
    "From Amish Country shops to local wineries and breweries, there's plenty to see and do in the area.",
  items: [
    {
      name: "Breitenbach Wine Cellars",
      detail:
        "Ohio's largest estate winery in nearby Sugarcreek, offering tastings, tours, and a charming gift shop.",
    },
    {
      name: "Broad Run Cheesehouse",
      detail: "A family-owned cheesehouse offering handcrafted cheeses, local products, and free samples.",
    },
    {
      name: "Downtown Dover Shops",
      detail:
        "Explore the small-town charm of Dover's downtown district with local boutiques, antique shops, and cafes.",
    },
    {
      name: "Sugarcreek Village",
      detail:
        "Known as the 'Little Switzerland of Ohio,' Sugarcreek features Swiss-themed shops, restaurants, and the world's largest cuckoo clock.",
    },
  ],
};

function SectionIntro({ section }) {
  return (
    <div className="max-w-2xl">
      <h2 className="font-display text-4xl font-light text-ink md:text-5xl">{section.title}</h2>
      <p className="mt-3 text-base leading-relaxed text-ink-soft">{section.description}</p>
    </div>
  );
}

function ItemGrid({ items }) {
  return (
    <div className="mt-10 grid gap-x-12 gap-y-9 sm:grid-cols-2">
      {items.map((item) => (
        <div key={item.name}>
          <h3 className="font-display text-2xl text-ink">{item.name}</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{item.detail}</p>
        </div>
      ))}
    </div>
  );
}

export default function ThingsToDoPage() {
  return (
    <main className="min-h-screen px-4 pb-16">
      <PageHeader title="Things To Do" subtitle="Exploring the Dover area" />

      <div className="mx-auto max-w-5xl">
        {/* Map */}
        <Reveal>
          <p className="mb-4 text-center text-sm text-ink-soft">
            {VENUE}, {VENUE_ADDRESS}
          </p>
          <Card inner="overflow-hidden">
            <iframe
              title="Map of the area around Yellowbrick on 39"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d48544.44!2d-81.5!3d40.52!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8836e7d7b3c7c3c7%3A0x0!2zNDDCsDMxJzEyLjAiTiA4McKwMjknMjQuMCJX!5e0!3m2!1sen!2sus!4v1"
              className="block h-[380px] w-full rounded-[calc(1.75rem-0.375rem)] md:h-[460px]"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </Card>
        </Reveal>

        {/* Outdoors */}
        <Reveal className="mt-24">
          <SectionIntro section={OUTDOORS} />
          <ItemGrid items={OUTDOORS.items} />
        </Reveal>

        {/* Dining, as a numbered list inside a tray */}
        <Reveal className="mt-24">
          <Card tone="paper" inner="px-7 py-10 sm:px-12 sm:py-14">
            <SectionIntro section={DINING} />
            <ol className="mt-10">
              {DINING.items.map((item, i) => (
                <li
                  key={item.name}
                  className={`grid grid-cols-[3rem_1fr] gap-4 py-6 ${i > 0 ? "border-t border-ink/10" : ""}`}
                >
                  <span className="font-display text-3xl font-light text-ink-soft">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="font-display text-2xl text-ink">{item.name}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{item.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Card>
        </Reveal>

        {/* Shopping */}
        <Reveal className="mt-24">
          <SectionIntro section={SHOPPING} />
          <ItemGrid items={SHOPPING.items} />
        </Reveal>

        <p className="mt-20 text-center text-sm italic text-ink-soft">
          More suggestions coming soon. Check back as the wedding approaches!
        </p>
      </div>
    </main>
  );
}
