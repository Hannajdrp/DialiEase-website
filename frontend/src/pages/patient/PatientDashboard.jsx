import React, { useEffect, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import '../../css/PatientDashboard.css';
import PatientSidebar from './PatientSidebar';
import Notification from '../../components/Notification';
import PatientCheckups from './PatientSched';
import TreatmentStatus from './TreatmentStatus';
import HealthOverview from './HealthOverview';
import TreatmentHistoryModal from './TreatmentHistoryModal';
import HandHygieneReminder from './HandHygieneReminder';
import TermsAndConditions from '../../components/TermsAndConditions';
import DwellTimerModal from './DwellTimerModal';
import NewPatientWelcome from './NewPatientWelcome';
import staffPic from "../../assets/images/staffPic.png";
import { createGlobalStyle } from 'styled-components';
import axios from 'axios';
import { 
  FiClock, 
  FiCalendar,
  FiList,
  FiAlertTriangle,
  FiInfo,
  FiBell,
  FiAward,
  FiHeart,
  FiDroplet
} from 'react-icons/fi';
import { toast } from 'react-toastify';

const PatientDashboard = () => {
  const [user, setUser] = useState(null);
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ongoingTreatment, setOngoingTreatment] = useState(null);
  const [treatmentLoading, setTreatmentLoading] = useState(true);
  const [treatmentHistory, setTreatmentHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [drainAlarm, setDrainAlarm] = useState(false);
  const [drainAlarmMessage, setDrainAlarmMessage] = useState('');
  const [healthAlerts, setHealthAlerts] = useState([]);
  const [healthTips, setHealthTips] = useState([]);
  const [complianceStatus, setComplianceStatus] = useState({
    completed: 0,
    remaining: 3,
    needsReminder: true
  });
  const [missedDays, setMissedDays] = useState([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [reminders, setReminders] = useState([]);
  const [confirmationStatus, setConfirmationStatus] = useState(null);
  const [dailyLimitReached, setDailyLimitReached] = useState(false);
  const [firstTimeUser, setFirstTimeUser] = useState(false);
  const navigate = useNavigate();
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [showDwellTimer, setShowDwellTimer] = useState(false);
  const [isTimerMinimized, setIsTimerMinimized] = useState(false);
  const [currentDwellTime, setCurrentDwellTime] = useState(null);
  const [treatmentStartTime, setTreatmentStartTime] = useState(null);
  const [isNewPatient, setIsNewPatient] = useState(false);

  const colors = {
    primary: '#395886',
    secondary: '#638ECB',
    white: '#FFFFFF',
    green: '#477977',
    lightBg: '#F5F8FC',
    alert: '#FF6B6B',
    warning: '#FFA500',
    success: '#4CAF50',
    info: '#17a2b8',
    textMuted: '#6c757d'
  };

  useEffect(() => {
    const checkPatientStatus = async () => {
      try {
        const response = await axios.get('/patient/status', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        setIsNewPatient(response.data.isNewPatient);
      } catch (error) {
        console.error('Error checking patient status:', error);
      }
    };

    if (user && termsAccepted) {
      checkPatientStatus();
    }
  }, [user, termsAccepted]);

  useEffect(() => {
    const checkOngoingTreatment = async () => {
      try {
        const dwellTime = localStorage.getItem('currentDwellTime');
        const startTime = localStorage.getItem('treatmentStartTime');
        
        if (dwellTime && startTime) {
          setCurrentDwellTime(parseInt(dwellTime));
          setTreatmentStartTime(new Date(startTime));
          setShowDwellTimer(true);
        }
      } catch (error) {
        console.error('Error checking ongoing treatment:', error);
      }
    };

    checkOngoingTreatment();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const checkTerms = async () => {
      try {
        const response = await axios.get('/patient/terms-status', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.data.AccStatus === 'pending' || response.data.TermsAndCondition !== 'agreed') {
          setTermsAccepted(false);
        } else {
          setTermsAccepted(true);
        }
      } catch (error) {
        console.error('Error checking terms status:', error);
      }
    };

    if (user) {
      checkTerms();
    }
  }, [user]);

  const convertToPHTime = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return new Date(date.getTime() + (8 * 60 * 60 * 1000));
  };

  const fetchConfirmationStatus = async () => {
    try {
      const response = await axios.get('/patient/confirmation-status', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setConfirmationStatus(response.data);
      if (response.data.requiresConfirmation) {
        setReminders(prev => [...prev, {
          id: 'confirmation-reminder',
          type: 'urgent',
          message: `Please confirm your appointment for ${formatDateOnly(response.data.appointmentDate)}`,
          action: () => navigate('/confirm-appointment')
        }]);
      }
    } catch (error) {
      console.error('Error fetching confirmation status:', error);
    }
  };

  const fetchDailyLimitStatus = async (date) => {
    try {
      const response = await axios.get('/patient/daily-limit-status', {
        params: { date },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setDailyLimitReached(response.data.limitReached);
    } catch (error) {
      console.error('Error fetching daily limit status:', error);
    }
  };

  const calculateMissedDays = useCallback((treatments) => {
    if (treatments.length === 0) return [];
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const pastWeekDates = [];
    
    for (let i = 1; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      pastWeekDates.push(date);
    }

    const missedDaysList = pastWeekDates.filter(date => {
      const treatmentsOnDate = treatments.filter(treatment => {
        const treatmentDate = convertToPHTime(treatment.treatmentDate);
        return (
          treatmentDate.getDate() === date.getDate() &&
          treatmentDate.getMonth() === date.getMonth() &&
          treatmentDate.getFullYear() === date.getFullYear() &&
          treatment.TreatmentStatus.toLowerCase() === 'completed'
        );
      });
      return treatmentsOnDate.length < 3;
    });

    return missedDaysList;
  }, []);

  const checkDrainTime = useCallback(() => {
    if (!ongoingTreatment?.outSolution?.DrainStarted || ongoingTreatment.outSolution.DrainFinished) {
      setDrainAlarm(false);
      return;
    }

    const now = new Date();
    const drainTime = convertToPHTime(ongoingTreatment.outSolution.DrainStarted);
    const dwellTimeHours = ongoingTreatment.inSolution?.Dwell || 0;
    
    const expectedDrainTime = new Date(drainTime.getTime() + (dwellTimeHours * 60 * 60 * 1000));
    const warningTime = new Date(expectedDrainTime.getTime() - (15 * 60 * 1000));
    
    if (now >= expectedDrainTime) {
      setDrainAlarm(true);
      setDrainAlarmMessage('Drain process overdue! Please complete the drain immediately for your safety.');
    } else if (now >= warningTime) {
      setDrainAlarm(true);
      const minutesRemaining = Math.ceil((expectedDrainTime - now) / (60 * 1000));
      setDrainAlarmMessage(`Prepare to drain soon. Your treatment will be more effective if completed on schedule.`);
    } else {
      setDrainAlarm(false);
    }
  }, [ongoingTreatment]);

  const analyzeHealthData = useCallback(() => {
    if (!treatmentHistory.length) return;
    
    const alerts = [];
    const tips = [];
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const recentUFVolumes = treatmentHistory
      .filter(treatment => {
        const treatmentDate = convertToPHTime(treatment.treatmentDate);
        return treatmentDate > new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      })
      .map(treatment => {
        const uf = treatment.outSolution?.VolumeOut - treatment.inSolution?.VolumeIn;
        return isNaN(uf) ? null : uf;
      })
      .filter(uf => uf !== null);
    
    if (recentUFVolumes.length > 3) {
      const avgUF = recentUFVolumes.reduce((a, b) => a + b, 0) / recentUFVolumes.length;
      const lastUF = recentUFVolumes[recentUFVolumes.length - 1];
      
      if (lastUF > avgUF * 1.3) {
        alerts.push({
          type: 'warning',
          message: 'Higher than average fluid removal detected. Monitor for dehydration symptoms.',
          priority: 2
        });
      } else if (lastUF < avgUF * 0.7) {
        alerts.push({
          type: 'warning',
          message: 'Lower than average fluid removal detected. Watch for swelling or shortness of breath.',
          priority: 2
        });
      }
    }
    
    tips.push({
      type: 'info',
      message: 'Maintain a balanced diet with controlled sodium and potassium intake for better treatment outcomes.'
    });
    
    tips.push({
      type: 'info',
      message: 'Regular gentle exercise between treatments can improve circulation and overall wellbeing.'
    });
    
    tips.push({
      type: 'info',
      message: 'Monitor your weight daily at the same time to track fluid balance effectively.'
    });
    
    alerts.sort((a, b) => b.priority - a.priority);
    setHealthAlerts(alerts);
    setHealthTips(tips);
  }, [treatmentHistory]);

  useEffect(() => {
    const interval = setInterval(() => {
      checkDrainTime();
    }, 60000);
    
    checkDrainTime();

    return () => clearInterval(interval);
  }, [checkDrainTime]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem("user"));
        const token = localStorage.getItem("token");

        if (!token || !userData) {
          throw new Error("No authentication data found");
        }

        if (userData.userLevel !== 'patient') {
          throw new Error("Unauthorized access level");
        }

        setUser(userData);
        setNotification({
          message: `Welcome back, ${userData.first_name}!`,
          type: 'success',
        });
        await fetchConfirmationStatus();
      } catch (error) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setNotification({
          message: error.message || "Session expired. Please login again.",
          type: 'error',
        });
        setTimeout(() => navigate("/login"), 2000);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  const fetchOngoingTreatment = async () => {
    try {
      setTreatmentLoading(true);
      const response = await axios.get('/patient/treatments/ongoing', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data.success && response.data.has_ongoing) {
        setOngoingTreatment(response.data.treatment);
      } else {
        setOngoingTreatment(null);
      }
    } catch (error) {
      console.error('Error fetching ongoing treatment:', error);
      setNotification({
        message: error.response?.data?.message || 'Failed to load treatment data',
        type: 'error'
      });
    } finally {
      setTreatmentLoading(false);
    }
  };

  const fetchTreatmentHistory = async () => {
    try {
      setHistoryLoading(true);
      const response = await axios.get('/patient/treatments/recent', {
        params: { limit: 100 },
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.data.success) {
        const treatments = response.data.treatments || [];
        setTreatmentHistory(treatments);
        
        if (treatments.length === 0) {
          setFirstTimeUser(true);
        } else {
          setFirstTimeUser(false);
        }
        
        const completedToday = treatments.filter(t => {
          const treatmentDate = convertToPHTime(t.treatmentDate);
          const now = new Date();
          return (
            treatmentDate.getDate() === now.getDate() &&
            treatmentDate.getMonth() === now.getMonth() &&
            treatmentDate.getFullYear() === now.getFullYear() &&
            t.TreatmentStatus.toLowerCase() === 'completed'
          );
        }).length;

        setComplianceStatus({
          completed: completedToday,
          remaining: Math.max(0, 3 - completedToday),
          needsReminder: completedToday < 3
        });
        
        setMissedDays(calculateMissedDays(treatments));
      }
    } catch (error) {
      console.error('Error fetching treatment history:', error);
      setNotification({
        message: error.response?.data?.message || 'Failed to load treatment history',
        type: 'error'
      });
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchOngoingTreatment();
      fetchTreatmentHistory();
    }
  }, [user]);

  useEffect(() => {
    analyzeHealthData();
  }, [treatmentHistory, analyzeHealthData]);

  const handleCloseNotification = () => {
    setNotification(null);
  };

  const formatDateOnly = (dateString) => {
    if (!dateString) return 'N/A';
    const date = convertToPHTime(dateString);
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      timeZone: 'Asia/Manila'
    };
    return date.toLocaleDateString('en-PH', options);
  };

  const handleEndTreatmentEarly = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get('/patient/treatments/ongoing', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success && response.data.has_ongoing) {
        await axios.patch(`/patient/treatments/${response.data.treatment.Treatment_ID}`, {
          status: 'completed',
          early_termination: true
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        localStorage.removeItem('currentDwellTime');
        localStorage.removeItem('treatmentStartTime');
        
        setShowDwellTimer(false);
        fetchOngoingTreatment();
        fetchTreatmentHistory();
        
        setNotification({
          message: 'Treatment ended successfully',
          type: 'success'
        });
      }
    } catch (error) {
      console.error('Error ending treatment:', error);
      setNotification({
        message: error.response?.data?.message || 'Failed to end treatment',
        type: 'error'
      });
    }
  };

  const groupTreatmentsByDate = () => {
    const grouped = {};
    
    treatmentHistory.forEach(treatment => {
      const phDate = convertToPHTime(treatment.treatmentDate);
      const dateKey = phDate.toDateString();
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      
      grouped[dateKey].push(treatment);
    });
    
    return grouped;
  };

  const calculateBalance = (treatment) => {
    const volumeIn = treatment.inSolution?.VolumeIn || 0;
    const volumeOut = treatment.outSolution?.VolumeOut || 0;
    const balance = volumeOut - volumeIn;
    
    if (isNaN(balance)) return '---';
    
    if (volumeOut < volumeIn) {
      return `-${Math.abs(balance)}`;
    }
    return `${balance}`;
  };

  if (loading) {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        backgroundColor: colors.lightBg,
        zIndex: 9999,
        height: '100dvh',
        width: '100vw',
      }}>
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
        <div style={{
          width: '60px',
          height: '60px',
          border: '6px solid #e0e0e0',
          borderTop: `6px solid ${colors.primary}`,
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }}></div>
        <p style={{
          color: colors.primary,
          fontSize: '16px',
          fontFamily: 'Arial, sans-serif'
        }}>
          Please wait while we get things ready…
        </p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (user && !termsAccepted) {
    return <TermsAndConditions 
             patient={user} 
             onAgree={() => setTermsAccepted(true)} 
           />;
  }

  if (isNewPatient) {
    return (
      <div style={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: colors.lightBg,
      }}>
        <PatientSidebar user={user} colors={colors} />
        
        <main style={{
          flex: 1,
          padding: '30px',
          marginLeft: '280px',
          maxWidth: 'calc(100% - 280px)',
          transition: 'all 0.3s ease',
        }}>
          <NewPatientWelcome colors={colors} user={user} />
        </main>
      </div>
    );
  }

  const groupedTreatments = groupTreatmentsByDate();

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: colors.lightBg,
    }}>
      <PatientSidebar user={user} colors={colors} />
      
      <main style={{
        flex: 1,
        padding: '30px',
        marginLeft: '280px',
        maxWidth: 'calc(100% - 280px)',
        transition: 'all 0.3s ease',
        marginTop: '620px',
      }}>
        
        {/* Date Section */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{
            color: colors.green,
            fontSize: '0.95rem',
            marginBottom: '2rem',
            paddingLeft: '1rem',
            fontWeight: '600'
          }}>
            {currentDateTime.toLocaleDateString(undefined, { weekday: "long" })}
            {", "}
            {currentDateTime.toLocaleDateString(undefined, { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h3>
        </div>

        {/* New Header Section with First-time User Welcome or Missed Treatments */}
        <div style={{ 
          marginBottom: '2rem', 
          display: 'flex', 
          gap: '2rem',
          '@media (max-width: 1200px)': {
            flexDirection: 'column' 
          }
        }}>
          {/* Main Header Card */}
          <div style={{
            backgroundColor: colors.primary,
            borderRadius: '20px',
            padding: '2rem',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '2rem',
            position: 'relative',
            overflow: 'hidden',
            height: '14rem',
            flex: 2,
            transition: 'all 0.3s ease',
            ':hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)',
            }
          }}>
            <div style={{ zIndex: 2 }}>
              <h1 style={{
                fontSize: '1.5rem',
                color: colors.white,
                margin: '0',
                fontWeight: '600'
              }}>Good Day, {user.first_name}!</h1>
              <h2 style={{
                fontSize: '1rem',
                fontWeight: '400',
                color: 'rgba(255, 255, 255, 0.9)',
                margin: '1rem 0',
                maxWidth: '60%',
                lineHeight: '1.5'
              }}>
                Every treatment is a step toward better days ahead. You're doing amazing!
              </h2>
              <p style={{
                fontSize: '0.95rem',
                color: 'rgba(255, 255, 255, 0.8)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <FiHeart /> Progress, one step at a time.
              </p>
            </div>
            <img 
              src={staffPic} 
              alt="Staff" 
              style={{
                position: 'absolute',
                right: 0,
                height: '100%',
                borderRadius: '0 20px 20px 0',
                objectFit: 'cover',
                opacity: 0.9
              }}
            />
          </div>

          {/* First-time User Welcome or Missed Treatments Section */}
          {firstTimeUser ? (
            <div style={{
              backgroundColor: colors.white,
              borderRadius: '20px',
              padding: '2rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              borderLeft: `5px solid ${colors.info}`,
              transition: 'all 0.3s ease',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              ':hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 16px rgba(0,0,0,0.12)'
              }
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '15px'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: `${colors.info}20`,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: '15px',
                  flexShrink: 0
                }}>
                  <FiAward style={{ 
                    color: colors.info,
                    fontSize: '24px'
                  }} />
                </div>
                <div>
                  <h3 style={{ 
                    margin: '0 0 5px 0',
                    color: colors.primary,
                    fontSize: '1.2rem',
                    fontWeight: '600'
                  }}>Welcome to Your Dialysis Journey!</h3>
                </div>
              </div>
              
              <p style={{
                margin: '0 0 15px 0',
                color: `${colors.primary}AA`,
                lineHeight: '1.6',
                fontSize: '0.9rem'
              }}>
                We're here to support you every step of the way.
              </p>
              
              <button 
                style={{
                  backgroundColor: colors.info,
                  color: colors.white,
                  border: 'none',
                  padding: '10px 15px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  alignSelf: 'flex-start',
                  transition: 'all 0.2s ease',
                  ':hover': {
                    opacity: 0.9,
                    transform: 'translateY(-1px)',
                  }
                }}
                onClick={() => navigate('/patient-education')}
              >
                <FiInfo /> Learn More
              </button>
            </div>
          ) : (
            !firstTimeUser && missedDays.length > 0 && treatmentHistory.length > 0 && (
              <div style={{
                backgroundColor: colors.white,
                borderRadius: '20px',
                padding: '2rem',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                borderLeft: `5px solid ${colors.warning}`,
                transition: 'all 0.3s ease',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                ':hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 16px rgba(0,0,0,0.12)'
                }
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '15px'
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: `${colors.warning}20`,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: '15px',
                    flexShrink: 0
                  }}>
                    <FiAlertTriangle style={{ 
                      color: colors.warning,
                      fontSize: '24px'
                    }} />
                  </div>
                  <div>
                    <h3 style={{ 
                      margin: '0 0 5px 0',
                      color: colors.primary,
                      fontSize: '1.2rem',
                      fontWeight: '600'
                    }}>Missed Treatments Detected</h3>
                  </div>
                </div>
                
                <p style={{
                  margin: '0 0 15px 0',
                  color: `${colors.primary}AA`,
                  lineHeight: '1.6',
                  fontSize: '0.9rem'
                }}>
                  You missed completing all treatments on <strong>{missedDays.length}</strong> day{missedDays.length > 1 ? 's' : ''} in the past week.
                </p>
                
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px',
                  marginBottom: '15px'
                }}>
                  {missedDays.map((date, index) => (
                    <span key={index} style={{
                      backgroundColor: `${colors.warning}20`,
                      color: colors.warning,
                      padding: '4px 10px',
                      borderRadius: '20px',
                      fontSize: '13px',
                      fontWeight: '500'
                    }}>
                      {date.toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                  ))}
                </div>
                
              </div>
            )
          )}
        </div>

        {/* Reminders Section */}
        {reminders.length > 0 && (
          <div style={{
            backgroundColor: colors.white,
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '25px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            borderLeft: `4px solid ${colors.warning}`,
            transition: 'all 0.3s ease'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '15px'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: `${colors.warning}20`,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: '15px'
              }}>
                <FiBell style={{ 
                  color: colors.warning,
                  fontSize: '20px'
                }} />
              </div>
              <h3 style={{ 
                margin: 0,
                color: colors.primary,
                fontSize: '18px',
                fontWeight: '600'
              }}>Important Reminders</h3>
            </div>
            
            <div style={{
              display: 'grid',
              gap: '12px'
            }}>
              {reminders.map((reminder, index) => (
                <div key={index} style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: reminder.type === 'urgent' ? `${colors.alert}15` : `${colors.secondary}10`,
                  padding: '12px 15px',
                  borderRadius: '8px',
                  borderLeft: `3px solid ${reminder.type === 'urgent' ? colors.alert : colors.secondary}`,
                  transition: 'all 0.2s',
                  ':hover': {
                    transform: 'translateX(3px)'
                  }
                }}>
                  <div style={{ flex: 1 }}>
                    <p style={{
                      margin: 0,
                      color: reminder.type === 'urgent' ? colors.alert : colors.primary,
                      fontWeight: '500'
                    }}>
                      {reminder.message}
                    </p>
                  </div>
                  {reminder.action && (
                    <button 
                      onClick={reminder.action}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: reminder.type === 'urgent' ? colors.alert : colors.secondary,
                        color: colors.white,
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500',
                        transition: 'all 0.2s',
                        ':hover': {
                          opacity: 0.9,
                          transform: 'translateY(-1px)'
                        }
                      }}
                    >
                      Take Action
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {notification && (
          <Notification
            message={notification.message}
            type={notification.type}
            onClose={handleCloseNotification}
          />
        )}

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.5fr 1fr',
          gap: '25px',
          '@media (max-width: 1200px)': {
            gridTemplateColumns: '1fr'
          }
        }}>
          {/* Left Column */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '25px'
          }}>
            {/* Treatment Status */}
            <TreatmentStatus 
              ongoingTreatment={ongoingTreatment}
              treatmentLoading={treatmentLoading}
              complianceStatus={complianceStatus}
              drainAlarm={drainAlarm}
              drainAlarmMessage={drainAlarmMessage}
              navigate={navigate}
              colors={colors}
              firstTimeUser={firstTimeUser}
            />

            {/* Treatment History */}
            <div style={{
              backgroundColor: colors.white,
              borderRadius: '12px',
              padding: '25px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              transition: 'all 0.3s ease'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: `${colors.primary}10`,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: '15px'
                  }}>
                    <FiList style={{
                      color: colors.primary,
                      fontSize: '18px'
                    }} />
                  </div>
                  <h3 style={{ 
                    margin: 0,
                    color: colors.primary,
                    fontWeight: '600'
                  }}>Recent Treatment History</h3>
                </div>
                {!firstTimeUser && (
                  <button 
                    style={{
                      backgroundColor: 'transparent',
                      border: `1px solid ${colors.primary}`,
                      color: colors.primary,
                      padding: '8px 18px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontWeight: '500',
                      ':hover': {
                        backgroundColor: colors.primary,
                        color: colors.white,
                        transform: 'translateY(-2px)'
                      }
                    }}
                    onClick={() => setShowHistoryModal(true)}
                  >
                    View Full History
                  </button>
                )}
              </div>

              {historyLoading ? (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '40px 0'
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    border: `4px solid ${colors.primary}20`,
                    borderTop: `4px solid ${colors.primary}`,
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    marginBottom: '15px'
                  }}></div>
                  <p style={{ 
                    margin: 0,
                    color: `${colors.primary}AA`
                  }}>Loading treatment history...</p>
                </div>
              ) : firstTimeUser ? (
                <div style={{
                  textAlign: 'center',
                  padding: '40px 20px',
                  color: `${colors.primary}AA`
                }}>
                  <div style={{
                    width: '80px',
                    height: '80px',
                    backgroundColor: `${colors.primary}10`,
                    borderRadius: '50%',
                    display: 'inline-flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginBottom: '20px'
                  }}>
                    <FiDroplet style={{
                      fontSize: '32px',
                      color: colors.primary
                    }} />
                  </div>
                  <h4 style={{
                    margin: '0 0 15px 0',
                    color: colors.primary,
                    fontSize: '18px',
                    fontWeight: '600'
                  }}>No Treatment History Yet</h4>
                  <p style={{
                    margin: '0 0 25px 0',
                    lineHeight: '1.6'
                  }}>
                    Once you complete your first treatment, your history will appear here to help track your progress.
                  </p>
                </div>
              ) : treatmentHistory.length > 0 ? (
                <div>
                  {Object.keys(groupedTreatments).slice(0, 3).map(dateKey => (
                    <div key={dateKey} style={{ marginBottom: '30px' }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: '15px',
                        paddingBottom: '15px',
                        borderBottom: `1px solid ${colors.primary}20`
                      }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          backgroundColor: `${colors.primary}10`,
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          marginRight: '12px'
                        }}>
                          <FiCalendar style={{
                            color: colors.primary,
                            fontSize: '16px'
                          }} />
                        </div>
                        <h4 style={{ 
                          margin: 0,
                          color: colors.primary,
                          fontWeight: '500'
                        }}>{formatDateOnly(dateKey)}</h4>
                      </div>
                      
                      <div style={{
                        overflowX: 'auto',
                        borderRadius: '8px',
                        border: `1px solid ${colors.primary}20`,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                      }}>
                        <table style={{
                          width: '100%',
                          borderCollapse: 'collapse',
                          minWidth: '800px'
                        }}>
                          <thead>
                            <tr style={{
                              backgroundColor: `${colors.primary}08`,
                              textAlign: 'left'
                            }}>
                              <th style={{ 
                                padding: '12px 15px',
                                color: colors.primary,
                                fontWeight: '500',
                                fontSize: '14px'
                              }}>Volume In</th>
                              <th style={{ 
                                padding: '12px 15px',
                                color: colors.primary,
                                fontWeight: '500',
                                fontSize: '14px'
                              }}>Dialysate</th>
                              <th style={{ 
                                padding: '12px 15px',
                                color: colors.primary,
                                fontWeight: '500',
                                fontSize: '14px'
                              }}>Dwell</th>
                              <th style={{ 
                                padding: '12px 15px',
                                color: colors.primary,
                                fontWeight: '500',
                                fontSize: '14px'
                              }}>Volume Out</th>
                              <th style={{ 
                                padding: '12px 15px',
                                color: colors.primary,
                                fontWeight: '500',
                                fontSize: '14px'
                              }}>Balance</th>
                              <th style={{ 
                                padding: '12px 15px',
                                color: colors.primary,
                                fontWeight: '500',
                                fontSize: '14px'
                              }}>Color</th>
                              <th style={{ 
                                padding: '12px 15px',
                                color: colors.primary,
                                fontWeight: '500',
                                fontSize: '14px'
                              }}>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {groupedTreatments[dateKey].map((treatment) => (
                              <tr key={treatment.Treatment_ID} style={{
                                borderBottom: `1px solid ${colors.primary}10`,
                                ':hover': {
                                  backgroundColor: `${colors.primary}05`
                                }
                              }}>
                                <td style={{ 
                                  padding: '12px 15px',
                                  color: colors.primary,
                                  fontSize: '14px'
                                }}>{treatment.inSolution?.VolumeIn || 'N/A'} mL</td>
                                <td style={{ 
                                  padding: '12px 15px',
                                  color: colors.primary,
                                  fontSize: '14px'
                                }}>{treatment.inSolution?.Dialysate || 'N/A'}%</td>
                                <td style={{ 
                                  padding: '12px 15px',
                                  color: colors.primary,
                                  fontSize: '14px'
                                }}>{treatment.inSolution?.Dwell || 'N/A'}h</td>
                                <td style={{ 
                                  padding: '12px 15px',
                                  color: colors.primary,
                                  fontSize: '14px'
                                }}>{treatment.outSolution?.VolumeOut || 'N/A'} mL</td>
                                <td style={{ 
                                padding: '12px 15px',
                                color: calculateBalance(treatment).startsWith('-') ? colors.alert : colors.primary,
                                fontWeight: '500',
                                fontSize: '14px'
                              }}>
                                {calculateBalance(treatment)} mL
                              </td>
                                <td style={{ 
                                  padding: '12px 15px',
                                  fontSize: '14px'
                                }}>
                                  <div 
                                    style={{
                                      width: '24px',
                                      height: '24px',
                                      borderRadius: '4px',
                                      backgroundColor: treatment.outSolution?.Color ? '#e3f2fd' : '#f0f0f0',
                                      border: `1px solid ${colors.primary}20`,
                                      display: 'flex',
                                      justifyContent: 'center',
                                      alignItems: 'center'
                                    }}
                                    title={treatment.outSolution?.Color || 'N/A'}
                                  >
                                    {treatment.outSolution?.Color ? (
                                      <span style={{
                                        fontSize: '10px',
                                        color: colors.textMuted
                                      }}></span>
                                    ) : null}
                                  </div>
                                </td>
                                <td style={{ 
                                  padding: '12px 15px',
                                  fontSize: '14px'
                                }}>
                                  <span style={{
                                    display: 'inline-block',
                                    padding: '6px 12px',
                                    borderRadius: '20px',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    backgroundColor: 
                                      treatment.TreatmentStatus.toLowerCase() === 'completed' ? `${colors.success}20` : 
                                      treatment.TreatmentStatus.toLowerCase() === 'in progress' ? `${colors.secondary}20` : `${colors.alert}20`,
                                    color: 
                                      treatment.TreatmentStatus.toLowerCase() === 'completed' ? colors.success : 
                                      treatment.TreatmentStatus.toLowerCase() === 'in progress' ? colors.secondary : colors.alert
                                  }}>
                                    {treatment.TreatmentStatus}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{
                  textAlign: 'center',
                  padding: '40px 0',
                  color: `${colors.primary}AA`
                }}>
                  <p>No treatment history found for the last 30 days</p>
                </div>
              )}
              
              <HandHygieneReminder colors={colors} />
            </div>
          </div>

          {/* Right Column */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '25px'
          }}>
            {/* Checkups Component */}
            <div style={{
              backgroundColor: colors.white,
              borderRadius: '12px',
              padding: '25px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              transition: 'all 0.3s ease'
            }}>
              <PatientCheckups 
                dailyLimitReached={dailyLimitReached}
                fetchDailyLimitStatus={fetchDailyLimitStatus}
                colors={colors}
                firstTimeUser={firstTimeUser}
              />
            </div>
            
            <HealthOverview 
              healthAlerts={healthAlerts} 
              healthTips={healthTips} 
              navigate={navigate}
              colors={colors}
              firstTimeUser={firstTimeUser}
            />
          </div>
        </div>
      </main>

      {/* Treatment History Modal */}
      {showHistoryModal && (
        <TreatmentHistoryModal 
          onClose={() => setShowHistoryModal(false)}
          patientId={user?.user_id}
          colors={colors}
        />
      )}

      {/* Dwell Timer Modal */}
      {showDwellTimer && currentDwellTime && ongoingTreatment && (
        <DwellTimerModal 
          dwellTime={currentDwellTime}
          onClose={() => {
            setShowDwellTimer(false);
            setIsTimerMinimized(false);
          }}
          onEndTreatment={handleEndTreatmentEarly}
          colors={colors}
          isMinimized={isTimerMinimized}
          onToggleMinimize={() => setIsTimerMinimized(!isTimerMinimized)}
        />
      )}
    </div>
  );
};

export default PatientDashboard;