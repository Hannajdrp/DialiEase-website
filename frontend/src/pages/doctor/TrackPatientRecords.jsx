import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  FiArrowLeft, 
  FiAlertTriangle, 
  FiBell, 
  FiCalendar, 
  FiFilter, 
  FiEye, 
  FiCheckCircle,
  FiXCircle,
  FiBarChart2,
  FiChevronDown,
  FiChevronUp,
  FiSearch,
  FiThermometer,
  FiDroplet,
  FiUser
} from 'react-icons/fi';
import { FaRegCalendarAlt, FaProcedures, FaRegChartBar } from 'react-icons/fa';
import { BsClipboard2Pulse } from 'react-icons/bs';
import PatientDetailModal from './PatientDetailsModal';

const TrackPatientRecords = () => {
    const navigate = useNavigate();
    const [patients, setPatients] = useState([]);
    const [adultPatients, setAdultPatients] = useState([]);
    const [pediatricPatients, setPediatricPatients] = useState([]);
    const [emergencyPatients, setEmergencyPatients] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [summary, setSummary] = useState({
        total_patients: 0,
        total_treatments: 0,
        non_compliant_patients: 0,
        fluid_retention_alerts: 0,
        abnormal_color_alerts: 0,
        severe_retention_cases: 0
    });
    const [expandedPatients, setExpandedPatients] = useState({});
    const [activeTab, setActiveTab] = useState('all');
    const [criticalAlerts, setCriticalAlerts] = useState([]);
    const [showFilters, setShowFilters] = useState(false);
    const [statsPeriod, setStatsPeriod] = useState('7d');
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [quickStats, setQuickStats] = useState({
        avgUf: 0,
        complianceRate: 0,
        alertTrend: 'down'
    });
    const [searchTimeout, setSearchTimeout] = useState(null);

    // Virtual scrolling state
    const [visiblePatients, setVisiblePatients] = useState([]);
    const [startIndex, setStartIndex] = useState(0);
    const [endIndex, setEndIndex] = useState(50);
    const patientItemHeight = 60; // Estimated height of each patient row in pixels

    const getSurname = useCallback((fullName) => {
        if (!fullName) return { givenNames: '', surname: '' };
        const surnamePrefixes = ['del', 'de la', 'van', 'van der', 'von'];
        const prefix = surnamePrefixes.find(prefix => 
            fullName.toLowerCase().includes(prefix + ' ')
        );
        
        if (prefix) {
            const prefixIndex = fullName.toLowerCase().lastIndexOf(prefix);
            if (prefixIndex > 0) {
                const givenNames = fullName.substring(0, prefixIndex - 1);
                const surname = fullName.substring(prefixIndex);
                return { givenNames, surname };
            }
        }
        
        const lastSpaceIndex = fullName.lastIndexOf(' ');
        if (lastSpaceIndex === -1) return { givenNames: '', surname: fullName };
        
        return {
            givenNames: fullName.substring(0, lastSpaceIndex),
            surname: fullName.substring(lastSpaceIndex + 1)
        };
    }, []);

    const sortPatients = useCallback((patients) => {
        return [...patients].sort((a, b) => {
            const aStats = calculatePatientStats(a);
            const bStats = calculatePatientStats(b);
            
            // Sort by severity first
            const aSeverity = aStats.severityLevel;
            const bSeverity = bStats.severityLevel;
            
            if (aSeverity !== bSeverity) {
                return bSeverity - aSeverity; // Higher severity first
            }
            
            // Then by surname
            const aSurname = getSurname(a.name).surname;
            const bSurname = getSurname(b.name).surname;
            
            return aSurname.localeCompare(bSurname);
        });
    }, [getSurname]);

    const formatNameBySurname = useCallback((fullName) => {
        if (!fullName) return '';
        const { givenNames, surname } = getSurname(fullName);
        return `${surname}, ${givenNames}`;
    }, [getSurname]);

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearch(value);
        
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }
        
        setSearchTimeout(setTimeout(() => {
            fetchTreatments();
        }, 300));
    };

    const fetchTreatments = useCallback(async () => {
        try {
            const params = new URLSearchParams();
            if (search && search.length >= 2) params.append('search', search);
            if (dateFrom) params.append('date_from', dateFrom);
            if (dateTo) params.append('date_to', dateTo);
            if (activeTab !== 'all') params.append('status', activeTab);
            params.append('stats_period', statsPeriod);
    
            const endpoint = '/doctor/patient-treatments';
    
            const response = await axios.get(`${endpoint}?${params.toString()}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Accept': 'application/json'
                }
            });
    
            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to fetch treatments');
            }
    
            const sortedPatients = sortPatients(response.data.patients);
            setPatients(sortedPatients);
            
            const adults = [];
            const pediatric = [];
            const emergency = [];
            
            sortedPatients.forEach(patient => {
                const stats = calculatePatientStats(patient);
                const age = calculateAge(patient.date_of_birth);
                
                if (stats.severityLevel >= 2) { // Severe cases
                    emergency.push(patient);
                } else if (age >= 18) {
                    adults.push(patient);
                } else {
                    pediatric.push(patient);
                }
            });
            
            setAdultPatients(adults);
            setPediatricPatients(pediatric);
            setEmergencyPatients(emergency);
            
            let totalNetUF = 0;
            let totalTreatments = 0;
            sortedPatients.forEach(patient => {
                patient.treatments.forEach(treatment => {
                    const volumeIn = treatment.VolumeIn || 0;
                    const volumeOut = treatment.VolumeOut || 0;
                    totalNetUF += (volumeOut - volumeIn);
                    totalTreatments++;
                });
            });
            
            const avgUf = totalTreatments > 0 ? Math.round(totalNetUF / totalTreatments) : 0;
            const compliantPatients = sortedPatients.length - response.data.summary.non_compliant_patients;
            const complianceRate = sortedPatients.length > 0 
                ? Math.round((compliantPatients / sortedPatients.length) * 100) 
                : 0;
            
            setQuickStats({
                avgUf,
                complianceRate,
                alertTrend: response.data.summary.fluid_retention_alerts > 0 ? 'up' : 'down'
            });
            
            setSummary({
                ...response.data.summary,
                total_net_uf: totalNetUF
            });
            
            const alerts = [];
            sortedPatients.forEach(patient => {
                const stats = calculatePatientStats(patient);
                
                if (stats.hasAbnormalColor) {
                    alerts.push({
                        type: 'color',
                        patientId: patient.patientID,
                        patientName: formatNameBySurname(patient.name),
                        message: 'Abnormal drain color detected',
                        severity: 'high'
                    });
                }
                
                if (stats.fluidRetentionAlert) {
                    alerts.push({
                        type: 'fluid',
                        patientId: patient.patientID,
                        patientName: formatNameBySurname(patient.name),
                        message: `Significant fluid retention (${stats.avgVolumeIn - stats.avgVolumeOut}mL)`,
                        severity: stats.severityLevel >= 2 ? 'critical' : 'high'
                    });
                }
                
                if (stats.complianceStatus === 'danger') {
                    alerts.push({
                        type: 'compliance',
                        patientId: patient.patientID,
                        patientName: formatNameBySurname(patient.name),
                        message: 'Non-compliance: Less than 3 treatments on some days',
                        severity: 'medium'
                    });
                }
            });
            
            setCriticalAlerts(alerts);
        } catch (error) {
            console.error('Error fetching treatments:', error);
            
            if (error.response) {
                if (error.response.status === 401) {
                    navigate('/login');
                    return;
                }
                
                setPatients([]);
                setAdultPatients([]);
                setPediatricPatients([]);
                setEmergencyPatients([]);
                setSummary({
                    total_patients: 0,
                    total_treatments: 0,
                    non_compliant_patients: 0,
                    fluid_retention_alerts: 0,
                    abnormal_color_alerts: 0,
                    severe_retention_cases: 0
                });
                
                alert(`Error: ${error.response.data.message || 'Failed to load treatments'}`);
            } else if (error.request) {
                alert('Network error - please check your connection');
            } else {
                alert(`Error: ${error.message}`);
            }
        }
    }, [search, dateFrom, dateTo, activeTab, statsPeriod, sortPatients, formatNameBySurname, navigate]);

    useEffect(() => {
        fetchTreatments();
        
        return () => {
            if (searchTimeout) {
                clearTimeout(searchTimeout);
            }
        };
    }, [dateFrom, dateTo, activeTab, statsPeriod, fetchTreatments]);

    // Virtual scroll handler
    useEffect(() => {
        const handleScroll = () => {
            const scrollContainer = document.querySelector('.patient-list-container');
            if (!scrollContainer) return;

            const scrollTop = scrollContainer.scrollTop;
            const clientHeight = scrollContainer.clientHeight;
            
            const newStartIndex = Math.floor(scrollTop / patientItemHeight);
            const newEndIndex = Math.min(
                newStartIndex + Math.ceil(clientHeight / patientItemHeight) + 10,
                patients.length
            );

            if (newStartIndex !== startIndex || newEndIndex !== endIndex) {
                setStartIndex(newStartIndex);
                setEndIndex(newEndIndex);
            }
        };

        const scrollContainer = document.querySelector('.patient-list-container');
        if (scrollContainer) {
            scrollContainer.addEventListener('scroll', handleScroll);
            return () => scrollContainer.removeEventListener('scroll', handleScroll);
        }
    }, [patients.length, startIndex, endIndex]);

    useEffect(() => {
        setVisiblePatients(patients.slice(startIndex, endIndex));
    }, [patients, startIndex, endIndex]);

    const calculateAge = (dateOfBirth) => {
        if (!dateOfBirth) return 0;
        const birthDate = new Date(dateOfBirth);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        
        return age;
    };

    const calculatePatientStats = (patient) => {
        const treatmentCount = patient.treatments.length;
        let totalVolumeIn = 0;
        let totalVolumeOut = 0;
        let hasAbnormalColor = false;
        let lastTreatmentDate = null;
        let firstTreatmentDate = null;
        let incompleteDays = 0;
        let severeRetentionDays = 0;

        const treatmentsByDay = {};
        patient.treatments.forEach(treatment => {
            totalVolumeIn += treatment.VolumeIn || 0;
            totalVolumeOut += treatment.VolumeOut || 0;
            
            const treatmentDate = new Date(treatment.treatmentDate);
            const dayKey = treatmentDate.toISOString().split('T')[0];
            
            if (!treatmentsByDay[dayKey]) {
                treatmentsByDay[dayKey] = {
                    treatments: [],
                    dailyVolumeIn: 0,
                    dailyVolumeOut: 0,
                    dailyNetUF: 0,
                    completedCount: 0,
                    dayBalance: 0,
                    retentionCount: 0
                };
            }
            
            treatmentsByDay[dayKey].treatments.push(treatment);
            treatmentsByDay[dayKey].dailyVolumeIn += treatment.VolumeIn || 0;
            treatmentsByDay[dayKey].dailyVolumeOut += treatment.VolumeOut || 0;
            
            const balance = (treatment.VolumeOut || 0) - (treatment.VolumeIn || 0);
            treatmentsByDay[dayKey].dailyNetUF += balance;
            treatmentsByDay[dayKey].dayBalance += balance;
            
            if (balance < 0) { // Fluid retention
                treatmentsByDay[dayKey].retentionCount++;
            }
            
            if (treatment.TreatmentStatus?.toLowerCase() === 'finished') {
                treatmentsByDay[dayKey].completedCount++;
            }
            
            if (!lastTreatmentDate || treatmentDate > lastTreatmentDate) {
                lastTreatmentDate = treatmentDate;
            }
            if (!firstTreatmentDate || treatmentDate < firstTreatmentDate) {
                firstTreatmentDate = treatmentDate;
            }

            const color = treatment.Color ? treatment.Color.toLowerCase() : '';
            if (color && !['clear', 'yellow', 'amber'].includes(color)) {
                hasAbnormalColor = true;
            }
        });

        const today = new Date().toISOString().split('T')[0];
        Object.entries(treatmentsByDay).forEach(([day, dayData]) => {
            if (day < today && dayData.treatments.length < 3) {
                incompleteDays++;
            }
            
            // Check for severe retention (all treatments in a day show retention)
            if (dayData.retentionCount === dayData.treatments.length && dayData.treatments.length > 0) {
                severeRetentionDays++;
            }
        });

        const avgVolumeIn = treatmentCount > 0 ? Math.round(totalVolumeIn / treatmentCount) : 0;
        const avgVolumeOut = treatmentCount > 0 ? Math.round(totalVolumeOut / treatmentCount) : 0;
        const fluidDifference = avgVolumeIn - avgVolumeOut;
        const totalNetUF = totalVolumeOut - totalVolumeIn;
        
        // Determine severity level
        let severityLevel = 0; // 0 = normal, 1 = warning, 2 = severe
        if (severeRetentionDays > 0) {
            severityLevel = 2;
        } else if (fluidDifference > 200) {
            severityLevel = 1;
        }
        
        return {
            treatmentCount,
            avgVolumeIn,
            avgVolumeOut,
            fluidDifference,
            totalNetUF,
            fluidRetentionAlert: fluidDifference > 200,
            hasAbnormalColor,
            complianceStatus: incompleteDays > 0 ? 'danger' : 'normal',
            lastTreatmentDate,
            firstTreatmentDate,
            treatmentsByDay,
            incompleteDays,
            severeRetentionDays,
            severityLevel,
            age: calculateAge(patient.date_of_birth)
        };
    };

    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const getColorClass = (color) => {
        if (!color) return '';
        color = color.toLowerCase();
        
        if (color === 'clear') return 'color-clear';
        if (color === 'yellow' || color === 'amber') return 'color-normal';
        return 'color-abnormal';
    };

    const togglePatientSection = (patientId) => {
        setExpandedPatients(prev => ({
            ...prev,
            [patientId]: !prev[patientId]
        }));
        
        if (!expandedPatients[patientId]) {
            setTimeout(() => {
                const element = document.getElementById(`patient-${patientId}`);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            }, 100);
        }
    };

    const clearFilters = () => {
        setSearch('');
        setDateFrom('');
        setDateTo('');
        setActiveTab('all');
    };

    const viewPatientDetails = (patient) => {
        setSelectedPatient(patient);
    };

    const closePatientDetails = () => {
        setSelectedPatient(null);
    };

    const calculateBalance = (volumeIn, volumeOut) => {
        const balance = volumeOut - volumeIn;
        const isPositive = balance >= 0;
        
        let formatted;
        if (isPositive) {
            formatted = `-${Math.abs(balance)}mL`;
        } else {
            formatted = `+${Math.abs(balance)}mL`;
        }
        
        return {
            value: balance,
            formatted: formatted,
            isPositive: isPositive,
            interpretation: isPositive 
                ? 'Good: Excess fluid removed' 
                : 'Warning: Fluid retention detected'
        };
    };

    const getStatusColor = (status) => {
        switch(status?.toLowerCase()) {
            case 'finished': return '#28a745';
            case 'ongoing': return '#ffc107';
            case 'scheduled': return '#17a2b8';
            case 'cancelled': return '#dc3545';
            default: return '#6c757d';
        }
    };

    const calculateDailySummary = (treatmentsByDay) => {
        const dailySummaries = [];
        
        Object.entries(treatmentsByDay).forEach(([date, dayData]) => {
            const treatments = dayData.treatments;
            const totalVolumeIn = dayData.dailyVolumeIn;
            const totalVolumeOut = dayData.dailyVolumeOut;
            const dayBalance = dayData.dayBalance;
            const retentionCount = dayData.retentionCount;
            
            const isCompleteDay = treatments.length >= 3;
            const isSevereRetention = retentionCount === treatments.length && treatments.length > 0;
            
            dailySummaries.push({
                date,
                treatments,
                totalVolumeIn,
                totalVolumeOut,
                dayBalance,
                isCompleteDay,
                isSevereRetention,
                treatmentCount: treatments.length,
                retentionCount
            });
        });
        
        dailySummaries.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        return dailySummaries;
    };

    const renderPatientSection = (title, patientsList, isEmergency = false) => {
        if (patientsList.length === 0) return null;

        return (
            <div style={{ marginBottom: '2rem' }}>
                <h3 style={{
                    padding: '1rem 1.5rem',
                    backgroundColor: isEmergency ? '#fef2f2' : '#f8f9fa',
                    borderBottom: `1px solid ${isEmergency ? '#fee2e2' : '#e1e5eb'}`,
                    margin: 0,
                    color: isEmergency ? '#b91c1c' : '#2c3e50',
                    display: 'flex',
                    alignItems: 'center'
                }}>
                    {isEmergency ? (
                        <FiAlertTriangle style={{ marginRight: '0.8rem', color: '#dc2626' }} />
                    ) : title === 'Adult Patients' ? (
                        <FiUser style={{ marginRight: '0.8rem', color: '#2563eb' }} />
                    ) : (
                        <FiUser style={{ marginRight: '0.8rem', color: '#db2777' }} />
                    )}
                    {title} ({patientsList.length})
                    {isEmergency && (
                        <span style={{
                            marginLeft: '0.8rem',
                            padding: '0.2rem 0.6rem',
                            backgroundColor: '#fee2e2',
                            color: '#b91c1c',
                            borderRadius: '9999px',
                            fontSize: '0.8rem',
                            fontWeight: '500'
                        }}>
                            Severe Fluid Retention
                        </span>
                    )}
                </h3>
                
                <div style={{ overflow: 'hidden' }}>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'minmax(300px, 3fr) 1fr 1fr 1fr',
                        padding: '1rem 1.5rem',
                        backgroundColor: isEmergency ? '#fef2f2' : '#f8f9fa',
                        borderBottom: `1px solid ${isEmergency ? '#fee2e2' : '#e1e5eb'}`,
                        fontWeight: '600',
                        color: isEmergency ? '#b91c1c' : '#2c3e50',
                        fontSize: '0.85rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                    }}>
                        <div>Patient Name</div>
                        <div style={{ textAlign: 'center' }}>Compliance</div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ marginBottom: '2px' }}>Net UF</div>
                            <div style={{ 
                                fontSize: '0.7rem',
                                fontWeight: '500',
                                color: isEmergency ? '#ef4444' : '#7f8c8d',
                                textTransform: 'none'
                            }}>
                                Ultrafiltration
                            </div>
                        </div>
                        <div style={{ textAlign: 'center' }}>Actions</div>
                    </div>
                    
                    <div className="patient-list-container" style={{
                        height: 'calc(100vh - 300px)',
                        overflowY: 'auto',
                        position: 'relative'
                    }}>
                        <div style={{
                            height: `${patientsList.length * patientItemHeight}px`,
                            position: 'relative'
                        }}>
                            {patientsList.slice(startIndex, endIndex).map((patient, index) => {
                                const stats = calculatePatientStats(patient);
                                const isExpanded = expandedPatients[patient.patientID] || false;
                                const hasAlerts = stats.complianceStatus === 'danger' || stats.hasAbnormalColor || stats.fluidRetentionAlert;
                                const formattedName = formatNameBySurname(patient.name);
                                const dailySummaries = calculateDailySummary(stats.treatmentsByDay);
                                
                                return (
                                    <div 
                                        key={patient.patientID} 
                                        id={`patient-${patient.patientID}`}
                                        style={{
                                            position: 'absolute',
                                            top: `${(startIndex + index) * patientItemHeight}px`,
                                            width: '100%',
                                            borderBottom: '1px solid #eee',
                                            backgroundColor: isEmergency ? '#fff5f5' : (hasAlerts ? '#fff8f8' : '#fff'),
                                            transition: 'background-color 0.2s ease'
                                        }}
                                    >
                                        <div 
                                            style={{
                                                display: 'grid',
                                                gridTemplateColumns: 'minmax(300px, 3fr) 1fr 1fr 1fr',
                                                padding: '1rem 1.5rem',
                                                cursor: 'pointer',
                                                transition: 'background-color 0.2s ease',
                                                alignItems: 'center'
                                            }}
                                            onClick={() => togglePatientSection(patient.patientID)}
                                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = isEmergency ? '#fee2e2' : (hasAlerts ? '#ffefef' : '#f8f9fa')}
                                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = isEmergency ? '#fff5f5' : (hasAlerts ? '#fff8f8' : '#fff')}
                                        >
                                            <div style={{ 
                                                display: 'flex', 
                                                alignItems: 'center',
                                                minWidth: '300px',
                                                paddingRight: '1rem'
                                            }}>
                                                <div style={{
                                                    width: '40px',
                                                    height: '40px',
                                                    borderRadius: '50%',
                                                    backgroundColor: isEmergency ? '#dc2626' : 
                                                                   title === 'Adult Patients' ? '#2563eb' : '#db2777',
                                                    color: '#fff',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    marginRight: '1rem',
                                                    position: 'relative',
                                                    fontWeight: '600',
                                                    fontSize: '1.1rem'
                                                }}>
                                                    {patient.name.charAt(0)}
                                                    {hasAlerts && <span style={{
                                                        position: 'absolute',
                                                        top: '-3px',
                                                        right: '-3px',
                                                        width: '12px',
                                                        height: '12px',
                                                        borderRadius: '50%',
                                                        backgroundColor: '#e74c3c',
                                                        border: '2px solid #fff'
                                                    }}></span>}
                                                </div>
                                                <div>
                                                    <div style={{ 
                                                        fontWeight: '500',
                                                        color: isEmergency ? '#b91c1c' : '#2c3e50',
                                                        whiteSpace: 'normal',
                                                        wordBreak: 'break-word'
                                                    }}>
                                                        {formattedName}
                                                    </div>
                                                    <div style={{ 
                                                        fontSize: '0.8rem',
                                                        color: isEmergency ? '#ef4444' : '#7f8c8d',
                                                        marginTop: '0.2rem'
                                                    }}>
                                                        {stats.age}y • {patient.gender || 'N/A'} • {stats.treatmentCount} treatments
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div style={{ textAlign: 'center' }}>
                                                <div style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    padding: '0.3rem 0.8rem',
                                                    borderRadius: '20px',
                                                    backgroundColor: stats.complianceStatus === 'danger' ? '#f8d7da' : '#d4edda',
                                                    color: stats.complianceStatus === 'danger' ? '#721c24' : '#155724',
                                                    fontSize: '0.8rem',
                                                    whiteSpace: 'nowrap'
                                                }}>
                                                    {stats.complianceStatus === 'danger' ? (
                                                        <FiXCircle style={{ marginRight: '0.3rem' }} />
                                                    ) : (
                                                        <FiCheckCircle style={{ marginRight: '0.3rem' }} />
                                                    )}
                                                    {stats.complianceStatus === 'danger' ? 
                                                        `${stats.incompleteDays} day${stats.incompleteDays > 1 ? 's' : ''} incomplete` : 
                                                        'Compliant'}
                                                </div>
                                            </div>
                                            
                                            <div style={{ textAlign: 'center' }}>
                                                <div style={{
                                                    fontSize: '0.9rem',
                                                    fontWeight: '600',
                                                    color: stats.totalNetUF >= 0 ? '#28a745' : '#dc3545'
                                                }}>
                                                    {stats.totalNetUF >= 0 ? '-' : '+'}{Math.abs(stats.totalNetUF)}mL
                                                </div>
                                                <div style={{ 
                                                    fontSize: '0.7rem',
                                                    color: isEmergency ? '#fca5a5' : '#adb5bd'
                                                }}>
                                                    {stats.avgVolumeIn}mL in / {stats.avgVolumeOut}mL out
                                                </div>
                                            </div>
                                            
                                            <div style={{ 
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '0.5rem'
                                            }}>
                                                <button 
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        backgroundColor: isEmergency ? '#fee2e2' : '#e9f7fe',
                                                        color: isEmergency ? '#b91c1c' : '#2563eb',
                                                        border: 'none',
                                                        borderRadius: '5px',
                                                        padding: '0.4rem 0.8rem',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.3s ease',
                                                        fontSize: '0.8rem',
                                                        whiteSpace: 'nowrap'
                                                    }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        viewPatientDetails(patient);
                                                    }}
                                                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = isEmergency ? '#fecaca' : '#d4f0fd'}
                                                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = isEmergency ? '#fee2e2' : '#e9f7fe'}
                                                >
                                                    <FiEye style={{ marginRight: '0.3rem' }} /> Details
                                                </button>
                                                <div style={{ 
                                                    color: isEmergency ? '#fca5a5' : '#95a5a6',
                                                    display: 'flex',
                                                    alignItems: 'center'
                                                }}>
                                                    {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div style={{
                                            maxHeight: isExpanded ? 'none' : '0',
                                            overflow: 'hidden',
                                            transition: 'max-height 0.3s ease',
                                            backgroundColor: isEmergency ? '#fff5f5' : '#f8f9fa',
                                            borderTop: isExpanded ? '1px solid #eee' : 'none'
                                        }}>
                                            {isExpanded && (
                                                <div style={{ padding: '1.5rem' }}>
                                                    <div style={{ marginBottom: '1.5rem' }}>
                                                        <div style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            marginBottom: '1rem',
                                                            color: isEmergency ? '#b91c1c' : '#2c3e50',
                                                            fontWeight: '500'
                                                        }}>
                                                            <BsClipboard2Pulse style={{ 
                                                                marginRight: '0.8rem',
                                                                color: isEmergency ? '#dc2626' : '#2563eb'
                                                            }} /> Clinical Summary
                                                        </div>
                                                        <div style={{
                                                            display: 'grid',
                                                            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                                                            gap: '1rem'
                                                        }}>
                                                            <div style={{
                                                                backgroundColor: '#fff',
                                                                padding: '1rem',
                                                                borderRadius: '8px',
                                                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                                                borderLeft: `3px solid ${isEmergency ? '#dc2626' : '#2563eb'}`
                                                            }}>
                                                                <div style={{ 
                                                                    fontSize: '0.8rem',
                                                                    color: isEmergency ? '#ef4444' : '#7f8c8d',
                                                                    marginBottom: '0.5rem'
                                                                }}>Total Treatments</div>
                                                                <div style={{ 
                                                                    fontSize: '1.2rem',
                                                                    fontWeight: '600',
                                                                    color: isEmergency ? '#b91c1c' : '#2c3e50'
                                                                }}>{stats.treatmentCount}</div>
                                                            </div>
                                                            <div style={{
                                                                backgroundColor: '#fff',
                                                                padding: '1rem',
                                                                borderRadius: '8px',
                                                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                                                borderLeft: '3px solid #17a2b8'
                                                            }}>
                                                                <div style={{ 
                                                                    fontSize: '0.8rem',
                                                                    color: isEmergency ? '#ef4444' : '#7f8c8d',
                                                                    marginBottom: '0.5rem'
                                                                }}>Avg Volume In</div>
                                                                <div style={{ 
                                                                    fontSize: '1.2rem',
                                                                    fontWeight: '600',
                                                                    color: isEmergency ? '#b91c1c' : '#2c3e50'
                                                                }}>{stats.avgVolumeIn}mL</div>
                                                            </div>
                                                            <div style={{
                                                                backgroundColor: '#fff',
                                                                padding: '1rem',
                                                                borderRadius: '8px',
                                                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                                                borderLeft: '3px solid #17a2b8'
                                                            }}>
                                                                <div style={{ 
                                                                    fontSize: '0.8rem',
                                                                    color: isEmergency ? '#ef4444' : '#7f8c8d',
                                                                    marginBottom: '0.5rem'
                                                                }}>Avg Volume Out</div>
                                                                <div style={{ 
                                                                    fontSize: '1.2rem',
                                                                    fontWeight: '600',
                                                                    color: isEmergency ? '#b91c1c' : '#2c3e50'
                                                                }}>{stats.avgVolumeOut}mL</div>
                                                            </div>
                                                            <div style={{
                                                                backgroundColor: '#fff',
                                                                padding: '1rem',
                                                                borderRadius: '8px',
                                                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                                                borderLeft: '3px solid #28a745'
                                                            }}>
                                                                <div style={{ 
                                                                    fontSize: '0.8rem',
                                                                    color: isEmergency ? '#ef4444' : '#7f8c8d',
                                                                    marginBottom: '0.5rem'
                                                                }}>Total Net UF</div>
                                                                <div style={{ 
                                                                    fontSize: '1.2rem',
                                                                    fontWeight: '600',
                                                                    color: stats.totalNetUF >= 0 ? '#28a745' : '#dc3545'
                                                                }}>
                                                                    {stats.totalNetUF >= 0 ? '-' : '+'}{Math.abs(stats.totalNetUF)}mL
                                                                </div>
                                                            </div>
                                                            <div style={{
                                                                backgroundColor: '#fff',
                                                                padding: '1rem',
                                                                borderRadius: '8px',
                                                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                                                borderLeft: '3px solid #e83e8c'
                                                            }}>
                                                                <div style={{ 
                                                                    fontSize: '0.8rem',
                                                                    color: isEmergency ? '#ef4444' : '#7f8c8d',
                                                                    marginBottom: '0.5rem'
                                                                }}>Incomplete Days</div>
                                                                <div style={{ 
                                                                    fontSize: '1.2rem',
                                                                    fontWeight: '600',
                                                                    color: stats.incompleteDays > 0 ? '#dc3545' : '#28a745'
                                                                }}>
                                                                    {stats.incompleteDays}
                                                                </div>
                                                            </div>
                                                            {isEmergency && (
                                                                <div style={{
                                                                    backgroundColor: '#fff',
                                                                    padding: '1rem',
                                                                    borderRadius: '8px',
                                                                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                                                    borderLeft: '3px solid #dc2626'
                                                                }}>
                                                                    <div style={{ 
                                                                        fontSize: '0.8rem',
                                                                        color: '#ef4444',
                                                                        marginBottom: '0.5rem'
                                                                    }}>Severe Retention Days</div>
                                                                    <div style={{ 
                                                                        fontSize: '1.2rem',
                                                                        fontWeight: '600',
                                                                        color: '#b91c1c'
                                                                    }}>
                                                                        {stats.severeRetentionDays}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    
                                                    {hasAlerts && (
                                                        <div style={{ marginBottom: '1.5rem' }}>
                                                            <div style={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                marginBottom: '1rem',
                                                                color: isEmergency ? '#b91c1c' : '#2c3e50',
                                                                fontWeight: '500'
                                                            }}>
                                                                <FiAlertTriangle style={{ 
                                                                    marginRight: '0.8rem',
                                                                    color: isEmergency ? '#dc2626' : '#e74c3c'
                                                                }} /> Clinical Alerts
                                                            </div>
                                                            <div style={{
                                                                display: 'grid',
                                                                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                                                                gap: '1rem'
                                                            }}>
                                                                {stats.complianceStatus === 'danger' && (
                                                                    <div style={{
                                                                        backgroundColor: '#fff',
                                                                        padding: '1rem',
                                                                        borderRadius: '8px',
                                                                        borderLeft: '4px solid #dc3545',
                                                                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                                                                    }}>
                                                                        <div style={{ 
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            color: '#dc3545',
                                                                            fontWeight: '500',
                                                                            marginBottom: '0.5rem'
                                                                        }}>
                                                                            <FiXCircle style={{ marginRight: '0.5rem' }} /> Treatment Compliance Issue
                                                                        </div>
                                                                        <div style={{ 
                                                                            fontSize: '0.9rem',
                                                                            color: '#6c757d'
                                                                        }}>
                                                                            Patient had {stats.incompleteDays} day{stats.incompleteDays > 1 ? 's' : ''} with less than 3 completed treatments
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                
                                                                {stats.hasAbnormalColor && (
                                                                    <div style={{
                                                                        backgroundColor: '#fff',
                                                                        padding: '1rem',
                                                                        borderRadius: '8px',
                                                                        borderLeft: '4px solid #ffc107',
                                                                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                                                                    }}>
                                                                        <div style={{ 
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            color: '#ffc107',
                                                                            fontWeight: '500',
                                                                            marginBottom: '0.5rem'
                                                                        }}>
                                                                            <FiDroplet style={{ marginRight: '0.5rem' }} /> Abnormal Drain Color
                                                                        </div>
                                                                        <div style={{ 
                                                                            fontSize: '0.9rem',
                                                                            color: '#6c757d'
                                                                        }}>
                                                                            Abnormal peritoneal fluid color detected in recent treatments
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                
                                                                {stats.fluidRetentionAlert && (
                                                                    <div style={{
                                                                        backgroundColor: '#fff',
                                                                        padding: '1rem',
                                                                        borderRadius: '8px',
                                                                        borderLeft: isEmergency ? '4px solid #dc2626' : '4px solid #fd7e14',
                                                                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                                                                    }}>
                                                                        <div style={{ 
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            color: isEmergency ? '#dc2626' : '#fd7e14',
                                                                            fontWeight: '500',
                                                                            marginBottom: '0.5rem'
                                                                        }}>
                                                                            <FiThermometer style={{ marginRight: '0.5rem' }} /> 
                                                                            {isEmergency ? 'Severe Fluid Retention' : 'Fluid Retention'}
                                                                        </div>
                                                                        <div style={{ 
                                                                            fontSize: '0.9rem',
                                                                            color: '#6c757d'
                                                                        }}>
                                                                            Possible fluid retention of {stats.fluidDifference}mL
                                                                            <div style={{ 
                                                                                fontSize: '0.8rem',
                                                                                marginTop: '0.3rem',
                                                                                color: '#adb5bd'
                                                                            }}>
                                                                                (Avg In: {stats.avgVolumeIn}mL, Avg Out: {stats.avgVolumeOut}mL)
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                    
                                                    <div>
                                                        <div style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            marginBottom: '1rem',
                                                            color: isEmergency ? '#b91c1c' : '#2c3e50',
                                                            fontWeight: '500'
                                                        }}>
                                                            <FaRegChartBar style={{ 
                                                                marginRight: '0.8rem',
                                                                color: isEmergency ? '#dc2626' : '#2563eb'
                                                            }} /> Daily Treatment Summary
                                                        </div>
                                                        
                                                        {dailySummaries.map((daySummary, dayIndex) => {
                                                            const dayBalance = daySummary.dayBalance;
                                                            const isPositiveBalance = dayBalance >= 0;
                                                            
                                                            return (
                                                                <div key={dayIndex} style={{
                                                                    backgroundColor: '#fff',
                                                                    borderRadius: '8px',
                                                                    overflow: 'hidden',
                                                                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                                                    marginBottom: '1rem',
                                                                    borderLeft: daySummary.isSevereRetention ? '4px solid #dc2626' : 'none'
                                                                }}>
                                                                    <div style={{
                                                                        display: 'flex',
                                                                        justifyContent: 'space-between',
                                                                        alignItems: 'center',
                                                                        padding: '0.8rem 1rem',
                                                                        backgroundColor: isEmergency ? '#fee2e2' : '#f8f9fa',
                                                                        borderBottom: '1px solid #eee'
                                                                    }}>
                                                                        <div style={{ 
                                                                            fontWeight: '500',
                                                                            color: isEmergency ? '#b91c1c' : '#2c3e50'
                                                                        }}>
                                                                            {formatDate(daySummary.date)}
                                                                            {!daySummary.isCompleteDay && (
                                                                                <span style={{
                                                                                    marginLeft: '0.5rem',
                                                                                    padding: '0.2rem 0.5rem',
                                                                                    backgroundColor: '#f8d7da',
                                                                                    color: '#721c24',
                                                                                    borderRadius: '4px',
                                                                                    fontSize: '0.8rem'
                                                                                }}>
                                                                                    Only {daySummary.treatmentCount} treatment{daySummary.treatmentCount > 1 ? 's' : ''}
                                                                                </span>
                                                                            )}
                                                                            {daySummary.isSevereRetention && (
                                                                                <span style={{
                                                                                    marginLeft: '0.5rem',
                                                                                    padding: '0.2rem 0.5rem',
                                                                                    backgroundColor: '#fee2e2',
                                                                                    color: '#b91c1c',
                                                                                    borderRadius: '4px',
                                                                                    fontSize: '0.8rem'
                                                                                }}>
                                                                                    Severe Retention
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        <div style={{ 
                                                                            fontWeight: '600',
                                                                            color: isPositiveBalance ? '#28a745' : '#dc3545'
                                                                        }}>
                                                                            {isPositiveBalance ? '-' : '+'}{Math.abs(dayBalance)}mL
                                                                        </div>
                                                                    </div>
                                                                    
                                                                    <div style={{
                                                                        display: 'grid',
                                                                        gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr',
                                                                        padding: '0.8rem 1rem',
                                                                        backgroundColor: isEmergency ? '#fee2e2' : '#f8f9fa',
                                                                        borderBottom: '1px solid #eee',
                                                                        fontWeight: '500',
                                                                        color: isEmergency ? '#b91c1c' : '#2c3e50',
                                                                        fontSize: '0.8rem'
                                                                    }}>
                                                                        <div>Volume In</div>
                                                                        <div>Volume Out</div>
                                                                        <div>Net UF (Balance)</div>
                                                                        <div>Color</div>
                                                                        <div>Status</div>
                                                                    </div>
                                                                    
                                                                    {daySummary.treatments.map((treatment, index) => {
                                                                        const balance = calculateBalance(treatment.VolumeIn, treatment.VolumeOut);
                                                                        const colorClass = getColorClass(treatment.Color);
                                                                        
                                                                        return (
                                                                            <div key={index} style={{
                                                                                display: 'grid',
                                                                                gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr',
                                                                                padding: '0.8rem 1rem',
                                                                                borderBottom: '1px solid #eee',
                                                                                fontSize: '0.9rem',
                                                                                alignItems: 'center',
                                                                                backgroundColor: balance.value < 0 ? '#fff5f5' : '#fff'
                                                                            }}>
                                                                                <div>
                                                                                    {treatment.VolumeIn || 'N/A'}mL
                                                                                </div>
                                                                                <div>
                                                                                    {treatment.VolumeOut || 'N/A'}mL
                                                                                </div>
                                                                                <div style={{
                                                                                    fontWeight: '500',
                                                                                    color: balance.isPositive ? '#28a745' : '#dc3545'
                                                                                }}>
                                                                                    {balance.formatted}
                                                                                    <div style={{ 
                                                                                        fontSize: '0.7rem',
                                                                                        color: '#adb5bd'
                                                                                    }}>
                                                                                        {balance.interpretation}
                                                                                    </div>
                                                                                </div>
                                                                                <div>
                                                                                    <span style={{
                                                                                        display: 'inline-block',
                                                                                        padding: '0.2rem 0.5rem',
                                                                                        borderRadius: '4px',
                                                                                        backgroundColor: colorClass === 'color-clear' ? '#e3f2fd' : 
                                                                                                       colorClass === 'color-normal' ? '#e8f5e9' : '#ffebee',
                                                                                        color: colorClass === 'color-clear' ? '#1976d2' : 
                                                                                              colorClass === 'color-normal' ? '#2e7d32' : '#c62828',
                                                                                        fontSize: '0.8rem'
                                                                                    }}>
                                                                                        {treatment.Color || 'N/A'}
                                                                                    </span>
                                                                                </div>
                                                                                <div>
                                                                                    <span style={{
                                                                                        display: 'inline-block',
                                                                                        padding: '0.2rem 0.5rem',
                                                                                        borderRadius: '4px',
                                                                                        backgroundColor: getStatusColor(treatment.TreatmentStatus) + '20',
                                                                                        color: getStatusColor(treatment.TreatmentStatus),
                                                                                        fontSize: '0.8rem'
                                                                                    }}>
                                                                                        {treatment.TreatmentStatus || 'Unknown'}
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                    
                                                                    <div style={{
                                                                        display: 'grid',
                                                                        gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr',
                                                                        padding: '0.8rem 1rem',
                                                                        backgroundColor: isEmergency ? '#fee2e2' : '#e9ecef',
                                                                        fontWeight: 500,
                                                                        fontSize: '0.9rem',
                                                                    }}>
                                                                        <div style={{ fontWeight: 700 }}>
                                                                            Daily Net Fluid Balance:
                                                                        </div>
                                                                        <div>{daySummary.totalVolumeIn} mL</div>
                                                                        <div>{daySummary.totalVolumeOut} mL</div>
                                                                        <div style={{
                                                                            color: isPositiveBalance ? '#28a745' : '#dc3545',
                                                                        }}>
                                                                            {isPositiveBalance ? '-' : '+'}
                                                                            {Math.abs(dayBalance)} mL
                                                                        </div>
                                                                        <div></div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div style={{
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
            backgroundColor: '#f5f7fa',
            minHeight: '100vh',
            color: '#333',
            position: 'relative',
            width: '100%',
        }}>
            <header style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem 2rem',
                backgroundColor: '#fff',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                position: 'sticky',
                top: 0,
                zIndex: 100
            }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <button 
                        onClick={() => navigate(-1)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            backgroundColor: 'transparent',
                            border: '1px solid #ddd',
                            borderRadius: '5px',
                            padding: '0.5rem 1rem',
                            marginRight: '1.5rem',
                            cursor: 'pointer',
                            color: '#555',
                            transition: 'all 0.3s ease'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        <FiArrowLeft style={{ marginRight: '0.5rem' }} /> Back
                    </button>
                    <div>
                        <h1 style={{
                            margin: 0,
                            fontSize: '1.8rem',
                            color: '#2c3e50',
                            fontWeight: 600
                        }}>
                           Peritoneal Dialysis Monitoring
                        </h1>
                        <p style={{
                            margin: '0.2rem 0 0',
                            fontSize: '0.9rem',
                            color: '#7f8c8d'
                        }}>Track patient treatments, dialysis sessions, and monitor fluid intake and output to ensure proper fluid balance and detection of imbalances or complications.</p>
                    </div>
                </div>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    color: '#7f8c8d',
                    fontSize: '0.95rem'
                }}>
                    <FaRegCalendarAlt style={{ marginRight: '0.5rem' }} /> 
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
            </header>
            
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem 2rem',
                backgroundColor: '#fff',
                margin: '1rem 2rem',
                borderRadius: '8px',
                boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
            }}>
                <div style={{
                    position: 'relative',
                    flex: '1',
                    maxWidth: '800px'
                }}>
                    <FiSearch style={{
                        position: 'absolute',
                        left: '1rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#95a5a6'
                    }} />
                    <input
                        type="text"
                        placeholder="Search patients by name, ID, or status..."
                        value={search}
                        onChange={handleSearchChange}
                        style={{
                            width: '100%',
                            padding: '0.8rem 1rem 0.8rem 2.5rem',
                            border: '1px solid #ddd',
                            borderRadius: '5px',
                            fontSize: '0.95rem',
                            transition: 'border 0.3s ease',
                            outline: 'none'
                        }}
                        onFocus={(e) => e.currentTarget.style.borderColor = '#3498db'}
                        onBlur={(e) => e.currentTarget.style.borderColor = '#ddd'}
                    />
                    {search && (
                        <button 
                            style={{
                                position: 'absolute',
                                right: '1rem',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                backgroundColor: 'transparent',
                                border: 'none',
                                color: '#95a5a6',
                                cursor: 'pointer'
                            }}
                            onClick={() => {
                                setSearch('');
                                fetchTreatments();
                            }}
                        >
                            <FiXCircle />
                        </button>
                    )}
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <button 
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            backgroundColor: showFilters ? '#3498db' : '#f8f9fa',
                            color: showFilters ? '#fff' : '#333',
                            border: '1px solid #ddd',
                            borderRadius: '5px',
                            padding: '0.6rem 1rem',
                            marginLeft: '1rem',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            fontSize: '0.9rem'
                        }}
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <FiFilter style={{ marginRight: '0.5rem' }} /> 
                        {showFilters ? 'Hide Filters' : 'Show Filters'}
                    </button>
                </div>
            </div>

            {showFilters && (
                <div style={{
                    backgroundColor: '#fff',
                    margin: '0 2rem 1rem',
                    padding: '1.5rem',
                    borderRadius: '8px',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                }}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <div style={{ 
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: '1rem',
                            flexDirection: window.innerWidth < 768 ? 'column' : 'row'
                        }}>
                            <div style={{ flex: '1', marginRight: '1rem', marginBottom: window.innerWidth < 768 ? '1rem' : 0 }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontWeight: '500',
                                    color: '#2c3e50'
                                }}>Date Range</label>
                                <div style={{ 
                                    display: 'flex',
                                    alignItems: 'center'
                                }}>
                                    <div style={{ 
                                        position: 'relative',
                                        flex: '1'
                                    }}>
                                        <FiCalendar style={{
                                            position: 'absolute',
                                            left: '0.8rem',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            color: '#95a5a6'
                                        }} />
                                        <input
                                            type="date"
                                            value={dateFrom}
                                            onChange={(e) => setDateFrom(e.target.value)}
                                            placeholder="From"
                                            style={{
                                                width: '100%',
                                                padding: '0.6rem 0.6rem 0.6rem 2rem',
                                                border: '1px solid #ddd',
                                                borderRadius: '5px',
                                                fontSize: '0.9rem'
                                            }}
                                        />
                                    </div>
                                    <span style={{ 
                                        margin: '0 0.5rem',
                                        color: '#7f8c8d'
                                    }}>to</span>
                                    <div style={{ 
                                        position: 'relative',
                                        flex: '1'
                                    }}>
                                        <FiCalendar style={{
                                            position: 'absolute',
                                            left: '0.8rem',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            color: '#95a5a6'
                                        }} />
                                        <input
                                            type="date"
                                            value={dateTo}
                                            onChange={(e) => setDateTo(e.target.value)}
                                            placeholder="To"
                                            style={{
                                                width: '100%',
                                                padding: '0.6rem 0.6rem 0.6rem 2rem',
                                                border: '1px solid #ddd',
                                                borderRadius: '5px',
                                                fontSize: '0.9rem'
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div style={{ flex: '1' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontWeight: '500',
                                    color: '#2c3e50'
                                }}>Patient Status</label>
                                <div style={{ 
                                    display: 'flex',
                                    border: '1px solid #ddd',
                                    borderRadius: '5px',
                                    overflow: 'hidden'
                                }}>
                                    <button 
                                        style={{
                                            flex: '1',
                                            padding: '0.6rem',
                                            border: 'none',
                                            backgroundColor: activeTab === 'all' ? '#3498db' : '#f8f9fa',
                                            color: activeTab === 'all' ? '#fff' : '#333',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease',
                                            fontSize: '0.9rem'
                                        }}
                                        onClick={() => setActiveTab('all')}
                                    >
                                        All Patients
                                    </button>
                                    <button 
                                        style={{
                                            flex: '1',
                                            padding: '0.6rem',
                                            borderLeft: '1px solid #ddd',
                                            borderRight: '1px solid #ddd',
                                            backgroundColor: activeTab === 'non-compliant' ? '#3498db' : '#f8f9fa',
                                            color: activeTab === 'non-compliant' ? '#fff' : '#333',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease',
                                            fontSize: '0.9rem'
                                        }}
                                        onClick={() => setActiveTab('non-compliant')}
                                    >
                                        Non-Compliant
                                    </button>
                                    <button 
                                        style={{
                                            flex: '1',
                                            padding: '0.6rem',
                                            border: 'none',
                                            backgroundColor: activeTab === 'abnormal' ? '#3498db' : '#f8f9fa',
                                            color: activeTab === 'abnormal' ? '#fff' : '#333',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease',
                                            fontSize: '0.9rem'
                                        }}
                                        onClick={() => setActiveTab('abnormal')}
                                    >
                                        With Alerts
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ 
                        display: 'flex',
                        justifyContent: 'flex-end'
                    }}>
                        <button style={{
                            padding: '0.6rem 1.2rem',
                            backgroundColor: '#3498db',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            marginRight: '1rem',
                            transition: 'all 0.3s ease',
                            fontSize: '0.9rem'
                        }}
                            onClick={fetchTreatments}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2980b9'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#3498db'}
                        >
                            Apply Filters
                        </button>
                        <button style={{
                            padding: '0.6rem 1.2rem',
                            backgroundColor: '#f8f9fa',
                            color: '#333',
                            border: '1px solid #ddd',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            fontSize: '0.9rem'
                        }}
                            onClick={clearFilters}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e9ecef'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>
            )}

            <div style={{
                display: 'flex',
                margin: '0 2rem 2rem',
                gap: '1.5rem',
                flexDirection: window.innerWidth < 1200 ? 'column' : 'row'
            }}>
                <div style={{
                    flex: '3',
                    backgroundColor: '#fff',
                    borderRadius: '8px',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        padding: '1.2rem 1.5rem',
                        borderBottom: '1px solid #eee',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <h3 style={{
                            margin: 0,
                            display: 'flex',
                            alignItems: 'center',
                            color: '#2c3e50'
                        }}>
                            <FaProcedures style={{ 
                                marginRight: '0.8rem',
                                color: '#3498db'
                            }} /> 
                            Continuous Ambulatory Peritoneal Dialysis Patients
                            <span style={{
                                backgroundColor: '#e74c3c',
                                color: '#fff',
                                borderRadius: '50%',
                                padding: '0.2rem 0.5rem',
                                fontSize: '0.8rem',
                                marginLeft: '0.8rem'
                            }}>{patients.length}</span>
                        </h3>
                    </div>
                    
                    {patients.length === 0 ? (
                        <div style={{
                            padding: '3rem',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            textAlign: 'center',
                            color: '#7f8c8d'
                        }}>
                            <FiBell style={{
                                fontSize: '3rem',
                                marginBottom: '1rem',
                                color: '#bdc3c7'
                            }} />
                            <h3 style={{ margin: '0 0 0.5rem', color: '#2c3e50' }}>No patients found</h3>
                            <p style={{ marginBottom: '1.5rem' }}>Try adjusting your filters or check back later</p>
                            <button style={{
                                padding: '0.6rem 1.2rem',
                                backgroundColor: '#3498db',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease'
                            }}
                                onClick={fetchTreatments}
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2980b9'}
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#3498db'}
                            >
                                Retry
                            </button>
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <div style={{ minWidth: '1000px' }}>
                                {renderPatientSection('Emergency Cases', emergencyPatients, true)}
                                {renderPatientSection('Adult Patients', adultPatients)}
                                {renderPatientSection('Pediatric Patients', pediatricPatients)}
                            </div>
                        </div>
                    )}
                </div>
                
                <div style={{
                    flex: '1',
                    backgroundColor: '#fff',
                    borderRadius: '8px',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                    alignSelf: 'flex-start',
                    position: window.innerWidth < 1200 ? 'static' : 'sticky',
                    top: '1rem'
                }}>
                    <div style={{ padding: '1.5rem' }}>
                        <h3 style={{
                            margin: '0 0 1.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            color: '#2c3e50'
                        }}>
                            <FiBarChart2 style={{ 
                                marginRight: '0.8rem',
                                color: '#3498db'
                            }} /> Clinical Summary
                        </h3>
                        <div style={{
                            backgroundColor: '#f8f9fa',
                            borderRadius: '8px',
                            padding: '1rem',
                            marginBottom: '1.5rem'
                        }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '0.8rem'
                            }}>
                                <div style={{ 
                                    fontWeight: '500',
                                    color: '#2c3e50'
                                }}>Patient Compliance</div>
                                <div style={{ 
                                    fontWeight: '600',
                                    color: '#2c3e50'
                                }}>{summary.non_compliant_patients} of {summary.total_patients}</div>
                            </div>
                            <div style={{
                                height: '8px',
                                backgroundColor: '#e9ecef',
                                borderRadius: '4px',
                                marginBottom: '0.8rem',
                                overflow: 'hidden'
                            }}>
                                <div 
                                    style={{ 
                                        height: '100%',
                                        width: `${quickStats.complianceRate}%`,
                                        backgroundColor: '#28a745',
                                        transition: 'width 0.5s ease'
                                    }}
                                ></div>
                            </div>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                fontSize: '0.8rem'
                            }}>
                                <span style={{ color: '#28a745' }}>Compliant: {summary.total_patients - summary.non_compliant_patients}</span>
                                <span style={{ color: '#dc3545' }}>Non-Compliant: {summary.non_compliant_patients}</span>
                            </div>
                        </div>
                        
                        <div style={{
                            backgroundColor: '#f8f9fa',
                            borderRadius: '8px',
                            padding: '1rem'
                        }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '0.8rem'
                            }}>
                                <div style={{ 
                                    fontWeight: '500',
                                    color: '#2c3e50'
                                }}>Recent Alerts</div>
                                <div style={{ 
                                    fontWeight: '600',
                                    color: '#2c3e50'
                                }}>{criticalAlerts.length}</div>
                            </div>
                            <div>
                                {criticalAlerts.length === 0 ? (
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: '1rem',
                                        backgroundColor: '#fff',
                                        borderRadius: '8px',
                                        color: '#28a745',
                                        fontSize: '0.9rem'
                                    }}>
                                        <FiCheckCircle style={{ marginRight: '0.5rem' }} /> No active alerts
                                    </div>
                                ) : (
                                    criticalAlerts.slice(0, 3).map((alert, index) => (
                                        <div key={index} style={{
                                            backgroundColor: '#fff',
                                            borderRadius: '8px',
                                            padding: '0.8rem',
                                            marginBottom: '0.8rem',
                                            borderLeft: `4px solid ${
                                                alert.severity === 'critical' ? '#dc3545' : 
                                                alert.severity === 'high' ? '#fd7e14' : '#ffc107'
                                            }`
                                        }}>
                                            <div style={{ 
                                                fontWeight: '500',
                                                marginBottom: '0.3rem',
                                                color: '#2c3e50'
                                            }}>{alert.patientName}</div>
                                            <div style={{ 
                                                fontSize: '0.8rem',
                                                color: '#6c757d'
                                            }}>{alert.message}</div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {selectedPatient && (
                <PatientDetailModal 
                    patient={selectedPatient} 
                    onClose={closePatientDetails} 
                />
            )}
        </div>
    );
};

export default TrackPatientRecords;