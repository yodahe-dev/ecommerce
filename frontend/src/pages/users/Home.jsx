import React from "react";
import Hero from "../../components/Hero";
import Card from "../../components/Card";

export default function Home() {
  return (

      <div className="">
        {/* Hero */}
        <section>
          <Hero />
        </section>

     

        {/* Products */}
        <section className="p-6 bg-white dark:bg-slate-900 flex flex-col ">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white text-center">
            Featured Products
          </h2>
          <Card />
        </section>

        {/* Footer */}
        <footer className="text-center p-4 text-sm text-gray-500 dark:text-gray-400">
          © {new Date().getFullYear()} Pickup. All rights reserved.
        </footer>

        <div className="h-52">

        </div>
      </div>
  );
}
