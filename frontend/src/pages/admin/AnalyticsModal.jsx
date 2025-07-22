import React from 'react';
import { FaTimes, FaInfoCircle, FaChartBar, FaChartPie, FaChartLine } from 'react-icons/fa';
import { Pie, Line, Bar } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend, 
  ArcElement, 
  PointElement, 
  LineElement,
  RadialLinearScale
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  RadialLinearScale
);

const AnalyticsModal = ({ isOpen, onClose, logs }) => {
  if (!isOpen) return null;

  // Helper functions to process log data
  const getActivityCountByType = () => {
    const types = {};
    logs.forEach(log => {
      const action = log.action || 'Other';
      types[action] = (types[action] || 0) + 1;
    });
    return types;
  };

  const getActivityCountByUser = () => {
    const users = {};
    logs.forEach(log => {
      const user = log.user_name || 'System';
      users[user] = (users[user] || 0) + 1;
    });
    return users;
  };

  const getActivityCountByDate = () => {
    const dates = {};
    logs.forEach(log => {
      if (log.timestamp) {
        const date = new Date(log.timestamp).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        });
        dates[date] = (dates[date] || 0) + 1;
      }
    });
    return dates;
  };

  // Calculate statistics
  const totalActivities = logs?.length || 0;
  const uniqueUsers = Object.keys(getActivityCountByUser()).length || 0;
  const mostActiveUser = Object.entries(getActivityCountByUser()).sort((a, b) => b[1] - a[1])[0] || ['N/A', 0];
  const mostCommonAction = Object.entries(getActivityCountByType()).sort((a, b) => b[1] - a[1])[0] || ['N/A', 0];

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
            <h2 style={{ margin: 0, color: '#E2E8F0', fontWeight: '600' }}>Audit Log Analytics</h2>
            <p style={{ margin: '5px 0 0', color: '#94A3B8', fontSize: '14px' }}>
              Comprehensive analysis of system activities and user interactions
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
              <li>The <strong style={{ color: '#E2E8F0' }}>Activity Distribution</strong> shows system actions in radial layout</li>
              <li>The <strong style={{ color: '#E2E8F0' }}>User Activity</strong> uses donut chart for clear user segmentation</li>
              <li>The <strong style={{ color: '#E2E8F0' }}>Activity Timeline</strong> visualizes patterns over time</li>
              <li>Hover interactions provide detailed information about each metric</li>
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
            title="Total Activities" 
            value={totalActivities} 
            trend={logs?.length > 0 ? 'up' : 'neutral'} 
            color="#6366F1"
          />
          {/* <MetricCard 
            title="Unique Users" 
            value={uniqueUsers} 
            trend={uniqueUsers > 0 ? 'up' : 'neutral'} 
            color="#3B82F6"
          /> */}
          <MetricCard 
            title="Most Active User" 
            value={mostActiveUser[1]} 
            subtitle={mostActiveUser[0]}
            trend={mostActiveUser[1] > 0 ? 'up' : 'neutral'} 
            color="#10B981"
          />
          <MetricCard 
            title="Most Common Action" 
            value={mostCommonAction[1]} 
            subtitle={mostCommonAction[0]}
            trend={mostCommonAction[1] > 0 ? 'up' : 'neutral'} 
            color="#F59E0B"
          />
        </div>

        {/* Charts Section */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px',
          padding: '0 20px 20px'
        }}>
          {/* Activity Distribution - Radial Bar Chart */}
          <div style={{
            backgroundColor: 'rgba(255,255,255,0.03)',
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.05)',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ marginTop: 0, color: '#E2E8F0', fontSize: '18px' }}>
                <FaChartBar style={{ marginRight: '10px' }} />
                Activity Distribution
              </h3>
              <div style={{
                backgroundColor: 'rgba(99, 102, 241, 0.2)',
                color: '#A5B4FC',
                padding: '4px 10px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '500'
              }}>
                ACTION TYPES
              </div>
            </div>
            <p style={{ margin: '0 0 15px', color: '#94A3B8', fontSize: '14px' }}>
              Radial visualization of system activities by type
            </p>
            <div style={{ height: '350px', position: 'relative' }}>
              <Bar 
                data={{
                  labels: Object.keys(getActivityCountByType()),
                  datasets: [{
                    label: 'Activities',
                    data: Object.values(getActivityCountByType()),
                    backgroundColor: Object.keys(getActivityCountByType()).map((_, i) => {
                      const colors = [
                        'rgba(99, 102, 241, 0.8)',
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(16, 185, 129, 0.8)',
                        'rgba(245, 158, 11, 0.8)',
                        'rgba(236, 72, 153, 0.8)'
                      ];
                      return colors[i % colors.length];
                    }),
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    borderWidth: 1,
                    borderRadius: 6
                  }]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  indexAxis: 'y',
                  scales: {
                    x: {
                      display: false,
                      grid: {
                        display: false
                      }
                    },
                    y: {
                      display: true,
                      position: 'left',
                      grid: {
                        display: false
                      },
                      ticks: {
                        color: '#94A3B8'
                      }
                    },
                    r: {
                      angleLines: {
                        display: true,
                        color: 'rgba(255, 255, 255, 0.1)'
                      },
                      suggestedMin: 0,
                      beginAtZero: true,
                      grid: {
                        circular: true,
                        color: 'rgba(255, 255, 255, 0.1)'
                      },
                      pointLabels: {
                        display: true,
                        centerPointLabels: true,
                        color: '#E2E8F0',
                        font: {
                          size: 12
                        }
                      }
                    }
                  },
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
                        label: function(context) {
                          return `${context.label}: ${context.raw} activities`;
                        }
                      }
                    }
                  }
                }}
              />
            </div>
          </div>
          
          {/* User Activity - Donut Chart */}
          <div style={{
            backgroundColor: 'rgba(255,255,255,0.03)',
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.05)',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ marginTop: 0, color: '#E2E8F0', fontSize: '18px' }}>
                <FaChartPie style={{ marginRight: '10px' }} />
                User Activity
              </h3>
              <div style={{
                backgroundColor: 'rgba(99, 102, 241, 0.2)',
                color: '#A5B4FC',
                padding: '4px 10px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '500'
              }}>
                USER SEGMENTATION
              </div>
            </div>
            <p style={{ margin: '0 0 15px', color: '#94A3B8', fontSize: '14px' }}>
              Distribution of activities across different users
            </p>
            <div style={{ height: '300px', position: 'relative' }}>
              <Pie 
                data={{
                  labels: Object.keys(getActivityCountByUser()),
                  datasets: [{
                    data: Object.values(getActivityCountByUser()),
                    backgroundColor: [
                      'rgba(99, 102, 241, 0.7)',
                      'rgba(59, 130, 246, 0.7)',
                      'rgba(16, 185, 129, 0.7)',
                      'rgba(245, 158, 11, 0.7)',
                      'rgba(236, 72, 153, 0.7)'
                    ],
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                    borderWidth: 1
                  }]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  cutout: '65%',
                  plugins: {
                    legend: {
                      position: 'right',
                      labels: {
                        color: '#E2E8F0',
                        padding: 20,
                        usePointStyle: true,
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
                          return `${label}: ${value} activities (${percentage}%)`;
                        }
                      }
                    }
                  }
                }}
              />
            </div>
          </div>
          
          {/* Activity Timeline - Full Width */}
          <div style={{
            backgroundColor: 'rgba(255,255,255,0.03)',
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.05)',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            gridColumn: '1 / -1'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ marginTop: 0, color: '#E2E8F0', fontSize: '18px' }}>
                <FaChartLine style={{ marginRight: '10px' }} />
                Activity Timeline
              </h3>
              <div style={{
                backgroundColor: 'rgba(99, 102, 241, 0.2)',
                color: '#A5B4FC',
                padding: '4px 10px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '500'
              }}>
                TEMPORAL PATTERNS
              </div>
            </div>
            <p style={{ margin: '0 0 15px', color: '#94A3B8', fontSize: '14px' }}>
              System activities over time with area chart visualization
            </p>
            <div style={{ height: '300px', position: 'relative' }}>
              <Line 
                data={{
                  labels: Object.keys(getActivityCountByDate()),
                  datasets: [{
                    label: 'Activities Over Time',
                    data: Object.values(getActivityCountByDate()),
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
                    pointBorderWidth: 2
                  }]
                }}
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
                      borderWidth: 1
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        color: '#94A3B8'
                      },
                      grid: {
                        color: 'rgba(255,255,255,0.05)'
                      }
                    },
                    x: {
                      ticks: {
                        color: '#94A3B8'
                      },
                      grid: {
                        display: false
                      }
                    }
                  }
                }}
              />
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
const MetricCard = ({ title, value, subtitle, trend, color }) => {
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
      {subtitle && (
        <p style={{ 
          margin: '4px 0 0',
          color: '#94A3B8',
          fontSize: '13px',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default AnalyticsModal;