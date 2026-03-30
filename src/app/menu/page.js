export default function MenuPage() {
  return (
    <main className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Menu Header */}
        <div className="text-center mb-12 relative">
          <div className="absolute inset-0 flex items-center justify-center opacity-5">
            <div className="text-9xl"></div>
          </div>
          <h1 className="text-6xl font-serif text-sky-900 mb-4 relative">
            Wedding Menu
          </h1>
          <div className="w-32 h-1 bg-sky-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600 italic font-serif">
            Tori & Connor
          </p>
          <p className="text-lg text-gray-500">May 22, 2027</p>
          <p className="text-sm text-gray-400 mt-2">Catered by Theo's Catering</p>
        </div>

        {/* Timeline */}
        <div className="flex flex-wrap justify-center gap-6 mb-12 text-center">
          {[
            { time: "3:30 PM", label: "Ceremony" },
            { time: "4:00 PM", label: "Cocktail Hour" },
            { time: "5:00 PM", label: "Reception" },
            { time: "5:30 PM", label: "Dinner" },
            { time: "6:30 PM", label: "Cake Cutting" },
          ].map((item) => (
            <div key={item.label} className="bg-white rounded-lg shadow px-5 py-3 border border-sky-100">
              <p className="text-lg font-semibold text-sky-900">{item.time}</p>
              <p className="text-sm text-gray-500">{item.label}</p>
            </div>
          ))}
        </div>

        {/* Menu Content */}
        <div className="bg-white rounded-lg shadow-2xl border-4 border-double border-sky-400 p-8 md:p-12 relative overflow-hidden">
          {/* Decorative corner elements */}
          <div className="absolute top-0 left-0 w-20 h-20 border-t-4 border-l-4 border-sky-300 opacity-40"></div>
          <div className="absolute top-0 right-0 w-20 h-20 border-t-4 border-r-4 border-sky-300 opacity-40"></div>
          <div className="absolute bottom-0 left-0 w-20 h-20 border-b-4 border-l-4 border-sky-300 opacity-40"></div>
          <div className="absolute bottom-0 right-0 w-20 h-20 border-b-4 border-r-4 border-sky-300 opacity-40"></div>

          {/* Appetizers */}
          <section className="mb-10">
            <h2 className="text-3xl font-serif text-sky-900 mb-2 text-center border-b-2 border-sky-400 pb-2">
              ~ Appetizers ~
            </h2>
            <p className="text-center text-gray-400 text-sm italic mb-6">Served during cocktail hour</p>
            <div className="space-y-3 text-center">
              <p className="text-lg text-gray-700">Cheese & Crackers</p>
              <p className="text-lg text-gray-700">Fresh Fruit with Dip</p>
              <p className="text-lg text-gray-700">Sliced Meats & Crackers</p>
            </div>
          </section>

          {/* Buffet Dinner */}
          <section className="mb-10">
            <h2 className="text-3xl font-serif text-sky-900 mb-2 text-center border-b-2 border-sky-400 pb-2">
              ~ Buffet Dinner ~
            </h2>
            <p className="text-center text-gray-400 text-sm italic mb-6">Served upstairs</p>
            <div className="space-y-3 text-center">
              <p className="text-lg text-gray-700 font-medium">Marry Me Chicken</p>
              <p className="text-lg text-gray-700 font-medium">Penne Pasta with Marinara & Meatballs</p>
            </div>
          </section>

          {/* Sides */}
          <section className="mb-10">
            <h2 className="text-3xl font-serif text-sky-900 mb-2 text-center border-b-2 border-sky-400 pb-2">
              ~ Accompaniments ~
            </h2>
            <div className="space-y-3 text-center">
              <p className="text-lg text-gray-700">Signature Mashed Potatoes</p>
              <p className="text-lg text-gray-700">Glazed Baby Carrots</p>
              <p className="text-lg text-gray-700">Caribbean Blend Veggies</p>
              <p className="text-lg text-gray-700">Family Style Salad with House Dressing</p>
              <p className="text-lg text-gray-700">Rolls & Butter</p>
            </div>
          </section>

          {/* Desserts */}
          <section className="mb-10">
            <h2 className="text-3xl font-serif text-sky-900 mb-2 text-center border-b-2 border-sky-400 pb-2">
              ~ Desserts ~
            </h2>
            <div className="space-y-3 text-center">
              <p className="text-lg text-gray-700">Wedding Cake</p>
              <p className="text-lg text-gray-700">Cupcakes & Cookies</p>
            </div>
          </section>

          {/* Beverages */}
          <section className="mb-6">
            <h2 className="text-3xl font-serif text-sky-900 mb-2 text-center border-b-2 border-sky-400 pb-2">
              ~ Beverages ~
            </h2>
            <div className="space-y-3 text-center mb-6">
              <p className="text-lg text-gray-700">Iced Tea</p>
              <p className="text-lg text-gray-700">Lemonade</p>
              <p className="text-lg text-gray-700">Coffee & Decaf</p>
              <p className="text-lg text-gray-700">Ice Water at Every Table</p>
            </div>
            <div className="text-center space-y-3">
              <div className="bg-sky-50 p-4 rounded-lg border-l-4 border-sky-500 hover:shadow-lg transition-shadow duration-200">
                <h3 className="text-xl font-semibold text-sky-900 mb-2">🍸 Open Bar</h3>
                <p className="text-gray-700">
                  Complimentary beer, wine, and cocktails
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Guests 21+ will be ID'd
                </p>
              </div>
              <div className="bg-sky-50 p-4 rounded-lg border-l-4 border-sky-500 hover:shadow-lg transition-shadow duration-200">
                <p className="text-gray-700">
                  <strong className="text-sky-900">BYOB Welcome!</strong>
                  <br />
                  Feel free to bring your own liquor, beer, or wine.
                  <br />
                  <span className="text-sm italic">Must be kept behind the bar</span>
                </p>
              </div>
            </div>
          </section>

          {/* Footer flourish */}
          <div className="text-center mt-12 pt-6 border-t border-sky-300">
            <p className="text-2xl text-sky-900 font-serif italic">
              ~ Bon Appétit ~
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
