import React, { useState } from 'react';
import { 
  FaTimes, FaCalendarAlt, FaPhone, FaEnvelope, 
  FaVideo, FaArchive
} from 'react-icons/fa';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../../css/outPatient.css';

const patientDetailsAdmin = ({ patient, user, onClose }) => {
  const [showTelemedOptions, setShowTelemedOptions] = useState(false);
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

  return (
    <div className="patientlist-modal-overlay">
      <div className="patientlist-modal patientlist-modal-enhanced">
        <div className="patientlist-modal-header">
          <h2 className="patientlist-modal-title">
            {patient.first_name} {patient.last_name}'s Profile
          </h2>
          <div className="patientlist-modal-actions">
            <button 
              className="patientlist-modal-action-btn"
              onClick={() => setShowTelemedOptions(!showTelemedOptions)}
              title="Start Video Consultation"
            >
              <FaVideo />
            </button>
            <button 
              className="patientlist-modal-close"
              onClick={onClose}
            >
              <FaTimes />
            </button>
          </div>
          
          {showTelemedOptions && (
            <div className="patientlist-telemed-options">
              <button 
                className="patientlist-telemed-option"
                onClick={startVideoConsultation}
              >
                <FaVideo /> Start Video Consultation
              </button>
            </div>
          )}
        </div>
        
        <div className="patientlist-modal-body">
          <div className="patientlist-modal-tabs">
            <button className="patientlist-modal-tab active">Overview</button>
          </div>
          
          <div className="patientlist-modal-sections">
            <div className="patientlist-modal-section">
              <h3 className="patientlist-modal-section-title">
                Basic Information
              </h3>
              <div className="patientlist-modal-grid">
                <div className="patientlist-modal-field">
                  <span className="patientlist-modal-label">Hospital Number:</span>
                  <span className="patientlist-modal-value">
                    {patient.hospitalNumber || 'N/A'}
                  </span>
                </div>
                <div className="patientlist-modal-field">
                  <span className="patientlist-modal-label">Full Name:</span>
                  <span className="patientlist-modal-value">
                    {`${patient.first_name} ${patient.middle_name || ''} ${patient.last_name}`.trim() || 'N/A'}
                  </span>
                </div>
                <div className="patientlist-modal-field">
                  <span className="patientlist-modal-label">Date of Birth:</span>
                  <span className="patientlist-modal-value">
                    {patient.date_of_birth ? new Date(patient.date_of_birth).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="patientlist-modal-field">
                  <span className="patientlist-modal-label">Gender:</span>
                  <span className="patientlist-modal-value">{patient.gender || 'N/A'}</span>
                </div>
                <div className="patientlist-modal-field">
                  <span className="patientlist-modal-label">Email:</span>
                  <span className="patientlist-modal-value">
                    {patient.email || 'N/A'}
                    {patient.email && (
                      <button 
                        className="patientlist-modal-icon-btn"
                        onClick={() => window.open(`mailto:${patient.email}`)}
                      >
                        <FaEnvelope />
                      </button>
                    )}
                  </span>
                </div>
                <div className="patientlist-modal-field">
                  <span className="patientlist-modal-label">Phone:</span>
                  <span className="patientlist-modal-value">
                    {patient.phone_number || 'N/A'}
                    {patient.phone_number && (
                      <button 
                        className="patientlist-modal-icon-btn"
                        onClick={() => window.open(`tel:${patient.phone_number}`)}
                      >
                        <FaPhone />
                      </button>
                    )}
                  </span>
                </div>
                {/* <div className="patientlist-modal-field">
                  <span className="patientlist-modal-label">Address:</span>
                  <span className="patientlist-modal-value">{patient.EmpAddress || 'N/A'}</span>
                </div> */}
                <div className="patientlist-modal-field">
                  <span className="patientlist-modal-label">Status:</span>
                  <span className="patientlist-modal-value">
                    <span className={`patientlist-status-badge ${patient.AccStatus === 'active' ? 'active' : 'inactive'}`}>
                      {patient.AccStatus === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="patientlist-modal-footer">
          <button 
            className="patientlist-modal-button patientlist-modal-button-danger"
            onClick={archivePatient}
          >
            <FaArchive /> Archive Patient
          </button>
        </div>
      </div>
    </div>
  );
};

export default patientDetailsAdmin;