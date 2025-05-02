import { useState, useEffect } from 'react';
import { login, resendOtp, verifyOtp } from '../api';
import { Navigate, Link } from 'react-router-dom';
import { FaRegEye, FaEyeSlash } from 'react-icons/fa';

function Login({ onLogin }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [msg, setMsg] = useState('');
  const [isVerifyNeeded, setIsVerifyNeeded] = useState(false);
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [redirect, setRedirect] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleOtpChange = (e) => {
    const value = e.target.value;
    if (/[^0-9]/.test(value)) return;

    if (value.length <= 6) {
      setOtp(value);
      setIsVerifying(value.length === 6);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await login(form);

    if (res.token) {
      onLogin(res.token);
      setRedirect(true);
    } else if (res.error?.includes('verify')) {
      setIsVerifyNeeded(true);
      setMsg('Check your email for OTP.');
      startResendTimer();
    } else {
      setMsg(res.error || 'Login failed.');
    }
  };

  const handleVerification = async () => {
    if (otp.length !== 6) return;

    const res = await verifyOtp({ email: form.email, otp });

    if (res.message) {
      setMsg('Verification successful.');
      setIsVerifyNeeded(false);
      setRedirect(true);
    } else {
      setMsg(res.error || 'Invalid OTP');
    }
  };

  const handleResendOtp = async () => {
    const res = await resendOtp({ email: form.email });

    if (res.message) {
      setMsg('OTP resent.');
      startResendTimer();
    } else {
      setMsg(res.error || 'Failed to resend OTP.');
    }
  };

  const startResendTimer = () => {
    setResendTimer(60);
    const timer = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible((prev) => !prev);
  };

  if (redirect) {
    return <Navigate to="/account" />;
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 max-w-sm w-full">
        <h2 className="text-2xl font-semibold text-center text-gray-800 dark:text-white mb-6">Login</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="email"
            placeholder="Email"
            type="email"
            className="w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            onChange={handleChange}
            required
          />
          <div className="relative">
            <input
              name="password"
              placeholder="Password"
              type={passwordVisible ? 'text' : 'password'}
              className="w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
              onChange={handleChange}
              required
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
            >
              {passwordVisible ? <FaEyeSlash /> : <FaRegEye />}
            </button>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            Login
          </button>
          {msg && <p className="text-sm text-center mt-2 text-red-500">{msg}</p>}
        </form>

        {isVerifyNeeded && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-8 rounded-lg shadow-lg w-[400px]">
              <h3 className="text-xl font-semibold mb-4">Verify OTP</h3>
              <input
                type="text"
                maxLength="6"
                value={otp}
                onChange={handleOtpChange}
                className="w-full h-12 text-center text-2xl border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4 dark:bg-gray-700 dark:text-white"
                placeholder="Enter OTP"
              />
              <button
                onClick={handleVerification}
                disabled={!isVerifying}
                className={`w-full py-3 font-semibold rounded-lg ${
                  isVerifying
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-400'
                    : 'bg-gray-400 text-white cursor-not-allowed'
                }`}
              >
                Verify OTP
              </button>
              <div className="text-center mt-4">
                {resendTimer > 0 ? (
                  <p className="text-sm text-gray-500">Resend OTP in {resendTimer}s</p>
                ) : (
                  <button
                    onClick={handleResendOtp}
                    className="text-indigo-600 hover:text-indigo-700 font-semibold text-sm"
                  >
                    Resend OTP
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="text-center mt-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <Link to="/signup" className="text-indigo-600 hover:text-indigo-700 font-semibold">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
