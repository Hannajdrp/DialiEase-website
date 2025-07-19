import React, { useState } from 'react';
import { 
  FaTimes, FaCalendarAlt, FaEnvelope, 
  FaVideo, FaArchive, FaUser, FaIdCard, 
  FaVenusMars, FaNotesMedical, FaFileMedicalAlt
} from 'react-icons/fa';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const PatientDetailsModal = ({ patient, user, onClose }) => {
  const [showTelemedOptions, setShowTelemedOptions] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();

  const startVideoConsultation = () => {
    if (patient.email) {
      const meetUrl = `https://meet.google.com/new?hs=191&authuser=0&email=${encodeURIComponent(patient.email)}`;
      window.open(meetUrl, '_blank');
    } else {
      alert('Patient does not have an email address');
    }
    setShowTelemedOptions(false);
  };

  const archivePatient = async () => {
    if (window.confirm(`Are you sure you want to archive ${patient.first_name} ${patient.last_name}?`)) {
      try {
        const token = localStorage.getItem('token');
        await axios.put(`http://localhost:8000/api/patients/${patient.userID}/archive`, {}, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        alert('Patient archived successfully');
        onClose();
        window.location.reload();
      } catch (err) {
        console.error('Error archiving patient:', err);
        alert('Failed to archive patient');
      }
    }
  };

  // Styles
  const styles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      padding: '20px',
    },
    modal: {
      backgroundColor: '#FFF',
      borderRadius: '12px',
      boxShadow: '0 15px 40px rgba(0, 0, 0, 0.25)',
      width: '100%',
      maxWidth: '1000px',
      maxHeight: '90vh',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    },
    header: {
      padding: '25px',
      background: '#395886',
      color: '#FFF',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'relative',
    },
    headerContent: {
      display: 'flex',
      alignItems: 'center',
      gap: '20px',
    },
    avatar: {
      width: '70px',
      height: '70px',
      borderRadius: '50%',
      backgroundColor: '#638ECB',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '2rem',
      fontWeight: 'bold',
      color: '#FFF',
    },
    headerText: {
      display: 'flex',
      flexDirection: 'column',
    },
    title: {
      margin: 0,
      fontSize: '1.8rem',
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
    },
    subtitle: {
      margin: '5px 0 0',
      fontSize: '1rem',
      fontWeight: '400',
      opacity: 0.9,
    },
    actions: {
      display: 'flex',
      gap: '15px',
    },
    actionBtn: {
      background: 'rgba(255, 255, 255, 0.15)',
      border: 'none',
      color: '#FFF',
      fontSize: '1rem',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      padding: '10px',
      borderRadius: '8px',
      transition: 'all 0.3s ease',
      ':hover': {
        background: 'rgba(255, 255, 255, 0.25)',
        transform: 'translateY(-2px)',
      },
    },
    closeBtn: {
      background: 'rgba(255, 255, 255, 0.15)',
      border: 'none',
      color: '#FFF',
      fontSize: '1rem',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      padding: '10px',
      borderRadius: '8px',
      transition: 'all 0.3s ease',
      ':hover': {
        background: 'rgba(255, 255, 255, 0.25)',
        transform: 'translateY(-2px)',
      },
    },
    telemedOptions: {
      position: 'absolute',
      right: '25px',
      top: '80px',
      backgroundColor: '#FFF',
      borderRadius: '8px',
      boxShadow: '0 5px 20px rgba(0, 0, 0, 0.15)',
      zIndex: 10,
      overflow: 'hidden',
      minWidth: '240px',
    },
    telemedOption: {
      padding: '14px 20px',
      border: 'none',
      backgroundColor: 'transparent',
      color: '#395886',
      width: '100%',
      textAlign: 'left',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      cursor: 'pointer',
      transition: 'all 0.2s',
      fontSize: '1rem',
      fontWeight: '500',
      ':hover': {
        backgroundColor: '#f0f4f8',
        color: '#477977',
      },
    },
    body: {
      padding: '0',
      overflowY: 'auto',
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
    },
    tabs: {
      display: 'flex',
      borderBottom: '1px solid #e1e5eb',
      backgroundColor: '#f8fafc',
    },
    tab: {
      padding: '16px 30px',
      border: 'none',
      backgroundColor: 'transparent',
      cursor: 'pointer',
      fontSize: '1rem',
      color: '#6c757d',
      position: 'relative',
      fontWeight: '500',
      transition: 'all 0.2s',
    },
    activeTab: {
      color: '#395886',
      fontWeight: '600',
    },
    activeTabIndicator: {
      position: 'absolute',
      bottom: '-1px',
      left: '30px',
      right: '30px',
      height: '3px',
      backgroundColor: '#477977',
      borderRadius: '3px 3px 0 0',
    },
    content: {
      padding: '30px',
      flex: 1,
    },
    section: {
      marginBottom: '35px',
    },
    sectionTitle: {
      fontSize: '1.3rem',
      color: '#395886',
      marginBottom: '20px',
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      paddingBottom: '10px',
      borderBottom: '1px solid #e1e5eb',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
      gap: '30px',
    },
    card: {
      backgroundColor: '#FFF',
      borderRadius: '10px',
      padding: '25px',
      boxShadow: '0 3px 10px rgba(0, 0, 0, 0.08)',
      border: '1px solid #e1e5eb',
      transition: 'all 0.3s ease',
      ':hover': {
        transform: 'translateY(-5px)',
        boxShadow: '0 8px 20px rgba(0, 0, 0, 0.12)',
      },
    },
    cardTitle: {
      fontSize: '1.1rem',
      color: '#395886',
      marginBottom: '20px',
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
    },
    field: {
      marginBottom: '18px',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '15px',
    },
    fieldIcon: {
      color: '#477977',
      fontSize: '1.1rem',
      marginTop: '3px',
      flexShrink: 0,
    },
    fieldContent: {
      flex: 1,
    },
    label: {
      display: 'block',
      fontSize: '0.85rem',
      color: '#6c757d',
      marginBottom: '8px',
      fontWeight: '500',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    },
    value: {
      fontSize: '1.1rem',
      color: '#2d3748',
      fontWeight: '500',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
    },
    iconBtn: {
      background: 'none',
      border: 'none',
      color: '#638ECB',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      padding: '0',
      transition: 'all 0.2s',
      ':hover': {
        color: '#477977',
        transform: 'scale(1.1)',
      },
    },
    statusBadge: {
      display: 'inline-block',
      padding: '8px 15px',
      borderRadius: '20px',
      fontSize: '0.85rem',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    },
    activeStatus: {
      backgroundColor: '#e6f6f5',
      color: '#477977',
      border: '1px solid #b8d8d7',
    },
    inactiveStatus: {
      backgroundColor: '#fae6e8',
      color: '#d33f49',
      border: '1px solid #f0c0c4',
    },
    footer: {
      padding: '20px 30px',
      borderTop: '1px solid #e1e5eb',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: '#f8fafc',
    },
    button: {
      padding: '12px 25px',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      fontSize: '1rem',
      fontWeight: '600',
      transition: 'all 0.2s ease',
      boxShadow: '0 3px 8px rgba(0, 0, 0, 0.1)',
    },
    primaryButton: {
      backgroundColor: '#477977',
      color: '#FFF',
      ':hover': {
        backgroundColor: '#3a6563',
        transform: 'translateY(-2px)',
        boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)',
      },
    },
    dangerButton: {
      backgroundColor: '#fae6e8',
      color: '#d33f49',
      ':hover': {
        backgroundColor: '#f5cdd1',
        transform: 'translateY(-2px)',
        boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)',
      },
    },
    // Responsive adjustments
    '@media (maxWidth: 768px)': {
      modal: {
        width: '95%',
        maxHeight: '95vh',
      },
      header: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '15px',
      },
      headerContent: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '15px',
      },
      actions: {
        width: '100%',
        justifyContent: 'flex-end',
      },
      grid: {
        gridTemplateColumns: '1fr',
      },
      card: {
        padding: '20px',
      },
      content: {
        padding: '20px',
      },
    },
  };

  // Get initials for avatar
  const getInitials = (name) => {
    return name.split(' ').map(part => part[0]).join('').toUpperCase();
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <div style={styles.headerContent}>
            <div style={styles.avatar}>
              {getInitials(`${patient.first_name} ${patient.last_name}`)}
            </div>
            <div style={styles.headerText}>
              <h2 style={styles.title}>
                {patient.first_name} {patient.last_name}
              </h2>
              <p style={styles.subtitle}>
                {patient.hospitalNumber ? `Hospital Number: ${patient.hospitalNumber}` : 'Patient Profile'}
              </p>
            </div>
          </div>
          <div style={styles.actions}>
            <button 
              style={styles.actionBtn}
              onClick={() => setShowTelemedOptions(!showTelemedOptions)}
              title="Start Video Consultation"
            >
              <FaVideo /> <span style={{ marginLeft: '8px' }}>Consult</span>
            </button>
            <button 
              style={styles.closeBtn}
              onClick={onClose}
            >
              <FaTimes />
            </button>
          </div>
          
          {showTelemedOptions && (
            <div style={styles.telemedOptions}>
              <button 
                style={styles.telemedOption}
                onClick={startVideoConsultation}
              >
                <FaVideo /> Start Video Consultation
              </button>
            </div>
          )}
        </div>
        
        <div style={styles.body}>
          <div style={styles.tabs}>
            <button 
              style={{ ...styles.tab, ...(activeTab === 'overview' ? styles.activeTab : {}) }}
              onClick={() => setActiveTab('overview')}
            >
              Overview
              {activeTab === 'overview' && <span style={styles.activeTabIndicator}></span>}
            </button>
            <button 
              style={{ ...styles.tab, ...(activeTab === 'medical' ? styles.activeTab : {}) }}
              onClick={() => setActiveTab('medical')}
            >
              Medical Records
              {activeTab === 'medical' && <span style={styles.activeTabIndicator}></span>}
            </button>
          </div>
          
          <div style={styles.content}>
            {activeTab === 'overview' ? (
              <div>
                <div style={styles.section}>
                  <h3 style={styles.sectionTitle}>
                    <FaUser /> Personal Information
                  </h3>
                  <div style={styles.grid}>
                    {/* Identification Card */}
                    <div style={styles.card}>
                      <h4 style={styles.cardTitle}>
                        <FaIdCard /> Identification
                      </h4>
                      <div style={styles.field}>
                        <FaIdCard style={styles.fieldIcon} />
                        <div style={styles.fieldContent}>
                          <span style={styles.label}>Hospital Number</span>
                          <span style={styles.value}>
                            {patient.hospitalNumber || 'Not assigned'}
                          </span>
                        </div>
                      </div>
                      
                      <div style={styles.field}>
                        <FaUser style={styles.fieldIcon} />
                        <div style={styles.fieldContent}>
                          <span style={styles.label}>Full Name</span>
                          <span style={styles.value}>
                            {`${patient.first_name} ${patient.middle_name || ''} ${patient.last_name}`.trim()}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Demographics Card */}
                    <div style={styles.card}>
                      <h4 style={styles.cardTitle}>
                        <FaVenusMars /> Demographics
                      </h4>
                      <div style={styles.field}>
                        <FaCalendarAlt style={styles.fieldIcon} />
                        <div style={styles.fieldContent}>
                          <span style={styles.label}>Date of Birth</span>
                          <span style={styles.value}>
                            {patient.date_of_birth ? new Date(patient.date_of_birth).toLocaleDateString() : 'Not specified'}
                          </span>
                        </div>
                      </div>
                      
                      <div style={styles.field}>
                        <FaVenusMars style={styles.fieldIcon} />
                        <div style={styles.fieldContent}>
                          <span style={styles.label}>Gender</span>
                          <span style={styles.value}>
                            {patient.gender || 'Not specified'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Contact Card */}
                    <div style={styles.card}>
                      <h4 style={styles.cardTitle}>
                        <FaEnvelope /> Contact
                      </h4>
                      <div style={styles.field}>
                        <FaEnvelope style={styles.fieldIcon} />
                        <div style={styles.fieldContent}>
                          <span style={styles.label}>Email Address</span>
                          <span style={styles.value}>
                            {patient.email || 'Not provided'}
                            {patient.email && (
                              <button 
                                style={styles.iconBtn}
                                onClick={() => window.open(`mailto:${patient.email}`)}
                              >
                                <FaEnvelope />
                              </button>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Status Card */}
                    <div style={styles.card}>
                      <h4 style={styles.cardTitle}>
                        <FaFileMedicalAlt /> Status
                      </h4>
                      <div style={styles.field}>
                        <div style={styles.fieldContent}>
                          <span style={styles.label}>Account Status</span>
                          <span style={styles.value}>
                            <span style={{ 
                              ...styles.statusBadge, 
                              ...(patient.AccStatus === 'active' ? styles.activeStatus : styles.inactiveStatus)
                            }}>
                              {patient.AccStatus === 'active' ? 'Active' : 'Inactive'}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>
                  <FaNotesMedical /> Medical Records
                </h3>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  minHeight: '200px',
                  color: '#6c757d',
                  fontSize: '1.1rem'
                }}>
                  Medical records would be displayed here
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div style={styles.footer}>
          <button 
            style={{ ...styles.button, ...styles.dangerButton }}
            onClick={archivePatient}
          >
            <FaArchive /> Archive Patient
          </button>
        </div>
      </div>
    </div>
  );
};

export default PatientDetailsModal;