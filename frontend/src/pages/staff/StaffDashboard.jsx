import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  FaUserInjured, 
  FaCalendarAlt, 
  FaCheckCircle, 
  FaSearch, 
  FaUserClock,
  FaExchangeAlt,
  FaInfoCircle,
  FaChartLine,
  FaSync,
  FaQuoteLeft,
  FaPlus,
  FaChevronRight,
  FaExclamationTriangle,
  FaCalendarTimes,
  FaBell
} from 'react-icons/fa';
import { MdClose } from 'react-icons/md';
import { BsGraphUp } from 'react-icons/bs';
import StaffSidebar from './StaffSidebar';
import Notification from '../../components/Notification';
import staffPic from "../../assets/images/staffPic.png";
import PatientSections from './PatientSections';
import PatientDetailsModal from '../doctor/Patient_Details';
import MissedAppointmentsNotification from './MissedAppointmentsNotification';
import { format, addDays } from 'date-fns';
import StatusSummaryCard from './StatusSummaryCard';

const API_BASE_URL = 'http://localhost:8000/api';

const StaffDashboard = () => {
  const [user, setUser] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    patientsToday: [],
    patientsTomorrow: [],
    nextWeekPatients: [],
    upcomingAppointments: [],
    confirmedPatients: [],
    rescheduledPatients: [],
    allSchedules: [],
    patientStats: [],
    counts: {
      pending: 0,
      completed: 0,
      rescheduled: 0,
      unrescheduled: 0,
      yesterday_unrescheduled: 0
    }
  });
  const [stats, setStats] = useState({
    pending: 0,
    completed: 0,
    rescheduled: 0,
    missed: 0
  });
  const [showMissedNotification, setShowMissedNotification] = useState(false);
  const [missedCount, setMissedCount] = useState(0);
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [todaySearchTerm, setTodaySearchTerm] = useState("");
  const [tomorrowSearchTerm, setTomorrowSearchTerm] = useState("");
  const [nextWeekSearchTerm, setNextWeekSearchTerm] = useState("");
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState('today');
  const [timeRange, setTimeRange] = useState('week');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [newMissedAlert, setNewMissedAlert] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const checkMissedAppointments = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/staff/missed-appointments`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });
        
        if (response.data.appointments && response.data.appointments.length > 0) {
          const yesterdayCount = response.data.appointments.filter(app => 
            new Date(app.appointment_date).toDateString() === 
            new Date(Date.now() - 86400000).toDateString()
          ).length;
          
          if (yesterdayCount > 0 || response.data.appointments.length > 0) {
            setNewMissedAlert(true);
          }
        }
      } catch (error) {
        console.error("Error checking missed appointments:", error);
      }
    };

    const interval = setInterval(checkMissedAppointments, 60000);
    checkMissedAppointments();
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem("user"));
        const token = localStorage.getItem("token");

        if (!token || !userData) {
          throw new Error("No authentication data found");
        }

        if (!['nurse', 'staff'].includes(userData.userLevel)) {
          throw new Error("Unauthorized access level");
        }

        setUser(userData);
        await fetchDashboardData();
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

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/staff/dashboard`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });

      const today = new Date().toISOString().split('T')[0];
      const tomorrow = new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0];
      
      const allSchedules = response.data.allSchedules || [];
      
      const patientsToday = allSchedules.filter(schedule => 
        schedule.appointment_date && 
        schedule.appointment_date.split('T')[0] === today
      );

      const patientsTomorrow = allSchedules.filter(schedule => 
        schedule.appointment_date && 
        schedule.appointment_date.split('T')[0] === tomorrow
      );

      const nextWeekPatients = allSchedules.filter(schedule => {
        if (!schedule.appointment_date) return false;
        const scheduleDate = new Date(schedule.appointment_date);
        const today = new Date();
        const nextWeek = new Date(today.setDate(today.getDate() + 7));
        return scheduleDate >= new Date() && scheduleDate <= nextWeek;
      });

      const counts = response.data.counts || {
        pending: 0,
        completed: 0,
        rescheduled: 0,
        unrescheduled: 0,
        yesterday_unrescheduled: 0
      };

      setDashboardData({
        patientsToday,
        patientsTomorrow,
        nextWeekPatients,
        upcomingAppointments: response.data.upcomingAppointments || [],
        confirmedPatients: response.data.confirmedPatients || [],
        rescheduledPatients: response.data.rescheduledPatients || [],
        allSchedules,
        patientStats: response.data.patientStats || [],
        counts
      });

      setStats({
        pending: counts.pending || 0,
        completed: counts.completed || 0,
        rescheduled: response.data.rescheduledPatients?.length || 0,
        missed: counts.unrescheduled || 0
      });

      if (counts.yesterday_unrescheduled > 0 || counts.unrescheduled > 0) {
        setMissedCount(counts.unrescheduled);
        setShowMissedNotification(false);
        setNewMissedAlert(true);
      }

    } catch (error) {
      setNotification({
        message: error.response?.data?.message || "Failed to fetch dashboard data",
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsCompleted = async (patientId) => {
    try {
      await axios.post(`${API_BASE_URL}/staff/mark-completed`, 
        { patient_id: patientId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );
      
      setNotification({
        message: 'Patient marked as completed successfully',
        type: 'success'
      });
      
      await fetchDashboardData();
    } catch (error) {
      setNotification({
        message: error.response?.data?.message || "Failed to mark as completed",
        type: 'error'
      });
    }
  };

  const handleApproveReschedule = async (scheduleId, approve) => {
    try {
      await axios.post(`${API_BASE_URL}/staff/approve-reschedule`, 
        { schedule_id: scheduleId, approve },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );
      
      setNotification({
        message: `Reschedule request ${approve ? 'approved' : 'rejected'} successfully`,
        type: 'success'
      });
      
      await fetchDashboardData();
    } catch (error) {
      setNotification({
        message: error.response?.data?.message || "Failed to process reschedule request",
        type: 'error'
      });
    }
  };

  const calculateAge = (dob) => {
    if (!dob) return 'N/A';
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const handleCloseNotification = () => {
    setNotification(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getDaysDifference = (appointmentDate) => {
    if (!appointmentDate) return Infinity;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const appointment = new Date(appointmentDate);
    appointment.setHours(0, 0, 0, 0);
    const diffTime = appointment - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const handlePatientClick = (patient) => {
    setSelectedPatient(patient);
    setShowPatientModal(true);
  };

  const closePatientModal = () => {
    setShowPatientModal(false);
    setSelectedPatient(null);
  };

  const filteredAppointments = useMemo(() => {
    return dashboardData.upcomingAppointments.filter(appointment => {
      const fullName = `${appointment.first_name || ''} ${appointment.last_name || ''}`.toLowerCase();
      const hn = appointment.hospitalNumber ? appointment.hospitalNumber.toLowerCase() : '';
      return fullName.includes(searchTerm.toLowerCase()) || 
             hn.includes(searchTerm.toLowerCase());
    });
  }, [dashboardData.upcomingAppointments, searchTerm]);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        width: '100vw',
        backgroundColor: '#EEF0F5',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 9999
      }}>
        <div style={{
          width: 'clamp(50px, 10vw, 80px)',
          height: 'clamp(50px, 10vw, 80px)',
          border: '5px solid rgba(243, 243, 243, 0.6)',
          borderTop: '5px solid #395886',
          borderRight: '5px solid rgba(57, 88, 134, 0.7)',
          borderBottom: '5px solid rgba(57, 88, 134, 0.4)',
          borderRadius: '50%',
          animation: 'spin 1.2s cubic-bezier(0.5, 0.1, 0.4, 0.9) infinite',
          willChange: 'transform',
          boxShadow: '0 4px 12px rgba(57, 88, 134, 0.1)',
        }}></div>
        
        <p style={{
          color: '#395886',
          fontSize: 'clamp(16px, 3vw, 20px)',
          fontWeight: 500,
          fontFamily: 'sans-serif',
          animation: 'fadePulse 1.5s ease-in-out infinite'
        }}>
          Wait for a seconds<span style={{
            display: 'inline-block',
            animation: 'dotPulse 1.5s infinite'
          }}>...</span>
        </p>

        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @keyframes fadePulse {
            0%, 100% { opacity: 0.8; }
            50% { opacity: 1; }
          }
          
          @keyframes dotPulse {
            0% { opacity: 0.2; transform: translateY(0); }
            20% { opacity: 1; transform: translateY(-3px); }
            40%, 100% { opacity: 0.2; transform: translateY(0); }
          }
        `}</style>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: '#f5f7fa',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    }}>
      <StaffSidebar user={user} />
      
      <div style={{
        flex: 1,
        padding: '24px',
        marginLeft: '270px',
        transition: 'margin 0.3s ease',
        marginTop: '-540px'
      }}>
        <div style={{
          display: 'flex',
          gap: '24px',
          maxWidth: '1600px',
          margin: '0 auto'
        }}>
          <div style={{
            flex: 2,
            minWidth: 0
          }}>
            

            {dashboardData.rescheduledPatients.length > 0 && (
              <div style={{
                backgroundColor: '#e8f4fd',
                borderLeft: '4px solid #3498db',
                padding: '15px',
                borderRadius: '4px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '15px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <FaExchangeAlt style={{ color: '#3498db', fontSize: '20px' }} />
                  <div>
                    <p style={{ margin: 0, fontWeight: '500', color: '#2c3e50' }}>
                      You have <strong>{dashboardData.rescheduledPatients.length} pending reschedule request(s)</strong> from patients.
                    </p>
                    <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#2c3e50' }}>
                      Please review and approve or reject these requests.
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveTab('rescheduled')}
                  style={{
                    backgroundColor: '#3498db',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    ':hover': {
                      backgroundColor: '#2980b9'
                    }
                  }}
                >
                  <FaExchangeAlt /> View Reschedule Requests
                </button>
              </div>
            )}

            {dashboardData.counts.unrescheduled > 0 && (
              <div style={{
                backgroundColor: '#fee2e2',
                borderLeft: '4px solid #ef4444',
                padding: '15px',
                borderRadius: '4px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '15px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <FaCalendarTimes style={{ color: '#ef4444', fontSize: '20px' }} />
                  <div>
                    <p style={{ margin: 0, fontWeight: '500', color: '#7f1d1d' }}>
                      There are <strong>{dashboardData.counts.unrescheduled} patient(s)</strong> who need to have their appointments rescheduled.
                    </p>
                    <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#7f1d1d' }}>
                      {dashboardData.counts.yesterday_unrescheduled > 0 ? (
                        <span>Including {dashboardData.counts.yesterday_unrescheduled} from yesterday.</span>
                      ) : (
                        <span>These patients missed their scheduled appointments.</span>
                      )}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowMissedNotification(true)}
                  style={{
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    ':hover': {
                      backgroundColor: '#dc2626'
                    }
                  }}
                >
                  <FaCalendarTimes /> Reschedule Now
                </button>
              </div>
            )}

            <div style={{
              marginBottom: '24px'
            }}>
              <div>
                <h1 style={{
                  fontSize: '28px',
                  fontWeight: '700',
                  color: '#1e293b',
                  marginBottom: '8px'
                }}>CAPD Medical Staff Homepage</h1>
                <p style={{
                  fontSize: '16px',
                  color: '#64748b',
                  margin: 0
                }}>
                 Stay organized with the CAPD staff dashboard—view patients, see schedules, and keep up with appointments.
                </p>
              </div>
            </div>
            

            <div style={{
              backgroundColor: '#395886',
              borderRadius: '16px',
              padding: '24px',
              color: 'white',
              marginBottom: '24px',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{
                flex: 1,
                zIndex: 1
              }}>
                <h1 style={{
                  fontSize: '24px',
                  fontWeight: '600',
                  marginBottom: '12px'
                }}>
                  Good Day, <span style={{ fontWeight: '700' }}>{user.first_name}!</span>
                </h1>
                <p style={{
                  fontSize: '15px',
                  opacity: 0.9,
                  marginBottom: '20px',
                  maxWidth: '500px'
                }}>
                  Your dedication ensures every patient receives the care they deserve. 
                  You have <strong>{dashboardData.patientsToday.length}</strong> appointments today.
                </p>
                <div style={{
                  display: 'flex',
                  gap: '12px'
                }}>
                  <div style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    padding: '10px 16px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    backdropFilter: 'blur(5px)'
                  }}>
                    <FaUserInjured color="#fff" size={18} />
                    <span style={{ fontSize: '14px' }}>
                      {dashboardData.patientsToday.length} Today
                    </span>
                  </div>
                  <div style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    padding: '10px 16px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    backdropFilter: 'blur(5px)'
                  }}>
                    <FaCalendarAlt color="#fff" size={16} />
                    <span style={{ fontSize: '14px' }}>
                      {dashboardData.patientsTomorrow.length} Tomorrow
                    </span>
                  </div>
                </div>
              </div>
             
              <img src={staffPic} alt="staff" style={{
                width: '350px',  // Increased from original
                height: '350px', // Increased from original
                objectFit: 'contain',
                zIndex: 1,
                position: 'absolute', // Changed to absolute positioning
                right: '20px',       // Positioned from right
                top: '50%',          // Centered vertically
                transform: 'translateY(-50%)' // Perfect vertical centering
              }} />
              <div style={{
                position: 'absolute',
                width: '200px',
                height: '200px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                top: '-50px',
                right: '-50px'
              }}></div>
              <div style={{
                position: 'absolute',
                width: '300px',
                height: '300px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                bottom: '-100px',
                right: '-100px'
              }}></div>
            </div>
            
            {(dashboardData.counts.yesterday_unrescheduled > 0 || dashboardData.counts.unrescheduled > 0) && (
            <div style={{
              backgroundColor: '#fff9f2',
              borderLeft: '4px solid #ff8a00',
              padding: '20px',
              borderRadius: '6px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '20px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              fontFamily: "'Segoe UI', Roboto, sans-serif"
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', flex: 1 }}>
                <div style={{
                  backgroundColor: '#ffebcc',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <FaExclamationTriangle style={{ color: '#ff8a00', fontSize: '18px' }} />
                </div>
                <div>
                  <h4 style={{ 
                    margin: '0 0 6px 0', 
                    fontWeight: '600', 
                    color: '#333',
                    fontSize: '16px'
                  }}>
                    Missed Appointment Notification
                  </h4>
                  <p style={{ 
                    margin: 0, 
                    color: '#555', 
                    fontSize: '15px',
                    lineHeight: '1.5'
                  }}>
                    You have <strong style={{ color: '#e65100' }}>{dashboardData.counts.yesterday_unrescheduled} patient(s)</strong> who missed appointments yesterday
                    {dashboardData.counts.unrescheduled > 0 && (
                      <span> and <strong style={{ color: '#e65100' }}>{dashboardData.counts.unrescheduled} total</strong> unresolved missed appointments</span>
                    )}.
                  </p>
                  <p style={{ 
                    margin: '8px 0 0 0', 
                    fontSize: '14px', 
                    color: '#666',
                    fontStyle: 'italic'
                  }}>
                    Please review and reschedule these appointments at your earliest convenience.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowMissedNotification(true)}
                style={{
                  backgroundColor: '#ff8a00',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '14px',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap',
                  ':hover': {
                    backgroundColor: '#e65100',
                    transform: 'translateY(-1px)'
                  }
                }}
              >
                <FaCalendarTimes style={{ fontSize: '16px' }} /> 
                View All Missed Appointments
              </button>
            </div>
          )}

                      
            <PatientSections 
            dashboardData={dashboardData}
            stats={stats}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            todaySearchTerm={todaySearchTerm}
            setTodaySearchTerm={setTodaySearchTerm}
            tomorrowSearchTerm={tomorrowSearchTerm}
            setTomorrowSearchTerm={setTomorrowSearchTerm}
            nextWeekSearchTerm={nextWeekSearchTerm}
            setNextWeekSearchTerm={setNextWeekSearchTerm}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            timeRange={timeRange}
            setTimeRange={setTimeRange}
            handleMarkAsCompleted={handleMarkAsCompleted}
            handleApproveReschedule={handleApproveReschedule}
            calculateAge={calculateAge}
            formatDate={formatDate}
            navigate={navigate}
            fetchDashboardData={fetchDashboardData}
          />
          </div>

          <div style={{
            flex: 1,
            maxWidth: '400px',
            minWidth: '300px',
          
          }}>
           

            <StatusSummaryCard 
            confirmedCount={dashboardData.confirmedPatients.length}
            pendingCount={stats.pending}
            rescheduledCount={stats.rescheduled}
            missedCount={dashboardData.counts.unrescheduled}
            yesterdayMissedCount={dashboardData.counts.yesterday_unrescheduled}
            fetchDashboardData={fetchDashboardData}
          />

            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              marginBottom: '24px',
              overflow: 'hidden',
              marginTop: '20px',
              width: "100%",
            }}>
              <div style={{
                padding: '16px 20px',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <h3 style={{
                  margin: 0,
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#1e293b',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <FaCalendarAlt color="#477977" size={18} /> 
                  <span>Confirmed Appointments ({dashboardData.upcomingAppointments.length})</span>
                </h3>
              </div>
              
              <div style={{
                padding: '12px 16px',
                borderBottom: '1px solid #e2e8f0',
                position: 'relative'
              }}>
                <FaSearch style={{
                  position: 'absolute',
                  left: '28px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94a3b8',
                  fontSize: '14px'
                }} />
                <input 
                  type="text" 
                  style={{
                    width: '100%',
                    padding: '8px 12px 8px 32px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'border 0.2s',
                    backgroundColor: '#f8fafc',
                    ':focus': {
                      borderColor: '#6366f1'
                    }
                  }}
                  placeholder="Search patients..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div style={{
                maxHeight: '400px',
                overflowY: 'auto'
              }}>
                {filteredAppointments.length > 0 ? (
                  <div style={{
                    padding: '8px 0'
                  }}>
                    {filteredAppointments.map((appointment, index) => {
                      const daysDifference = getDaysDifference(appointment.appointment_date);
                      const appointmentDate = new Date(appointment.appointment_date);
                      const isRescheduled = appointment.checkup_remarks && 
                        appointment.checkup_remarks.includes('Automatically rescheduled');

                      return (
                        <div 
                          key={`${appointment.patientID || 'unknown'}-${index}`} 
                          onClick={() => handlePatientClick(appointment)}
                          style={{
                            padding: '12px 16px',
                            cursor: 'pointer',
                            transition: 'background 0.2s',
                            ':hover': {
                              backgroundColor: '#f8fafc'
                            }
                          }}
                        >
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '8px'
                          }}>
                            <span style={{
                              fontWeight: '500',
                              color: '#1e293b',
                              fontSize: '15px'
                            }}>
                              {appointment.first_name} {appointment.last_name}
                            </span>
                            {daysDifference === 0 ? (
                              <span style={{
                                backgroundColor: '#f0fdf4',
                                color: '#16a34a',
                                fontSize: '12px',
                                fontWeight: '500',
                                padding: '4px 8px',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}>
                                <span style={{
                                  width: '6px',
                                  height: '6px',
                                  borderRadius: '50%',
                                  backgroundColor: '#16a34a'
                                }}></span>
                                Today
                              </span>
                            ) : daysDifference === 1 ? (
                              <span style={{
                                backgroundColor: '#eff6ff',
                                color: '#2563eb',
                                fontSize: '12px',
                                fontWeight: '500',
                                padding: '4px 8px',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}>
                                <span style={{
                                  width: '6px',
                                  height: '6px',
                                  borderRadius: '50%',
                                  backgroundColor: '#2563eb'
                                }}></span>
                                Tomorrow
                              </span>
                            ) : (
                              <span style={{
                                backgroundColor: '#f8fafc',
                                color: '#475569',
                                fontSize: '12px',
                                fontWeight: '500',
                                padding: '4px 8px',
                                borderRadius: '12px'
                              }}>
                                {appointmentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </span>
                            )}
                          </div>
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            fontSize: '13px',
                            color: '#64748b'
                          }}>
                            <span>
                              HN: {appointment.hospitalNumber || 'N/A'}
                            </span>
                            <span>
                              {appointment.appointment_type || 'Monthly Checkup'}
                            </span>
                          </div>
                          {isRescheduled && (
                            <div style={{
                              marginTop: '8px',
                              fontSize: '12px',
                              color: '#d97706',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}>
                              <FaInfoCircle size={12} />
                              <span>Automatically rescheduled from previous missed appointment</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{
                    padding: '32px 16px',
                    textAlign: 'center'
                  }}>
                    <div style={{
                      color: '#cbd5e1',
                      fontSize: '32px',
                      marginBottom: '12px',
                      display: 'flex',
                      justifyContent: 'center'
                    }}>
                      <FaCalendarAlt />
                    </div>
                    <div style={{
                      fontSize: '16px',
                      fontWeight: '500',
                      color: '#475569',
                      marginBottom: '8px'
                    }}>
                      No Upcoming Appointments
                    </div>
                    <p style={{
                      fontSize: '14px',
                      color: '#94a3b8',
                      margin: 0
                    }}>
                      {searchTerm 
                        ? 'No patients match your search' 
                        : 'No appointments scheduled in the next 7 days'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showPatientModal && (
        <PatientDetailsModal 
          patient={selectedPatient} 
          onClose={closePatientModal} 
        />
      )}

      {showMissedNotification && (
      <MissedAppointmentsNotification 
        onClose={() => setShowMissedNotification(false)}
        missedCount={missedCount}
        fetchDashboardData={fetchDashboardData}
      />
    )}

      {notification && (
        <Notification 
          message={notification.message} 
          type={notification.type} 
          onClose={handleCloseNotification}
        />
      )}
    </div>
  );
};

export default StaffDashboard;