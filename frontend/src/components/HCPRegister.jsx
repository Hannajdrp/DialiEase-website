import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { FaUser, FaLock, FaEnvelope, FaPhone, FaVenusMars, FaIdCard, FaCalendarAlt, FaMapMarkerAlt, FaCamera, FaCheck, FaArrowLeft } from "react-icons/fa";
import axios from "axios";
import logoImage from "../images/logo.PNG";
import Validation_EmailVerif from "./Validation_EmailVerif";

function HCPRegister() {
  const location = useLocation();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    employeeNumber: "",
    email: "",
    otp: "",
    password: "",
    password_confirmation: "",
    firstName: "",
    lastName: "",
    middle_name: "",
    suffix: "",
    phoneNumber: "",
    date_of_birth: "",
    gender: "",
    specialization: "",
    regNumber: "",
    userLevel: "",
    EmpAddress: "",
    profile_image: null,
    acceptTerms: false
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [userData, setUserData] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    if (location.state?.userData) {
      const { userData } = location.state;
      setUserData(userData);
      setFormData(prev => ({
        ...prev,
        employeeNumber: userData.employeeNumber,
        email: userData.email || "",
        firstName: userData.first_name,
        lastName: userData.last_name,
        phoneNumber: userData.phone_number || "",
        gender: userData.gender || "",
        specialization: userData.specialization || "",
        regNumber: userData.reg_number || "",
        userLevel: userData.userLevel
      }));
    } else {
      navigate('/validate-employee');
    }
  }, [location.state, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result.split(',')[1];
        setFormData(prev => ({
          ...prev,
          profile_image: base64String
        }));
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateRegistrationForm = () => {
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
    
    if (!formData.acceptTerms) {
      newErrors.acceptTerms = "You must accept the terms and conditions";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateRegistrationForm()) return;
    
    setIsLoading(true);
    setApiError("");
    
    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'profile_image' && formData[key]) {
          formDataToSend.append(key, formData[key]);
        } else if (formData[key] !== null && formData[key] !== undefined) {
          formDataToSend.append(key, formData[key]);
        }
      });
      
      const response = await axios.post('/hcp-register', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.success) {
        navigate('/login', { state: { registrationSuccess: true } });
      } else {
        throw new Error(response.data.message || 'Registration failed');
      }
    } catch (error) {
      setApiError(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f0f9ff', 
      display: 'flex', 
      flexDirection: 'column',
      fontFamily: "'Inter', sans-serif"
    }}>
      {/* Header */}
      <header style={{ 
        backgroundColor: 'white', 
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)', 
        padding: '1rem 2rem',
        position: 'sticky', 
        top: 0, 
        zIndex: 50 
      }}>
        <div style={{ 
          maxWidth: '1400px', 
          margin: '0 auto', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between' 
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            color: '#395886', 
            fontWeight: 600, 
            fontSize: '1.75rem', 
            gap: '0.75rem',
            cursor: 'pointer'
          }} onClick={() => navigate('/')}>
            <img 
              src={logoImage} 
              alt="Dialiease Logo" 
              style={{ height: '3.5rem', transition: 'all 0.2s' }}
            />
            <span>Dialiease</span>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              onClick={() => navigate('/login')}
              style={{
                padding: '0.5rem 1.5rem',
                borderRadius: '0.375rem',
                border: '1px solid #395886',
                color: '#395886',
                fontWeight: '500',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                transition: 'all 0.2s',
                ':hover': {
                  backgroundColor: '#f0f9ff'
                }
              }}
            >
              Login
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ 
        flex: 1, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: '3rem 2rem',
        background: 'linear-gradient(to bottom right, #f0f9ff, #e0f2fe)'
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ 
            width: '100%', 
            maxWidth: '1900px',
            backgroundColor: 'white', 
            borderRadius: '1rem', 
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            overflow: 'hidden',
            display: 'grid',
            gridTemplateColumns: '1fr 3fr'
          }}
        >
          {/* Left Side - Branding */}
          <div style={{ 
            background: 'linear-gradient(135deg, #395886, #2a4365)',
            padding: '3rem 2rem',
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <button 
                onClick={() => navigate(-1)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: 'white',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  marginBottom: '1.5rem',
                  fontSize: '0.9rem'
                }}
              >
                <FaArrowLeft /> Back
              </button>
              
              <h2 style={{ 
                fontSize: '2rem', 
                fontWeight: 'bold', 
                marginBottom: '1rem',
                lineHeight: '1.2'
              }}>
                Complete Your Registration
              </h2>
              <p style={{ 
                color: '#bae6fd', 
                fontSize: '1.05rem',
                lineHeight: '1.5',
                marginBottom: '2rem'
              }}>
                Finalize your account setup to access the Dialiease healthcare platform.
              </p>
            </div>
            
            <div style={{ marginTop: '2rem' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                marginBottom: '1.5rem'
              }}>
                <div style={{ 
                  flexShrink: 0, 
                  backgroundColor: 'rgba(186, 230, 253, 0.2)', 
                  borderRadius: '50%', 
                  padding: '0.75rem', 
                  marginRight: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <FaCheck style={{ color: '#bae6fd', fontSize: '1rem' }} />
                </div>
                <p style={{ color: '#bae6fd', fontSize: '0.95rem' }}>
                  Secure and HIPAA compliant platform
                </p>
              </div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                marginBottom: '1.5rem'
              }}>
                <div style={{ 
                  flexShrink: 0, 
                  backgroundColor: 'rgba(186, 230, 253, 0.2)', 
                  borderRadius: '50%', 
                  padding: '0.75rem', 
                  marginRight: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <FaCheck style={{ color: '#bae6fd', fontSize: '1rem' }} />
                </div>
                <p style={{ color: '#bae6fd', fontSize: '0.95rem' }}>
                  24/7 patient access and support
                </p>
              </div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center'
              }}>
                <div style={{ 
                  flexShrink: 0, 
                  backgroundColor: 'rgba(186, 230, 253, 0.2)', 
                  borderRadius: '50%', 
                  padding: '0.75rem', 
                  marginRight: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <FaCheck style={{ color: '#bae6fd', fontSize: '1rem' }} />
                </div>
                <p style={{ color: '#bae6fd', fontSize: '0.95rem' }}>
                  Integrated medical records system
                </p>
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div style={{ 
            padding: '3rem',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{ 
                fontSize: '1.75rem', 
                fontWeight: 'bold', 
                color: '#1e293b',
                marginBottom: '0.5rem'
              }}>
                Complete Your Profile
              </h2>
              <p style={{ 
                color: '#64748b', 
                fontSize: '1rem'
              }}>
                Please fill in all required fields to complete your registration
              </p>
            </div>

            {apiError && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ 
                  backgroundColor: '#fee2e2', 
                  borderLeft: '4px solid #ef4444', 
                  color: '#b91c1c', 
                  padding: '1rem', 
                  marginBottom: '1.5rem', 
                  borderRadius: '0.375rem',
                  fontSize: '0.95rem'
                }}
              >
                {apiError}
              </motion.div>
            )}

            {/* Progress Steps */}
            <div style={{ 
              display: 'flex', 
              marginBottom: '2.5rem',
              position: 'relative'
            }}>
              <div style={{ 
                position: 'absolute',
                top: '1rem',
                left: '0',
                right: '0',
                height: '2px',
                backgroundColor: '#e2e8f0',
                zIndex: '1'
              }}></div>
              
              <div style={{ 
                flex: 1, 
                position: 'relative',
                zIndex: '2',
                textAlign: 'center'
              }}>
                <div style={{ 
                  width: '2.5rem', 
                  height: '2.5rem', 
                  margin: '0 auto 0.5rem', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  backgroundColor: step >= 1 ? '#395886' : '#e2e8f0', 
                  color: step >= 1 ? 'white' : '#94a3b8',
                  border: step >= 1 ? 'none' : '2px solid #cbd5e1',
                  fontWeight: '500'
                }}>
                  1
                </div>
                <p style={{ 
                  fontSize: '0.85rem', 
                  color: step >= 1 ? '#395886' : '#94a3b8', 
                  fontWeight: step >= 1 ? '600' : 'normal' 
                }}>
                  Email Verification
                </p>
              </div>
              
              <div style={{ 
                flex: 1, 
                position: 'relative',
                zIndex: '2',
                textAlign: 'center'
              }}>
                <div style={{ 
                  width: '2.5rem', 
                  height: '2.5rem', 
                  margin: '0 auto 0.5rem', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  backgroundColor: step >= 2 ? '#395886' : '#e2e8f0', 
                  color: step >= 2 ? 'white' : '#94a3b8',
                  border: step >= 2 ? 'none' : '2px solid #cbd5e1',
                  fontWeight: '500'
                }}>
                  2
                </div>
                <p style={{ 
                  fontSize: '0.85rem', 
                  color: step >= 2 ? '#395886' : '#94a3b8', 
                  fontWeight: step >= 2 ? '600' : 'normal' 
                }}>
                  Complete Profile
                </p>
              </div>
            </div>

            {step === 1 ? (
              <Validation_EmailVerif 
                formData={formData}
                setFormData={setFormData}
                setStep={setStep}
                setOtpSent={setOtpSent}
                setOtpVerified={setOtpVerified}
                errors={errors}
                setErrors={setErrors}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
                apiError={apiError}
                setApiError={setApiError}
                otpSent={otpSent}
              />
            ) : (
              <form onSubmit={handleSubmit}>
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
                  }}>2</span>
                  Complete Your Profile
                </h3>

                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(1, 1fr)',
                  gap: '1.5rem', 
                  marginBottom: '1.5rem'
                }}>
                  <div style={{ 
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '1.5rem'
                  }}>
                    <div>
                      <label style={{ 
                        display: 'block', 
                        fontSize: '0.95rem', 
                        fontWeight: '500', 
                        color: '#334155', 
                        marginBottom: '0.5rem'
                      }}>
                        Employee Number
                      </label>
                      <div style={{ position: 'relative' }}>
                        <div style={{ 
                          position: 'absolute', 
                          top: 0, 
                          bottom: 0, 
                          left: 0, 
                          paddingLeft: '1rem', 
                          display: 'flex', 
                          alignItems: 'center', 
                          pointerEvents: 'none',
                          color: '#94a3b8'
                        }}>
                          <FaIdCard />
                        </div>
                        <input
                          type="text"
                          name="employeeNumber"
                          value={formData.employeeNumber}
                          onChange={handleChange}
                          style={{ 
                            display: 'block', 
                            width: '100%', 
                            padding: '0.75rem 1rem 0.75rem 3rem',
                            border: '1px solid #cbd5e1',
                            borderRadius: '0.5rem', 
                            backgroundColor: '#f8fafc', 
                            outline: 'none',
                            fontSize: '0.95rem',
                            color: '#64748b'
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ 
                        display: 'block', 
                        fontSize: '0.95rem', 
                        fontWeight: '500', 
                        color: '#334155', 
                        marginBottom: '0.5rem'
                      }}>
                        Email
                      </label>
                      <div style={{ position: 'relative' }}>
                        <div style={{ 
                          position: 'absolute', 
                          top: 0, 
                          bottom: 0, 
                          left: 0, 
                          paddingLeft: '1rem', 
                          display: 'flex', 
                          alignItems: 'center', 
                          pointerEvents: 'none',
                          color: '#94a3b8'
                        }}>
                          <FaEnvelope />
                        </div>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          readOnly
                          style={{ 
                            display: 'block', 
                            width: '100%', 
                            padding: '0.75rem 1rem 0.75rem 3rem',
                            border: '1px solid #cbd5e1',
                            borderRadius: '0.5rem', 
                            backgroundColor: '#f8fafc', 
                            outline: 'none',
                            fontSize: '0.95rem',
                            color: '#64748b'
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div style={{ 
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '1.5rem'
                  }}>
                    <div>
                      <label style={{ 
                        display: 'block', 
                        fontSize: '0.95rem', 
                        fontWeight: '500', 
                        color: '#334155', 
                        marginBottom: '0.5rem'
                      }}>
                        First Name <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <div style={{ position: 'relative' }}>
                        <div style={{ 
                          position: 'absolute', 
                          top: 0, 
                          bottom: 0, 
                          left: 0, 
                          paddingLeft: '1rem', 
                          display: 'flex', 
                          alignItems: 'center', 
                          pointerEvents: 'none',
                          color: '#94a3b8'
                        }}>
                          <FaUser />
                        </div>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          style={{ 
                            display: 'block', 
                            width: '100%', 
                            padding: '0.75rem 1rem 0.75rem 3rem',
                            border: `1px solid ${errors.firstName ? '#fca5a5' : '#cbd5e1'}`,
                            borderRadius: '0.5rem', 
                            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', 
                            outline: 'none',
                            fontSize: '0.95rem',
                            transition: 'all 0.2s'
                          }}
                        />
                      </div>
                      {errors.firstName && (
                        <p style={{ 
                          marginTop: '0.5rem', 
                          fontSize: '0.85rem', 
                          color: '#dc2626'
                        }}>
                          {errors.firstName}
                        </p>
                      )}
                    </div>

                    <div>
                      <label style={{ 
                        display: 'block', 
                        fontSize: '0.95rem', 
                        fontWeight: '500', 
                        color: '#334155', 
                        marginBottom: '0.5rem'
                      }}>
                        Middle Name
                      </label>
                      <div style={{ position: 'relative' }}>
                        <div style={{ 
                          position: 'absolute', 
                          top: 0, 
                          bottom: 0, 
                          left: 0, 
                          paddingLeft: '1rem', 
                          display: 'flex', 
                          alignItems: 'center', 
                          pointerEvents: 'none',
                          color: '#94a3b8'
                        }}>
                          <FaUser />
                        </div>
                        <input
                          type="text"
                          name="middle_name"
                          value={formData.middle_name}
                          onChange={handleChange}
                          style={{ 
                            display: 'block', 
                            width: '100%', 
                            padding: '0.75rem 1rem 0.75rem 3rem',
                            border: '1px solid #cbd5e1',
                            borderRadius: '0.5rem', 
                            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', 
                            outline: 'none',
                            fontSize: '0.95rem',
                            transition: 'all 0.2s'
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ 
                        display: 'block', 
                        fontSize: '0.95rem', 
                        fontWeight: '500', 
                        color: '#334155', 
                        marginBottom: '0.5rem'
                      }}>
                        Last Name <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <div style={{ position: 'relative' }}>
                        <div style={{ 
                          position: 'absolute', 
                          top: 0, 
                          bottom: 0, 
                          left: 0, 
                          paddingLeft: '1rem', 
                          display: 'flex', 
                          alignItems: 'center', 
                          pointerEvents: 'none',
                          color: '#94a3b8'
                        }}>
                          <FaUser />
                        </div>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          style={{ 
                            display: 'block', 
                            width: '100%', 
                            padding: '0.75rem 1rem 0.75rem 3rem',
                            border: `1px solid ${errors.lastName ? '#fca5a5' : '#cbd5e1'}`,
                            borderRadius: '0.5rem', 
                            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', 
                            outline: 'none',
                            fontSize: '0.95rem',
                            transition: 'all 0.2s'
                          }}
                        />
                      </div>
                      {errors.lastName && (
                        <p style={{ 
                          marginTop: '0.5rem', 
                          fontSize: '0.85rem', 
                          color: '#dc2626'
                        }}>
                          {errors.lastName}
                        </p>
                      )}
                    </div>
                  </div>

                  <div style={{ 
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '1.5rem'
                  }}>
                    <div>
                      <label style={{ 
                        display: 'block', 
                        fontSize: '0.95rem', 
                        fontWeight: '500', 
                        color: '#334155', 
                        marginBottom: '0.5rem'
                      }}>
                        Suffix
                      </label>
                      <select
                        name="suffix"
                        value={formData.suffix}
                        onChange={handleChange}
                        style={{ 
                          display: 'block', 
                          width: '100%', 
                          padding: '0.75rem 1rem',
                          border: '1px solid #cbd5e1',
                          borderRadius: '0.5rem', 
                          outline: 'none',
                          fontSize: '0.95rem',
                          transition: 'all 0.2s'
                        }}
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
                      <label style={{ 
                        display: 'block', 
                        fontSize: '0.95rem', 
                        fontWeight: '500', 
                        color: '#334155', 
                        marginBottom: '0.5rem'
                      }}>
                        Date of Birth
                      </label>
                      <div style={{ position: 'relative' }}>
                        <div style={{ 
                          position: 'absolute', 
                          top: 0, 
                          bottom: 0, 
                          left: 0, 
                          paddingLeft: '1rem', 
                          display: 'flex', 
                          alignItems: 'center', 
                          pointerEvents: 'none',
                          color: '#94a3b8'
                        }}>
                          <FaCalendarAlt />
                        </div>
                        <input
                          type="date"
                          name="date_of_birth"
                          value={formData.date_of_birth}
                          onChange={handleChange}
                          style={{ 
                            display: 'block', 
                            width: '100%', 
                            padding: '0.75rem 1rem 0.75rem 3rem',
                            border: '1px solid #cbd5e1',
                            borderRadius: '0.5rem', 
                            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', 
                            outline: 'none',
                            fontSize: '0.95rem',
                            transition: 'all 0.2s'
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ 
                        display: 'block', 
                        fontSize: '0.95rem', 
                        fontWeight: '500', 
                        color: '#334155', 
                        marginBottom: '0.5rem'
                      }}>
                        Gender <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <div style={{ position: 'relative' }}>
                        <div style={{ 
                          position: 'absolute', 
                          top: 0, 
                          bottom: 0, 
                          left: 0, 
                          paddingLeft: '1rem', 
                          display: 'flex', 
                          alignItems: 'center', 
                          pointerEvents: 'none',
                          color: '#94a3b8'
                        }}>
                          <FaVenusMars />
                        </div>
                        <select
                          name="gender"
                          value={formData.gender}
                          onChange={handleChange}
                          style={{ 
                            display: 'block', 
                            width: '100%', 
                            padding: '0.75rem 1rem 0.75rem 3rem',
                            border: `1px solid ${errors.gender ? '#fca5a5' : '#cbd5e1'}`,
                            borderRadius: '0.5rem', 
                            outline: 'none',
                            fontSize: '0.95rem',
                            transition: 'all 0.2s'
                          }}
                        >
                          <option value="">Select Gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      {errors.gender && (
                        <p style={{ 
                          marginTop: '0.5rem', 
                          fontSize: '0.85rem', 
                          color: '#dc2626'
                        }}>
                          {errors.gender}
                        </p>
                      )}
                    </div>
                  </div>

                  <div style={{ 
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '1.5rem'
                  }}>
                    <div>
                      <label style={{ 
                        display: 'block', 
                        fontSize: '0.95rem', 
                        fontWeight: '500', 
                        color: '#334155', 
                        marginBottom: '0.5rem'
                      }}>
                        Password <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <div style={{ position: 'relative' }}>
                        <div style={{ 
                          position: 'absolute', 
                          top: 0, 
                          bottom: 0, 
                          left: 0, 
                          paddingLeft: '1rem', 
                          display: 'flex', 
                          alignItems: 'center', 
                          pointerEvents: 'none',
                          color: '#94a3b8'
                        }}>
                          <FaLock />
                        </div>
                        <input
                          type="password"
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          style={{ 
                            display: 'block', 
                            width: '100%', 
                            padding: '0.75rem 1rem 0.75rem 3rem',
                            border: `1px solid ${errors.password ? '#fca5a5' : '#cbd5e1'}`,
                            borderRadius: '0.5rem', 
                            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', 
                            outline: 'none',
                            fontSize: '0.95rem',
                            transition: 'all 0.2s'
                          }}
                        />
                      </div>
                      {errors.password && (
                        <p style={{ 
                          marginTop: '0.5rem', 
                          fontSize: '0.85rem', 
                          color: '#dc2626'
                        }}>
                          {errors.password}
                        </p>
                      )}
                    </div>

                    <div>
                      <label style={{ 
                        display: 'block', 
                        fontSize: '0.95rem', 
                        fontWeight: '500', 
                        color: '#334155', 
                        marginBottom: '0.5rem'
                      }}>
                        Confirm Password <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <div style={{ position: 'relative' }}>
                        <div style={{ 
                          position: 'absolute', 
                          top: 0, 
                          bottom: 0, 
                          left: 0, 
                          paddingLeft: '1rem', 
                          display: 'flex', 
                          alignItems: 'center', 
                          pointerEvents: 'none',
                          color: '#94a3b8'
                        }}>
                          <FaLock />
                        </div>
                        <input
                          type="password"
                          name="password_confirmation"
                          value={formData.password_confirmation}
                          onChange={handleChange}
                          style={{ 
                            display: 'block', 
                            width: '100%', 
                            padding: '0.75rem 1rem 0.75rem 3rem',
                            border: `1px solid ${errors.password_confirmation ? '#fca5a5' : '#cbd5e1'}`,
                            borderRadius: '0.5rem', 
                            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', 
                            outline: 'none',
                            fontSize: '0.95rem',
                            transition: 'all 0.2s'
                          }}
                        />
                      </div>
                      {errors.password_confirmation && (
                        <p style={{ 
                          marginTop: '0.5rem', 
                          fontSize: '0.85rem', 
                          color: '#dc2626'
                        }}>
                          {errors.password_confirmation}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '0.95rem', 
                      fontWeight: '500', 
                      color: '#334155', 
                      marginBottom: '0.5rem'
                    }}>
                      Profile Image
                    </label>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '1.5rem'
                    }}>
                      <div style={{ 
                        width: '6rem', 
                        height: '6rem', 
                        borderRadius: '50%', 
                        backgroundColor: '#f1f5f9', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        overflow: 'hidden',
                        border: '2px dashed #cbd5e1'
                      }}>
                        {previewImage ? (
                          <img 
                            src={previewImage} 
                            alt="Profile preview" 
                            style={{ 
                              width: '100%', 
                              height: '100%', 
                              objectFit: 'cover'
                            }}
                          />
                        ) : (
                          <FaUser style={{ 
                            color: '#94a3b8', 
                            fontSize: '2rem' 
                          }} />
                        )}
                      </div>
                      <label style={{ 
                        padding: '0.75rem 1.5rem', 
                        backgroundColor: '#f1f5f9', 
                        color: '#334155', 
                        borderRadius: '0.5rem', 
                        fontSize: '0.95rem', 
                        fontWeight: '500', 
                        cursor: 'pointer', 
                        transition: 'all 0.2s',
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '0.75rem',
                        border: '1px solid #e2e8f0'
                      }}>
                        <FaCamera style={{ fontSize: '1rem' }} />
                        <span>Upload Image</span>
                        <input
                          type="file"
                          name="profile_image"
                          onChange={handleImageChange}
                          accept="image/*"
                          style={{ display: 'none' }}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', height: '1.5rem' }}>
                      <input
                        id="acceptTerms"
                        name="acceptTerms"
                        type="checkbox"
                        checked={formData.acceptTerms}
                        onChange={handleChange}
                        style={{ 
                          width: '1rem', 
                          height: '1rem', 
                          color: '#395886', 
                          borderColor: errors.acceptTerms ? '#fca5a5' : '#cbd5e1',
                          borderRadius: '0.25rem',
                          marginRight: '0.75rem',
                          cursor: 'pointer'
                        }}
                      />
                    </div>
                    <div style={{ fontSize: '0.95rem' }}>
                      <label htmlFor="acceptTerms" style={{ 
                        fontWeight: '500', 
                        color: '#334155',
                        cursor: 'pointer'
                      }}>
                        I accept the <a href="/terms" style={{ 
                          color: '#395886', 
                          textDecoration: 'none'
                        }}>Terms and Conditions</a> and <a href="/privacy" style={{ 
                          color: '#395886', 
                          textDecoration: 'none'
                        }}>Privacy Policy</a>
                      </label>
                      {errors.acceptTerms && (
                        <p style={{ 
                          marginTop: '0.5rem', 
                          fontSize: '0.85rem', 
                          color: '#dc2626'
                        }}>
                          {errors.acceptTerms}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isLoading}
                    style={{ 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      padding: '0.875rem 2rem', 
                      border: 'none',
                      fontSize: '1rem', 
                      fontWeight: '500', 
                      borderRadius: '0.5rem', 
                      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', 
                      color: 'white', 
                      backgroundColor: '#395886',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {isLoading ? (
                      <>
                        <svg style={{ 
                          animation: 'spin 1s linear infinite', 
                          marginRight: '0.75rem', 
                          height: '1.25rem', 
                          width: '1.25rem', 
                          color: 'white' 
                        }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle style={{ opacity: '0.25' }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path style={{ opacity: '0.75' }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : 'Complete Registration'}
                  </motion.button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer style={{ 
        backgroundColor: 'white',
        padding: '1.5rem 2rem',
        borderTop: '1px solid #e2e8f0'
      }}>
        <div style={{ 
          maxWidth: '1400px', 
          margin: '0 auto', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          fontSize: '0.875rem',
          color: '#64748b'
        }}>
          <div>
            © {new Date().getFullYear()} Dialiease. All rights reserved.
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <a href="/privacy" style={{ 
              color: '#64748b',
              textDecoration: 'none'
            }}>
              Privacy Policy
            </a>
            <a href="/terms" style={{ 
              color: '#64748b',
              textDecoration: 'none'
            }}>
              Terms of Service
            </a>
            <a href="/contact" style={{ 
              color: '#64748b',
              textDecoration: 'none'
            }}>
              Contact Us
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default HCPRegister;