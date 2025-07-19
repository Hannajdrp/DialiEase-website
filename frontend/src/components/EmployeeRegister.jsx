import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaUser, FaKey, FaEnvelope, FaShieldAlt, 
  FaLock, FaIdCard, FaCalendarAlt, FaVenusMars, 
  FaCamera, FaArrowLeft, FaCheck 
} from 'react-icons/fa';
import { FiAlertCircle } from 'react-icons/fi';
import axios from 'axios';
import logoImage from '../assets/images/logo.PNG';

function EmployeeRegister() {
  const location = useLocation();
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Validate, 2: Email Verify, 3: Complete Profile
  const [formData, setFormData] = useState({
    employeeNumber: '',
    registrationCode: '',
    email: '',
    otp: '',
    password: '',
    password_confirmation: '',
    firstName: '',
    lastName: '',
    middle_name: '',
    suffix: '',
    date_of_birth: '',
    gender: '',
    profile_image: null
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [userData, setUserData] = useState(null);

  // Theme variables
  const theme = {
    primary: '#395886',
    secondary: '#638ECB',
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    text: '#1E293B',
    secondaryText: '#64748B',
    border: '#CBD5E1',
    bg: '#F8FAFC',
    cardBg: 'rgba(255, 255, 255, 0.9)',
    inputBg: 'rgba(241, 245, 249, 0.7)'
  };

  // Validate employee number format
  const validateEmployeeNumber = (number) => {
    return /^EMP-\d{6}$/i.test(number);
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'file') {
      const file = files[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewImage(reader.result);
          setFormData(prev => ({ ...prev, [name]: reader.result.split(',')[1] }));
        };
        reader.readAsDataURL(file);
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Step 1: Validate employee credentials
  const validateEmployee = async (e) => {
    e.preventDefault();
    setApiError('');
    
    // Form validation
    const newErrors = {};
    if (!formData.employeeNumber.trim()) {
      newErrors.employeeNumber = "Employee number is required";
    } else if (!validateEmployeeNumber(formData.employeeNumber)) {
      newErrors.employeeNumber = "Format must be EMP- followed by 6 digits (e.g. EMP-123456)";
    }
    
    if (!formData.registrationCode.trim()) {
      newErrors.registrationCode = "Registration code is required";
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await axios.post('/validate-employee', {
        employeeNumber: formData.employeeNumber,
        registrationCode: formData.registrationCode
      });
      
      if (response.data.success) {
        if (response.data.data.EmpStatus === 'pre-signup') {
          setNotification({ 
            message: 'Please proceed to login and change your credentials.', 
            type: 'info' 
          });
          setTimeout(() => {
            navigate('/employee-change-credentials', { state: { userData: response.data.data } });
          }, 2000);
        } else if (response.data.data.EmpStatus === 'pre-register') {
          setUserData(response.data.data);
          setFormData(prev => ({
            ...prev,
            firstName: response.data.data.first_name,
            lastName: response.data.data.last_name,
            gender: response.data.data.gender || ''
          }));
          setStep(2); // Move to email verification
        } else {
          setNotification({ 
            message: 'This employee is already registered. Please login instead.', 
            type: 'info' 
          });
          setTimeout(() => navigate('/login'), 2000);
        }
      } else {
        throw new Error(response.data.message || 'Validation failed');
      }
    } catch (error) {
      setApiError(error.response?.data?.message || 'Validation failed. Please check your details and try again.');
      setNotification({ 
        message: error.response?.data?.message || 'Validation failed. Please check your details and try again.', 
        type: 'error' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Send OTP for email verification
  const handleSendOTP = async () => {
    setApiError('');
    
    // Email validation
    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await axios.post('/send-otp', {
        email: formData.email,
        employeeNumber: formData.employeeNumber
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

  // Step 2: Verify OTP
  const handleVerifyOTP = async () => {
    setApiError('');
    
    // OTP validation
    const newErrors = {};
    if (!formData.otp.trim()) {
      newErrors.otp = "OTP is required";
    } else if (!/^\d{6}$/.test(formData.otp)) {
      newErrors.otp = "OTP must be 6 digits";
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await axios.post('/verify-otp', {
        email: formData.email,
        employeeNumber: formData.employeeNumber,
        otp: formData.otp
      });
      
      if (response.data.success) {
        setOtpVerified(true);
        setStep(3); // Move to profile completion
      } else {
        throw new Error(response.data.message || 'OTP verification failed');
      }
    } catch (error) {
      setApiError(error.response?.data?.message || 'OTP verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Complete registration
  const handleCompleteRegistration = async (e) => {
    e.preventDefault();
    setApiError('');
    
    // Form validation
    const newErrors = {};
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }
    
    if (formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = "Passwords do not match";
    }
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }
    
    if (!formData.gender) {
      newErrors.gender = "Gender is required";
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    
    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'profile_image' && formData[key]) {
          formDataToSend.append(key, formData[key]);
        } else if (formData[key] !== null && formData[key] !== undefined) {
          formDataToSend.append(key, formData[key]);
        }
      });
      
      const response = await axios.post('/complete-employee-registration', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.success) {
        setNotification({ 
          message: 'Registration completed successfully! Redirecting to login...', 
          type: 'success' 
        });
        setTimeout(() => navigate('/login', { state: { registrationSuccess: true } }), 2000);
      } else {
        throw new Error(response.data.message || 'Registration failed');
      }
    } catch (error) {
      setApiError(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Render step 1: Employee validation
  const renderValidationStep = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Validate Employee Details</h2>
      <p className="text-gray-600">
        Enter your employee number and registration code to verify your identity.
      </p>

      {apiError && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
          <div className="flex items-center">
            <FiAlertCircle className="mr-2" />
            <span>{apiError}</span>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Employee Number <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <FaUser />
            </div>
            <input
              type="text"
              name="employeeNumber"
              value={formData.employeeNumber}
              onChange={handleChange}
              placeholder="EMP-123456"
              className={`block w-full pl-10 pr-3 py-2 border ${errors.employeeNumber ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
              disabled={isLoading}
            />
          </div>
          {errors.employeeNumber && (
            <p className="mt-1 text-sm text-red-600">{errors.employeeNumber}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Registration Code <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <FaKey />
            </div>
            <input
              type="text"
              name="registrationCode"
              value={formData.registrationCode}
              onChange={handleChange}
              placeholder="Enter your registration code"
              className={`block w-full pl-10 pr-3 py-2 border ${errors.registrationCode ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
              disabled={isLoading}
            />
          </div>
          {errors.registrationCode && (
            <p className="mt-1 text-sm text-red-600">{errors.registrationCode}</p>
          )}
        </div>
      </div>

      <div className="pt-2">
        <motion.button
          type="button"
          onClick={validateEmployee}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={isLoading}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${isLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Validating...
            </>
          ) : 'Validate'}
        </motion.button>
      </div>
    </div>
  );

  // Render step 2: Email verification
  const renderEmailVerificationStep = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-md border-l-4 border-blue-500">
        <h4 className="font-medium text-blue-800 flex items-center">
          <FaUser className="mr-2" />
          Employee Information
        </h4>
        <div className="grid grid-cols-2 gap-4 mt-2">
          <div>
            <p className="text-xs text-gray-500">Employee Name</p>
            <p className="font-medium">{userData?.first_name} {userData?.last_name}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Employee Number</p>
            <p className="font-medium">{formData.employeeNumber}</p>
          </div>
        </div>
        <p className="mt-2 text-sm text-gray-600">
          Please provide a valid email address that will be used for account verification and important communications.
        </p>
      </div>

      <h2 className="text-2xl font-bold text-gray-800">Email Verification</h2>
      <p className="text-gray-600">
        We'll send a verification code to your email to confirm your identity.
      </p>

      {apiError && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
          <div className="flex items-center">
            <FiAlertCircle className="mr-2" />
            <span>{apiError}</span>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <FaEnvelope />
            </div>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              className={`block w-full pl-10 pr-3 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
              disabled={isLoading || otpSent}
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        {otpSent && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Verification Code <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <FaShieldAlt />
              </div>
              <input
                type="text"
                name="otp"
                value={formData.otp}
                onChange={handleChange}
                placeholder="Enter 6-digit code"
                className={`block w-full pl-10 pr-3 py-2 border ${errors.otp ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                disabled={isLoading}
              />
            </div>
            {errors.otp && (
              <p className="mt-1 text-sm text-red-600">{errors.otp}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              We've sent a 6-digit verification code to your email. Please check your inbox.
            </p>
          </div>
        )}
      </div>

      <div className="pt-2">
        {!otpSent ? (
          <motion.button
            type="button"
            onClick={handleSendOTP}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isLoading}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${isLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
              </>
            ) : 'Send Verification Code'}
          </motion.button>
        ) : (
          <motion.button
            type="button"
            onClick={handleVerifyOTP}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isLoading}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${isLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Verifying...
              </>
            ) : 'Verify Code'}
          </motion.button>
        )}
      </div>
    </div>
  );

  // Render step 3: Complete profile
  const renderCompleteProfileStep = () => (
    <form onSubmit={handleCompleteRegistration} className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Complete Your Profile</h2>
      <p className="text-gray-600">
        Please fill in the remaining details to complete your registration.
      </p>

      {apiError && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
          <div className="flex items-center">
            <FiAlertCircle className="mr-2" />
            <span>{apiError}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Employee Number
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <FaIdCard />
            </div>
            <input
              type="text"
              value={formData.employeeNumber}
              readOnly
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 bg-gray-50 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <FaEnvelope />
            </div>
            <input
              type="email"
              value={formData.email}
              readOnly
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 bg-gray-50 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            First Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className={`block w-full px-3 py-2 border ${errors.firstName ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
          />
          {errors.firstName && (
            <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Middle Name
          </label>
          <input
            type="text"
            name="middle_name"
            value={formData.middle_name}
            onChange={handleChange}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Last Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className={`block w-full px-3 py-2 border ${errors.lastName ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
          />
          {errors.lastName && (
            <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Suffix
          </label>
          <select
            name="suffix"
            value={formData.suffix}
            onChange={handleChange}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">None</option>
            <option value="Jr">Jr</option>
            <option value="Sr">Sr</option>
            <option value="II">II</option>
            <option value="III">III</option>
            <option value="IV">IV</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date of Birth
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <FaCalendarAlt />
            </div>
            <input
              type="date"
              name="date_of_birth"
              value={formData.date_of_birth}
              onChange={handleChange}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Gender <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <FaVenusMars />
            </div>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className={`block w-full pl-10 pr-3 py-2 border ${errors.gender ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          {errors.gender && (
            <p className="mt-1 text-sm text-red-600">{errors.gender}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <FaLock />
            </div>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`block w-full pl-10 pr-3 py-2 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
            />
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Confirm Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <FaLock />
            </div>
            <input
              type="password"
              name="password_confirmation"
              value={formData.password_confirmation}
              onChange={handleChange}
              className={`block w-full pl-10 pr-3 py-2 border ${errors.password_confirmation ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
            />
          </div>
          {errors.password_confirmation && (
            <p className="mt-1 text-sm text-red-600">{errors.password_confirmation}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Profile Image
        </label>
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0 h-16 w-16 rounded-full bg-gray-200 overflow-hidden border-2 border-gray-300 flex items-center justify-center">
            {previewImage ? (
              <img src={previewImage} alt="Profile preview" className="h-full w-full object-cover" />
            ) : (
              <FaUser className="h-8 w-8 text-gray-400" />
            )}
          </div>
          <label className="cursor-pointer">
            <span className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <FaCamera className="-ml-0.5 mr-2 h-4 w-4" />
              Upload
            </span>
            <input
              type="file"
              name="profile_image"
              onChange={handleChange}
              accept="image/*"
              className="sr-only"
            />
          </label>
        </div>
      </div>

      <div className="pt-4">
        <motion.button
          type="submit"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={isLoading}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${isLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Completing Registration...
            </>
          ) : 'Complete Registration'}
        </motion.button>
      </div>
    </form>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
            <img src={logoImage} alt="Logo" className="h-10" />
            <span className="text-xl font-semibold text-gray-800">Dialiease</span>
          </div>
          <button 
            onClick={() => navigate('/login')}
            className="px-4 py-2 border border-blue-600 text-sm font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Login
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-6 sm:p-8">
              {/* Progress Steps */}
              <div className="flex mb-8 relative">
                <div className="absolute top-4 left-0 right-0 h-1 bg-gray-200 z-0"></div>
                
                {/* Step 1 */}
                <div className="flex-1 relative z-10 text-center">
                  <div className={`w-8 h-8 mx-auto mb-2 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'} font-medium`}>
                    1
                  </div>
                  <p className={`text-xs ${step >= 1 ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                    Validate Employee
                  </p>
                </div>
                
                {/* Step 2 */}
                <div className="flex-1 relative z-10 text-center">
                  <div className={`w-8 h-8 mx-auto mb-2 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'} font-medium`}>
                    2
                  </div>
                  <p className={`text-xs ${step >= 2 ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                    Email Verification
                  </p>
                </div>
                
                {/* Step 3 */}
                <div className="flex-1 relative z-10 text-center">
                  <div className={`w-8 h-8 mx-auto mb-2 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'} font-medium`}>
                    3
                  </div>
                  <p className={`text-xs ${step >= 3 ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                    Complete Profile
                  </p>
                </div>
              </div>

              {/* Current Step Content */}
              {step === 1 && renderValidationStep()}
              {step === 2 && renderEmailVerificationStep()}
              {step === 3 && renderCompleteProfileStep()}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} Dialiease. All rights reserved.
            </p>
            <div className="mt-4 md:mt-0 flex space-x-6">
              <a href="/privacy" className="text-sm text-gray-500 hover:text-gray-700">Privacy Policy</a>
              <a href="/terms" className="text-sm text-gray-500 hover:text-gray-700">Terms of Service</a>
              <a href="/contact" className="text-sm text-gray-500 hover:text-gray-700">Contact Us</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Notification */}
      {notification.message && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-4 right-4 p-4 rounded-md shadow-lg text-white"
          style={{
            backgroundColor: 
              notification.type === 'success' ? theme.success :
              notification.type === 'error' ? theme.error :
              notification.type === 'info' ? theme.primary : theme.primary
          }}
        >
          <div className="flex items-center">
            <FiAlertCircle className="mr-2" />
            <span>{notification.message}</span>
            <button 
              onClick={() => setNotification({ message: '', type: '' })}
              className="ml-4 text-white hover:text-gray-200"
            >
              ×
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default EmployeeRegister;