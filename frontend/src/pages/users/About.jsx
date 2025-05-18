import { useEffect } from 'react';

export default function About() {
  // Optional: Smooth scroll on mount (good UX)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <>
      <style>{`
        /* Custom scrollbar for this page */
        ::-webkit-scrollbar {
          width: 12px;
        }
        ::-webkit-scrollbar-track {
          background: #f0f0f0;
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb {
          background: #f97316; /* orange */
          border-radius: 10px;
          border: 3px solid #f0f0f0;
          transition: background-color 0.3s ease;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #ea580c;
        }

        /* For Firefox */
        scrollbar-width: thin;
        scrollbar-color: #f97316 #f0f0f0;
      `}</style>

      <div className="max-w-full mx-auto p-8 bg-white dark:bg-gray-900 rounded-lg shadow-2xl my-12 overflow-y-auto max-h-[80vh] scroll-smooth">
        <h1 className="text-5xl font-extrabold mb-10 text-center bg-gradient-to-r from-orange-500 to-orange-700 bg-clip-text text-transparent">
          Ethiopia's Trusted E-Commerce
        </h1>

        <section className="mb-12 opacity-0 animate-fadeIn delay-100">
          <p className="text-xl text-gray-900 dark:text-gray-100 leading-relaxed tracking-wide">
            Welcome to your reliable online marketplace. We connect buyers and sellers across Ethiopia with a focus on <span className="font-semibold text-orange-600">trust</span>, <span className="font-semibold text-orange-600">quality</span>, and <span className="font-semibold text-orange-600">service</span>.
          </p>
        </section>

        <section className="mb-12 p-8 rounded-xl border-4 border-orange-400 dark:border-orange-600 bg-orange-50 dark:bg-orange-900 shadow-lg opacity-0 animate-fadeIn delay-200">
          <h2 className="text-3xl font-bold mb-6 text-orange-700 dark:text-orange-300 tracking-wide">
            Our Guarantee
          </h2>
          <p className="text-gray-800 dark:text-orange-200 leading-relaxed text-lg">
            We stand behind every purchase you make. If your product does not arrive within a few weeks, you will get <span className="font-bold underline decoration-orange-600">100% of your money back</span> — no questions asked. Our commitment is to your satisfaction and peace of mind.
          </p>
        </section>

        <section className="mb-12 opacity-0 animate-fadeIn delay-300">
          <h2 className="text-3xl font-bold mb-6 text-orange-600 dark:text-orange-400 tracking-wide">
            Become a Verified Seller
          </h2>
          <p className="text-gray-900 dark:text-gray-100 text-lg mb-4 leading-relaxed">
            Interested in selling your products on our platform? To become a verified seller, please contact our team. Verification helps ensure the quality and authenticity of sellers, benefiting all users.
          </p>
          <p className="text-gray-900 dark:text-gray-100 text-lg leading-relaxed">
            Verified sellers get priority listing, seller support, and access to exclusive tools to grow their business.
          </p>
        </section>

        <section className="mb-12 opacity-0 animate-fadeIn delay-400">
          <h2 className="text-3xl font-bold mb-6 text-orange-600 dark:text-orange-400 tracking-wide">
            Contact Us
          </h2>
          <p className="text-gray-900 dark:text-gray-100 text-lg mb-4 leading-relaxed">
            For seller verification, questions, or any other information, feel free to reach out to us:
          </p>
          <ul className="list-disc list-inside text-gray-900 dark:text-gray-100 text-lg space-y-2">
            <li>
              Email:{' '}
              <a
                href="mailto:support@ethiotrust.com"
                className="text-orange-600 dark:text-orange-400 hover:underline transition-colors"
              >
                support@ethiotrust.com
              </a>
            </li>
            <li>
              Phone:{' '}
              <a
                href="tel:+251985543325"
                className="text-orange-600 dark:text-orange-400 hover:underline transition-colors font-semibold"
              >
                +251 98 554 3325
              </a>
            </li>
            <li>Address: 123 Addis Ababa St, Addis Ababa, Ethiopia</li>
          </ul>
        </section>

        <section className="opacity-0 animate-fadeIn delay-500">
          <h2 className="text-3xl font-bold mb-6 text-orange-600 dark:text-orange-400 tracking-wide">
            Why Shop With Us?
          </h2>
          <ul className="list-disc list-inside text-gray-900 dark:text-gray-100 text-lg space-y-3">
            <li>
              <strong>Wide Selection:</strong> Find products from trusted local sellers across Ethiopia.
            </li>
            <li>
              <strong>Secure Payments:</strong> Our platform ensures safe and reliable transactions.
            </li>
            <li>
              <strong>Fast Delivery:</strong> We work with trusted couriers to deliver your order quickly.
            </li>
            <li>
              <strong>Customer Support:</strong> Dedicated support ready to help you with any issue.
            </li>
            <li>
              <strong>Verified Sellers:</strong> Only quality-checked sellers join our marketplace.
            </li>
          </ul>
        </section>

      </div>

      <style jsx>{`
        @keyframes fadeIn {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.8s ease forwards;
          transform: translateY(20px);
        }
        .delay-100 {
          animation-delay: 0.1s;
        }
        .delay-200 {
          animation-delay: 0.2s;
        }
        .delay-300 {
          animation-delay: 0.3s;
        }
        .delay-400 {
          animation-delay: 0.4s;
        }
        .delay-500 {
          animation-delay: 0.5s;
        }
      `}</style>
    </>
  );
}
