import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { FaEnvelope, FaShieldAlt, FaArrowLeft, FaCheck, FaUser, FaIdCard } from "react-icons/fa";
import { FiAlertCircle } from "react-icons/fi";
import axios from "axios";

function Validation_EmailVerif({ 
  formData, 
  setFormData, 
  setStep, 
  setOtpSent, 
  setOtpVerified, 
  errors, 
  setErrors, 
  isLoading, 
  setIsLoading, 
  apiError, 
  setApiError, 
  otpSent 
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [currentEmail, setCurrentEmail] = useState('');

  useEffect(() => {
    if (location.state?.userData) {
      setUserData(location.state.userData);
      setCurrentEmail(location.state.userData.current_email || '');
    } else {
      navigate('/validate-employee');
    }
  }, [location.state, navigate]);

  const validateEmailStep = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    } else if (formData.email === currentEmail) {
      newErrors.email = "This is already your current email";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateOTPStep = () => {
    const newErrors = {};
    
    if (!formData.otp.trim()) {
      newErrors.otp = "OTP is required";
    } else if (!/^[0-9]{6}$/.test(formData.otp)) {
      newErrors.otp = "OTP must be 6 digits";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendOTP = async () => {
    if (!validateEmailStep()) return;
    
    setIsLoading(true);
    setApiError("");
    
    try {
      const response = await axios.post('/send-otp', {
        email: formData.email,
        employeeNumber: userData.employeeNumber
      });
      
      if (response.data.success) {
        setOtpSent(true);
      } else {
        throw new Error(response.data.message || 'Failed to send OTP');
      }
    } catch (error) {
      setApiError(error.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!validateOTPStep()) return;
    
    setIsLoading(true);
    setApiError("");
    
    try {
      const response = await axios.post('/verify-otp', { 
        email: formData.email,
        employeeNumber: userData.employeeNumber,
        otp: formData.otp
      });
      
      if (response.data.success) {
        setOtpVerified(true);
        setStep(2);
        setCurrentEmail(formData.email);
      } else {
        throw new Error(response.data.message || 'OTP verification failed');
      }
    } catch (error) {
      let errorMessage = 'OTP verification failed. Please try again.';
      if (error.response?.status === 422) {
        // Handle Laravel validation errors
        const errors = error.response.data.errors;
        errorMessage = Object.values(errors).flat().join(' ');
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      setApiError(errorMessage);
    } finally {
      setIsLoading(false);
    }
};

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  if (!userData) {
    return null;
  }

  const getFullName = () => {
    const firstName = userData.first_name || userData.firstName || '';
    const lastName = userData.last_name || userData.lastName || '';
    return `${firstName} ${lastName}`.trim() || 'Not available';
  };

  const styles = {
    infoCard: {
      backgroundColor: '#f0f9ff',
      padding: '1.5rem',
      borderRadius: '0.75rem',
      marginBottom: '2rem',
      borderLeft: '4px solid #395886'
    },
    currentEmail: {
      backgroundColor: '#f1f5f9',
      padding: '0.75rem',
      borderRadius: '0.5rem',
      marginBottom: '1rem',
      fontSize: '0.9rem'
    },
    emailLabel: {
      fontWeight: '500',
      color: '#64748b',
      marginBottom: '0.25rem'
    },
    emailValue: {
      fontWeight: '600',
      color: '#1e293b'
    },
    // ... [rest of the styles remain the same]
  };

  return (
    <div>
      {/* Employee Information Card */}
      <div style={styles.infoCard}>
        <h4 style={styles.sectionTitle}>
          <FaUser style={{ color: '#395886' }} />
          Employee Information
        </h4>
        
        {/* Current Email Display */}
        {currentEmail && (
          <div style={styles.currentEmail}>
            <div style={styles.emailLabel}>Current Email:</div>
            <div style={styles.emailValue}>{currentEmail}</div>
          </div>
        )}
        
        <div style={styles.grid}>
          <div>
            <p style={styles.label}>Employee Name</p>
            <p style={styles.value}>{getFullName()}</p>
          </div>
          
          <div>
            <p style={styles.label}>Employee Number</p>
            <p style={styles.value}>{userData.employeeNumber || 'Not available'}</p>
          </div>
        </div>
        
        <p style={{ 
          fontSize: '0.875rem',
          color: '#64748b',
          marginTop: '0.5rem'
        }}>
          {otpSent 
            ? 'Enter the verification code sent to your new email address.'
            : 'Please provide a new email address for account verification and important communications.'}
        </p>
      </div>

      {/* Verification Section */}
      <h3 style={{ 
        fontSize: '1.25rem', 
        fontWeight: '600', 
        color: '#1e293b', 
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        <span style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '1.75rem',
          height: '1.75rem',
          borderRadius: '50%',
          backgroundColor: '#e0f2fe',
          color: '#395886',
          fontSize: '0.9rem'
        }}>1</span>
        {otpSent ? 'Verify New Email' : 'Update Email Address'}
      </h3>

      {/* Error Message */}
      {apiError && (
        <div style={styles.errorAlert}>
          <FiAlertCircle />
          <span>{apiError}</span>
        </div>
      )}

      {/* Email Input */}
      <div style={styles.inputContainer}>
        <label style={{ 
          display: 'block', 
          fontSize: '0.95rem', 
          fontWeight: '500', 
          color: '#334155', 
          marginBottom: '0.5rem'
        }}>
          {otpSent ? 'New Email Address' : 'New Email Address'} <span style={{ color: '#ef4444' }}>*</span>
        </label>
        <div style={{ position: 'relative' }}>
          <div style={styles.inputIcon}>
            <FaEnvelope />
          </div>
          <input
            type="email"
            name="email"
            placeholder="your@new-email.com"
            value={formData.email}
            onChange={handleChange}
            disabled={otpSent || isLoading}
            style={{ 
              ...styles.input,
              ...(errors.email ? styles.errorInput : {}),
              backgroundColor: (isLoading || otpSent) ? '#f8fafc' : 'white'
            }}
          />
        </div>
        {errors.email && <p style={styles.errorText}>{errors.email}</p>}
      </div>

      {/* OTP Input (conditionally shown) */}
      {otpSent && (
        <div style={styles.inputContainer}>
          <label style={{ 
            display: 'block', 
            fontSize: '0.95rem', 
            fontWeight: '500', 
            color: '#334155', 
            marginBottom: '0.5rem'
          }}>
            Verification Code <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <div style={{ position: 'relative' }}>
            <div style={styles.inputIcon}>
              <FaShieldAlt />
            </div>
            <input
              type="text"
              name="otp"
              placeholder="Enter 6-digit code"
              value={formData.otp}
              onChange={handleChange}
              disabled={isLoading}
              style={{ 
                ...styles.input,
                ...(errors.otp ? styles.errorInput : {}),
                backgroundColor: isLoading ? '#f8fafc' : 'white'
              }}
            />
          </div>
          {errors.otp && <p style={styles.errorText}>{errors.otp}</p>}
          <p style={{ 
            marginTop: '0.5rem', 
            fontSize: '0.85rem', 
            color: '#64748b'
          }}>
            We've sent a 6-digit verification code to {formData.email}. Please check your inbox.
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        {!otpSent ? (
          <motion.button
            type="button"
            onClick={handleSendOTP}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isLoading}
            style={styles.button}
          >
            {isLoading ? 'Sending...' : 'Send Verification Code'}
          </motion.button>
        ) : (
          <motion.button
            type="button"
            onClick={handleVerifyOTP}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isLoading}
            style={styles.button}
          >
            {isLoading ? 'Verifying...' : 'Verify Code'}
          </motion.button>
        )}
      </div>
    </div>
  );
}

export default Validation_EmailVerif;