import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  FaCheckCircle, FaFileSignature, FaLock, FaShieldAlt, FaUserShield, 
  FaBalanceScale, FaUserMd, FaExclamationTriangle, FaInfoCircle, 
  FaUser, FaWeight, FaCogs, FaBan, FaSyncAlt, FaPhone, FaEnvelope,
  FaArrowRight
} from 'react-icons/fa';

import termsImage from '../assets/images/contract.JPG';
import contactImage from '../assets/images/contact.JPG';

const TermsAndConditions = ({ patient, onAgree }) => {
  const [loading, setLoading] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [activeSection, setActiveSection] = useState('privacy');
  const navigate = useNavigate();

  const colors = {
    primary: '#2c7873',
    secondary: '#6fb98f',
    accent: '#004445',
    white: '#FFFFFF',
    light: '#f8f9fa',
    lightBg: '#F5F8FC',
    dark: '#343a40',
    alert: '#FF6B6B',
    warning: '#FFA500',
    success: '#4CAF50',
    info: '#17a2b8',
    gradientStart: '#2c7873',
    gradientEnd: '#004445'
  };

  const handleAgree = async () => {
    if (!accepted) {
      toast.warning('Please accept the privacy policy and terms to continue');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/patient/accept-terms', {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        toast.success('Privacy policy and terms accepted successfully!');
        onAgree();
        navigate('/patient/PatientDashboard');
      } else {
        toast.error(response.data.message || 'Failed to accept terms');
      }
    } catch (error) {
      console.error('Error accepting terms:', error);
      toast.error(error.response?.data?.message || 'Failed to accept terms');
    } finally {
      setLoading(false);
    }
  };

  const sections = {
    privacy: {
      title: 'Privacy Policy',
      icon: <FaShieldAlt />,
      image: contactImage 
    },
    terms: {
      title: 'Terms & Conditions',
      icon: <FaBalanceScale />,
      image: termsImage
    },
    contact: {
      title: 'Contact Information',
      icon: <FaEnvelope />,
      image: contactImage
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: colors.lightBg,
      padding: '0',
      position: 'relative',
      marginTop: '320px',
    }}>
      {/* Hero Section */}
      <div style={{
        background: `linear-gradient(rgba(44, 120, 115, 0.8), rgba(44, 120, 115, 0.8)), url(${contactImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: colors.white,
        padding: '80px 20px',
        textAlign: 'center'
      }}>
        <h1 style={{
          fontSize: '42px',
          fontWeight: '700',
          marginBottom: '20px',
          textShadow: '0 2px 4px rgba(0,0,0,0.3)'
        }}>
          Welcome to DialiEase
        </h1>
        <p style={{
          fontSize: '20px',
          maxWidth: '800px',
          margin: '0 auto 30px',
          lineHeight: '1.6'
        }}>
          Before you begin, please review our Privacy Policy and Terms of Use to understand how we protect and use your information.
        </p>
      </div>

      {/* Main Content */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '40px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '40px'
      }}>
        {/* Navigation Tabs */}
        <div style={{
          display: 'flex',
          gap: '10px',
          borderBottom: `1px solid ${colors.light}`,
          paddingBottom: '10px'
        }}>
          {Object.keys(sections).map((key) => (
            <button
              key={key}
              onClick={() => setActiveSection(key)}
              style={{
                padding: '12px 24px',
                backgroundColor: activeSection === key ? colors.primary : 'transparent',
                color: activeSection === key ? colors.white : colors.dark,
                border: 'none',
                borderRadius: '6px 6px 0 0',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.3s ease'
              }}
            >
              {sections[key].icon}
              {sections[key].title}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div style={{
          display: 'flex',
          gap: '40px',
          alignItems: 'flex-start',
        }}>
          {/* Sidebar Image */}
          <div style={{
            width: '350px',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            flexShrink: 0,
            display: { xs: 'none', md: 'block' }
          }}>
            <img 
              src={sections[activeSection].image} 
              alt={sections[activeSection].title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          </div>

          {/* Scrollable Content */}
          <div style={{
            flex: 1,
            maxHeight: '500px',
            overflowY: 'auto',
            paddingRight: '20px',
            scrollbarWidth: 'thin',
            '::-webkit-scrollbar': {
              width: '6px'
            },
            '::-webkit-scrollbar-thumb': {
              backgroundColor: colors.primary,
              borderRadius: '3px'
            }
          }}>
            {activeSection === 'privacy' && (
              <div>
                <h2 style={{
                  color: colors.primary,
                  fontSize: '28px',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <FaShieldAlt /> Privacy Policy
                </h2>
                
                <div style={{ marginBottom: '30px' }}>
                  <p style={{ 
                    lineHeight: '1.7', 
                    fontSize: '16px',
                    marginBottom: '20px'
                  }}>
                    DialiEase respects and upholds the privacy rights of all users. This Privacy Policy outlines how we collect, use, disclose, and protect your personal and health-related information in compliance with the Data Privacy Act of 2012 (Republic Act No. 10173) and other applicable laws of the Republic of the Philippines.
                  </p>
                  
                  <div style={{ 
                    backgroundColor: colors.lightBg,
                    borderRadius: '8px',
                    padding: '20px',
                    marginBottom: '20px'
                  }}>
                    <h3 style={{ 
                      color: colors.accent,
                      fontSize: '20px',
                      marginBottom: '15px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}>
                      <FaInfoCircle /> Information We Collect
                    </h3>
                    <p style={{ marginBottom: '15px' }}>
                      We collect several types of information to provide and improve our services:
                    </p>
                    
                    <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ color: colors.accent, marginBottom: '10px' }}>Personal Information</h4>
                        <ul style={{ paddingLeft: '20px' }}>
                          <li>Full name</li>
                          <li>Contact details</li>
                          <li>Demographic information</li>
                          <li>Account credentials</li>
                        </ul>
                      </div>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ color: colors.accent, marginBottom: '10px' }}>Health Information</h4>
                        <ul style={{ paddingLeft: '20px' }}>
                          <li>Dialysis treatment data</li>
                          <li>Medical history</li>
                          <li>Vital signs</li>
                          <li>Medication records</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ 
                    backgroundColor: colors.lightBg,
                    borderRadius: '8px',
                    padding: '20px'
                  }}>
                    <h3 style={{ 
                      color: colors.accent,
                      fontSize: '20px',
                      marginBottom: '15px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}>
                      <FaLock /> Data Security
                    </h3>
                    <p style={{ marginBottom: '15px' }}>
                      We implement robust security measures to protect your information:
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
                      <div style={{
                        backgroundColor: colors.white,
                        padding: '15px',
                        borderRadius: '8px',
                        flex: '1 1 200px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                      }}>
                        <h4 style={{ color: colors.primary, marginBottom: '10px' }}>Encryption</h4>
                        <p>All data is encrypted in transit and at rest using industry-standard protocols.</p>
                      </div>
                      <div style={{
                        backgroundColor: colors.white,
                        padding: '15px',
                        borderRadius: '8px',
                        flex: '1 1 200px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                      }}>
                        <h4 style={{ color: colors.primary, marginBottom: '10px' }}>Access Controls</h4>
                        <p>Strict role-based access ensures only authorized personnel can view your data.</p>
                      </div>
                      <div style={{
                        backgroundColor: colors.white,
                        padding: '15px',
                        borderRadius: '8px',
                        flex: '1 1 200px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                      }}>
                        <h4 style={{ color: colors.primary, marginBottom: '10px' }}>Audit Logs</h4>
                        <p>All access to your health records is logged and monitored for security.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'terms' && (
              <div>
                <h2 style={{
                  color: colors.primary,
                  fontSize: '28px',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <FaBalanceScale /> Terms & Conditions
                </h2>
                
                <div style={{ marginBottom: '30px' }}>
                  <div style={{ 
                    backgroundColor: colors.lightBg,
                    borderRadius: '8px',
                    padding: '20px',
                    marginBottom: '20px'
                  }}>
                    <h3 style={{ 
                      color: colors.accent,
                      fontSize: '20px',
                      marginBottom: '15px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}>
                      <FaInfoCircle /> Service Description
                    </h3>
                    <p style={{ marginBottom: '15px' }}>
                      DialiEase provides digital tools to support peritoneal dialysis patients, including:
                    </p>
                    <ul style={{ paddingLeft: '20px', marginBottom: '15px' }}>
                      <li>Treatment tracking and monitoring</li>
                      <li>Health data visualization</li>
                      <li>Communication with healthcare providers</li>
                      <li>Educational resources</li>
                    </ul>
                    <div style={{
                      backgroundColor: '#fff8e1',
                      borderLeft: `4px solid ${colors.warning}`,
                      padding: '15px',
                      borderRadius: '4px',
                      margin: '20px 0',
                      display: 'flex',
                      gap: '15px'
                    }}>
                      <FaExclamationTriangle style={{ 
                        color: colors.warning,
                        fontSize: '24px',
                        flexShrink: 0
                      }} />
                      <div>
                        <strong>Important:</strong> DialiEase is not a substitute for professional medical care. Always consult your healthcare provider for medical advice.
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ 
                    backgroundColor: colors.lightBg,
                    borderRadius: '8px',
                    padding: '20px'
                  }}>
                    <h3 style={{ 
                      color: colors.accent,
                      fontSize: '20px',
                      marginBottom: '15px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}>
                      <FaUserShield /> User Responsibilities
                    </h3>
                    <p style={{ marginBottom: '15px' }}>
                      By using DialiEase, you agree to:
                    </p>
                    <ul style={{ paddingLeft: '20px', marginBottom: '15px' }}>
                      <li>Provide accurate and complete information</li>
                      <li>Use the service only for its intended medical purposes</li>
                      <li>Maintain the confidentiality of your account credentials</li>
                      <li>Report any unauthorized access immediately</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'contact' && (
              <div>
                <h2 style={{
                  color: colors.primary,
                  fontSize: '28px',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <FaEnvelope /> Contact Information
                </h2>
                
                <div style={{ 
                  backgroundColor: colors.lightBg,
                  borderRadius: '8px',
                  padding: '20px',
                  marginBottom: '20px'
                }}>
                  <h3 style={{ 
                    color: colors.accent,
                    fontSize: '20px',
                    marginBottom: '20px'
                  }}>
                    How to Reach Us
                  </h3>
                  
                  <div style={{ display: 'flex', gap: '30px', marginBottom: '30px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        backgroundColor: colors.white,
                        borderRadius: '8px',
                        padding: '20px',
                        height: '100%',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                      }}>
                        <h4 style={{ 
                          color: colors.primary,
                          marginBottom: '15px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px'
                        }}>
                          <FaEnvelope /> Email Support
                        </h4>
                        <p style={{ marginBottom: '10px' }}>
                          For general inquiries and support:
                        </p>
                        <a href="mailto:dialiease@gmail.com" style={{
                          color: colors.primary,
                          fontWeight: '600',
                          textDecoration: 'none',
                          ':hover': {
                            textDecoration: 'underline'
                          }
                        }}>
                          dialiease@gmail.com
                        </a>
                        <p style={{ margin: '15px 0 10px' }}>
                          Expected response time: 24-48 hours
                        </p>
                      </div>
                    </div>
                    
                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        backgroundColor: colors.white,
                        borderRadius: '8px',
                        padding: '20px',
                        height: '100%',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                      }}>
                        <h4 style={{ 
                          color: colors.primary,
                          marginBottom: '15px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px'
                        }}>
                          <FaPhone /> Phone Support
                        </h4>
                        <p style={{ marginBottom: '10px' }}>
                          For urgent matters:
                        </p>
                        <a href="tel:+639366674879" style={{
                          color: colors.primary,
                          fontWeight: '600',
                          textDecoration: 'none',
                          ':hover': {
                            textDecoration: 'underline'
                          }
                        }}>
                          +63 936 667 4879
                        </a>
                        <p style={{ margin: '15px 0 10px' }}>
                          Available Monday-Friday, 8AM-5PM
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ 
                    backgroundColor: '#e8f5e9',
                    borderLeft: `4px solid ${colors.success}`,
                    padding: '15px',
                    borderRadius: '4px'
                  }}>
                    <h4 style={{ 
                      color: colors.accent,
                      marginBottom: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}>
                      <FaInfoCircle /> Privacy Concerns
                    </h4>
                    <p>
                      For questions about data privacy or to exercise your rights under the Data Privacy Act, please contact our Data Protection Officer at <strong>dpo@dialiease.com</strong>.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Acceptance Section */}
        <div style={{ 
          backgroundColor: colors.white,
          borderRadius: '12px',
          padding: '30px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          marginTop: '20px'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'flex-start',
            gap: '20px',
            marginBottom: '20px'
          }}>
            <div style={{ 
              position: 'relative',
              marginTop: '3px'
            }}>
              <input
                type="checkbox"
                id="accept-terms"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                style={{ 
                  width: '24px',
                  height: '24px',
                  appearance: 'none',
                  border: `2px solid ${accepted ? colors.primary : '#adb5bd'}`,
                  backgroundColor: accepted ? colors.primary : colors.white,
                  borderRadius: '4px',
                  outline: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  position: 'relative',
                  ':checked': {
                    backgroundColor: colors.primary,
                    borderColor: colors.primary
                  },
                  ':hover': {
                    borderColor: accepted ? colors.primary : colors.secondary
                  }
                }}
              />
              {accepted && (
                <FaCheckCircle style={{ 
                  position: 'absolute',
                  top: '0',
                  left: '0',
                  color: colors.white,
                  fontSize: '24px',
                  pointerEvents: 'none',
                  transition: 'all 0.2s'
                }} />
              )}
            </div>
            <label htmlFor="accept-terms" style={{ 
              lineHeight: '1.6',
              fontSize: '16px',
              color: colors.dark,
              flex: 1,
              cursor: 'pointer'
            }}>
              <strong style={{ color: colors.accent }}>I acknowledge and agree</strong> that I have read and understood the Privacy Policy and Terms of Use. I consent to the collection and processing of my personal and health information as described in these documents.
            </label>
          </div>
          
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end'
          }}>
            <button
              onClick={handleAgree}
              disabled={loading || !accepted}
              style={{
                backgroundColor: accepted ? colors.primary : '#ced4da',
                color: colors.white,
                border: 'none',
                padding: '15px 40px',
                borderRadius: '8px',
                fontSize: '18px',
                fontWeight: '600',
                cursor: accepted ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                transition: 'all 0.3s ease',
                opacity: loading ? 0.8 : 1,
                boxShadow: accepted ? '0 4px 12px rgba(44, 120, 115, 0.3)' : 'none',
                ':hover': {
                  transform: accepted ? 'translateY(-2px)' : 'none',
                  boxShadow: accepted ? '0 6px 16px rgba(44, 120, 115, 0.4)' : 'none'
                }
              }}
            >
              {loading ? (
                <>
                  <FaSyncAlt style={{ animation: 'spin 1s linear infinite' }} />
                  Processing...
                </>
              ) : (
                <>
                  Accept and Continue <FaArrowRight />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;