import React, { useState, useEffect } from 'react';
import { 
  FaCalendarTimes, 
  FaCheck, 
  FaTimes, 
  FaInfoCircle,
  FaArrowRight,
  FaCommentAlt,
  FaCheckCircle,
  FaSpinner,
  FaSearch,
  FaChevronDown,
  FaExclamationTriangle,
  FaUser,
  FaCalendarAlt,
  FaIdCard,
  FaEnvelope
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { format, parseISO, isYesterday, isToday, isThisWeek, isThisYear, compareDesc } from 'date-fns';
import RescheduleReasonModal from './RescheduleReasonModal';

const MissedAppointmentsNotification = ({ 
  onClose, 
  missedCount,
  fetchDashboardData
}) => {
  const [missedAppointments, setMissedAppointments] = useState([]);
  const [groupedAppointments, setGroupedAppointments] = useState({});
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointments, setSelectedAppointments] = useState([]);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [selectedReason, setSelectedReason] = useState(null);
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [dateRange, setDateRange] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSelectAll, setIsSelectAll] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState({});
  const [searchDate, setSearchDate] = useState('');

  // Color palette - professional tones
  const colors = {
    primary: '#3f51b5',
    primaryLight: '#757de8',
    primaryDark: '#002984',
    secondary: '#009688',
    success: '#4caf50',
    error: '#f44336',
    warning: '#ff9800',
    info: '#2196f3',
    light: '#f5f5f5',
    white: '#ffffff',
    dark: '#212121',
    gray100: '#f5f5f5',
    gray200: '#eeeeee',
    gray300: '#e0e0e0',
    gray400: '#bdbdbd',
    gray500: '#9e9e9e',
    gray600: '#757575',
    gray700: '#616161',
    gray800: '#424242',
  };

  const formatAppointmentDate = (dateString) => {
    const date = parseISO(dateString);
    return format(date, 'EEEE, MMMM d, yyyy');
  };

  const formatGroupDate = (dateString) => {
    const date = parseISO(dateString);
    
    if (isToday(date)) {
      return `Today (${format(date, 'MMMM d, yyyy')})`;
    } else if (isYesterday(date)) {
      return `Yesterday (${format(date, 'MMMM d, yyyy')})`;
    } else if (isThisWeek(date)) {
      return `${format(date, 'EEEE')} (${format(date, 'MMMM d, yyyy')})`;
    } else {
      return format(date, 'MMMM d, yyyy');
    }
  };

  const groupAppointmentsByDate = (appointments) => {
    const grouped = {};
    
    appointments.forEach(appt => {
      const dateKey = format(parseISO(appt.appointment_date), 'yyyy-MM-dd');
      if (!grouped[dateKey]) {
        grouped[dateKey] = {
          date: appt.appointment_date,
          appointments: []
        };
      }
      grouped[dateKey].appointments.push(appt);
    });
    
    const sortedGroups = {};
    Object.keys(grouped)
      .sort((a, b) => compareDesc(parseISO(a), parseISO(b)))
      .forEach(key => {
        sortedGroups[key] = grouped[key];
      });
    
    return sortedGroups;
  };

  useEffect(() => {
    const fetchMissedAppointments = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:8000/api/staff/missed-appointments', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });
        const appointments = response.data.appointments || [];
        setMissedAppointments(appointments);
        setGroupedAppointments(groupAppointmentsByDate(appointments));
      } catch (error) {
        console.error("Error fetching missed appointments:", error);
        setErrorMessage("Failed to fetch missed appointments. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchMissedAppointments();
  }, []);

  useEffect(() => {
    let filtered = [...missedAppointments];
    
    if (dateRange === 'yesterday') {
      filtered = filtered.filter(appt => isYesterday(parseISO(appt.appointment_date)));
    } else if (dateRange === 'thisWeek') {
      filtered = filtered.filter(appt => isThisWeek(parseISO(appt.appointment_date)));
    } else if (dateRange === 'older') {
      filtered = filtered.filter(appt => 
        !isToday(parseISO(appt.appointment_date)) && 
        !isYesterday(parseISO(appt.appointment_date)) &&
        !isThisWeek(parseISO(appt.appointment_date))
      );
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(appt => 
        appt.first_name.toLowerCase().includes(term) || 
        appt.last_name.toLowerCase().includes(term) ||
        appt.hospitalNumber.toLowerCase().includes(term)
      );
    }

    if (searchDate) {
      const searchDateFormatted = format(parseISO(searchDate), 'yyyy-MM-dd');
      filtered = filtered.filter(appt => 
        format(parseISO(appt.appointment_date), 'yyyy-MM-dd') === searchDateFormatted
      );
    }
    
    setFilteredAppointments(filtered);
    setGroupedAppointments(groupAppointmentsByDate(filtered));
    setIsSelectAll(false);
    setSelectedAppointments([]);
  }, [dateRange, searchTerm, searchDate, missedAppointments]);

  const handleSelectAppointment = (scheduleId) => {
    setSelectedAppointments(prev => 
      prev.includes(scheduleId) 
        ? prev.filter(id => id !== scheduleId) 
        : [...prev, scheduleId]
    );
  };

  const toggleSelectAll = () => {
    if (isSelectAll) {
      setSelectedAppointments([]);
    } else {
      const allIds = filteredAppointments.map(appt => appt.schedule_id);
      setSelectedAppointments(allIds);
    }
    setIsSelectAll(!isSelectAll);
  };

  const toggleGroup = (dateKey) => {
    setExpandedGroups(prev => ({
      ...prev,
      [dateKey]: !prev[dateKey]
    }));
  };

  const handleRescheduleSelected = async () => {
    if (selectedAppointments.length === 0) return;

    setProcessing(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await axios.post(
        'http://localhost:8000/api/staff/reschedule-missed-batch',
        { schedule_ids: selectedAppointments },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );

      if (response.data.success) {
        const successMsg = response.data.new_dates 
          ? `Successfully rescheduled ${selectedAppointments.length} appointment(s). New appointment dates: ${response.data.new_dates.join(', ')}`
          : `Successfully rescheduled ${selectedAppointments.length} appointment(s)`;
        
        setSuccessMessage(successMsg);
        
        const updatedAppointments = missedAppointments.filter(
          appt => !selectedAppointments.includes(appt.schedule_id)
        );
        
        setMissedAppointments(updatedAppointments);
        setSelectedAppointments([]);
        setIsSelectAll(false);
        fetchDashboardData();
        
        setTimeout(() => {
          if (updatedAppointments.length === 0) {
            onClose();
          }
        }, 3000);
      }
      
      if (response.data.errors && response.data.errors.length > 0) {
        setErrorMessage(`Some appointments failed to reschedule: ${response.data.errors.join(', ')}`);
      }
    } catch (error) {
      console.error("Error rescheduling appointments:", error);
      setErrorMessage(error.response?.data?.message || "Failed to reschedule appointments. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const openReasonModal = (appointment) => {
    setSelectedAppointment(appointment);
    setSelectedReason(appointment.reschedule_reason);
    setShowReasonModal(true);
  };

  const getAppointmentStatusColor = (dateString) => {
    const date = parseISO(dateString);
    
    if (isToday(date)) return colors.error;
    if (isYesterday(date)) return colors.warning;
    if (isThisWeek(date)) return colors.info;
    return colors.gray600;
  };

  // Date filter button component
  const DateFilterButton = ({ active, onClick, label, count, color }) => {
    return (
      <button
        onClick={onClick}
        style={{
          backgroundColor: active ? (color || colors.primary) : colors.gray100,
          color: active ? colors.white : (color || colors.gray600),
          padding: '8px 12px',
          borderRadius: '6px',
          fontSize: '13px',
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          border: 'none',
          cursor: 'pointer',
          transition: 'all 0.2s',
          ':hover': {
            backgroundColor: active ? (color || colors.primary) : colors.gray200
          }
        }}
      >
        <span>{label}</span>
        <span style={{
          backgroundColor: active ? 'rgba(255,255,255,0.2)' : colors.gray200,
          padding: '2px 6px',
          borderRadius: '10px',
          fontSize: '12px',
          fontWeight: 600
        }}>
          {count}
        </span>
      </button>
    );
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(33, 33, 33, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(4px)',
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          style={{
            backgroundColor: colors.white,
            borderRadius: '12px',
            width: '95%',
            maxWidth: '1200px',
            maxHeight: '90vh',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 10px 20px rgba(0, 0, 0, 0.2)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div style={{
            padding: '20px 24px',
            borderBottom: `1px solid ${colors.gray200}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: colors.white,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: `${colors.primary}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <FaCalendarTimes style={{ color: colors.primary, fontSize: '20px' }} />
              </div>
              <div>
                <h3 style={{ 
                  margin: 0, 
                  fontSize: '20px', 
                  fontWeight: 600, 
                  color: colors.dark,
                }}>
                  Missed Appointments
                </h3>
                <p style={{
                  margin: '4px 0 0',
                  fontSize: '14px',
                  color: colors.gray600,
                }}>
                  {missedCount} total missed appointments
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                width: '40px',
                height: '40px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: colors.gray500,
                fontSize: '20px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
              }}
            >
              &times;
            </button>
          </div>

          {/* Filters and Search */}
          <div style={{
            padding: '16px 24px',
            borderBottom: `1px solid ${colors.gray200}`,
            display: 'flex',
            gap: '16px',
            alignItems: 'center',
            backgroundColor: colors.white,
            flexWrap: 'wrap'
          }}>
            <div style={{
              position: 'relative',
              flex: 1,
              minWidth: '300px',
              maxWidth: '400px'
            }}>
              <input
                type="text"
                placeholder="Search patients or hospital number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 16px 10px 40px',
                  borderRadius: '8px',
                  border: `1px solid ${colors.gray300}`,
                  fontSize: '14px',
                  transition: 'all 0.2s',
                  backgroundColor: colors.white,
                }}
              />
              <FaSearch style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: colors.gray500,
                fontSize: '14px'
              }} />
            </div>

            <div style={{
              position: 'relative',
              minWidth: '200px',
            }}>
              <input
                type="date"
                value={searchDate}
                onChange={(e) => setSearchDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  border: `1px solid ${colors.gray300}`,
                  fontSize: '14px',
                  transition: 'all 0.2s',
                  backgroundColor: colors.white,
                }}
              />
              {searchDate && (
                <button
                  onClick={() => setSearchDate('')}
                  style={{
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: colors.gray500,
                    cursor: 'pointer',
                    fontSize: '14px',
                  }}
                >
                  <FaTimes />
                </button>
              )}
            </div>
            
            <div style={{
              display: 'flex',
              gap: '8px',
              flexWrap: 'wrap'
            }}>
              <DateFilterButton 
                active={dateRange === 'all'}
                onClick={() => setDateRange('all')}
                label="All Dates"
                count={missedCount}
              />
              <DateFilterButton 
                active={dateRange === 'yesterday'}
                onClick={() => setDateRange('yesterday')}
                label="Yesterday"
                color={colors.warning}
                count={missedAppointments.filter(a => isYesterday(parseISO(a.appointment_date))).length}
              />
              <DateFilterButton 
                active={dateRange === 'thisWeek'}
                onClick={() => setDateRange('thisWeek')}
                label="This Week"
                color={colors.info}
                count={missedAppointments.filter(a => isThisWeek(parseISO(a.appointment_date))).length}
              />
              <DateFilterButton 
                active={dateRange === 'older'}
                onClick={() => setDateRange('older')}
                label="Older"
                color={colors.gray600}
                count={missedAppointments.filter(a => 
                  !isToday(parseISO(a.appointment_date)) && 
                  !isYesterday(parseISO(a.appointment_date)) &&
                  !isThisWeek(parseISO(a.appointment_date))
                ).length}
              />
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div style={{ 
              padding: '40px', 
              textAlign: 'center',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px'
            }}>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                border: `3px solid ${colors.gray200}`, 
                borderTopColor: colors.primary, 
                borderRadius: '50%', 
                animation: 'spin 1s linear infinite'
              }}></div>
              <p style={{ 
                margin: 0, 
                color: colors.gray600,
                fontSize: '15px'
              }}>
                Loading missed appointments...
              </p>
            </div>
          )}

          {/* Error State */}
          {errorMessage && !loading && (
            <div style={{ 
              padding: '16px 24px', 
              backgroundColor: `${colors.error}10`, 
              margin: '16px', 
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              borderLeft: `4px solid ${colors.error}`,
            }}>
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: `${colors.error}20`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <FaTimes color={colors.error} size={12} />
              </div>
              <span style={{ 
                color: colors.error,
                fontSize: '14px'
              }}>
                {errorMessage}
              </span>
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredAppointments.length === 0 && (
            <div style={{ 
              padding: '40px', 
              textAlign: 'center',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px'
            }}>
              {searchTerm || searchDate || dateRange !== 'all' ? (
                <>
                  <div style={{
                    width: '72px',
                    height: '72px',
                    borderRadius: '50%',
                    backgroundColor: `${colors.warning}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <FaExclamationTriangle style={{ fontSize: '28px', color: colors.warning }} />
                  </div>
                  <h4 style={{ 
                    margin: 0, 
                    fontSize: '18px',
                    fontWeight: 600,
                    color: colors.dark
                  }}>
                    No appointments found
                  </h4>
                  <p style={{ 
                    margin: 0, 
                    color: colors.gray600,
                    fontSize: '15px',
                    maxWidth: '400px',
                    lineHeight: '1.6'
                  }}>
                    {searchTerm 
                      ? `No appointments match "${searchTerm}"`
                      : searchDate
                      ? `No missed appointments on ${format(parseISO(searchDate), 'MMMM d, yyyy')}`
                      : `No missed appointments for the selected date range`}
                  </p>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSearchDate('');
                      setDateRange('all');
                    }}
                    style={{
                      background: colors.primary,
                      color: colors.white,
                      border: 'none',
                      padding: '10px 20px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: 500,
                      fontSize: '14px',
                      marginTop: '16px',
                      transition: 'all 0.2s',
                    }}
                  >
                    Reset filters
                  </button>
                </>
              ) : (
                <>
                  <div style={{
                    width: '72px',
                    height: '72px',
                    borderRadius: '50%',
                    backgroundColor: `${colors.success}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <FaCheckCircle style={{ fontSize: '32px', color: colors.success }} />
                  </div>
                  <h4 style={{ 
                    margin: 0, 
                    fontSize: '18px',
                    fontWeight: 600,
                    color: colors.dark
                  }}>
                    No missed appointments
                  </h4>
                  <p style={{ 
                    margin: 0, 
                    color: colors.gray600,
                    fontSize: '15px',
                    maxWidth: '400px',
                    lineHeight: '1.6'
                  }}>
                    All appointments have been attended or rescheduled.
                  </p>
                </>
              )}
            </div>
          )}

          {/* Appointments List */}
          {!loading && filteredAppointments.length > 0 && (
            <>
              <div style={{ 
                overflowY: 'auto', 
                flex: 1,
                position: 'relative'
              }}>
                <div style={{ 
                  width: '100%',
                  borderCollapse: 'separate',
                  borderSpacing: 0,
                  fontSize: '14px'
                }}>
                  {/* Header */}
                  <div style={{ 
                    backgroundColor: colors.white,
                    position: 'sticky',
                    top: 0,
                    zIndex: 10,
                    boxShadow: `0 1px 0 ${colors.gray200}`,
                    display: 'flex',
                    alignItems: 'center',
                    padding: '16px 24px',
                    borderBottom: `1px solid ${colors.gray200}`
                  }}>
                    <div style={{ 
                      width: '40px',
                      paddingRight: '16px',
                      flexShrink: 0
                    }}>
                      <div style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '6px',
                        border: `2px solid ${isSelectAll ? colors.primary : colors.gray400}`,
                        backgroundColor: isSelectAll ? colors.primary : colors.white,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                      onClick={toggleSelectAll}
                      >
                        {isSelectAll && (
                          <FaCheck size={12} color={colors.white} />
                        )}
                      </div>
                    </div>
                    <div style={{ 
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      <div style={{ 
                        flex: 2,
                        color: colors.gray600,
                        fontWeight: 600,
                        fontSize: '13px'
                      }}>
                        Patient Name
                      </div>
                      <div style={{ 
                        flex: 1,
                        color: colors.gray600,
                        fontWeight: 600,
                        fontSize: '13px'
                      }}>
                        Hospital no.
                      </div>
                      <div style={{ 
                        flex: 1.5,
                        color: colors.gray600,
                        fontWeight: 600,
                        fontSize: '13px'
                      }}>
                        Missed Date
                      </div>
                      <div style={{ 
                        flex: 1,
                        color: colors.gray600,
                        fontWeight: 600,
                        fontSize: '13px'
                      }}>
                        Reason
                      </div>
                    </div>
                  </div>

                  {/* Grouped Appointments */}
                  <div style={{ paddingBottom: '16px' }}>
                    {Object.keys(groupedAppointments).map(dateKey => {
                      const group = groupedAppointments[dateKey];
                      const isExpanded = expandedGroups[dateKey] !== false;
                      const groupCount = group.appointments.length;
                      const groupSelectedCount = group.appointments.filter(
                        appt => selectedAppointments.includes(appt.schedule_id)
                      ).length;

                      return (
                        <div key={dateKey} style={{ 
                          borderBottom: `1px solid ${colors.gray200}`,
                          backgroundColor: isExpanded ? colors.white : colors.gray100
                        }}>
                          {/* Group Header */}
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '12px 24px',
                            cursor: 'pointer',
                            backgroundColor: isExpanded ? colors.white : colors.gray100,
                            transition: 'background-color 0.2s',
                          }}
                          onClick={() => toggleGroup(dateKey)}
                          >
                            <div style={{ 
                              width: '40px',
                              paddingRight: '16px',
                              flexShrink: 0,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              <FaChevronDown style={{ 
                                color: colors.gray500,
                                transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                                transition: 'transform 0.2s'
                              }} />
                            </div>
                            <div style={{ 
                              flex: 1,
                              display: 'flex',
                              alignItems: 'center'
                            }}>
                              <div style={{ 
                                flex: 2,
                                fontWeight: 600,
                                color: colors.dark,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                              }}>
                                {formatGroupDate(group.date)}
                                <span style={{
                                  backgroundColor: getAppointmentStatusColor(group.date),
                                  color: colors.white,
                                  fontSize: '12px',
                                  padding: '2px 8px',
                                  borderRadius: '10px'
                                }}>
                                  {groupCount} {groupCount === 1 ? 'appointment' : 'appointments'}
                                </span>
                              </div>
                              <div style={{ 
                                flex: 1,
                                color: colors.gray600,
                                fontWeight: 500
                              }}>
                                {groupSelectedCount > 0 && (
                                  <span style={{ 
                                    color: colors.primary,
                                    fontWeight: 600
                                  }}>
                                    {groupSelectedCount} selected
                                  </span>
                                )}
                              </div>
                              <div style={{ 
                                flex: 1.5,
                                color: colors.gray600
                              }}>
                                {/* Empty space for alignment */}
                              </div>
                              <div style={{ 
                                flex: 1,
                                color: colors.gray600
                              }}>
                                {/* Empty space for alignment */}
                              </div>
                            </div>
                          </div>

                          {/* Group Content */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                {group.appointments.map((appointment, index) => {
                                  const isSelected = selectedAppointments.includes(appointment.schedule_id);
                                  const statusColor = getAppointmentStatusColor(appointment.appointment_date);
                                  
                                  return (
                                    <div 
                                      key={appointment.schedule_id}
                                      style={{ 
                                        display: 'flex',
                                        alignItems: 'center',
                                        padding: '12px 24px',
                                        backgroundColor: isSelected 
                                          ? `${colors.primary}08` 
                                          : index % 2 === 0 ? colors.white : colors.gray100,
                                        transition: 'background-color 0.2s',
                                      }}
                                    >
                                      <div style={{ 
                                        width: '40px',
                                        paddingRight: '16px',
                                        flexShrink: 0
                                      }}>
                                        <div style={{
                                          width: '20px',
                                          height: '20px',
                                          borderRadius: '6px',
                                          border: `2px solid ${isSelected ? colors.primary : colors.gray400}`,
                                          backgroundColor: isSelected ? colors.primary : colors.white,
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          cursor: 'pointer',
                                          transition: 'all 0.2s',
                                        }}
                                        onClick={() => handleSelectAppointment(appointment.schedule_id)}
                                        >
                                          {isSelected && (
                                            <FaCheck size={12} color={colors.white} />
                                          )}
                                        </div>
                                      </div>
                                      <div style={{ 
                                        flex: 1,
                                        display: 'flex',
                                        alignItems: 'center'
                                      }}>
                                        <div style={{ 
                                          flex: 2,
                                          fontWeight: 500,
                                          color: colors.gray800
                                        }}>
                                          {appointment.first_name} {appointment.last_name}
                                        </div>
                                        <div style={{ 
                                          flex: 1,
                                          color: colors.gray700,
                                          fontFamily: 'monospace',
                                          fontWeight: 500
                                        }}>
                                          {appointment.hospitalNumber}
                                        </div>
                                        <div style={{ 
                                          flex: 1.5,
                                          color: statusColor,
                                          fontWeight: 500
                                        }}>
                                          {formatAppointmentDate(appointment.appointment_date)}
                                        </div>
                                        <div style={{ 
                                          flex: 1
                                        }}>
                                          {appointment.reschedule_reason ? (
                                            <button
                                              onClick={() => openReasonModal(appointment)}
                                              style={{
                                                background: 'none',
                                                border: 'none',
                                                color: colors.secondary,
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                padding: '8px 12px',
                                                borderRadius: '6px',
                                                maxWidth: '200px',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                                transition: 'all 0.2s',
                                              }}
                                            >
                                              <FaCommentAlt size={14} />
                                              <span style={{
                                                fontSize: '14px',
                                                fontWeight: 500
                                              }}>View reason</span>
                                            </button>
                                          ) : (
                                            <span style={{ 
                                              color: colors.gray500, 
                                              fontStyle: 'italic',
                                              fontSize: '14px',
                                              padding: '8px 12px',
                                              display: 'inline-block'
                                            }}>
                                              No reason provided
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div style={{ 
                padding: '16px 24px', 
                borderTop: `1px solid ${colors.gray200}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: colors.white,
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '6px',
                    backgroundColor: `${colors.primary}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <FaCheck size={12} color={colors.primary} />
                  </div>
                  <p style={{ 
                    margin: 0, 
                    fontSize: '14px', 
                    color: colors.gray700,
                    fontWeight: 500
                  }}>
                    <span style={{ color: colors.primary, fontWeight: 600 }}>
                      {selectedAppointments.length}
                    </span> selected
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    onClick={handleRescheduleSelected}
                    disabled={selectedAppointments.length === 0 || processing}
                    style={{
                      background: selectedAppointments.length === 0 
                        ? colors.gray300 
                        : colors.primary,
                      border: 'none',
                      padding: '8px 20px',
                      borderRadius: '6px',
                      cursor: selectedAppointments.length === 0 ? 'not-allowed' : 'pointer',
                      color: selectedAppointments.length === 0 ? colors.gray500 : colors.white,
                      fontWeight: 500,
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.2s',
                    }}
                  >
                    {processing ? (
                      <>
                        <FaSpinner className="spin" size={14} />
                        Processing...
                      </>
                    ) : (
                      <>
                        <FaCheck size={14} />
                        Reschedule Selected
                      </>
                    )}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Success Message */}
          {successMessage && (
            <div style={{ 
              padding: '12px 24px', 
              backgroundColor: `${colors.success}10`, 
              color: colors.success,
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              borderTop: `1px solid ${colors.success}20`,
              fontSize: '14px',
              fontWeight: 500
            }}>
              <div style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: `${colors.success}20`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <FaCheck size={12} />
              </div>
              <span>{successMessage}</span>
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* Reason Modal */}
      <RescheduleReasonModal 
        show={showReasonModal}
        onClose={() => setShowReasonModal(false)}
        reason={selectedReason}
        appointment={selectedAppointment}
        colors={colors}
      />

      {/* CSS for spinner animation */}
      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </>
  );
};

export default MissedAppointmentsNotification;