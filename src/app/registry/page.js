export default function RegistryPage() {
  return (
    <main className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-serif text-sky-900 mb-4">
            Our Registry
          </h1>
          <div className="w-32 h-1 bg-sky-600 mx-auto mb-6"></div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your presence at our wedding is the greatest gift of all. However, if you wish to honor us with a gift, we've registered at the following stores.
          </p>
        </div>

        {/* Registry Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Placeholder Registry 1 */}
          <div className="bg-white rounded-xl shadow-lg border-2 border-sky-300 p-8 hover:shadow-2xl hover:-translate-y-1 transition-all duration-200">
            <div className="text-center">
              <div className="w-24 h-24 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">🎁</span>
              </div>
              <h2 className="text-2xl font-serif text-sky-900 mb-3">
                Registry Coming Soon
              </h2>
              <p className="text-gray-600 mb-6">
                We're still putting together our registry. Check back soon for details!
              </p>
              <button
                disabled
                className="px-6 py-3 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed"
              >
                Coming Soon
              </button>
            </div>
          </div>

          {/* Placeholder Registry 2 */}
          <div className="bg-white rounded-xl shadow-lg border-2 border-sky-300 p-8 hover:shadow-2xl hover:-translate-y-1 transition-all duration-200">
            <div className="text-center">
              <div className="w-24 h-24 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">💝</span>
              </div>
              <h2 className="text-2xl font-serif text-sky-900 mb-3">
                Additional Registry
              </h2>
              <p className="text-gray-600 mb-6">
                More registry options will be available soon.
              </p>
              <button
                disabled
                className="px-6 py-3 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed"
              >
                Coming Soon
              </button>
            </div>
          </div>
        </div>

        {/* Cash Fund Option */}
        <div className="bg-white rounded-xl shadow-lg border-2 border-sky-400 p-8 mb-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
              <span className="text-4xl">🏠</span>
            </div>
            <h2 className="text-2xl font-serif text-sky-900 mb-3">
              House Fund
            </h2>
            <p className="text-gray-700 max-w-2xl mx-auto mb-4">
              If you'd prefer to contribute to our new home, we'd be incredibly grateful. Details coming soon!
            </p>
          </div>
        </div>

        {/* Thank You Note */}
        <div className="text-center bg-white rounded-lg shadow-md p-8 border-l-4 border-sky-500">
          <p className="text-xl text-gray-700 font-serif italic">
            "Thank you for celebrating this special day with us. Your love and support mean the world!"
          </p>
          <p className="text-lg text-sky-800 mt-4 font-serif">
            ~ Tori & Connor ~
          </p>
        </div>
      </div>
    </main>
  );
}
