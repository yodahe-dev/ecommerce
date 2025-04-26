import { useEffect, useState } from 'react';
import { getProfile } from '../api';

function Profile({ token }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (token) {
      setLoading(true);
      getProfile(token)
        .then((res) => {
          if (res.error) {
            setError(res.error);
          } else {
            setUser(res);
          }
          setLoading(false);
        })
        .catch((err) => {
          setError('An error occurred while fetching the profile.');
          setLoading(false);
        });
    }
  }, [token]);

  if (!token) return <div className="text-center p-6 text-lg text-gray-600">Please log in to view your profile.</div>;
  if (loading) return <div className="text-center p-6 text-lg text-gray-600">Loading...</div>;
  if (error) return <div className="text-center p-6 text-lg text-red-600">{error}</div>;

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-indigo-600 to-blue-500 p-6">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-lg w-full">
        <div className="flex justify-center mb-6">
          {/* Add user profile picture if available */}
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-indigo-500">
            <img
              src={user.profilePicture || 'https://via.placeholder.com/150'}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <h2 className="text-3xl font-semibold text-center text-gray-800 mb-6">Profile</h2>

        <div className="space-y-4">
          <p className="text-lg font-medium text-gray-700">
            <strong>ID:</strong> {user.id}
          </p>
          <p className="text-lg font-medium text-gray-700">
            <strong>Username:</strong> {user.username}
          </p>
          <p className="text-lg font-medium text-gray-700">
            <strong>Email:</strong> {user.email}
          </p>
        </div>
      </div>
    </div>
  );
}

export default Profile;
