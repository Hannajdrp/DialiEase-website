import React from 'react';
import { FaTimes, FaInfoCircle } from 'react-icons/fa';
import { Pie, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const PatientListAnalyticsModal = ({ patients, onClose }) => {
  // Helper function to calculate age from date of birth
  const calculateAge = (dob) => {
    if (!dob) return null;
    const birthDate = new Date(dob);
    const diff = Date.now() - birthDate.getTime();
    const ageDate = new Date(diff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  // Categorize patients by age group
  const categorizeByAge = (patient) => {
    const age = calculateAge(patient.date_of_birth);
    if (age === null) return 'Unknown';
    if (age < 18) return 'Minor (<18)';
    if (age >= 18 && age < 65) return 'Adult (18-64)';
    return 'Senior (65+)';
  };

  // Age Distribution Data - Radial Bar Style
  const getAgeDistribution = () => {
    if (!patients || patients.length === 0) {
      return {
        labels: ['No Data'],
        datasets: [{
          data: [1],
          backgroundColor: ['rgba(200, 200, 200, 0.7)'],
          borderColor: ['rgba(200, 200, 200, 1)'],
          borderWidth: 1
        }]
      };
    }

    const ageData = patients.reduce((acc, patient) => {
      const ageGroup = categorizeByAge(patient);
      acc[ageGroup] = (acc[ageGroup] || 0) + 1;
      return acc;
    }, {});
    
    // Unique gradient colors for each age group
    const colors = {
      'Minor (<18)': createGradient(['#6EE7B7', '#3B82F6']),
      'Adult (18-64)': createGradient(['#FCD34D', '#F59E0B']),
      'Senior (65+)': createGradient(['#F9A8D4', '#EC4899']),
      'Unknown': createGradient(['#D1D5DB', '#9CA3AF'])
    };

    return {
      labels: Object.keys(ageData),
      datasets: [{
        data: Object.values(ageData),
        backgroundColor: Object.keys(ageData).map(group => colors[group]),
        borderColor: 'rgba(255, 255, 255, 0.8)',
        borderWidth: 2,
        cutout: '65%',
        borderRadius: 10,
        spacing: 5
      }]
    };
  };

  // Helper function to create gradient
  const createGradient = (colorStops) => {
    const ctx = document.createElement('canvas').getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, colorStops[0]);
    gradient.addColorStop(1, colorStops[1]);
    return gradient;
  };

  // Registration Trend Data - Stepped Line with Area
  const getRegistrationTrend = () => {
    if (!patients || patients.length === 0) {
      return {
        labels: ['No Data'],
        datasets: [{
          label: 'Patient Registrations',
          data: [0],
          fill: true,
          backgroundColor: 'rgba(200, 200, 200, 0.2)',
          borderColor: 'rgba(200, 200, 200, 1)',
          tension: 0.4
        }]
      };
    }

    const now = new Date();
    const monthNames = Array.from({ length: 12 }, (_, i) => {
      const date = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
      return date.toLocaleString('default', { month: 'short' });
    });
    
    const monthlyCounts = patients.reduce((acc, patient) => {
      if (!patient.created_at) return acc;
      
      const date = new Date(patient.created_at);
      const monthYear = date.toLocaleString('default', { month: 'short', year: 'numeric' });
      acc[monthYear] = (acc[monthYear] || 0) + 1;
      return acc;
    }, {});
    
    const data = monthNames.map(month => monthlyCounts[month] || 0);
    
    return {
      labels: monthNames,
      datasets: [{
        label: 'Patient Registrations',
        data: data,
        fill: {
          target: 'origin',
          above: 'rgba(99, 102, 241, 0.15)'
        },
        backgroundColor: 'rgba(99, 102, 241, 0.5)',
        borderColor: '#6366F1',
        borderWidth: 3,
        tension: 0.2,
        pointBackgroundColor: '#6366F1',
        pointBorderColor: '#fff',
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBorderWidth: 2,
        stepped: 'middle'
      }]
    };
  };

  // Calculate statistics
  const totalPatients = patients?.length || 0;
  const minorPatients = patients?.filter(p => {
    const age = calculateAge(p.date_of_birth);
    return age !== null && age < 18;
  }).length || 0;
  const adultPatients = patients?.filter(p => {
    const age = calculateAge(p.date_of_birth);
    return age !== null && age >= 18 && age < 65;
  }).length || 0;
  const seniorPatients = patients?.filter(p => {
    const age = calculateAge(p.date_of_birth);
    return age !== null && age >= 65;
  }).length || 0;
  const unknownAgePatients = patients?.filter(p => !p.date_of_birth || !calculateAge(p.date_of_birth)).length || 0;

  // Get the most recent registration date
  const mostRecentRegistration = patients?.length > 0 
    ? new Date(Math.max(...patients.map(p => new Date(p.created_at).getTime())))
    : null;

  // Format date for display
  const formatDate = (date) => {
    return date?.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) || 'N/A';
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        backgroundColor: '#1E293B',
        borderRadius: '12px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
        width: '90%',
        maxWidth: '1100px',
        maxHeight: '90vh',
        overflow: 'auto',
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px 25px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          position: 'sticky',
          top: 0,
          backgroundColor: '#1E293B',
          zIndex: 10
        }}>
          <div>
            <h2 style={{ margin: 0, color: '#E2E8F0', fontWeight: '600' }}>Patient Demographic Overview</h2>
            <p style={{ margin: '5px 0 0', color: '#94A3B8', fontSize: '14px' }}>
              Comprehensive analysis of patient age distribution and registration patterns
            </p>
          </div>
          <button 
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              color: '#E2E8F0',
              fontSize: '20px',
              cursor: 'pointer',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
              ':hover': {
                background: 'rgba(255,255,255,0.2)'
              }
            }}
          >
            <FaTimes />
          </button>
        </div>
        
        {/* Info Section */}
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.05)',
          padding: '15px 20px',
          margin: '20px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px',
          borderLeft: '4px solid #6366F1'
        }}>
          <FaInfoCircle style={{ color: '#6366F1', fontSize: '18px', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <p style={{ margin: '0 0 5px', fontWeight: '500', color: '#E2E8F0' }}>Dashboard Insights</p>
            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#94A3B8' }}>
              <li>The <strong style={{ color: '#E2E8F0' }}>Age Distribution</strong> shows patient segmentation with radial gradients</li>
              <li>The <strong style={{ color: '#E2E8F0' }}>Registration Trend</strong> uses stepped area chart for clear monthly patterns</li>
              <li>Hover interactions provide detailed cohort information</li>
              <li>Color-coded metrics highlight key patient segments</li>
            </ul>
          </div>
        </div>

        {/* Key Metrics - Card Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '15px',
          padding: '0 20px 20px',
        }}>
          <MetricCard 
            title="Total Patients" 
            value={totalPatients} 
            trend={patients?.length > 0 ? 'up' : 'neutral'} 
            color="#6366F1"
          />
          <MetricCard 
            title="Minors (<18)" 
            value={minorPatients} 
            trend={minorPatients > 0 ? 'up' : 'neutral'} 
            color="#3B82F6"
          />
          <MetricCard 
            title="Adults (18-64)" 
            value={adultPatients} 
            trend={adultPatients > 0 ? 'up' : 'neutral'} 
            color="#F59E0B"
          />
          <MetricCard 
            title="Seniors (65+)" 
            value={seniorPatients} 
            trend={seniorPatients > 0 ? 'up' : 'neutral'} 
            color="#EC4899"
          />
        </div>

        {/* Charts Section */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px',
          padding: '0 20px 20px'
        }}>
          {/* Age Distribution - Radial Gradient */}
          <div style={{
            backgroundColor: 'rgba(255,255,255,0.03)',
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.05)',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ marginTop: 0, color: '#E2E8F0', fontSize: '18px' }}>Age Distribution</h3>
              <div style={{
                backgroundColor: 'rgba(99, 102, 241, 0.2)',
                color: '#A5B4FC',
                padding: '4px 10px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '500'
              }}>
                COHORT ANALYSIS
              </div>
            </div>
            <p style={{ margin: '0 0 15px', color: '#94A3B8', fontSize: '14px' }}>
              Patient segmentation by age groups with percentage breakdown
            </p>
            <div style={{ height: '300px', position: 'relative' }}>
              <Pie 
                data={getAgeDistribution()}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        padding: 20,
                        usePointStyle: true,
                        pointStyle: 'circle',
                        color: '#E2E8F0',
                        font: {
                          family: 'inherit'
                        }
                      }
                    },
                    tooltip: {
                      backgroundColor: '#0F172A',
                      titleColor: '#E2E8F0',
                      bodyColor: '#E2E8F0',
                      borderColor: 'rgba(255,255,255,0.1)',
                      borderWidth: 1,
                      callbacks: {
                        label: function(context) {
                          const label = context.label || '';
                          const value = context.raw || 0;
                          const total = context.dataset.data.reduce((a, b) => a + b, 0);
                          const percentage = Math.round((value / total) * 100);
                          return `${label}: ${value} patients (${percentage}%)`;
                        }
                      }
                    }
                  }
                }}
              />
            </div>
            {unknownAgePatients > 0 && (
              <div style={{
                marginTop: '15px',
                padding: '10px',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                borderRadius: '6px',
                borderLeft: '3px solid #EF4444',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 8V12M12 16H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span style={{ color: '#FECACA', fontSize: '13px' }}>
                  <strong>Data gap:</strong> {unknownAgePatients} patient(s) have unknown age (missing date of birth)
                </span>
              </div>
            )}
          </div>
          
          {/* Registration Trend - Stepped Area */}
          <div style={{
            backgroundColor: 'rgba(255,255,255,0.03)',
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.05)',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ marginTop: 0, color: '#E2E8F0', fontSize: '18px' }}>Registration Trend</h3>
              <div style={{
                backgroundColor: 'rgba(99, 102, 241, 0.2)',
                color: '#A5B4FC',
                padding: '4px 10px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '500'
              }}>
                MONTHLY PATTERNS
              </div>
            </div>
            <p style={{ margin: '0 0 15px', color: '#94A3B8', fontSize: '14px' }}>
              New patient registrations over the last 12 months with stepped visualization
            </p>
            <div style={{ height: '300px', position: 'relative' }}>
              <Line 
                data={getRegistrationTrend()}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false
                    },
                    tooltip: {
                      backgroundColor: '#0F172A',
                      titleColor: '#E2E8F0',
                      bodyColor: '#E2E8F0',
                      borderColor: 'rgba(255,255,255,0.1)',
                      borderWidth: 1,
                      callbacks: {
                        title: function(context) {
                          return context[0].label;
                        },
                        label: function(context) {
                          return `New patients: ${context.raw}`;
                        }
                      }
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        precision: 0,
                        color: '#94A3B8'
                      },
                      grid: {
                        color: 'rgba(255,255,255,0.05)'
                      },
                      title: {
                        display: true,
                        text: 'Number of Patients',
                        color: '#94A3B8'
                      }
                    },
                    x: {
                      grid: {
                        display: false
                      },
                      ticks: {
                        color: '#94A3B8'
                      },
                      title: {
                        display: true,
                        text: 'Month',
                        color: '#94A3B8'
                      }
                    }
                  }
                }}
              />
            </div>
            <div style={{ 
              marginTop: '15px',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '10px'
            }}>
              <div style={{
                backgroundColor: 'rgba(255,255,255,0.03)',
                padding: '10px',
                borderRadius: '6px',
                borderLeft: '3px solid #6366F1'
              }}>
                <p style={{ margin: '0 0 5px', color: '#94A3B8', fontSize: '12px' }}>Peak Month</p>
                <p style={{ margin: 0, color: '#E2E8F0', fontWeight: '500' }}>
                  {patients?.length > 0 
                    ? getRegistrationTrend().labels[
                        getRegistrationTrend().datasets[0].data.indexOf(
                          Math.max(...getRegistrationTrend().datasets[0].data)
                        )
                      ]
                    : 'N/A'}
                </p>
              </div>
              <div style={{
                backgroundColor: 'rgba(255,255,255,0.03)',
                padding: '10px',
                borderRadius: '6px',
                borderLeft: '3px solid #6366F1'
              }}>
                <p style={{ margin: '0 0 5px', color: '#94A3B8', fontSize: '12px' }}>Last Registration</p>
                <p style={{ margin: 0, color: '#E2E8F0', fontWeight: '500' }}>
                  {formatDate(mostRecentRegistration)}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div style={{
          padding: '20px',
          display: 'flex',
          justifyContent: 'flex-end',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          position: 'sticky',
          bottom: 0,
          backgroundColor: '#1E293B'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 24px',
              backgroundColor: '#6366F1',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s',
              ':hover': {
                backgroundColor: '#4F46E5'
              }
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Reusable Metric Card Component
const MetricCard = ({ title, value, trend, color }) => {
  const trendIcon = {
    up: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7 11L12 6L17 11M12 18V7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    down: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7 13L12 18L17 13M12 6V17" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    neutral: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 12H16M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )
  };

  return (
    <div style={{
      backgroundColor: 'rgba(255,255,255,0.03)',
      padding: '16px',
      borderRadius: '10px',
      border: '1px solid rgba(255,255,255,0.05)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '4px',
        height: '100%',
        backgroundColor: color
      }} />
      <h3 style={{ 
        margin: '0 0 8px', 
        color: '#94A3B8', 
        fontSize: '14px',
        fontWeight: '500'
      }}>
        {title}
      </h3>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <p style={{ 
          margin: 0, 
          fontSize: '24px', 
          fontWeight: '600',
          color: '#E2E8F0'
        }}>
          {value}
        </p>
        {trendIcon[trend]}
      </div>
    </div>
  );
};

export default PatientListAnalyticsModal;