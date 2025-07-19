import React, { useState, useEffect } from 'react';
import { saveAs } from 'file-saver';
import api from '../../api/axios';

const HCproviderAddModal = ({ showModal, setShowModal, refreshProviders }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    suffix: '',
    email: '',
    employeeNumber: '',
    gender: '',
    specialization: '',
    userLevel: '',
    newUserLevel: '',
    registrationType: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    if (formData.first_name && formData.last_name && formData.userLevel) {
      generateEmail();
    }
  }, [formData.first_name, formData.last_name, formData.userLevel]);

  const resetForm = () => {
    setFormData({
      first_name: '',
      middle_name: '',
      last_name: '',
      suffix: '',
      email: '',
      employeeNumber: '',
      gender: '',
      specialization: '',
      userLevel: '',
      newUserLevel: '',
      registrationType: ''
    });
    setErrors({});
    setApiError('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const generateEmployeeNumber = () => {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    return `EMP-${randomNum}`;
  };

  const generateEmail = () => {
    const firstInitial = formData.first_name.charAt(0).toLowerCase();
    const lastName = formData.last_name.toLowerCase().replace(/\s+/g, '');
    
    let domain = formData.userLevel === 'custom' ? 'employee' : formData.userLevel;
    
    const generatedEmail = `${firstInitial}${lastName}.${domain}@capd.com`;
    const generatedEmployeeNumber = generateEmployeeNumber();
    
    setFormData(prev => ({
      ...prev,
      email: generatedEmail,
      employeeNumber: generatedEmployeeNumber
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.first_name.trim()) newErrors.first_name = 'First name is required';
    if (!formData.last_name.trim()) newErrors.last_name = 'Last name is required';
    if (!formData.userLevel) newErrors.userLevel = 'User level is required';
    if (!formData.registrationType) newErrors.registrationType = 'Registration type is required';
    
    if (formData.userLevel === 'custom' && !formData.newUserLevel.trim()) {
      newErrors.newUserLevel = 'Please specify the new user level';
    }
    
    if (formData.registrationType === 'full-register' && !formData.gender) {
      newErrors.gender = 'Gender is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsLoading(true);
    setApiError('');

    try {
      const endpoint = formData.registrationType === 'pre-register' 
        ? 'admin/pre-register-hcprovider' 
        : 'admin/register-hcprovider';
      
      const payload = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        employeeNumber: formData.employeeNumber,
        userLevel: formData.userLevel === 'custom' ? formData.newUserLevel : formData.userLevel
      };

      if (formData.registrationType === 'full-register') {
        payload.middle_name = formData.middle_name || null;
        payload.suffix = formData.suffix || null;
        payload.gender = formData.gender;
        if (formData.userLevel !== 'custom') {
          payload.specialization = formData.specialization || null;
        }
      }

      const response = await api.post(endpoint, payload);
      
      const pdfEndpoint = formData.registrationType === 'pre-register'
        ? `admin/generate-pre-register-pdf/${response.data.userID}`
        : `admin/generate-full-register-pdf/${response.data.userID}`;
      
      const pdfResponse = await api.get(pdfEndpoint, {
        responseType: 'blob',
        params: { password: response.data.password }
      });
      
      saveAs(
        new Blob([pdfResponse.data], { type: 'application/pdf' }),
        `${formData.registrationType}_${formData.employeeNumber}.pdf`
      );
      
      alert(`Successfully ${formData.registrationType === 'pre-register' ? 'pre-registered' : 'registered'} ${formData.first_name} ${formData.last_name}`);
      refreshProviders();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Registration error:', error);
      let errorMessage = 'Registration failed';
      
      if (error.response) {
        if (error.response.status === 422) {
          errorMessage = Object.values(error.response.data.errors).join('\n');
        } else if (error.response.data?.error) {
          errorMessage = error.response.data.error;
        }
      }
      
      setApiError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!showModal) return null;

  // Styles
  const styles = {
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    },
    modalContent: {
      backgroundColor: 'var(--color-white)',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      width: '90%',
      maxWidth: '800px',
      maxHeight: '90vh',
      overflowY: 'auto',
      padding: '24px',
    },
    modalHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '24px',
      paddingBottom: '16px',
      borderBottom: '1px solid #eee',
    },
    modalTitle: {
      color: 'var(--color-primary)',
      fontSize: '24px',
      fontWeight: '600',
      margin: 0,
    },
    closeButton: {
      background: 'none',
      border: 'none',
      fontSize: '24px',
      cursor: 'pointer',
      color: '#666',
      padding: '0',
      lineHeight: '1',
    },
    errorMessage: {
      backgroundColor: '#ffebee',
      color: '#d32f2f',
      padding: '12px',
      borderRadius: '4px',
      marginBottom: '16px',
      fontSize: '14px',
    },
    formGroup: {
      marginBottom: '16px',
    },
    label: {
      display: 'block',
      marginBottom: '8px',
      color: 'var(--color-primary)',
      fontSize: '14px',
      fontWeight: '500',
    },
    input: {
      width: '100%',
      padding: '10px 12px',
      borderRadius: '4px',
      border: '1px solid #ddd',
      fontSize: '14px',
      transition: 'border-color 0.3s',
    },
    inputError: {
      borderColor: '#d32f2f',
    },
    inputReadOnly: {
      backgroundColor: '#f5f5f5',
      cursor: 'not-allowed',
    },
    select: {
      width: '100%',
      padding: '10px 12px',
      borderRadius: '4px',
      border: '1px solid #ddd',
      fontSize: '14px',
      appearance: 'none',
      backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23333333%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'right 10px center',
      backgroundSize: '12px auto',
    },
    errorText: {
      color: '#d32f2f',
      fontSize: '12px',
      marginTop: '4px',
    },
    flexContainer: {
      display: 'flex',
      gap: '20px',
      marginBottom: '16px',
      flexWrap: 'wrap',
    },
    flexItem: {
      flex: 1,
      minWidth: '300px',
    },
    buttonGroup: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '12px',
      marginTop: '24px',
    },
    button: {
      padding: '10px 20px',
      borderRadius: '4px',
      border: 'none',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.3s',
    },
    cancelButton: {
      backgroundColor: '#f0f0f0',
      color: '#333',
      border: '1px solid #ddd',
    },
    submitButton: {
      backgroundColor: 'var(--color-green)',
      color: 'var(--color-white)',
    },
    submitButtonDisabled: {
      backgroundColor: '#cccccc',
      color: '#666666',
      cursor: 'not-allowed',
    },
  };

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalContent}>
        <div style={styles.modalHeader}>
          <h2 style={styles.modalTitle}>Add Healthcare Provider</h2>
          <button 
            onClick={() => {
              setShowModal(false);
              resetForm();
            }}
            style={styles.closeButton}
          >
            &times;
          </button>
        </div>
        
        {apiError && (
          <div style={styles.errorMessage}>
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Registration Type*</label>
            <select
              name="registrationType"
              value={formData.registrationType}
              onChange={handleChange}
              style={{
                ...styles.select,
                ...(errors.registrationType ? styles.inputError : {})
              }}
            >
              <option value="">Select Registration Type</option>
              <option value="pre-register">Pre-Register</option>
              <option value="full-register">Full Register</option>
            </select>
            {errors.registrationType && <span style={styles.errorText}>{errors.registrationType}</span>}
          </div>

          <div style={styles.flexContainer}>
            <div style={styles.flexItem}>
              <div style={styles.formGroup}>
                <label style={styles.label}>First Name*</label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  style={{
                    ...styles.input,
                    ...(errors.first_name ? styles.inputError : {})
                  }}
                />
                {errors.first_name && <span style={styles.errorText}>{errors.first_name}</span>}
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Last Name*</label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  style={{
                    ...styles.input,
                    ...(errors.last_name ? styles.inputError : {})
                  }}
                />
                {errors.last_name && <span style={styles.errorText}>{errors.last_name}</span>}
              </div>

              {formData.registrationType === 'full-register' && (
                <>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Middle Name</label>
                    <input
                      type="text"
                      name="middle_name"
                      value={formData.middle_name}
                      onChange={handleChange}
                      style={styles.input}
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Suffix</label>
                    <input
                      type="text"
                      name="suffix"
                      value={formData.suffix}
                      onChange={handleChange}
                      style={styles.input}
                    />
                  </div>
                </>
              )}
            </div>

            <div style={styles.flexItem}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Employee Number</label>
                <input
                  type="text"
                  name="employeeNumber"
                  value={formData.employeeNumber}
                  readOnly
                  style={{
                    ...styles.input,
                    ...styles.inputReadOnly
                  }}
                />
              </div>

              {formData.registrationType === 'full-register' && (
                <>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Gender*</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      style={{
                        ...styles.select,
                        ...(errors.gender ? styles.inputError : {})
                      }}
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                    {errors.gender && <span style={styles.errorText}>{errors.gender}</span>}
                  </div>

                  {formData.userLevel !== 'custom' && (
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Specialization</label>
                      <input
                        type="text"
                        name="specialization"
                        value={formData.specialization}
                        onChange={handleChange}
                        style={styles.input}
                      />
                    </div>
                  )}
                </>
              )}

              <div style={styles.formGroup}>
                <label style={styles.label}>User Level*</label>
                <select
                  name="userLevel"
                  value={formData.userLevel}
                  onChange={handleChange}
                  style={{
                    ...styles.select,
                    ...(errors.userLevel ? styles.inputError : {})
                  }}
                >
                  <option value="">Select User Level</option>
                  <option value="admin">Admin</option>
                  <option value="staff">Staff</option>
                  <option value="nurse">Nurse</option>
                  <option value="distributor">Distributor</option>
                  <option value="custom">Custom Role</option>
                </select>
                {errors.userLevel && <span style={styles.errorText}>{errors.userLevel}</span>}
              </div>
            </div>
          </div>

          {formData.userLevel === 'custom' && (
            <div style={styles.formGroup}>
              <label style={styles.label}>New User Level*</label>
              <input
                type="text"
                name="newUserLevel"
                value={formData.newUserLevel}
                onChange={handleChange}
                style={{
                  ...styles.input,
                  ...(errors.newUserLevel ? styles.inputError : {})
                }}
              />
              {errors.newUserLevel && <span style={styles.errorText}>{errors.newUserLevel}</span>}
            </div>
          )}
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              readOnly
              style={{
                ...styles.input,
                ...styles.inputReadOnly
              }}
            />
          </div>
          
          <div style={styles.buttonGroup}>
            <button
              type="button"
              onClick={() => {
                setShowModal(false);
                resetForm();
              }}
              style={{
                ...styles.button,
                ...styles.cancelButton
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              style={{
                ...styles.button,
                ...styles.submitButton,
                ...(isLoading ? styles.submitButtonDisabled : {})
              }}
            >
              {isLoading ? 'Processing...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HCproviderAddModal;