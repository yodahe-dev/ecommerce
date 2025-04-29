import { useState } from 'react';
import { login, resendOtp, verifyOtp } from '../api';
import { useNavigate, Link } from 'react-router-dom';

function Login({ onLogin }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [msg, setMsg] = useState('');
  const [isVerifyNeeded, setIsVerifyNeeded] = useState(false);
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const navigate = useNavigate();

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
      navigate('/account');
    } else if (res.error === 'Please verify your email first. A new verification code has been sent.') {
      setIsVerifyNeeded(true);
      setMsg('Please verify your email. A new code has been sent.');
      startResendTimer();
    } else {
      setMsg(res.error || 'Login failed');
    }
  };

  const handleVerification = async () => {
    if (otp.length !== 6) return;

    const res = await verifyOtp({ email: form.email, otp });

    if (res.message) {
      setMsg('Verification successful.');
      setIsVerifyNeeded(false);
      navigate('/');
    } else {
      setMsg(res.error || 'Invalid OTP');
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return; // Block if cooldown is active

    const res = await resendOtp({ email: form.email });

    if (res.message) {
      setMsg('New OTP sent.');
      startResendTimer();
    } else {
      setMsg(res.error || 'Failed to resend OTP');
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

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-indigo-600 to-blue-500 p-6">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-sm w-full">
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">Login</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="email"
            placeholder="Email"
            type="email"
            className="w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            onChange={handleChange}
          />
          <input
            name="password"
            placeholder="Password"
            type="password"
            className="w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            onChange={handleChange}
          />
          <button
            type="submit"
            className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-lg transition-all duration-200 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            Login
          </button>
          {msg && (
            <p className="text-sm text-center mt-2 text-red-500">
              {msg}
            </p>
          )}
        </form>

        {isVerifyNeeded && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-8 rounded-lg shadow-lg w-[400px]">
              <h3 className="text-xl font-semibold mb-4">Verify OTP</h3>
              <div className="flex justify-center mb-4">
                <input
                  type="text"
                  maxLength="6"
                  value={otp}
                  onChange={handleOtpChange}
                  className="w-50 h-12 text-center text-2xl border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter OTP"
                />
              </div>
              <button
                onClick={handleVerification}
                disabled={!isVerifying}
                className={`w-full py-3 font-semibold rounded-lg transition-all duration-200 focus:outline-none mt-4
                  ${isVerifying ? 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-400' : 'bg-gray-400 text-white cursor-not-allowed'}
                `}
              >
                Verify OTP
              </button>
              <div className="text-center mt-4">
                {resendTimer > 0 ? (
                  <p className="text-sm text-gray-500">
                    Resend OTP in {resendTimer}s
                  </p>
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
          <p className="text-sm text-gray-600">
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
