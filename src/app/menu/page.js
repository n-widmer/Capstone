export default function MenuPage() {
  return (
    <main className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Menu Header */}
        <div className="text-center mb-12 relative">
          <div className="absolute inset-0 flex items-center justify-center opacity-5">
            <div className="text-9xl">🌿</div>
          </div>
          <h1 className="text-6xl font-serif text-sky-900 mb-4 relative">
            Wedding Menu
          </h1>
          <div className="w-32 h-1 bg-sky-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600 italic font-serif">
            Tori & Connor
          </p>
          <p className="text-lg text-gray-500">May 22, 2027</p>
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
            <h2 className="text-3xl font-serif text-sky-900 mb-6 text-center border-b-2 border-sky-400 pb-2">
              ~ Appetizers ~
            </h2>
            <p className="text-center text-gray-600 italic mb-4">
              Catering details coming soon
            </p>
          </section>

          {/* Main Course */}
          <section className="mb-10">
            <h2 className="text-3xl font-serif text-sky-900 mb-6 text-center border-b-2 border-sky-400 pb-2">
              ~ Entrées ~
            </h2>
            <p className="text-center text-gray-600 italic mb-4">
              Delicious main courses to be announced
            </p>
          </section>

          {/* Sides */}
          <section className="mb-10">
            <h2 className="text-3xl font-serif text-sky-900 mb-6 text-center border-b-2 border-sky-400 pb-2">
              ~ Accompaniments ~
            </h2>
            <p className="text-center text-gray-600 italic mb-4">
              Fresh seasonal sides
            </p>
          </section>

          {/* Desserts */}
          <section className="mb-10">
            <h2 className="text-3xl font-serif text-sky-900 mb-6 text-center border-b-2 border-sky-400 pb-2">
              ~ Desserts ~
            </h2>
            <p className="text-center text-gray-600 italic mb-4">
              Sweet treats and wedding cake
            </p>
          </section>

          {/* Beverages */}
          <section className="mb-6">
            <h2 className="text-3xl font-serif text-sky-900 mb-6 text-center border-b-2 border-sky-400 pb-2">
              ~ Beverages ~
            </h2>
            <div className="text-center space-y-3">
              <div className="bg-sky-50 p-4 rounded-lg border-l-4 border-sky-500">
                <h3 className="text-xl font-semibold text-sky-900 mb-2">🍸 Open Bar</h3>
                <p className="text-gray-700">
                  Complimentary beer, wine, and cocktails
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Guests 21+ will be ID'd
                </p>
              </div>
              <div className="bg-sky-50 p-4 rounded-lg border-l-4 border-sky-500">
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
            <div className="flex justify-center items-center space-x-4 mt-4">
              <div className="w-12 h-0.5 bg-sky-500"></div>
              <span className="text-3xl">🌿</span>
              <div className="w-12 h-0.5 bg-sky-500"></div>
            </div>
          </div>
        </div>

        {/* Additional note */}
        <div className="mt-8 text-center text-gray-600 italic">
          <p>Menu selections will be updated as we finalize catering details</p>
        </div>
      </div>
    </main>
  );
}
