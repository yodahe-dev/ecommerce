import React from 'react';

export default function About() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 px-6 py-12">
      <div className="max-w-4xl mx-auto space-y-10">
        <h1 className="text-4xl font-bold text-orange-600">About AfroHive</h1>

        <p className="text-lg">
          AfroHive is a modern e-commerce platform made for people who want a smooth shopping experience. We connect buyers and sellers across Africa and beyond.
        </p>

        <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-xl shadow">
          <h2 className="text-2xl font-semibold mb-3">Why AfroHive?</h2>
          <ul className="list-disc list-inside space-y-2 text-base">
            <li>Fast product search with real-time results</li>
            <li>Simple and clean interface</li>
            <li>Safe checkout and user-friendly design</li>
            <li>Track your orders and manage your likes or cart easily</li>
            <li>Mobile-friendly for easy access anytime</li>
          </ul>
        </div>

        <div className="bg-orange-100 dark:bg-orange-900 p-6 rounded-xl shadow">
          <h2 className="text-2xl font-semibold mb-3 text-orange-700 dark:text-orange-200">Buyer Protection</h2>
          <p className="text-base">
            Didn't get your product? No worries. We refund 100% of your money if your item doesn't arrive.
          </p>
        </div>

        <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-xl shadow">
          <h2 className="text-2xl font-semibold mb-3">Become a Seller</h2>
          <p className="text-base">
            Want to sell on AfroHive? Go to our <a href="/contact" className="text-orange-500 underline">Contact Us</a> page and apply. We’ll review your request and approve your seller role.
          </p>
        </div>

        <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-xl shadow">
          <h2 className="text-2xl font-semibold mb-3">More Features</h2>
          <ul className="list-disc list-inside space-y-2 text-base">
            <li>Daily deals and product discounts</li>
            <li>Product likes to see what’s trending</li>
            <li>Price history and comparison tools</li>
            <li>Secure login with email and password</li>
            <li>Dark mode for better browsing at night</li>
          </ul>
        </div>

        <div className="bg-orange-50 dark:bg-orange-950 p-6 rounded-xl shadow">
          <h2 className="text-2xl font-semibold mb-3 text-orange-600">Need Help?</h2>
          <p className="text-base">
            Have questions or need help? Contact our support team anytime at <a href="mailto:support@afrohive.com" className="text-orange-500 underline">support@afrohive.com</a>
          </p>
        </div>
      </div>
    </div>
  );
}
