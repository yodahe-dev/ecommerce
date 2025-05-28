import React from 'react';

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 text-gray-800 dark:text-gray-100">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-orange-500 to-amber-500 dark:from-orange-700 dark:to-amber-700 py-20 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 z-10">
            <h1 className="text-5xl md:text-6xl font-bold text-white">
              About <span className="text-gray-900">AfroHive</span>
            </h1>
            <p className="text-xl text-white/90 max-w-xl">
              Africa's premier e-commerce platform connecting buyers and sellers across the continent and beyond. We're redefining online shopping with African excellence.
            </p>
            <div className="flex flex-wrap gap-4 mt-8">
              <a 
                href="/contact" 
                className="px-8 py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-black transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Become a Seller
              </a>
              <a 
                href="/contact" 
                className="px-8 py-3 bg-white text-orange-600 font-semibold rounded-lg hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Contact Support
              </a>
            </div>
          </div>
          <div className="relative flex justify-center">
            <div className="relative w-full max-w-md">
              <div className="absolute -top-6 -right-6 w-full h-full bg-orange-200 dark:bg-orange-900 rounded-2xl"></div>
              <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border-4 border-white">
                <div className="aspect-video bg-gradient-to-r from-orange-400 to-amber-400 flex items-center justify-center">
                  <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">AfroHive Marketplace</h3>
                  <p className="mt-2 text-gray-600 dark:text-gray-300">Connecting African entrepreneurs with global opportunities</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center p-6 bg-orange-50 dark:bg-gray-800 rounded-xl shadow-sm">
              <div className="text-4xl font-bold text-orange-600">50K+</div>
              <div className="mt-2 text-gray-600 dark:text-gray-300">Active Sellers</div>
            </div>
            <div className="text-center p-6 bg-orange-50 dark:bg-gray-800 rounded-xl shadow-sm">
              <div className="text-4xl font-bold text-orange-600">2M+</div>
              <div className="mt-2 text-gray-600 dark:text-gray-300">Happy Customers</div>
            </div>
            <div className="text-center p-6 bg-orange-50 dark:bg-gray-800 rounded-xl shadow-sm">
              <div className="text-4xl font-bold text-orange-600">99.7%</div>
              <div className="mt-2 text-gray-600 dark:text-gray-300">Successful Deliveries</div>
            </div>
            <div className="text-center p-6 bg-orange-50 dark:bg-gray-800 rounded-xl shadow-sm">
              <div className="text-4xl font-bold text-orange-600">24/7</div>
              <div className="mt-2 text-gray-600 dark:text-gray-300">Customer Support</div>
            </div>
          </div>
        </div>
      </div>

      {/* Why AfroHive Section */}
      <div className="py-20 bg-gray-50 dark:bg-gray-950 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Why Choose AfroHive?</h2>
            <div className="w-24 h-1 bg-orange-500 mx-auto"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                ),
                title: "Lightning Fast Search",
                desc: "Find products in milliseconds with our AI-powered search engine."
              },
              {
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                ),
                title: "Buyer Protection",
                desc: "100% money-back guarantee if your item doesn't arrive as described."
              },
              {
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                ),
                title: "Secure Transactions",
                desc: "Bank-level encryption keeps your payments and data safe."
              },
              {
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                title: "Pan-African Reach",
                desc: "Sell to customers across 54 African countries and beyond."
              },
              {
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                  </svg>
                ),
                title: "24/7 Support",
                desc: "Real human support in your language, anytime you need help."
              },
              {
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                ),
                title: "Data Insights",
                desc: "Advanced analytics to help you grow your business strategically."
              }
            ].map((feature, index) => (
              <div 
                key={index}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow duration-300 border-l-4 border-orange-500"
              >
                <div className="flex items-start space-x-4">
                  <div className="mt-1">{feature.icon}</div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300">{feature.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Seller Section */}
      <div className="py-20 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="relative">
            <div className="relative w-full h-96 rounded-3xl overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-amber-400 flex items-center justify-center">
                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
              </div>
            </div>
            <div className="absolute -bottom-6 -right-6 bg-orange-500 text-white px-6 py-3 rounded-lg shadow-lg">
              <span className="font-bold">Join 50,000+</span> African Sellers
            </div>
          </div>
          <div className="space-y-6">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white">Become an AfroHive Seller</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Tap into Africa's fastest growing e-commerce platform. Whether you're a small artisan or a large manufacturer, we provide the tools to grow your business exponentially.
            </p>
            <ul className="space-y-3">
              <li className="flex items-center">
                <svg className="w-6 h-6 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span>Zero setup fees - start selling immediately</span>
              </li>
              <li className="flex items-center">
                <svg className="w-6 h-6 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span>Access to millions of potential customers</span>
              </li>
              <li className="flex items-center">
                <svg className="w-6 h-6 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span>Simple dashboard to manage orders and inventory</span>
              </li>
              <li className="flex items-center">
                <svg className="w-6 h-6 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span>Logistics support across Africa</span>
              </li>
            </ul>
            <a 
              href="/contact" 
              className="inline-block mt-6 px-8 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Start Selling Today
            </a>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-20 bg-gray-50 dark:bg-gray-950 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">What Our Community Says</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Hear from entrepreneurs and shoppers who are transforming their lives with AfroHive
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: "AfroHive helped me take my handmade crafts from a small village market to customers in 12 different countries. My income has grown 500% in just 18 months.",
                author: "Amina Diallo",
                role: "Artisan, Senegal"
              },
              {
                quote: "As a buyer, I love how easy it is to find authentic African products. The buyer protection gives me confidence to shop from new sellers.",
                author: "David Okonkwo",
                role: "Customer, Nigeria"
              },
              {
                quote: "The seller tools are incredibly powerful yet simple to use. I've been able to manage my growing business without hiring extra staff.",
                author: "Fatima Nkosi",
                role: "Fashion Designer, South Africa"
              }
            ].map((testimonial, index) => (
              <div 
                key={index}
                className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg"
              >
                <div className="text-orange-400 mb-4">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                </div>
                <p className="text-gray-700 dark:text-gray-300 italic mb-6">"{testimonial.quote}"</p>
                <div className="flex items-center">
                  <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
                  <div className="ml-4">
                    <div className="font-bold text-gray-900 dark:text-white">{testimonial.author}</div>
                    <div className="text-gray-600 dark:text-gray-400">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 px-6 bg-gradient-to-r from-orange-500 to-amber-500 dark:from-orange-700 dark:to-amber-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Join Africa's Fastest Growing Marketplace</h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            Whether you're looking to shop unique products or start your entrepreneurial journey, AfroHive is your gateway to African commerce.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a 
              href="/signup" 
              className="px-8 py-3 bg-white text-orange-600 font-semibold rounded-lg hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Create Free Account
            </a>
            <a 
              href="/contact" 
              className="px-8 py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-black transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Contact Our Team
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}