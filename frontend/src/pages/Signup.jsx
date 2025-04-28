import { useState } from 'react';
import { signup } from '../api';
import { Navigate } from 'react-router-dom';

function Signup() {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [msg, setMsg] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [otp, setOtp] = useState(Array(6).fill(''));
  const [redirect, setRedirect] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleOtpChange = (e, index) => {
    const value = e.target.value;
    if (/[^0-9]/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (index < 5 && value) {
      document.getElementById(`otp-input-${index + 1}`).focus();
    }

    if (newOtp.every((digit) => digit !== '')) {
      handleVerification();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await signup(form);
    setMsg(res.error || 'Signup successful');
    if (res.error) return;
    setIsVerified(true);
  };

  const handleVerification = async () => {
    const otpString = otp.join('');
    try {
      const res = await fetch('http://localhost:5000/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, otp: otpString }),
      });

      const data = await res.json();
      if (res.ok) {
        setMsg('Verification successful');
        setRedirect(true);
      } else {
        setMsg('Invalid OTP');
      }
    } catch (error) {
      setMsg('Error verifying OTP');
    }
  };

  if (redirect) {
    return <Navigate to="/" />;
  }

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

        {isVerified && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-8 rounded-lg shadow-lg w-[400px]">
              <h3 className="text-xl font-semibold mb-4">Verify OTP</h3>
              <div className="flex justify-between">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-input-${index}`}
                    type="text"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleOtpChange(e, index)}
                    className="w-12 h-12 text-center text-2xl border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                ))}
              </div>
              <button
                onClick={handleVerification}
                className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-lg transition-all duration-200 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 mt-4"
              >
                Verify OTP
              </button>
            </div>
          </div>
        )}

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
