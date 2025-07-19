import React, { useEffect, useState } from 'react';
import { 
  FiCalendar, 
  FiAlertTriangle, 
  FiInfo, 
  FiBell, 
  FiCheckCircle,
  FiChevronRight,
  FiChevronDown,
  FiClock
} from 'react-icons/fi';
import axios from 'axios';
import Notification from '../../components/Notification';
import RescheduleModal from './RescheduleModal';
import ConfirmationModal from './ConfirmationModal';

const PatientSched = ({ dailyLimitReached, fetchDailyLimitStatus }) => {
    const [checkups, setCheckups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState(null);
    const [activeReminders, setActiveReminders] = useState([]);
    const [expandedCheckup, setExpandedCheckup] = useState(null);
    const [filter, setFilter] = useState('all');
    const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
    const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
    const [selectedCheckup, setSelectedCheckup] = useState(null);
    const [todayCheckup, setTodayCheckup] = useState(null);
    const [requiresConfirmation, setRequiresConfirmation] = useState(false);

    // Color palette
    const colors = {
        primary: '#395886',
        secondary: '#638ECB',
        white: '#FFFFFF',
        green: '#477977',
        lightBg: '#F5F7FA',
        border: '#E1E5EB',
        textPrimary: '#2C3E50',
        textSecondary: '#7F8C8D',
        warning: '#E67E22',
        danger: '#E74C3C',
        success: '#2ECC71'
    };

    const fetchUpcomingCheckups = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/patient/upcoming-checkups', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (response.data.success) {
                setCheckups(response.data.checkups);
                
                const now = new Date();
                const confirmableCheckups = response.data.checkups.filter(checkup => {
                    const appointmentDate = new Date(checkup.appointment_date);
                    const daysDiff = Math.floor((appointmentDate - now) / (1000 * 60 * 60 * 24));
                    return daysDiff >= 0 && daysDiff <= 2 &&
                           checkup.confirmation_status === 'pending' && 
                           checkup.checkup_status !== 'completed' && 
                           checkup.checkup_status !== 'cancelled';
                });
                
                confirmableCheckups.sort((a, b) => 
                    new Date(a.appointment_date) - new Date(b.appointment_date)
                );
                
                setRequiresConfirmation(confirmableCheckups.length > 0);
                
                if (confirmableCheckups.length > 0) {
                    setTodayCheckup(confirmableCheckups[0]);
                }
            } else {
                setNotification({
                    message: response.data.message || 'Failed to load checkup schedule',
                    type: 'error'
                });
            }
        } catch (error) {
            console.error('Error fetching checkups:', error);
            setNotification({
                message: error.response?.data?.message || 'Failed to load checkup schedule',
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUpcomingCheckups();
        
        const interval = setInterval(fetchUpcomingCheckups, 300000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (checkups.length > 0) {
            const reminders = [];
            const now = new Date();
            
            checkups.forEach(checkup => {
                const appointmentDate = new Date(checkup.appointment_date);
                const isPast = appointmentDate < now;
                let message = '';
                let priority = 0;
                let icon = <FiInfo />;
                
                if (isPast && checkup.checkup_status !== 'completed') {
                    message = `Missed checkup on ${formatDate(checkup.appointment_date)}`;
                    priority = 1;
                    icon = <FiAlertTriangle />;
                } else if (!isPast) {
                    const daysDiff = Math.floor((appointmentDate - now) / (1000 * 60 * 60 * 24));
                    
                    if (daysDiff === 0) {
                        message = `Your checkup is TODAY`;
                        priority = 3;
                        icon = <FiAlertTriangle />;
                    } else if (daysDiff === 2) {
                        message = `Your checkup is in 2 days`;
                        priority = 2;
                        icon = <FiAlertTriangle />;
                    } else if (daysDiff <= 7) {
                        message = `Upcoming checkup in ${daysDiff} DAY(S)`;
                        priority = 1;
                    }
                }
                
                if (message) {
                    reminders.push({
                        message,
                        priority,
                        date: checkup.appointment_date,
                        scheduleId: checkup.schedule_id,
                        icon,
                        isPast,
                        status: checkup.checkup_status
                    });
                }
            });
            
            reminders.sort((a, b) => b.priority - a.priority);
            setActiveReminders(reminders);
            
            if (reminders.length > 0 && !notification) {
                const topReminder = reminders[0];
                setNotification({
                    message: topReminder.message,
                    type: topReminder.priority >= 2 ? 'warning' : 'info',
                    persistent: topReminder.priority >= 2
                });
            }
        }
    }, [checkups]);

    const handleOpenRescheduleModal = (checkup) => {
        setSelectedCheckup(checkup);
        fetchDailyLimitStatus(checkup.appointment_date);
        setRescheduleModalOpen(true);
    };

    const handleOpenConfirmationModal = (checkup) => {
        setSelectedCheckup(checkup);
        setConfirmationModalOpen(true);
    };

    const handleRescheduleSuccess = (message) => {
        setNotification({
            message: message,
            type: 'success'
        });
        fetchUpcomingCheckups();
    };

    const handleConfirmationSuccess = (message) => {
        setNotification({
            message: message,
            type: 'success'
        });
        setRequiresConfirmation(false);
        fetchUpcomingCheckups();
    };

    const handleCloseNotification = () => {
        setNotification(null);
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const formatTimeRemaining = (dateString) => {
        const now = new Date();
        const appointmentDate = new Date(dateString);
        const diffMs = appointmentDate - now;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) {
            return `${Math.abs(diffDays)} days ago`;
        } else if (diffDays === 0) {
            return 'Today';
        }
        return `In ${diffDays} days`;
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            'confirmed': { 
                class: 'confirmed', 
                icon: <FiCheckCircle />, 
                label: 'Confirmed',
                bgColor: '#E6F7EE',
                textColor: colors.green
            },
            'pending': { 
                class: 'pending', 
                icon: <FiInfo />, 
                label: 'Pending',
                bgColor: '#FFF8E6',
                textColor: colors.warning
            },
            'cancelled': { 
                class: 'cancelled', 
                icon: <FiAlertTriangle />, 
                label: 'Cancelled',
                bgColor: '#FFEBEE',
                textColor: colors.danger
            },
            'completed': { 
                class: 'completed', 
                icon: <FiCheckCircle />, 
                label: 'Completed',
                bgColor: '#E8F5E9',
                textColor: colors.green
            },
            'pending_reschedule': { 
                class: 'pending', 
                icon: <FiInfo />, 
                label: 'Pending Reschedule',
                bgColor: '#FFF8E6',
                textColor: colors.warning
            }
        };
        
        const normalizedStatus = status ? status.toLowerCase() : 'pending';
        const config = statusMap[normalizedStatus] || { 
            class: 'default', 
            icon: <FiInfo />, 
            label: status,
            bgColor: '#F5F5F5',
            textColor: colors.textPrimary
        };
        
        return (
            <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '0.8rem',
                fontWeight: '500',
                backgroundColor: config.bgColor,
                color: config.textColor,
                marginRight: '8px'
            }}>
                {React.cloneElement(config.icon, { style: { marginRight: '4px', fontSize: '0.9rem' } })}
                {config.label}
            </span>
        );
    };

    const toggleCheckupDetails = (scheduleId) => {
        if (expandedCheckup === scheduleId) {
            setExpandedCheckup(null);
        } else {
            setExpandedCheckup(scheduleId);
        }
    };

    const isInConfirmationWindow = (appointmentDate) => {
        const now = new Date();
        const appointment = new Date(appointmentDate);
        const daysDiff = Math.floor((appointment - now) / (1000 * 60 * 60 * 24));
        return daysDiff >= 0 && daysDiff <= 2;
    };

    const filteredCheckups = checkups.filter(checkup => {
        const now = new Date();
        const appointmentDate = new Date(checkup.appointment_date);
        
        if (filter === 'upcoming') return appointmentDate >= now;
        if (filter === 'past') return appointmentDate < now;
        return true;
    });

    const sortedCheckups = [...filteredCheckups].sort((a, b) => {
        return new Date(a.appointment_date) - new Date(b.appointment_date);
    });

    return (
        <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '20px',
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            backgroundColor: colors.lightBg,
            minHeight: '100vh'
        }}>
            {notification && (
                <Notification
                    message={notification.message}
                    type={notification.type}
                    onClose={handleCloseNotification}
                    persistent={notification.persistent}
                />
            )}
            
            <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '24px',
                color: colors.primary,
                padding: '16px',
                backgroundColor: colors.white,
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}>
                <FiCalendar style={{ 
                    marginRight: '12px', 
                    fontSize: '24px',
                    color: colors.secondary 
                }} />
                <h2 style={{ 
                    margin: '0', 
                    fontSize: '24px', 
                    fontWeight: '600',
                    color: colors.primary
                }}>Checkup Schedule</h2>
            </div>
            
            {requiresConfirmation && todayCheckup && (
                <div style={{
                    backgroundColor: '#FFF8E1',
                    borderLeft: `4px solid ${colors.warning}`,
                    padding: '16px',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <FiAlertTriangle style={{ 
                            color: colors.warning, 
                            fontSize: '24px',
                            marginRight: '12px'
                        }} />
                        <div>
                            <h4 style={{ 
                                margin: '0 0 4px 0', 
                                color: colors.textPrimary 
                            }}>
                                Appointment Confirmation Required
                            </h4>
                            <p style={{ 
                                margin: 0, 
                                color: colors.textPrimary 
                            }}>
                                Please confirm your appointment on {formatDate(todayCheckup.appointment_date)} to secure your slot.
                                {new Date(todayCheckup.appointment_date).toDateString() === new Date().toDateString() ? 
                                    " (Today)" : 
                                    new Date(todayCheckup.appointment_date).getDate() === new Date().getDate() + 1 ? 
                                    " (Tomorrow)" : 
                                    " (Day after tomorrow)"}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => handleOpenConfirmationModal(todayCheckup)}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: colors.warning,
                            color: colors.white,
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontWeight: '500',
                            transition: 'all 0.2s ease',
                            ':hover': {
                                backgroundColor: '#D35400'
                            }
                        }}
                    >
                        Confirm Now
                    </button>
                </div>
            )}
            
            {activeReminders.length > 0 && (
                <div style={{
                    backgroundColor: colors.white,
                    borderRadius: '8px',
                    padding: '16px',
                    marginBottom: '24px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: '16px',
                        color: colors.primary
                    }}>
                        <FiBell style={{ 
                            marginRight: '12px', 
                            fontSize: '20px',
                            color: colors.secondary 
                        }} />
                        <h3 style={{ 
                            margin: '0', 
                            fontSize: '18px', 
                            fontWeight: '600',
                            color: colors.primary
                        }}>Checkup Alerts</h3>
                    </div>
                    <div>
                        {activeReminders.map((reminder, index) => (
                            <div key={index} style={{
                                display: 'flex',
                                padding: '12px',
                                borderRadius: '6px',
                                marginBottom: '8px',
                                backgroundColor: 
                                    reminder.priority === 3 ? '#FFF3E0' : 
                                    reminder.priority === 2 ? '#FFF8E1' : '#E8F4F8',
                                borderLeft: `4px solid ${
                                    reminder.priority === 3 ? colors.warning : 
                                    reminder.priority === 2 ? '#FFC107' : colors.secondary
                                }`,
                                opacity: reminder.isPast ? 0.7 : 1
                            }}>
                                <div style={{
                                    marginRight: '12px',
                                    color: 
                                        reminder.priority === 3 ? colors.warning : 
                                        reminder.priority === 2 ? '#FF8F00' : colors.secondary,
                                    fontSize: '20px'
                                }}>
                                    {reminder.icon}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ 
                                        margin: '0 0 8px 0', 
                                        fontWeight: '500',
                                        color: colors.textPrimary
                                    }}>{reminder.message}</p>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        fontSize: '0.85rem',
                                        color: colors.textSecondary
                                    }}>
                                        <span style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            marginRight: '16px'
                                        }}>
                                            {formatTimeRemaining(reminder.date)}
                                        </span>
                                        {reminder.status && (
                                            <span style={{
                                                display: 'flex',
                                                alignItems: 'center'
                                            }}>
                                                Status: {getStatusBadge(reminder.status)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Added Reminder Section */}
            <div style={{
                backgroundColor: '#E3F2FD',
                borderLeft: `4px solid ${colors.secondary}`,
                padding: '16px',
                borderRadius: '8px',
                marginBottom: '24px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                    <FiInfo style={{ 
                        color: colors.secondary, 
                        fontSize: '20px',
                        marginRight: '12px'
                    }} />
                    <h4 style={{ 
                        margin: 0, 
                        color: colors.textPrimary,
                        fontSize: '16px'
                    }}>
                        Important Reminders for Your Appointment
                    </h4>
                </div>
                <ul style={{ 
                    margin: '8px 0 0 0', 
                    paddingLeft: '20px',
                    color: colors.textPrimary
                }}>
                    <li>Please bring any recent lab results or medical reports</li>
                    <li>Don't forget to bring your current prescriptions</li>
                    <li>Remember to claim your PD solution if applicable</li>
                </ul>
            </div>
            
            {loading ? (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '200px',
                    backgroundColor: colors.white,
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}>
                    <div style={{
                        border: '4px solid #f3f3f3',
                        borderTop: `4px solid ${colors.secondary}`,
                        borderRadius: '50%',
                        width: '40px',
                        height: '40px',
                        animation: 'spin 1s linear infinite',
                        marginBottom: '16px'
                    }}></div>
                    <p style={{ 
                        color: colors.textSecondary, 
                        fontSize: '16px' 
                    }}>Loading your checkup schedule...</p>
                </div>
            ) : (
                <>
                    <div style={{
                        display: 'flex',
                        gap: '8px',
                        marginBottom: '24px',
                        backgroundColor: colors.white,
                        padding: '12px',
                        borderRadius: '8px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                    }}>
                        <button 
                            style={{
                                padding: '8px 16px',
                                borderRadius: '20px',
                                border: 'none',
                                backgroundColor: filter === 'all' ? colors.primary : colors.lightBg,
                                color: filter === 'all' ? colors.white : colors.textPrimary,
                                fontWeight: '500',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                ':hover': {
                                    backgroundColor: filter === 'all' ? colors.secondary : colors.border
                                }
                            }}
                            onClick={() => setFilter('all')}
                        >
                            All Appointments
                        </button>
                        <button 
                            style={{
                                padding: '8px 16px',
                                borderRadius: '20px',
                                border: 'none',
                                backgroundColor: filter === 'upcoming' ? colors.green : colors.lightBg,
                                color: filter === 'upcoming' ? colors.white : colors.textPrimary,
                                fontWeight: '500',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                ':hover': {
                                    backgroundColor: filter === 'upcoming' ? '#3A6B69' : colors.border
                                }
                            }}
                            onClick={() => setFilter('upcoming')}
                        >
                            Upcoming
                        </button>
                        <button 
                            style={{
                                padding: '8px 16px',
                                borderRadius: '20px',
                                border: 'none',
                                backgroundColor: filter === 'past' ? '#95A5A6' : colors.lightBg,
                                color: filter === 'past' ? colors.white : colors.textPrimary,
                                fontWeight: '500',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                ':hover': {
                                    backgroundColor: filter === 'past' ? '#7F8C8D' : colors.border
                                }
                            }}
                            onClick={() => setFilter('past')}
                        >
                            Past
                        </button>
                    </div>
                    
                    <div>
                        {sortedCheckups.length > 0 ? (
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                                gap: '20px'
                            }}>
                                {sortedCheckups.map(checkup => {
                                    const isExpanded = expandedCheckup === checkup.schedule_id;
                                    const isPast = new Date(checkup.appointment_date) < new Date();
                                    const isToday = new Date(checkup.appointment_date).toDateString() === new Date().toDateString();
                                    const canConfirm = isInConfirmationWindow(checkup.appointment_date) && 
                                                     checkup.confirmation_status === 'pending' && 
                                                     checkup.checkup_status !== 'completed' && 
                                                     checkup.checkup_status !== 'cancelled';
                                    const canReschedule = !isPast && 
                                                        checkup.checkup_status !== 'completed' && 
                                                        checkup.checkup_status !== 'cancelled' &&
                                                        checkup.confirmation_status !== 'confirmed';
                                    
                                    return (
                                        <div 
                                            key={checkup.schedule_id} 
                                            style={{
                                                backgroundColor: colors.white,
                                                borderRadius: '8px',
                                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                                overflow: 'hidden',
                                                borderLeft: isToday ? `4px solid ${colors.warning}` : `4px solid ${colors.secondary}`,
                                                opacity: isPast ? 0.8 : 1,
                                                transition: 'transform 0.2s ease',
                                                ':hover': {
                                                    transform: 'translateY(-2px)'
                                                }
                                            }}
                                        >
                                            <div 
                                                style={{
                                                    display: 'flex',
                                                    padding: '16px',
                                                    cursor: 'pointer',
                                                    transition: 'background-color 0.2s ease',
                                                    ':hover': {
                                                        backgroundColor: colors.lightBg
                                                    }
                                                }} 
                                                onClick={() => toggleCheckupDetails(checkup.schedule_id)}
                                            >
                                                <div style={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    minWidth: '60px',
                                                    backgroundColor: isPast ? colors.lightBg : '#E3F2FD',
                                                    borderRadius: '6px',
                                                    padding: '8px',
                                                    marginRight: '16px'
                                                }}>
                                                    <div style={{
                                                        fontSize: '24px',
                                                        fontWeight: '600',
                                                        color: isPast ? colors.textSecondary : colors.secondary
                                                    }}>
                                                        {new Date(checkup.appointment_date).getDate()}
                                                    </div>
                                                    <div style={{
                                                        fontSize: '12px',
                                                        fontWeight: '500',
                                                        textTransform: 'uppercase',
                                                        color: isPast ? colors.textSecondary : colors.secondary
                                                    }}>
                                                        {new Date(checkup.appointment_date).toLocaleString('default', { month: 'short' })}
                                                    </div>
                                                    <div style={{
                                                        fontSize: '12px',
                                                        color: isPast ? colors.textSecondary : colors.secondary
                                                    }}>
                                                        {new Date(checkup.appointment_date).getFullYear()}
                                                    </div>
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <h4 style={{ 
                                                        margin: '0 0 4px 0',
                                                        color: colors.textPrimary
                                                    }}>{checkup.first_name} {checkup.last_name}</h4>
                                                    <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                                                        {getStatusBadge(checkup.confirmation_status)}
                                                        {getStatusBadge(checkup.checkup_status)}
                                                    </div>
                                                </div>
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    color: colors.textSecondary,
                                                    fontSize: '20px'
                                                }}>
                                                    {isExpanded ? <FiChevronDown /> : <FiChevronRight />}
                                                </div>
                                            </div>
                                            
                                            {isExpanded && (
                                                <div style={{
                                                    padding: '16px',
                                                    borderTop: `1px solid ${colors.border}`,
                                                    backgroundColor: colors.lightBg
                                                }}>
                                                    <div style={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        marginBottom: '8px'
                                                    }}>
                                                        <span style={{ 
                                                            fontWeight: '500',
                                                            color: colors.textSecondary
                                                        }}>Date:</span>
                                                        <span style={{ color: colors.textPrimary }}>{formatDate(checkup.appointment_date)}</span>
                                                    </div>
                                                    <div style={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        marginBottom: '8px'
                                                    }}>
                                                        <span style={{ 
                                                            fontWeight: '500',
                                                            color: colors.textSecondary
                                                        }}>Status:</span>
                                                        <span>{getStatusBadge(checkup.checkup_status)}</span>
                                                    </div>
                                                    <div style={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        marginBottom: '8px'
                                                    }}>
                                                        <span style={{ 
                                                            fontWeight: '500',
                                                            color: colors.textSecondary
                                                        }}>Confirmation:</span>
                                                        <span>{getStatusBadge(checkup.confirmation_status)}</span>
                                                    </div>
                                                    <div style={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        marginBottom: '8px'
                                                    }}>
                                                        <span style={{ 
                                                            fontWeight: '500',
                                                            color: colors.textSecondary
                                                        }}>Time Remaining:</span>
                                                        <span>
                                                            {formatTimeRemaining(checkup.appointment_date)}
                                                        </span>
                                                    </div>
                                                    {checkup.remarks && (
                                                        <div style={{
                                                            display: 'flex',
                                                            justifyContent: 'space-between'
                                                        }}>
                                                            <span style={{ 
                                                                fontWeight: '500',
                                                                color: colors.textSecondary
                                                            }}>Remarks:</span>
                                                            <span style={{ 
                                                                color: colors.textPrimary,
                                                                textAlign: 'right',
                                                                maxWidth: '70%'
                                                            }}>{checkup.remarks}</span>
                                                        </div>
                                                    )}
                                                    {!isPast && checkup.checkup_status !== 'completed' && checkup.checkup_status !== 'cancelled' && (
                                                        <div style={{ 
                                                            display: 'flex', 
                                                            gap: '10px', 
                                                            marginTop: '16px' 
                                                        }}>
                                                            {canConfirm && (
                                                                <button
                                                                    onClick={() => handleOpenConfirmationModal(checkup)}
                                                                    style={{
                                                                        flex: 1,
                                                                        padding: '8px 16px',
                                                                        backgroundColor: colors.green,
                                                                        color: colors.white,
                                                                        border: 'none',
                                                                        borderRadius: '4px',
                                                                        cursor: 'pointer',
                                                                        fontWeight: '500',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        transition: 'all 0.2s ease',
                                                                        ':hover': {
                                                                            backgroundColor: '#3A6B69'
                                                                        }
                                                                    }}
                                                                >
                                                                    {isToday ? 'Confirm Attendance' : 'Confirm Appointment'}
                                                                </button>
                                                            )}
                                                            {canReschedule && (
                                                                <button
                                                                    onClick={() => handleOpenRescheduleModal(checkup)}
                                                                    style={{
                                                                        flex: 1,
                                                                        padding: '8px 16px',
                                                                        backgroundColor: colors.warning,
                                                                        color: colors.white,
                                                                        border: 'none',
                                                                        borderRadius: '4px',
                                                                        cursor: 'pointer',
                                                                        fontWeight: '500',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        opacity: dailyLimitReached && isToday ? 0.5 : 1,
                                                                        transition: 'all 0.2s ease',
                                                                        ':hover': {
                                                                            backgroundColor: dailyLimitReached && isToday ? colors.warning : '#D35400'
                                                                        }
                                                                    }}
                                                                    disabled={dailyLimitReached && isToday}
                                                                    title={dailyLimitReached && isToday ? 
                                                                        "Daily limit reached. Cannot reschedule to today." : ""}
                                                                >
                                                                    Request Reschedule
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '40px 20px',
                                backgroundColor: colors.white,
                                borderRadius: '8px',
                                textAlign: 'center',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                            }}>
                                <p style={{ 
                                    marginBottom: '16px',
                                    color: colors.textSecondary,
                                    fontSize: '16px'
                                }}>No checkups found</p>
                                {filter !== 'all' && (
                                    <button 
                                        style={{
                                            padding: '8px 16px',
                                            borderRadius: '20px',
                                            border: 'none',
                                            backgroundColor: colors.primary,
                                            color: colors.white,
                                            fontWeight: '500',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                            ':hover': {
                                                backgroundColor: colors.secondary
                                            }
                                        }}
                                        onClick={() => setFilter('all')}
                                    >
                                        Show all appointments
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </>
            )}

            <RescheduleModal
                isOpen={rescheduleModalOpen}
                onClose={() => setRescheduleModalOpen(false)}
                scheduleId={selectedCheckup?.schedule_id}
                currentDate={selectedCheckup?.appointment_date}
                onRescheduleSuccess={handleRescheduleSuccess}
                dailyLimitReached={dailyLimitReached}
                colors={colors}
            />

            <ConfirmationModal
                isOpen={confirmationModalOpen}
                onClose={() => setConfirmationModalOpen(false)}
                scheduleId={selectedCheckup?.schedule_id}
                onConfirmationSuccess={handleConfirmationSuccess}
                colors={colors}
            />
        </div>
    );
};

export default PatientSched;