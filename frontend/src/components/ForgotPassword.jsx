import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaArrowLeft, FaEnvelope, FaLock, FaArrowRight } from "react-icons/fa";
import logoImage from "../images/logo.PNG";
import staffPic from "../assets/images/staffPic.PNG";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

async function handleApiRequest(url, method = 'POST', body = null) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      signal: controller.signal,
      credentials: 'include',
      mode: 'cors'
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE_URL}${url}`, options);
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      throw new Error('Network error. Please check your internet connection and try again.');
    }
    throw error;
  }
}

function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (password) => password.length >= 6;

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'otp') {
      const numericValue = value.replace(/[^0-9]/g, '');
      setFormData(prev => ({ ...prev, [name]: numericValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const startCountdown = () => {
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!validateEmail(formData.email)) newErrors.email = "Please enter a valid email";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (!formData.otp.trim()) newErrors.otp = "OTP is required";
    else if (formData.otp.length !== 6) newErrors.otp = "OTP must be 6 digits";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors = {};
    if (!formData.newPassword) newErrors.newPassword = "Password is required";
    else if (!validatePassword(formData.newPassword)) newErrors.newPassword = "Password must be at least 6 characters";
    if (!formData.confirmPassword) newErrors.confirmPassword = "Please confirm your password";
    else if (formData.newPassword !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!validateStep1()) return;
    
    setIsLoading(true);
    setApiError("");
    
    try {
      await handleApiRequest('/api/forgot-password', 'POST', {
        email: formData.email.trim()
      });

      startCountdown();
      setStep(2);
      setNotification({ message: 'OTP sent successfully!', type: 'success' });
    } catch (error) {
      setApiError(error.message);
      setNotification({ message: error.message, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!validateStep2()) return;
    
    setIsLoading(true);
    setApiError("");
    
    try {
      await handleApiRequest('/api/verify-otp', 'POST', {
        email: formData.email.trim(),
        otp: formData.otp.trim()
      });

      setStep(3);
      setNotification({ message: 'OTP verified successfully!', type: 'success' });
    } catch (error) {
      setApiError(error.message);
      setNotification({ message: error.message, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!validateStep3()) return;
    
    setIsLoading(true);
    setApiError("");
    
    try {
      await handleApiRequest('/api/reset-password', 'POST', {
        email: formData.email.trim(),
        otp: formData.otp.trim(),
        newPassword: formData.newPassword,
        newPassword_confirmation: formData.confirmPassword
      });

      setNotification({ message: 'Password reset successfully!', type: 'success' });
      setTimeout(() => navigate('/login'), 1500);
    } catch (error) {
      setApiError(error.message);
      setNotification({ message: error.message, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    
    setIsLoading(true);
    setApiError("");
    
    try {
      await handleApiRequest('/api/resend-otp', 'POST', {
        email: formData.email.trim()
      });

      startCountdown();
      setNotification({ message: 'OTP resent successfully!', type: 'success' });
    } catch (error) {
      setApiError(error.message);
      setNotification({ message: error.message, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      {notification.message && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className={`notification ${notification.type}`}
        >
          <span>{notification.message}</span>
          <button onClick={() => setNotification({ message: '', type: '' })}>×</button>
        </motion.div>
      )}

      <header className="auth-header">
        <Link to="/" className="logo-link">
          <img src={logoImage} alt="Dialiease Logo" className="logo-img" />
          <span>Dialiease</span>
        </Link>
      </header>

      <div className="auth-content">
        <div className="auth-left">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            Reset Your <span className="highlight">Password</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            {step === 1 ? 'Enter your email to receive a verification code to reset your password.' : 
             step === 2 ? 'Check your email for the 6-digit verification code we just sent you.' : 
             'Create a new password for your Dialiease account.'}
          </motion.p>
          <motion.img 
            src={staffPic} 
            alt="Doctor using Dialiease" 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="auth-form-container"
        >
          <div className="form-header">
            <button onClick={() => step === 1 ? navigate('/login') : setStep(step - 1)} className="back-button">
              <FaArrowLeft /> Back to {step === 1 ? 'Login' : 'Previous Step'}
            </button>
            
            <h2>
              {step === 1 ? 'Forgot Password' : 
               step === 2 ? 'Verify OTP' : 
               'Reset Password'}
            </h2>
            
            <p>
              {step === 1 ? 'Enter your email to receive a verification code' : 
               step === 2 ? 'Enter the 6-digit code sent to your email' : 
               'Create a new password for your account'}
            </p>
          </div>

          {apiError && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="error-message">
              {apiError}
            </motion.div>
          )}

          {step === 1 && (
            <form onSubmit={handleSendOtp}>
              <div className="form-group">
                <div className="input-with-icon">
                  <FaEnvelope className="input-icon" />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    className={errors.email ? 'error' : ''}
                    disabled={isLoading}
                  />
                </div>
                {errors.email && <span className="error-text">{errors.email}</span>}
              </div>

              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isLoading}
                className="submit-button"
              >
                {isLoading ? (
                  <>
                    <div className="loading-dots">
                      <div></div>
                      <div></div>
                      <div></div>
                    </div>
                    Sending OTP...
                  </>
                ) : (
                  <>
                    Send Verification Code <FaArrowRight className="button-icon" />
                  </>
                )}
              </motion.button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyOtp}>
              <div className="form-group">
                <div className="input-with-icon">
                  <input
                    type="text"
                    name="otp"
                    placeholder="Enter 6-digit OTP"
                    value={formData.otp}
                    onChange={handleChange}
                    maxLength="6"
                    className={`otp-input ${errors.otp ? 'error' : ''}`}
                    disabled={isLoading}
                  />
                </div>
                {errors.otp && <span className="error-text">{errors.otp}</span>}
              </div>

              <div className="otp-resend">
                {countdown > 0 ? (
                  <span>Resend OTP in {countdown} seconds</span>
                ) : (
                  <button onClick={handleResendOtp} disabled={isLoading} className="resend-button">
                    Resend OTP
                  </button>
                )}
              </div>

              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isLoading}
                className="submit-button"
              >
                {isLoading ? (
                  <>
                    <div className="loading-dots">
                      <div></div>
                      <div></div>
                      <div></div>
                    </div>
                    Verifying...
                  </>
                ) : (
                  <>
                    Verify OTP <FaArrowRight className="button-icon" />
                  </>
                )}
              </motion.button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleResetPassword}>
              <div className="form-group">
                <div className="input-with-icon">
                  <FaLock className="input-icon" />
                  <input
                    type="password"
                    name="newPassword"
                    placeholder="New Password"
                    value={formData.newPassword}
                    onChange={handleChange}
                    className={errors.newPassword ? 'error' : ''}
                    disabled={isLoading}
                  />
                </div>
                {errors.newPassword && <span className="error-text">{errors.newPassword}</span>}
              </div>

              <div className="form-group">
                <div className="input-with-icon">
                  <FaLock className="input-icon" />
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm New Password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={errors.confirmPassword ? 'error' : ''}
                    disabled={isLoading}
                  />
                </div>
                {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
              </div>

              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isLoading}
                className="submit-button"
              >
                {isLoading ? (
                  <>
                    <div className="loading-dots">
                      <div></div>
                      <div></div>
                      <div></div>
                    </div>
                    Resetting...
                  </>
                ) : (
                  <>
                    Reset Password <FaArrowRight className="button-icon" />
                  </>
                )}
              </motion.button>
            </form>
          )}
        </motion.div>
      </div>

      <style jsx>{`
        .forgot-password-container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background-color: #f9fafb;
          font-family: 'Inter', sans-serif;
          width: 100vw;
          overflow-x: hidden;
        }
        
        .notification {
          position: fixed;
          top: 1rem;
          right: 1rem;
          padding: 1rem;
          border-radius: 0.375rem;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
          z-index: 50;
          display: flex;
          align-items: center;
          justify-content: space-between;
          min-width: 300px;
        }
        
        .success {
          background-color: #d1fae5;
          color: #065f46;
        }
        
        .error {
          background-color: #fee2e2;
          color: #b91c1c;
        }
        
        .auth-header {
          padding: 1rem 1.5rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          background-color: white;
          position: sticky;
          top: 0;
          z-index: 1000;
          width: 100%;
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border-bottom: 1px solid rgba(0,0,0,0.05);
        }
        
        .logo-link {
          display: flex;
          align-items: center;
          text-decoration: none;
          color: #395886;
          font-weight: 600;
          font-size: 1.5rem;
          gap: 0.75rem;
        }
        
        .logo-img {
          height: 50px;
          transition: height 0.2s ease;
        }
        
        .auth-content {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          width: 100%;
          background-color: #f5f7fa;
        }
        
        .auth-left {
          flex: 1;
          padding: 3rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        
        .auth-left h1 {
          font-size: 2.5rem;
          font-weight: 700;
          line-height: 1.2;
          margin-bottom: 1.5rem;
          color: #395886;
        }
        
        .highlight {
          color: #477977;
          font-weight: bold;
          font-size: 2.7rem;
          letter-spacing: 1px;
          text-shadow: 3px 3px 8px rgba(0, 0, 0, 0.3);
        }
        
        .auth-left p {
          font-size: 1.125rem;
          color: #6b7280;
          margin-bottom: 2rem;
          line-height: 1.6;
          max-width: 600px;
        }
        
        .auth-left img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          max-width: 800px;
        }
        
        .auth-form-container {
          width: 100%;
          max-width: 28rem;
          background-color: white;
          padding: 3rem;
          border-radius: 0.75rem;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
          margin: 2rem;
          align-self: center;
        }
        
        .form-header {
          margin-bottom: 2rem;
        }
        
        .back-button {
          background: none;
          border: none;
          color: #638ECB;
          display: flex;
          align-items: center;
          cursor: pointer;
          font-size: 0.875rem;
          font-weight: 500;
          padding: 0.5rem 0;
        }
        
        .form-header h2 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #395886;
          margin-bottom: 0.5rem;
          margin-top: 1rem;
        }
        
        .form-header p {
          color: #6b7280;
          font-size: 0.875rem;
        }
        
        .error-message {
          background-color: #fee2e2;
          color: #b91c1c;
          padding: 0.75rem;
          border-radius: 0.375rem;
          margin-bottom: 1.5rem;
          font-size: 0.875rem;
        }
        
        .form-group {
          margin-bottom: 1.25rem;
        }
        
        .input-with-icon {
          position: relative;
          margin-bottom: 0.25rem;
        }
        
        .input-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
        }
        
        input {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 2.5rem;
          border-radius: 0.375rem;
          border: 1px solid #d1d5db;
          outline: none;
          font-size: 0.875rem;
          background-color: white;
        }
        
        input.error {
          border-color: #f87171;
        }
        
        .otp-input {
          padding: 0.75rem 1rem;
          text-align: center;
          letter-spacing: 0.5rem;
          font-weight: 600;
        }
        
        .error-text {
          color: #ef4444;
          font-size: 0.75rem;
        }
        
        .otp-resend {
          display: flex;
          justify-content: center;
          margin-bottom: 1.5rem;
          font-size: 0.875rem;
        }
        
        .resend-button {
          background: none;
          border: none;
          color: #638ECB;
          font-weight: 500;
          cursor: pointer;
        }
        
        .submit-button {
          width: 100%;
          padding: 0.75rem;
          background-color: #477977;
          color: white;
          border: none;
          border-radius: 0.375rem;
          font-weight: 600;
          font-size: 0.875rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .submit-button:disabled {
          cursor: not-allowed;
          opacity: 0.7;
        }
        
        .button-icon {
          margin-left: 0.5rem;
        }
        
        .loading-dots {
          display: flex;
          align-items: center;
          margin-right: 0.5rem;
        }
        
        .loading-dots div {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background-color: rgba(255,255,255,0.3);
          margin: 0 2px;
          display: inline-block;
          animation: pulse 1.4s infinite ease-in-out both;
        }
        
        .loading-dots div:nth-child(2) {
          animation-delay: 0.2s;
        }
        
        .loading-dots div:nth-child(3) {
          animation-delay: 0.4s;
        }
        
        @keyframes pulse {
          0%, 80%, 100% { 
            transform: scale(0);
            opacity: 0.5;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

export default ForgotPassword;