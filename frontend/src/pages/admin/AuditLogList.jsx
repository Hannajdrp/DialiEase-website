import React, { useState, useEffect, useRef } from 'react';
import { 
  FaSearch, FaFilePdf, FaChevronLeft, FaChevronRight, 
  FaBell, FaTimes, FaBars, FaChartLine, FaChartBar,
  FaShieldAlt, FaLock, FaUserShield, FaExclamationTriangle
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminSidebar from './AdminSidebar';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import AnalyticsModal from './AnalyticsModal';
import logoImage from "../../images/logo.PNG";
import staffPic from "../../assets/images/staffPic.PNG";
import noResultsImage from '../../assets/images/no-results.PNG';

const AuditLogList = () => {
  // State management
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [logsPerPage] = useState(5);
  const [user, setUser] = useState(null);
  const [showActivityPanel, setShowActivityPanel] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [securityStats, setSecurityStats] = useState({
    failedLogins: 0,
    suspiciousActivities: 0,
    adminActions: 0,
    dataChanges: 0
  });
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  
  // Refs and hooks
  const navigate = useNavigate();
  const searchRef = useRef(null);

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Date formatting functions with proper timezone handling
  const formatFullDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        timeZone: 'Asia/Manila',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (e) {
      console.error('Date formatting error:', e);
      return 'Invalid Date';
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        timeZone: 'Asia/Manila',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (e) {
      console.error('Date formatting error:', e);
      return 'Invalid Date';
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('en-US', {
        timeZone: 'Asia/Manila',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (e) {
      console.error('Time formatting error:', e);
      return 'Invalid Time';
    }
  };

  const isToday = (dateString) => {
    if (!dateString) return false;
    try {
      const date = new Date(dateString);
      const today = new Date();
      return date.getFullYear() === today.getFullYear() &&
             date.getMonth() === today.getMonth() &&
             date.getDate() === today.getDate();
    } catch (e) {
      console.error('Date comparison error:', e);
      return false;
    }
  };

  const isYesterday = (dateString) => {
    if (!dateString) return false;
    try {
      const date = new Date(dateString);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      return date.getFullYear() === yesterday.getFullYear() &&
             date.getMonth() === yesterday.getMonth() &&
             date.getDate() === yesterday.getDate();
    } catch (e) {
      console.error('Date comparison error:', e);
      return false;
    }
  };

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return 'N/A';
    
    if (isToday(dateString)) {
      return `Today at ${formatTime(dateString)}`;
    }
    
    if (isYesterday(dateString)) {
      return `Yesterday at ${formatTime(dateString)}`;
    }
    
    return formatDateTime(dateString);
  };

  // Effects
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 992);
      if (window.innerWidth >= 992) {
        setSidebarOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    } else {
      const loggedInUser = JSON.parse(localStorage.getItem('user'));
      setUser(loggedInUser);
      fetchLogs(token);
      fetchRecentActivities(token);
      analyzeSecurityData(token);
    }

    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [navigate]);

  // Data fetching functions
  const fetchLogs = async (token) => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8000/api/admin/audit-logs', {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setLogs(response.data.data || []);
      } else {
        setError(response.data.message || 'Failed to fetch audit logs');
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err.message || 'Error fetching audit logs');
      if (err.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentActivities = async (token) => {
    try {
      const response = await axios.get('http://localhost:8000/api/admin/recent-activities', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setRecentActivities(response.data.data || []);
      } else {
        const mockActivities = [
          { id: 1, type: 'login', userId: user?.id || 101, userName: user ? `${user.first_name} ${user.last_name || ''}` : 'Admin User', 
            date: new Date(Date.now() - 1000 * 60 * 5).toISOString(), details: 'User logged in' },
          { id: 2, type: 'action', userId: 102, userName: 'Staff User', 
            date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), details: 'Updated patient records' }
        ];
        setRecentActivities(mockActivities);
      }
    } catch (err) {
      console.error('Error fetching activities:', err);
    }
  };

  const analyzeSecurityData = async (token) => {
    try {
      const stats = {
        failedLogins: logs.filter(log => log.action?.includes('failed login')).length,
        suspiciousActivities: logs.filter(log => 
          log.action?.includes('unauthorized') || 
          log.action?.includes('suspicious')
        ).length,
        adminActions: logs.filter(log => log.user_type === 'admin').length,
        dataChanges: logs.filter(log => 
          log.action?.includes('update') || 
          log.action?.includes('delete') ||
          log.action?.includes('create')
        ).length
      };
      setSecurityStats(stats);
    } catch (err) {
      console.error('Error analyzing security data:', err);
    }
  };

  // Helper functions
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (value.length > 1) {
      const suggestions = logs.filter(log => {
        const searchLower = value.toLowerCase();
        return (
          log.audit_id?.toString().includes(value) ||
          log.user_name?.toLowerCase().includes(searchLower) ||
          log.action?.toLowerCase().includes(searchLower)
        );
      }).slice(0, 5);
      
      setSearchSuggestions(suggestions);
      setShowSuggestions(true);
    } else {
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (log) => {
    setSearchTerm(log.user_name || log.action || '');
    setShowSuggestions(false);
  };

  const filteredLogs = logs.filter(log => {
    const searchLower = searchTerm.toLowerCase();
    return (
      log.audit_id?.toString().includes(searchTerm) ||
      log.user_name?.toLowerCase().includes(searchLower) ||
      log.user_type?.toLowerCase().includes(searchLower) ||
      log.action?.toLowerCase().includes(searchLower) ||
      log.timestamp?.toLowerCase().includes(searchLower)
    );
  });

  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog);
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);

  const generatePDF = () => {
    try {
      const doc = new jsPDF();
      doc.setFont("Poppins");
      doc.setFontSize(18);
      doc.text('Audit Logs Report', 14, 22);
      doc.setFontSize(10);
      doc.text(`Generated on: ${formatFullDate(new Date())}`, 14, 30);
      if (user) {
        doc.text(`Generated by: ${user.first_name} ${user.last_name || ''}`, 14, 38);
      }

      doc.setFontSize(12);
      doc.text('Security Overview', 14, 50);
      doc.setFontSize(10);
      doc.text(`• Failed login attempts: ${securityStats.failedLogins}`, 20, 60);
      doc.text(`• Suspicious activities: ${securityStats.suspiciousActivities}`, 20, 70);
      doc.text(`• Admin actions: ${securityStats.adminActions}`, 20, 80);
      doc.text(`• Data modifications: ${securityStats.dataChanges}`, 20, 90);

      autoTable(doc, {
        startY: 100,
        head: [['Log ID', 'User', 'User Type', 'Action', 'Timestamp']],
        body: filteredLogs.map(log => [
          log.audit_id || 'N/A',
          log.user_name || 'N/A',
          log.user_type || 'N/A',
          log.action || 'N/A',
          log.timestamp ? formatDateTime(log.timestamp) : 'N/A'
        ]),
        styles: {
          font: "Poppins",
          fontSize: 8,
          cellPadding: 2,
          textColor: 20,
        },
        headStyles: {
          fillColor: [57, 88, 134],
          textColor: 255,
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [245, 245, 255]
        }
      });

      doc.save(`audit-logs-${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Failed to generate PDF. Please check console for details.');
    }
  };

  const getPaginationGroup = () => {
    let start = Math.max(1, currentPage - 1);
    let end = Math.min(totalPages, start + 3);
    
    if (end === totalPages) {
      start = Math.max(1, end - 3);
    }
    
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  const refreshData = () => {
    const token = localStorage.getItem('token');
    fetchLogs(token);
    analyzeSecurityData(token);
  };

  const getThreatLevel = () => {
    const threatScore = securityStats.failedLogins * 0.5 + 
                       securityStats.suspiciousActivities * 0.8;
    
    if (threatScore > 10) return 'High';
    if (threatScore > 5) return 'Medium';
    return 'Low';
  };

  // Styles
  const styles = {
    container: {
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: '#f5f7fa',
      position: 'relative',
      width: '110%',
      marginTop: isMobile ? '-800' : '-690px',
    },
    content: {
      flex: 1,
      padding: isMobile ? '15px' : '20px 40px',
      transition: 'margin-left 0.3s ease',
      maxWidth: 'calc(100vw - 250px)',
      marginLeft: '250px',
    },
    mobileHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '10px 15px',
      backgroundColor: '#395886',
      color: 'white',
      marginBottom: '20px',
      borderRadius: '5px',
    },
    mobileMenu: {
      background: 'none',
      border: 'none',
      color: 'white',
      fontSize: '20px',
      cursor: 'pointer',
    },
    logoMobile: {
      height: '40px',
    },
    logoImage: {
      height: '100%',
    },
    notificationButton: {
      background: 'none',
      border: 'none',
      color: 'white',
      fontSize: '18px',
      position: 'relative',
      cursor: 'pointer',
    },
    notificationBadge: {
      position: 'absolute',
      top: '-5px',
      right: '-5px',
      backgroundColor: '#ff4757',
      color: 'white',
      borderRadius: '50%',
      width: '18px',
      height: '18px',
      fontSize: '10px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    header: {
      marginBottom: '20px',
    },
    headerTop: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '15px',
    },
    logo: {
      display: 'flex',
      alignItems: 'center',
    },
    heading: {
      marginLeft: '15px',
      color: '#395886',
      fontSize: '24px',
    },
    userInfo: {
      display: 'flex',
      alignItems: 'center',
    },
    userWelcome: {
      display: 'flex',
      alignItems: 'center',
    },
    userAvatar: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      marginRight: '10px',
    },
    userDetails: {
      display: 'flex',
      flexDirection: 'column',
      marginRight: '15px',
    },
    welcomeText: {
      fontSize: '14px',
      fontWeight: 'bold',
    },
    userRole: {
      fontSize: '12px',
      color: '#638ECB',
    },
    headerTitle: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px',
    },
    subHeading: {
      color: '#638ECB',
      fontSize: '16px',
    },
    datetime: {
      color: '#777',
      fontSize: '14px',
    },
    summaryCards: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)',
      gap: '15px',
      marginBottom: '20px',
    },
    summaryCard: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '20px',
      borderRadius: '10px',
      color: 'white',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      minWidth: '200px',
    },
    summaryCardPrimary: {
      backgroundColor: '#395886',
    },
    summaryCardSuccess: {
      backgroundColor: '#477977',
    },
    summaryCardWarning: {
      backgroundColor: '#b88b58',
    },
    summaryCardDanger: {
      backgroundColor: '#a55858',
    },
    summaryCardContent: {
      display: 'flex',
      flexDirection: 'column',
    },
    summaryCardIcon: {
      fontSize: '24px',
    },
    securityOverview: {
      backgroundColor: 'white',
      borderRadius: '10px',
      padding: '20px',
      marginBottom: '20px',
      boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
    },
    securityHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '15px',
    },
    securityTitle: {
      color: '#395886',
      fontSize: '18px',
      fontWeight: '600',
    },
    threatLevel: {
      display: 'flex',
      alignItems: 'center',
      padding: '5px 10px',
      borderRadius: '20px',
      fontWeight: '600',
    },
    threatLevelLow: {
      backgroundColor: '#e6f7e6',
      color: '#2e7d32',
    },
    threatLevelMedium: {
      backgroundColor: '#fff8e1',
      color: '#ff8f00',
    },
    threatLevelHigh: {
      backgroundColor: '#ffebee',
      color: '#c62828',
    },
    securityStats: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
      gap: '15px',
    },
    securityStat: {
      backgroundColor: '#f5f7fa',
      borderRadius: '8px',
      padding: '15px',
      display: 'flex',
      alignItems: 'center',
    },
    securityStatIcon: {
      fontSize: '20px',
      marginRight: '10px',
      color: '#395886',
    },
    securityStatContent: {
      flex: 1,
    },
    securityStatTitle: {
      fontSize: '12px',
      color: '#638ECB',
      marginBottom: '5px',
    },
    securityStatValue: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#395886',
    },
    headerControls: {
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      justifyContent: 'space-between',
      alignItems: isMobile ? 'stretch' : 'center',
      marginBottom: '20px',
      gap: '15px',
    },
    searchBox: {
      position: 'relative',
      flex: isMobile ? '1' : '0.8',
    },
    searchIcon: {
      position: 'absolute',
      left: '15px',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#638ECB',
    },
    searchInput: {
      width: '100%',
      padding: '12px 20px 12px 45px',
      borderRadius: '30px',
      border: '1px solid #ddd',
      fontSize: '14px',
      outline: 'none',
      transition: 'border 0.3s',
      boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
    },
    searchInputFocus: {
      border: '1px solid #395886',
    },
    searchSuggestions: {
      position: 'absolute',
      top: '100%',
      left: '0',
      right: '0',
      backgroundColor: 'white',
      border: '1px solid #ddd',
      borderRadius: '5px',
      zIndex: '100',
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
      maxHeight: '300px',
      overflowY: 'auto',
      width: '100%',
    },
    searchSuggestion: {
      padding: '10px 15px',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
    },
    searchSuggestionHover: {
      backgroundColor: '#f5f7fa',
    },
    suggestionName: {
      fontWeight: 'bold',
      color: '#395886',
    },
    suggestionDetails: {
      fontSize: '12px',
      color: '#777',
    },
    actionButtons: {
      display: 'flex',
      gap: '10px',
    },
    button: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '10px 15px',
      borderRadius: '30px',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.3s',
      fontSize: '14px',
      fontWeight: '600',
      minWidth: '120px',
    },
    buttonPrimary: {
      backgroundColor: '#395886',
      color: 'white',
    },
    buttonHover: {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    },
    buttonIcon: {
      marginRight: isMobile ? '0' : '8px',
    },
    errorMessage: {
      display: 'flex',
      alignItems: 'center',
      padding: '15px',
      backgroundColor: '#fff3f3',
      borderLeft: '4px solid #ff4757',
      borderRadius: '5px',
      marginBottom: '20px',
    },
    errorIcon: {
      marginRight: '10px',
      fontSize: '20px',
    },
    retryButton: {
      marginLeft: '15px',
      padding: '5px 10px',
      backgroundColor: '#395886',
      color: 'white',
      border: 'none',
      borderRadius: '3px',
      cursor: 'pointer',
    },
    tableWrapper: {
      backgroundColor: 'white',
      borderRadius: '10px',
      boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
      padding: '25px',
      marginBottom: '20px',
      width: '102%',
    },
    tableHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '15px',
    },
    resultsCount: {
      color: '#638ECB',
      fontSize: '14px',
    },
    tableResponsive: {
      overflowX: 'auto',
      width: '100%',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
    },
    th: {
      padding: '12px 15px',
      textAlign: 'left',
      backgroundColor: '#f5f7fa',
      color: '#395886',
      fontWeight: '600',
      borderBottom: '2px solid #ddd',
      minWidth: '150px',
    },
    tr: {
      borderBottom: '1px solid #eee',
    },
    trHover: {
      backgroundColor: '#f9f9f9',
    },
    td: {
      padding: '15px',
      verticalAlign: 'middle',
      minWidth: '150px',
    },
    highlightText: {
      color: '#395886',
      fontWeight: '600',
    },
    primaryText: {
      color: '#333',
      fontWeight: '500',
    },
    secondaryText: {
      color: '#777',
      fontSize: '13px',
      marginTop: '5px',
    },
    noResults: {
      padding: '40px 20px',
      textAlign: 'center',
    },
    emptyState: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyStateImage: {
      width: '150px',
      marginBottom: '20px',
      opacity: '0.7',
    },
    emptyStateText: {
      color: '#638ECB',
      marginBottom: '15px',
    },
    clearSearch: {
      padding: '5px 15px',
      backgroundColor: '#395886',
      color: 'white',
      border: 'none',
      borderRadius: '3px',
      cursor: 'pointer',
    },
    pagination: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: '20px',
    },
    paginationInfo: {
      color: '#638ECB',
      fontSize: '14px',
    },
    paginationControls: {
      display: 'flex',
      gap: '5px',
    },
    paginationButton: {
      padding: '5px 10px',
      backgroundColor: 'white',
      border: '1px solid #ddd',
      borderRadius: '3px',
      cursor: 'pointer',
      color: '#395886',
    },
    paginationButtonActive: {
      backgroundColor: '#395886',
      color: 'white',
      borderColor: '#395886',
    },
    paginationButtonDisabled: {
      opacity: '0.5',
      cursor: 'not-allowed',
    },
    activityPanel: {
      position: 'fixed',
      top: '0',
      right: '0',
      bottom: '0',
      width: isMobile ? '90%' : '35%',
      maxWidth: '800px',
      backgroundColor: 'white',
      boxShadow: '-5px 0 15px rgba(0,0,0,0.1)',
      zIndex: '1000',
      transform: showActivityPanel ? 'translateX(0)' : 'translateX(100%)',
      transition: 'transform 0.3s ease',
    },
    activityHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '15px 20px',
      borderBottom: '1px solid #eee',
    },
    activityClose: {
      background: 'none',
      border: 'none',
      color: '#395886',
      fontSize: '18px',
      cursor: 'pointer',
    },
    activityList: {
      padding: '15px',
      height: 'calc(100% - 60px)',
      overflowY: 'auto',
    },
    activityItem: {
      display: 'flex',
      padding: '15px 0',
      borderBottom: '1px solid #f5f5f5',
    },
    activityIcon: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      backgroundColor: '#f5f7fa',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: '15px',
      color: '#395886',
    },
    activityContent: {
      flex: 1,
    },
    activityTitle: {
      fontWeight: '600',
      color: '#395886',
      marginBottom: '5px',
    },
    activityDetails: {
      color: '#666',
      fontSize: '14px',
      marginBottom: '5px',
    },
    activityTime: {
      color: '#999',
      fontSize: '12px',
    },
    activityEmpty: {
      textAlign: 'center',
      color: '#638ECB',
      padding: '40px 20px',
    },
    userTypeBadge: {
      display: 'inline-block',
      padding: '0.25rem 0.5rem',
      borderRadius: '4px',
      fontSize: '0.75rem',
      fontWeight: '500',
      textTransform: 'capitalize',
    },
    userTypeAdmin: {
      backgroundColor: '#ecfdf5',
      color: '#059669',
    },
    userTypeStaff: {
      backgroundColor: '#eff6ff',
      color: '#2563eb',
    },
    userTypeSystem: {
      backgroundColor: '#f3e8ff',
      color: '#7e22ce',
    },
  };

  // Determine threat level styling
  const threatLevelStyle = () => {
    const level = getThreatLevel();
    if (level === 'High') return { ...styles.threatLevel, ...styles.threatLevelHigh };
    if (level === 'Medium') return { ...styles.threatLevel, ...styles.threatLevelMedium };
    return { ...styles.threatLevel, ...styles.threatLevelLow };
  };

  return (
    <div style={styles.container}>
      <AdminSidebar />
      
      <div style={styles.content}>
        {/* Mobile Header */}
        {isMobile && (
          <div style={styles.mobileHeader}>
            <button style={styles.mobileMenu} onClick={toggleSidebar}>
              <FaBars />
            </button>
            <div style={styles.logoMobile}>
              <img src={logoImage} alt="Clinic Logo" style={styles.logoImage} />
            </div>
            <button 
              style={styles.notificationButton}
              onClick={() => setShowActivityPanel(!showActivityPanel)}
            >
              <FaBell />
              {recentActivities.length > 0 && (
                <span style={styles.notificationBadge}>
                  {recentActivities.length > 9 ? '9+' : recentActivities.length}
                </span>
              )}
            </button>
          </div>
        )}
        
        <div style={styles.header}>
          {!isMobile && (
            <>
              <div style={styles.headerTop}>
                <div style={styles.logo}>
                  <img src={logoImage} alt="Clinic Logo" style={{ height: '50px' }} />
                  <h1 style={styles.heading}>
                    System Activity History
                  </h1>
                </div>
                <div style={styles.userInfo}>
                  {user && (
                    <div style={styles.userWelcome}>
                      <img 
                        src={staffPic} 
                        alt="Staff" 
                        style={styles.userAvatar}
                      />
                      <div style={styles.userDetails}>
                        <span style={styles.welcomeText}>Good Day, {user.first_name}!</span>
                        <span style={styles.userRole}>Administartor</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div style={styles.headerTitle}>
                <p style={styles.subHeading}>Keep a comprehensive log of all actions performed within the system, including user interactions, updates, and administrative changes for auditing and monitoring purposes</p>
                <p style={styles.datetime}>
                  {formatFullDate(currentTime)} at {formatTime(currentTime)}
                </p>
              </div>
            </>
          )}

          {/* Security Overview Section */}
          <div style={styles.securityOverview}>
            <div style={styles.securityHeader}>
              <h3 style={styles.securityTitle}>
                <FaShieldAlt style={{ marginRight: '10px' }} />
                Security Overview
              </h3>
              <div style={threatLevelStyle()}>
                <FaExclamationTriangle style={{ marginRight: '5px' }} />
                Threat Level: {getThreatLevel()}
              </div>
            </div>
            
            <div style={styles.securityStats}>
              <div style={styles.securityStat}>
                <div style={styles.securityStatIcon}>
                  <FaLock />
                </div>
                <div style={styles.securityStatContent}>
                  <div style={styles.securityStatTitle}>Failed Logins</div>
                  <div style={styles.securityStatValue}>{securityStats.failedLogins}</div>
                </div>
              </div>
              
              <div style={styles.securityStat}>
                <div style={styles.securityStatIcon}>
                  <FaExclamationTriangle />
                </div>
                <div style={styles.securityStatContent}>
                  <div style={styles.securityStatTitle}>Suspicious Activities</div>
                  <div style={styles.securityStatValue}>{securityStats.suspiciousActivities}</div>
                </div>
              </div>
              
              <div style={styles.securityStat}>
                <div style={styles.securityStatIcon}>
                  <FaUserShield />
                </div>
                <div style={styles.securityStatContent}>
                  <div style={styles.securityStatTitle}>Admin Actions</div>
                  <div style={styles.securityStatValue}>{securityStats.adminActions}</div>
                </div>
              </div>
              
              <div style={styles.securityStat}>
                <div style={styles.securityStatIcon}>
                  <FaChartLine />
                </div>
                <div style={styles.securityStatContent}>
                  <div style={styles.securityStatTitle}>Data Changes</div>
                  <div style={styles.securityStatValue}>{securityStats.dataChanges}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div style={styles.summaryCards}>
            <div style={{ ...styles.summaryCard, ...styles.summaryCardPrimary }}>
              <div style={styles.summaryCardContent}>
                <h3>Total Logs</h3>
                <p>{logs.length}</p>
              </div>
              <div style={styles.summaryCardIcon}>
                <FaChartLine />
              </div>
            </div>
            
            <div style={{ ...styles.summaryCard, ...styles.summaryCardSuccess }}>
              <div style={styles.summaryCardContent}>
                <h3>Today's Activities</h3>
                <p>
                  {logs.filter(log => isToday(log.timestamp)).length}
                </p>
              </div>
              <div style={styles.summaryCardIcon}>
                <FaChartLine />
              </div>
            </div>
            
            <div style={{ ...styles.summaryCard, ...styles.summaryCardWarning }}>
              <div style={styles.summaryCardContent}>
                <h3>This Week</h3>
                <p>
                  {logs.filter(log => {
                    const logDate = new Date(log.timestamp);
                    const today = new Date();
                    const lastWeek = new Date(today);
                    lastWeek.setDate(lastWeek.getDate() - 7);
                    return logDate >= lastWeek;
                  }).length}
                </p>
              </div>
              <div style={styles.summaryCardIcon}>
                <FaChartLine />
              </div>
            </div>
            
            <div style={{ ...styles.summaryCard, ...styles.summaryCardDanger }}>
              <div style={styles.summaryCardContent}>
                <h3>Critical Events</h3>
                <p>
                  {logs.filter(log => 
                    log.action?.includes('failed') || 
                    log.action?.includes('unauthorized')
                  ).length}
                </p>
              </div>
              <div style={styles.summaryCardIcon}>
                <FaChartLine />
              </div>
            </div>
          </div>

          {/* Search and Action Bar */}
          <div style={styles.headerControls}>
            <div style={styles.searchBox} ref={searchRef}>
              <FaSearch style={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search by user, action, timestamp..."
                style={{ ...styles.searchInput, ...(showSuggestions ? styles.searchInputFocus : {}) }}
                value={searchTerm}
                onChange={handleSearchChange}
                onFocus={() => searchTerm.length > 1 && setShowSuggestions(true)}
              />
              {showSuggestions && searchSuggestions.length > 0 && (
                <div style={styles.searchSuggestions}>
                  {searchSuggestions.map((log, index) => (
                    <div 
                      key={index}
                      style={styles.searchSuggestion}
                      onClick={() => handleSuggestionClick(log)}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f5f7fa'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'white'}
                    >
                      <div style={styles.suggestionName}>
                        {log.user_name || 'System'}
                      </div>
                      <div style={styles.suggestionDetails}>
                        {log.action}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div style={styles.actionButtons}>
              <button 
                style={{ ...styles.button, ...styles.buttonPrimary }}
                onClick={() => setShowAnalyticsModal(true)}
                disabled={logs.length === 0}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'none'}
              >
                <FaChartBar style={styles.buttonIcon} />
                {isMobile ? '' : 'Analytics'}
              </button>

              <button 
                style={{ ...styles.button, ...styles.buttonPrimary }}
                onClick={generatePDF}
                disabled={filteredLogs.length === 0}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'none'}
              >
                <FaFilePdf style={styles.buttonIcon} />
                {isMobile ? '' : 'Export'}
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div style={styles.errorMessage}>
            <span style={styles.errorIcon}>⚠️</span> 
            <div>
              <strong>Error:</strong> 
              <span>{error}</span>
            </div>
            <button 
              style={styles.retryButton}
              onClick={refreshData}
            >
              Retry
            </button>
          </div>
        )}

        {/* Main Content */}
        <div style={styles.tableWrapper}>
          <div style={styles.tableHeader}>
            <div style={styles.resultsCount}>
              Showing {indexOfFirstLog + 1}-{Math.min(indexOfLastLog, filteredLogs.length)} of {filteredLogs.length} logs
            </div>
          </div>
          <div style={styles.tableResponsive}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tr}>
                  <th style={styles.th}>Log ID</th>
                  <th style={styles.th}>User</th>
                  <th style={styles.th}>User Type</th>
                  <th style={styles.th}>Action</th>
                  <th style={styles.th}>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {currentLogs.length > 0 ? (
                  currentLogs.map((log, index) => (
                    <tr key={index} style={{ ...styles.tr, ':hover': { backgroundColor: '#f9f9f9' } }}>
                      <td style={styles.td} data-label="Log ID">
                        <span style={styles.highlightText}>
                          #{log.audit_id || 'N/A'}
                        </span>
                      </td>
                      <td style={styles.td} data-label="User">
                        <div style={styles.primaryText}>
                          {log.user_name || 'System'}
                        </div>
                      </td>
                      <td style={styles.td} data-label="User Type">
                        <span style={{
                          ...styles.userTypeBadge,
                          ...(log.user_type === 'admin' ? styles.userTypeAdmin : 
                              log.user_type === 'staff' ? styles.userTypeStaff : 
                              styles.userTypeSystem)
                        }}>
                          {log.user_type || 'System'}
                        </span>
                      </td>
                      <td style={styles.td} data-label="Action">
                        <div style={styles.primaryText}>
                          {log.action || 'N/A'}
                        </div>
                      </td>
                      <td style={styles.td} data-label="Timestamp">
                        <div style={styles.primaryText}>
                          {formatDateForDisplay(log.timestamp)}
                        </div>
                        <div style={styles.secondaryText}>
                          {formatFullDate(log.timestamp)}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} style={styles.noResults}>
                      <div style={styles.emptyState}>
                        <img 
                          src={noResultsImage} 
                          alt="No results" 
                          style={styles.emptyStateImage}
                        />
                        <h3 style={styles.emptyStateText}>
                          {logs.length === 0 
                            ? 'No audit logs in the system' 
                            : 'No matching logs found'}
                        </h3>
                        {logs.length > 0 && searchTerm && (
                          <button 
                            style={styles.clearSearch}
                            onClick={() => setSearchTerm('')}
                          >
                            Clear search
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {filteredLogs.length > 0 && (
            <div style={styles.pagination}>
              <div style={styles.paginationInfo}>
                Page {currentPage} of {totalPages}
              </div>
              <div style={styles.paginationControls}>
                <button
                  style={{ ...styles.paginationButton, ...(currentPage === 1 ? styles.paginationButtonDisabled : {}) }}
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                >
                  {isMobile ? '«' : <><FaChevronLeft /><FaChevronLeft /></>}
                </button>
                <button
                  style={{ ...styles.paginationButton, ...(currentPage === 1 ? styles.paginationButtonDisabled : {}) }}
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  {isMobile ? '‹' : <FaChevronLeft />}
                </button>
                
                {getPaginationGroup().map(number => (
                  <button
                    key={number}
                    style={{ ...styles.paginationButton, ...(number === currentPage ? styles.paginationButtonActive : {}) }}
                    onClick={() => setCurrentPage(number)}
                  >
                    {number}
                  </button>
                ))}
                
                <button
                  style={{ ...styles.paginationButton, ...(currentPage === totalPages ? styles.paginationButtonDisabled : {}) }}
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  {isMobile ? '›' : <FaChevronRight />}
                </button>
                <button
                  style={{ ...styles.paginationButton, ...(currentPage === totalPages ? styles.paginationButtonDisabled : {}) }}
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                >
                  {isMobile ? '»' : <><FaChevronRight /><FaChevronRight /></>}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Activity Panel */}
        {showActivityPanel && (
          <div style={styles.activityPanel}>
            <div style={styles.activityHeader}>
              <h3>Recent Activities</h3>
              <button 
                style={styles.activityClose}
                onClick={() => setShowActivityPanel(false)}
              >
                <FaTimes />
              </button>
            </div>
            
            <div style={styles.activityList}>
              {recentActivities.length > 0 ? (
                recentActivities.map(activity => (
                  <div key={activity.id} style={styles.activityItem}>
                    <div style={styles.activityIcon}>
                      {activity.type === 'login' && <FaChartLine />}
                      {activity.type === 'action' && <FaChartLine />}
                    </div>
                    <div style={styles.activityContent}>
                      <div style={styles.activityTitle}>
                        {activity.userName}
                      </div>
                      <div style={styles.activityDetails}>
                        {activity.details}
                      </div>
                      <div style={styles.activityTime}>
                        {formatDateForDisplay(activity.date)}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={styles.activityEmpty}>
                  No recent activities
                </div>
              )}
            </div>
          </div>
        )}

        {/* Analytics Modal */}
        {showAnalyticsModal && (
          <AnalyticsModal 
            isOpen={showAnalyticsModal}
            onClose={() => setShowAnalyticsModal(false)}
            logs={logs}
          />
        )}
      </div>
    </div>
  );
};

export default AuditLogList;