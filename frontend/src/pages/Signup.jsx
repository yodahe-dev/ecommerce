import { useState, useEffect, useRef } from 'react';
import { signup, resendOtp, verifyOtp } from '../api';
import { Navigate, Link } from 'react-router-dom';
import { FaRegEye, FaEyeSlash, FaArrowLeft, FaTimes } from 'react-icons/fa';

function Signup() {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [msg, setMsg] = useState('');
  const [isVerifyNeeded, setIsVerifyNeeded] = useState(false);
  const [otp, setOtp] = useState('');
  const [redirect, setRedirect] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const otpInputRef = useRef(null);

  useEffect(() => {
    if (isVerifyNeeded && otpInputRef.current) {
      otpInputRef.current.focus();
    }
  }, [isVerifyNeeded]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (msg) setMsg('');
  };

  const handleOtpChange = (e) => {
    const value = e.target.value;
    if (/[^0-9]/.test(value)) return;
    
    if (value.length <= 6) {
      setOtp(value);
      if (value.length === 6) {
        handleVerification();
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const res = await signup(form);
      
      if (res.error) {
        setMsg(res.error);
      } else {
        setMsg('Signup successful. Please check your email for the verification code.');
        setIsVerifyNeeded(true);
        startResendTimer();
      }
    } catch (error) {
      setMsg('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerification = async () => {
    if (otp.length !== 6) return;
    
    setIsVerifying(true);
    
    try {
      const res = await verifyOtp({ email: form.email, otp });
      
      if (res.message) {
        setMsg('Verification successful. Redirecting to login...');
        setTimeout(() => setRedirect(true), 1500);
      } else {
        setMsg(res.error || 'Invalid verification code. Please try again.');
      }
    } catch (error) {
      setMsg('Verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    
    setIsResending(true);
    
    try {
      const res = await resendOtp({ email: form.email });
      
      if (res.message) {
        setMsg('New verification code sent successfully!');
        startResendTimer();
      } else {
        setMsg(res.error || 'Failed to resend code. Please try again.');
      }
    } catch (error) {
      setMsg('Failed to resend code. Please try again.');
    } finally {
      setIsResending(false);
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

  const closeOtpModal = () => {
    setIsVerifyNeeded(false);
    setOtp('');
  };

  if (redirect) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-6">
            <h2 className="text-2xl font-bold text-white text-center">Create Your Account</h2>
            <p className="text-orange-100 text-center mt-1">Join our community today</p>
          </div>
          
          <div className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  placeholder="Enter your username"
                  type="text"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-orange-600 transition"
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  placeholder="your.email@example.com"
                  type="email"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-orange-600 transition"
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    placeholder="Create a strong password"
                    type={passwordVisible ? "text" : "password"}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-orange-600 transition pr-12"
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-orange-500 focus:outline-none transition-colors"
                  >
                    {passwordVisible ? <FaEyeSlash size={18} /> : <FaRegEye size={18} />}
                  </button>
                </div>
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-300 flex items-center justify-center ${
                  isSubmitting 
                    ? 'bg-orange-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
              
              {msg && (
                <div className={`mt-3 p-3 rounded-lg text-sm ${
                  msg.includes('successful') || msg.includes('sent') 
                    ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200' 
                    : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200'
                }`}>
                  {msg}
                </div>
              )}
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 transition-colors">
                  Sign In
                </Link>
              </p>
            </div>
          </div>
          
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-100 dark:border-gray-600 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              By creating an account, you agree to our <a href="#" className="text-orange-500 hover:underline">Terms</a> and <a href="#" className="text-orange-500 hover:underline">Privacy Policy</a>
            </p>
          </div>
        </div>
      </div>
      
      {/* OTP Verification Modal */}
      {isVerifyNeeded && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all duration-300 scale-95 animate-scaleIn">
            <div className="relative">
              <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-5">
                <h3 className="text-xl font-bold text-white text-center">Verify Your Email</h3>
                <p className="text-orange-100 text-center mt-1">Enter the 6-digit code sent to {form.email}</p>
              </div>
              
              <button
                onClick={closeOtpModal}
                className="absolute top-4 right-4 text-white hover:text-orange-200 focus:outline-none transition-colors"
              >
                <FaTimes size={20} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="flex justify-center mb-6">
                <div className="relative flex space-x-2">
                  {[...Array(6)].map((_, i) => (
                    <div 
                      key={i} 
                      className={`w-12 h-16 flex items-center justify-center text-2xl font-bold border-b-4 ${
                        i === otp.length 
                          ? 'border-orange-500' 
                          : otp[i] 
                            ? 'border-green-500' 
                            : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      {otp[i] || ''}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Enter 6-digit verification code
                </label>
                <input
                  ref={otpInputRef}
                  type="text"
                  maxLength="6"
                  value={otp}
                  onChange={handleOtpChange}
                  className="w-full p-4 text-center text-xl tracking-widest rounded-lg border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-orange-600 transition"
                  placeholder="••••••"
                />
              </div>
              
              <button
                onClick={handleVerification}
                disabled={isVerifying || otp.length !== 6}
                className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-300 flex items-center justify-center mb-4 ${
                  isVerifying || otp.length !== 6
                    ? 'bg-orange-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-md hover:shadow-lg'
                }`}
              >
                {isVerifying ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verifying...
                  </>
                ) : (
                  'Verify Account'
                )}
              </button>
              
              <div className="text-center">
                {resendTimer > 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Resend code in <span className="font-semibold text-orange-500">{resendTimer}s</span>
                  </p>
                ) : (
                  <button
                    onClick={handleResendOtp}
                    disabled={isResending}
                    className={`text-sm font-medium ${
                      isResending 
                        ? 'text-orange-400' 
                        : 'text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300'
                    } transition-colors flex items-center justify-center mx-auto`}
                  >
                    {isResending ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending new code...
                      </>
                    ) : (
                      'Resend Verification Code'
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Signup;