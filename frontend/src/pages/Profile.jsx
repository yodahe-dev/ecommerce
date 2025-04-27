import { useEffect, useState } from 'react';
import { getProfile } from '../api';
import { useNavigate } from 'react-router-dom';
import { FaUserCircle } from 'react-icons/fa'; // user icon

function Profile({ token }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // add this

  useEffect(() => {
    if (token) {
      setLoading(true);
      getProfile(token)
        .then((res) => {
          if (res.error) {
            if (res.error === 'Invalid token') {
              localStorage.removeItem('token'); // remove bad token
              navigate('/login'); // redirect to login
            } else {
              setError(res.error); // other errors
            }
          } else {
            setUser(res);
          }
          setLoading(false);
        })
        .catch(() => {
          setError('An error occurred while fetching the profile.');
          setLoading(false);
        });
    } else {
      navigate('/login'); // no token, force login
    }
  }, [token, navigate]);

  if (loading) {
    return (
      <div className="text-center p-6 text-lg text-gray-600">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-6 text-lg text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-indigo-600 to-blue-500 p-6">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-lg w-full">
        <div className="flex justify-center mb-6">
          <FaUserCircle size={96} className="text-indigo-500" />
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
          <p className="text-lg font-medium text-gray-700">
            <strong>Verified:</strong> {user.isVerified ? 'Yes' : 'No'}
          </p>
          <p className="text-lg font-medium text-gray-700">
            <strong>Role:</strong> {user.role?.name || 'N/A'}
          </p>
        </div>
      </div>
    </div>
  );
}

export default Profile;
