export default function ThingsToDoPage() {
  const sections = [
    {
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
    },
    {
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
          name: "Hog Heaven BBQ",
          detail:
            "Beloved barbecue spot serving up slow-smoked ribs, pulled pork, and all the classic sides.",
        },
        {
          name: "Buehler's Fresh Foods",
          detail:
            "A well-known local grocery and bakery chain, great for grabbing fresh deli sandwiches, baked goods, and snacks.",
        },
        {
          name: "The Wallhouse Hotel Restaurant",
          detail:
            "Upscale dining in a beautifully restored historic hotel in nearby Walnut Creek, featuring seasonal menus.",
        },
      ],
    },
    {
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
          detail:
            "A family-owned cheesehouse offering handcrafted cheeses, local products, and free samples.",
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
    },
  ];

  return (
    <main className="min-h-screen py-12">
      <div className="max-w-5xl mx-auto px-4">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="font-[family-name:var(--font-cormorant)] text-5xl md:text-6xl font-light tracking-wide text-sky-900 mb-3">
            Things To Do
          </h1>
          <div className="w-32 h-px bg-sky-600 mx-auto mb-4"></div>
          <p className="text-lg text-sky-800/70 italic">
            Exploring the Dover Area
          </p>
        </div>

        {/* Venue Pin Note */}
        <div className="text-center mb-6">
          <p className="text-sm text-sky-800/60 tracking-wide uppercase">
            Yellowbrick on 39 &middot; 3931 State Route 39 NW, Dover, OH 44622
          </p>
        </div>

        {/* Google Maps Embed */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-16">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d48544.44!2d-81.5!3d40.52!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8836e7d7b3c7c3c7%3A0x0!2zNDDCsDMxJzEyLjAiTiA4McKwMjknMjQuMCJX!5e0!3m2!1sen!2sus!4v1"
            width="100%"
            height="450"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        {/* Sections */}
        <div className="grid gap-10">
          {sections.map((section) => (
            <section
              key={section.title}
              className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-sky-100 overflow-hidden"
            >
              {/* Section Header */}
              <div className="bg-sky-900/5 px-8 py-5 border-b border-sky-100">
                <h2 className="font-[family-name:var(--font-cormorant)] text-3xl font-semibold text-sky-900 mb-1">
                  {section.title}
                </h2>
                <p className="text-sky-800/60 text-sm">{section.description}</p>
              </div>

              {/* Items Grid */}
              <div className="grid md:grid-cols-2 gap-px bg-sky-100">
                {section.items.map((item) => (
                  <div
                    key={item.name}
                    className="bg-white p-6 hover:bg-sky-50/50 transition-colors duration-200"
                  >
                    <h3 className="font-[family-name:var(--font-cormorant)] text-xl font-semibold text-sky-900 mb-2">
                      {item.name}
                    </h3>
                    <p className="text-sky-800/70 text-sm leading-relaxed">
                      {item.detail}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Footer Note */}
        <div className="text-center mt-14 mb-4">
          <p className="text-sky-800/50 text-sm italic">
            More suggestions coming soon &mdash; check back as the wedding
            approaches!
          </p>
        </div>
      </div>
    </main>
  );
}
