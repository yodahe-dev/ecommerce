import React from 'react'

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-20 space-y-6 animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
            Pickup Marketplace
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 font-medium">
            Ethiopia's Trusted E-Commerce Ecosystem
          </p>
        </div>

        {/* Trust Badges */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-shadow">
            <div className="text-orange-600 dark:text-orange-400 text-4xl mb-4">🛡️</div>
            <h3 className="text-2xl font-bold mb-4">100% Money Back Guarantee</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Full refund protection if items don't arrive. Your satisfaction is our priority.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-shadow">
            <div className="text-orange-600 dark:text-orange-400 text-4xl mb-4">🤝</div>
            <h3 className="text-2xl font-bold mb-4">Verified Sellers</h3>
            <p className="text-gray-600 dark:text-gray-400">
              All sellers undergo strict verification for your peace of mind.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-shadow">
            <div className="text-orange-600 dark:text-orange-400 text-4xl mb-4">🚚</div>
            <h3 className="text-2xl font-bold mb-4">Nationwide Delivery</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Reliable logistics network covering every corner of Ethiopia
            </p>
          </div>
        </div>

        {/* Seller CTA */}
        <div className="bg-orange-600 dark:bg-orange-700 rounded-3xl p-12 text-center mb-20 transform hover:scale-[1.01] transition-transform">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Become a Verified Seller
          </h2>
          <p className="text-orange-100 mb-8 text-lg">
            Join Ethiopia's fastest growing marketplace
          </p>
          <div className="space-y-4 text-orange-50">
            <a href="tel:0905582005" className="block text-xl hover:text-white transition-colors">
              ☎️ 0905 582 005
            </a>
            <a href="tel:0985543325" className="block text-xl hover:text-white transition-colors">
              📱 0985 543 325
            </a>
            <a href="mailto:yodahejob@gmail.com" className="block text-xl hover:text-white transition-colors">
              ✉️ yodahejob@gmail.com
            </a>
          </div>
        </div>

        {/* Social Proof */}
        <div className="text-center space-y-8">
          <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
            Join Our Community
          </h3>
          <div className="flex justify-center space-x-6">
            <a href="#" className="p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <span className="text-gray-700 dark:text-gray-300 hover:text-orange-600">📘 yodahe.dev</span>
            </a>
            <a href="#" className="p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <span className="text-gray-700 dark:text-gray-300 hover:text-orange-600">📸 yodahe.dev</span>
            </a>
            <a href="#" className="p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <span className="text-gray-700 dark:text-gray-300 hover:text-orange-600">🐦 yodahe.dev</span>
            </a>
          </div>
        </div>

        {/* Micro-interaction Watermark */}
        <div className="mt-20 text-center opacity-50 hover:opacity-100 transition-opacity">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            🔒 Trusted by 1M+ Ethiopians
          </span>
        </div>
      </div>
    </div>
  )
}