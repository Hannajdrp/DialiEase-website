import React from 'react';
import { FaCheck, FaUser, FaFilePdf, FaInfoCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const StaffRegistrationCompleteModal = ({ 
  registrationDetails, 
  onClose, 
  onDownloadCertificate,
  onRegisterAnother
}) => {
  const navigate = useNavigate();

  const formatDisplayDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const handleSeeList = () => {
    onClose(); // Close the modal first
    navigate('/staff/OutpatientList'); // Navigate to OutpatientList
  };

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
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        width: '100%',
        maxWidth: '600px',
        padding: '30px',
        boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        <div style={{ 
          textAlign: 'center',
          marginBottom: '30px'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: '#477977',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            fontSize: '36px'
          }}>
            <FaCheck />
          </div>
          <h2 style={{ 
            color: '#395886',
            marginBottom: '10px',
            fontSize: '24px'
          }}>
            Patient Registration Complete
          </h2>
          <p style={{ 
            color: '#666',
            fontSize: '16px',
            marginBottom: '0'
          }}>
            The patient has been successfully registered in the system.
          </p>
        </div>
        
        <div style={{ 
          backgroundColor: '#f5f7fa',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '30px'
        }}>
          <h3 style={{ 
            color: '#395886',
            marginTop: '0',
            marginBottom: '15px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '18px'
          }}>
            <FaUser /> Patient Details
          </h3>
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '15px'
          }}>
            <div>
              <div style={{ 
                fontWeight: '500',
                color: '#555',
                marginBottom: '5px',
                fontSize: '14px'
              }}>
                Hospital Number:
              </div>
              <div style={{ 
                color: '#395886',
                fontWeight: 'bold',
                fontSize: '16px'
              }}>
                {registrationDetails.hospitalNumber}
              </div>
            </div>
            <div>
              <div style={{ 
                fontWeight: '500',
                color: '#555',
                marginBottom: '5px',
                fontSize: '14px'
              }}>
                Patient Name:
              </div>
              <div style={{ color: '#333', fontSize: '14px' }}>
                {registrationDetails.patientName}
              </div>
            </div>
            <div>
              <div style={{ 
                fontWeight: '500',
                color: '#555',
                marginBottom: '5px',
                fontSize: '14px'
              }}>
                Email Address:
              </div>
              <div style={{ color: '#333', fontSize: '14px' }}>
                {registrationDetails.email}
              </div>
            </div>
            <div>
              <div style={{ 
                fontWeight: '500',
                color: '#555',
                marginBottom: '5px',
                fontSize: '14px'
              }}>
                Password Status:
              </div>
              <div style={{ 
                color: '#477977',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '14px'
              }}>
                <FaCheck /> Sent to patient's email
              </div>
            </div>
          </div>
        </div>
        
        <div style={{ 
          backgroundColor: '#e8f5e9',
          padding: '12px',
          borderRadius: '6px',
          color: '#2e7d32',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '20px',
          fontSize: '14px'
        }}>
          <FaInfoCircle />
          The patient will receive automated reminders for their appointments.
        </div>
        
        <div style={{ 
          display: 'flex',
          flexDirection: 'column',
          gap: '15px'
        }}>

          
          <button 
            onClick={onRegisterAnother}
            style={{
              backgroundColor: '#477977',
              color: 'white',
              border: 'none',
              padding: '12px',
              borderRadius: '5px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Register Another Patient
          </button>
          
          <button 
            onClick={handleSeeList}
            style={{
              backgroundColor: 'transparent',
              color: '#395886',
              border: '1px solid #395886',
              padding: '12px',
              borderRadius: '5px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            See the List
          </button>
        </div>
      </div>
    </div>
  );
};

export default StaffRegistrationCompleteModal;