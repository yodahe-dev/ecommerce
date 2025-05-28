import { useState, useEffect, useRef } from 'react';
import { login, resendOtp, verifyOtp } from '../api';
import { Navigate, Link } from 'react-router-dom';
import { FaRegEye, FaEyeSlash, FaTimes, FaArrowRight } from 'react-icons/fa';

function Login({ onLogin }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [msg, setMsg] = useState('');
  const [isVerifyNeeded, setIsVerifyNeeded] = useState(false);
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [redirect, setRedirect] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      const res = await login(form);
      
      if (res.token) {
        onLogin(res.token);
        setMsg('Login successful! Redirecting...');
        setTimeout(() => setRedirect(true), 1500);
      } else if (res.error?.includes('verify')) {
        setIsVerifyNeeded(true);
        setMsg('Please verify your account. Check your email for the verification code.');
        startResendTimer();
      } else {
        setMsg(res.error || 'Login failed. Please check your credentials.');
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
        setMsg('Verification successful. Redirecting...');
        setIsVerifyNeeded(false);
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
    return <Navigate to="/account" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-6">
            <h2 className="text-2xl font-bold text-white text-center">Welcome Back</h2>
            <p className="text-orange-100 text-center mt-1">Sign in to your account</p>
          </div>
          
          <div className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email Address
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
                    placeholder="Enter your password"
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
                <div className="mt-2 text-right">
                  <Link to="/forgot-password" className="text-sm text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 transition-colors">
                    Forgot password?
                  </Link>
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
                    Signing In...
                  </>
                ) : (
                  'Sign In'
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
              
              <div className="relative flex items-center py-4">
                <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
                <span className="flex-shrink mx-4 text-gray-500 dark:text-gray-400 text-sm">OR</span>
                <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className="py-2 px-4 flex items-center justify-center rounded-lg border border-gray-300 hover:border-gray-400 bg-white text-gray-700 hover:bg-gray-50 transition dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px">
                    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
                    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
                    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
                    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
                  </svg>
                  Google
                </button>
                <button
                  type="button"
                  className="py-2 px-4 flex items-center justify-center rounded-lg border border-gray-300 hover:border-gray-400 bg-white text-gray-700 hover:bg-gray-50 transition dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24px" height="24px">
                    <path d="M22.675 0H1.325C.593 0 0 .593 0 1.325v21.351C0 23.407.593 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.593 1.323-1.325V1.325C24 .593 23.407 0 22.675 0z"/>
                  </svg>
                  Facebook
                </button>
              </div>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Don't have an account?{' '}
                <Link to="/signup" className="font-medium text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 transition-colors flex items-center justify-center">
                  Create Account <FaArrowRight className="ml-1" size={12} />
                </Link>
              </p>
            </div>
          </div>
          
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-100 dark:border-gray-600 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              By signing in, you agree to our <a href="#" className="text-orange-500 hover:underline">Terms</a> and <a href="#" className="text-orange-500 hover:underline">Privacy Policy</a>
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
                <h3 className="text-xl font-bold text-white text-center">Verify Your Account</h3>
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

export default Login;