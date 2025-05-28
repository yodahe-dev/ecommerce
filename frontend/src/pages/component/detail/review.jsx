import React, { useEffect, useState } from "react";

const API = "http://localhost:5000/api";
const BASE_URL = "http://localhost:5173";

const RatingStars = ({ rating }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  
  return (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, i) => (
        <svg
          key={i}
          className={`w-5 h-5 ${i < fullStars || (i === fullStars && hasHalfStar) ? 
            'text-orange-400' : 'text-gray-300 dark:text-gray-600'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          {i < fullStars ? (
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          ) : hasHalfStar && i === fullStars ? (
            <path d="M10 1a1 1 0 011 1v1a1 1 0 11-2 0V2a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" />
          ) : (
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          )}
        </svg>
      ))}
    </div>
  );
};

export default function ReviewsTab({ productId }) {
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchReviews() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`${API}/rating/${productId}`);
        if (!res.ok) throw new Error("Failed to fetch reviews");
        const data = await res.json();

        setReviews(data.reviews || []);
        setAverageRating(data.averageRating || 0);
        setTotalRatings(data.totalRatings || 0);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (productId) fetchReviews();
  }, [productId]);

  if (loading)
    return (
      <div className="flex items-center justify-center h-32 gap-3">
        <div className="animate-spin w-8 h-8 border-4 border-orange-400 rounded-full border-t-transparent"></div>
        <span className="text-lg text-orange-400">Loading Reviews...</span>
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center p-6 bg-red-100/80 dark:bg-red-900/20 rounded-lg mx-4 mt-4 gap-3">
        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <div className="text-red-600 dark:text-red-400">Error: {error}</div>
      </div>
    );

  if (reviews.length === 0)
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <svg className="w-20 h-20 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-xl text-gray-500 dark:text-gray-400">No reviews yet. Be the first to share your experience!</p>
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto max-h-96 overflow-auto px-4 lg:px-6 py-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8 p-4 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-gray-800 dark:to-gray-800 rounded-xl shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Customer Reviews</h2>
          <p className="text-gray-600 dark:text-gray-300 mt-1">{totalRatings} verified ratings</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-4xl font-bold text-orange-600 dark:text-orange-400">
            {averageRating.toFixed(1)}
          </div>
          <div className="flex flex-col gap-1">
            <RatingStars rating={averageRating} />
            <span className="text-sm text-gray-500 dark:text-gray-400">Average Rating</span>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {reviews.map((review, idx) => (
          <div
            key={idx}
            className="group relative p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 dark:border-gray-700"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-gray-700 flex items-center justify-center">
                    <span className="text-orange-500 dark:text-orange-400 font-medium">
                      {review.user?.name?.[0]?.toUpperCase() || 'U'}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {review.user?.name || 'Anonymous User'}
                  </div>
                  <RatingStars rating={review.rating} />
                </div>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {review.createdAt ? new Date(review.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                }) : ''}
              </span>
            </div>

            <p className="whitespace-pre-line text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
              {review.feedback || "No feedback provided."}
            </p>

            {review.imageUrl && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
                <img
                  src={`${BASE_URL}${review.imageUrl}`}
                  alt="Review"
                  className="cursor-zoom-in rounded-lg border border-gray-200 dark:border-gray-700 transition-transform duration-200 hover:scale-[1.02]"
                  onClick={() => window.open(`${BASE_URL}${review.imageUrl}`, '_blank')}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}