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
          {/* Amazon Registry */}
          <a
            href="https://www.amazon.com/wedding/guest-view/B6T2KDY3A0GM"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white rounded-xl shadow-lg border-2 border-sky-300 p-8 hover:shadow-2xl hover:-translate-y-1 transition-all duration-200 block cursor-pointer"
          >
            <div className="text-center">
              <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-5xl font-bold text-amber-600">a</span>
              </div>
              <h2 className="text-2xl font-serif text-sky-900 mb-3">
                Amazon Registry
              </h2>
              <p className="text-gray-600 mb-6">
                Browse our Amazon wedding registry for gift ideas and our gift card fund.
              </p>
              <span className="inline-block px-6 py-3 bg-amber-500 text-white rounded-lg font-semibold hover:bg-amber-600 transition-colors">
                Shop on Amazon
              </span>
            </div>
          </a>

          {/* Walmart Registry */}
          <a
            href="https://www.walmart.com/registry/WR/0afce135-2924-4b49-98a2-63d12cbb21c6"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white rounded-xl shadow-lg border-2 border-sky-300 p-8 hover:shadow-2xl hover:-translate-y-1 transition-all duration-200 block cursor-pointer"
          >
            <div className="text-center">
              <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl font-bold text-blue-600">W</span>
              </div>
              <h2 className="text-2xl font-serif text-sky-900 mb-3">
                Walmart Registry
              </h2>
              <p className="text-gray-600 mb-6">
                View our Walmart wedding registry for home essentials and more.
              </p>
              <span className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                Shop on Walmart
              </span>
            </div>
          </a>
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
