import { useState } from 'react';
import { signup } from '../api';

function Signup() {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [msg, setMsg] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await signup(form);
    setMsg(res.error || 'Signup successful');
    <Navigate to="/profile" />
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-indigo-600 to-blue-500 p-6">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-sm w-full">
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">Sign Up</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              name="username"
              placeholder="Username"
              type="text"
              className="w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              onChange={handleChange}
            />
          </div>
          <div>
            <input
              name="email"
              placeholder="Email"
              type="email"
              className="w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              onChange={handleChange}
            />
          </div>
          <div>
            <input
              name="password"
              placeholder="Password"
              type="password"
              className="w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              onChange={handleChange}
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-lg transition-all duration-200 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            Sign Up
          </button>
          {msg && (
            <p className={`text-sm text-center mt-2 ${msg === 'Signup successful' ? 'text-green-500' : 'text-red-500'}`}>
              {msg}
            </p>
          )}
        </form>
        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <a href="/login" className="text-indigo-600 hover:text-indigo-700 font-semibold">
              Login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;
