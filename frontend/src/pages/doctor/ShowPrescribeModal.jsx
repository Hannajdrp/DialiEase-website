import React, { useState } from 'react';
import { FaTimes, FaFilePdf, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../../api/axios';

const ShowPrescribeModal = ({ 
    isOpen, 
    onClose, 
    patientId,
    patientName,
    medicines, 
    pdData, 
    additionalInstructions 
}) => {
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);
const handleSubmit = async () => {
    try {
        setIsSaving(true);
        setError(null);
        
        // Validate required fields
        if (!patientId) {
            throw new Error('Patient ID is missing');
        }

        if (!medicines || medicines.length === 0) {
            throw new Error('At least one medicine is required');
        }

        // Prepare medicines data
        const formattedMedicines = medicines.map(med => ({
            id: med.id ? parseInt(med.id) : null,
            name: med.name || 'Unnamed Medicine',
            dosage: med.dosage?.toString() || 'Not specified',
            frequency: med.frequency?.toString() || 'Not specified',
            duration: med.duration?.toString() || 'Not specified'
        }));

        // Prepare PD data if exists
        let formattedPdData = null;
        if (pdData) {
            formattedPdData = {
                system: pdData.system || '',
                totalExchanges: pdData.totalExchanges || '',
                dwellTime: pdData.dwellTime || '',
                first: pdData.first || '',
                second: pdData.second || '',
                third: pdData.third || '',
                fourth: pdData.fourth || '',
                fifth: pdData.fifth || '',
                sixth: pdData.sixth || '',
                bags: pdData.bags?.map(bag => ({
                    percentage: bag.percentage || '',
                    count: bag.count || ''
                })) || []
            };
        }

        // Prepare the complete payload
        const payload = {
            patient_id: parseInt(patientId),
            medicines: formattedMedicines,
            additional_instructions: additionalInstructions || '',
            pd_data: formattedPdData
        };

        console.log('Submitting prescription:', payload); // Debug log

        const response = await api.post('/prescriptions/generate', payload, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}` // Ensure auth token is sent
            }
        });

        if (!response.data.success) {
            throw new Error(response.data.message || 'Failed to save prescription');
        }

        // Show success message
        toast.success('Prescription saved successfully!', {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
        });

        // Close modal and trigger refresh if needed
        onClose(true);

    } catch (err) {
        console.error('Prescription submission error:', err);
        
        // Handle different error types
        let errorMessage = 'Failed to save prescription';
        
        if (err.response) {
            // Server responded with error status
            if (err.response.status === 422) {
                // Validation errors
                errorMessage = Object.values(err.response.data.errors || {})
                    .flat()
                    .join('\n');
            } else {
                errorMessage = err.response.data.message || err.message;
            }
        } else if (err.request) {
            // Request was made but no response
            errorMessage = 'No response from server. Please check your connection.';
        } else {
            // Other errors
            errorMessage = err.message;
        }

        setError(errorMessage);
        
        toast.error(`Error: ${errorMessage}`, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
        });

    } finally {
        setIsSaving(false);
    }
};

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50
        }}>
            <div style={{
                backgroundColor: 'white',
                borderRadius: '0.5rem',
                padding: '1.5rem',
                width: '100%',
                maxWidth: '56rem',
                maxHeight: '90vh',
                overflowY: 'auto'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1rem'
                }}>
                    <h2 style={{
                        fontSize: '1.25rem',
                        fontWeight: 'bold'
                    }}>Review Prescription for {patientName}</h2>
                    <button 
                        onClick={() => {
                            setError(null);
                            onClose(false);
                        }} 
                        style={{
                            color: '#6b7280',
                            cursor: 'pointer'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.color = '#374151'}
                    >
                        <FaTimes size={20} />
                    </button>
                </div>

                {/* Error Message Display */}
                {error && (
                    <div style={{
                        backgroundColor: '#fef2f2',
                        color: '#b91c1c',
                        padding: '1rem',
                        borderRadius: '0.375rem',
                        marginBottom: '1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        <FaExclamationTriangle />
                        <span>{error}</span>
                    </div>
                )}

                <div style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{
                        fontSize: '1.125rem',
                        fontWeight: 600,
                        marginBottom: '0.5rem'
                    }}>Prescribed Medications</h3>
                    <div style={{
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.5rem',
                        overflow: 'hidden'
                    }}>
                        <table style={{ minWidth: '100%' }}>
                            <thead style={{ backgroundColor: '#f3f4f6' }}>
                                <tr>
                                    <th style={{ padding: '0.5rem 1rem', textAlign: 'left' }}>No.</th>
                                    <th style={{ padding: '0.5rem 1rem', textAlign: 'left' }}>Medicine</th>
                                    <th style={{ padding: '0.5rem 1rem', textAlign: 'left' }}>Dosage</th>
                                    <th style={{ padding: '0.5rem 1rem', textAlign: 'left' }}>Frequency</th>
                                    <th style={{ padding: '0.5rem 1rem', textAlign: 'left' }}>Duration</th>
                                </tr>
                            </thead>
                            <tbody>
                                {medicines.map((medicine, index) => (
                                    <tr key={index} style={{ borderTop: '1px solid #e5e7eb' }}>
                                        <td style={{ padding: '0.5rem 1rem' }}>{index + 1}</td>
                                        <td style={{ padding: '0.5rem 1rem' }}>{medicine.name}</td>
                                        <td style={{ padding: '0.5rem 1rem' }}>{medicine.dosage || '-'}</td>
                                        <td style={{ padding: '0.5rem 1rem' }}>{medicine.frequency || '-'}</td>
                                        <td style={{ padding: '0.5rem 1rem' }}>{medicine.duration || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {pdData && (
                    <div style={{ marginBottom: '1.5rem' }}>
                        <h3 style={{
                            fontSize: '1.125rem',
                            fontWeight: 600,
                            marginBottom: '0.5rem'
                        }}>PD Solution Information</h3>
                        <div style={{
                            backgroundColor: '#f9fafb',
                            padding: '1rem',
                            borderRadius: '0.5rem'
                        }}>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                                gap: '1rem',
                                marginBottom: '1rem'
                            }}>
                                <div>
                                    <p style={{ fontSize: '0.875rem', color: '#4b5563' }}>System</p>
                                    <p>{pdData.system || '-'}</p>
                                </div>
                                <div>
                                    <p style={{ fontSize: '0.875rem', color: '#4b5563' }}>Total Exchanges</p>
                                    <p>{pdData.totalExchanges || '-'}</p>
                                </div>
                                <div>
                                    <p style={{ fontSize: '0.875rem', color: '#4b5563' }}>Dwell Time</p>
                                    <p>{pdData.dwellTime ? `${pdData.dwellTime} hours` : '-'}</p>
                                </div>
                            </div>
                            
                            <h4 style={{ fontWeight: 500, marginBottom: '0.5rem' }}>Exchange Schedule</h4>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ minWidth: '100%', border: '1px solid #e5e7eb' }}>
                                    <thead style={{ backgroundColor: '#f3f4f6' }}>
                                        <tr>
                                            <th style={{ padding: '0.5rem 1rem', border: '1px solid #e5e7eb' }}>Dwell Time</th>
                                            <th style={{ padding: '0.5rem 1rem', border: '1px solid #e5e7eb' }}>1st</th>
                                            <th style={{ padding: '0.5rem 1rem', border: '1px solid #e5e7eb' }}>2nd</th>
                                            <th style={{ padding: '0.5rem 1rem', border: '1px solid #e5e7eb' }}>3rd</th>
                                            <th style={{ padding: '0.5rem 1rem', border: '1px solid #e5e7eb' }}>4th</th>
                                            <th style={{ padding: '0.5rem 1rem', border: '1px solid #e5e7eb' }}>5th</th>
                                            <th style={{ padding: '0.5rem 1rem', border: '1px solid #e5e7eb' }}>6th</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td style={{ padding: '0.5rem 1rem', border: '1px solid #e5e7eb' }}>{pdData.dwellTime ? `${pdData.dwellTime} hours` : '-'}</td>
                                            <td style={{ padding: '0.5rem 1rem', border: '1px solid #e5e7eb' }}>{pdData.first || '-'}</td>
                                            <td style={{ padding: '0.5rem 1rem', border: '1px solid #e5e7eb' }}>{pdData.second || '-'}</td>
                                            <td style={{ padding: '0.5rem 1rem', border: '1px solid #e5e7eb' }}>{pdData.third || '-'}</td>
                                            <td style={{ padding: '0.5rem 1rem', border: '1px solid #e5e7eb' }}>{pdData.fourth || '-'}</td>
                                            <td style={{ padding: '0.5rem 1rem', border: '1px solid #e5e7eb' }}>{pdData.fifth || '-'}</td>
                                            <td style={{ padding: '0.5rem 1rem', border: '1px solid #e5e7eb' }}>{pdData.sixth || '-'}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            
                            {pdData.bags?.length > 0 && (
                                <div style={{ marginTop: '1rem' }}>
                                    <h4 style={{ fontWeight: 500, marginBottom: '0.5rem' }}>Solutions</h4>
                                    <ul style={{ listStyleType: 'disc', paddingLeft: '1.25rem' }}>
                                        {pdData.bags.map((bag, index) => (
                                            <li key={index}>
                                                {bag.percentage ? `${bag.percentage}% - ` : ''}{bag.count} bags
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {additionalInstructions && (
                    <div style={{ marginBottom: '1.5rem' }}>
                        <h3 style={{
                            fontSize: '1.125rem',
                            fontWeight: 600,
                            marginBottom: '0.5rem'
                        }}>Additional Instructions</h3>
                        <div style={{
                            backgroundColor: '#f9fafb',
                            padding: '1rem',
                            borderRadius: '0.5rem'
                        }}>
                            <p>{additionalInstructions}</p>
                        </div>
                    </div>
                )}

                <div style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '0.75rem',
                    marginTop: '1.5rem'
                }}>
                    <button
                        onClick={() => {
                            setError(null);
                            onClose(false);
                        }}
                        style={{
                            padding: '0.5rem 1rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '0.375rem',
                            cursor: 'pointer'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSaving}
                        style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: '#2563eb',
                            color: 'white',
                            borderRadius: '0.375rem',
                            cursor: isSaving ? 'not-allowed' : 'pointer',
                            opacity: isSaving ? 0.5 : 1,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                        onMouseOver={(e) => !isSaving && (e.currentTarget.style.backgroundColor = '#1d4ed8')}
                        onMouseOut={(e) => !isSaving && (e.currentTarget.style.backgroundColor = '#2563eb')}
                    >
                        {isSaving ? (
                            'Sending...'
                        ) : (
                            <>
                                <FaCheckCircle />
                                Send to Patient
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ShowPrescribeModal;