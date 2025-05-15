import React from "react";
import Hero from "../../components/Hero";
import Card from "../../components/Card";
import CategorySection from "../../components/CategorySection";
import "../../home.css";

export default function Home() {
  return (
    <div className="w-full h-screen flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto custom-scroll">
        {/* Hero */}
        <section>
          <Hero />
        </section>

     

        {/* Products */}
        <section className="p-6 bg-white dark:bg-slate-900">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
            Featured Products
          </h2>
          <Card />
        </section>

        {/* Footer */}
        <footer className="text-center p-4 text-sm text-gray-500 dark:text-gray-400">
          © {new Date().getFullYear()} Pickup. All rights reserved.
        </footer>
      </div>
    </div>
  );
}
