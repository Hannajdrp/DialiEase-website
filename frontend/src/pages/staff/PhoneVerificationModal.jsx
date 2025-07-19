import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FaPhone, FaCheck, FaTimes, FaSpinner, FaRedo, FaShieldAlt 
} from 'react-icons/fa';

const PhoneVerificationModal = ({ 
  phoneNumber, 
  onVerify, 
  onClose,
  isOpen
}) => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendDisabled, setResendDisabled] = useState(true);
  const [countdown, setCountdown] = useState(30);

  // Countdown timer for resend OTP
  useEffect(() => {
    let timer;
    if (resendDisabled && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (countdown === 0) {
      setResendDisabled(false);
    }
    return () => clearTimeout(timer);
  }, [resendDisabled, countdown]);

const handleResend = async () => {
    setResendDisabled(true);
    setCountdown(30);
    setOtp('');
    setError('');
    
    try {
        const response = await axios.post('/patient/send-phone-otp', {
            phone_number: phoneNumber.replace(/\D/g, '')
        });
        
        if (response.data.success) {
            console.log('New OTP sent successfully');
            // Auto-fill the OTP for testing purposes
            if (response.data.otp) {
                setOtp(response.data.otp);
                console.log('Your OTP:', response.data.otp);
            }
        } else {
            throw new Error(response.data.error || 'Failed to resend code');
        }
    } catch (err) {
        setError(err.response?.data?.error || err.message || 'Failed to resend code');
    }
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await axios.post('/api/patient/verify-phone-otp', {
        phone_number: phoneNumber.replace(/\D/g, ''),
        otp: otp
      });
      
      if (response.data.success) {
        onVerify();
      } else {
        throw new Error(response.data.error || 'Verification failed');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '10px',
        width: '100%',
        maxWidth: '450px',
        padding: '25px',
        boxShadow: '0 5px 15px rgba(0,0,0,0.2)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h3 style={{
            margin: 0,
            fontSize: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: '#2d4668'
          }}>
            <FaShieldAlt /> Verify Phone Number
          </h3>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '18px',
              color: '#6b7280'
            }}
          >
            <FaTimes />
          </button>
        </div>

        <p style={{ marginBottom: '25px', color: '#4b5563' }}>
          We've sent a 6-digit verification code to <strong>{phoneNumber}</strong>. 
          Please enter it below to verify your phone number.
        </p>

        {error && (
          <div style={{
            padding: '12px',
            backgroundColor: '#fef2f2',
            color: '#ef4444',
            borderRadius: '6px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <FaTimes /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '500',
              color: '#374151'
            }}>
              Verification Code
            </label>
            <input
              type="text"
              value={otp}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                setOtp(value);
                setError('');
              }}
              placeholder="Enter 6-digit code"
              style={{
                width: '100%',
                padding: '12px 15px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '16px',
                transition: 'all 0.2s',
                boxSizing: 'border-box'
              }}
              autoFocus
            />
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '25px'
          }}>
            <button
              type="button"
              onClick={handleResend}
              disabled={resendDisabled}
              style={{
                background: 'none',
                border: 'none',
                color: resendDisabled ? '#9ca3af' : '#3b82f6',
                cursor: resendDisabled ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '14px'
              }}
            >
              <FaRedo /> 
              {resendDisabled ? `Resend in ${countdown}s` : 'Resend Code'}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: loading || otp.length !== 6 ? '#93c5fd' : '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: loading || otp.length !== 6 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px'
            }}
          >
            {loading ? (
              <>
                <FaSpinner style={{ animation: 'spin 1s linear infinite' }} /> 
                Verifying...
              </>
            ) : (
              <>
                <FaCheck /> Verify Phone Number
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PhoneVerificationModal;