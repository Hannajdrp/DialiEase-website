// components/AgeDistributionChart.jsx
import React from 'react';
import { Chart } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend,
  Filler
} from 'chart.js';
import { FaChartArea, FaInfoCircle } from 'react-icons/fa';
import { Tooltip as ReactTooltip } from 'react-tooltip';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const AgeDistributionChart = ({ dashboardStats, windowWidth }) => {
  // Enhanced age distribution chart data
  const ageDistributionData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Minors (0-17)',
        data: dashboardStats?.ageDistribution?.minors || Array(12).fill(0),
        borderColor: '#4BC0C0',
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderWidth: 1,
        tension: 0.3,
        fill: true,
        pointBackgroundColor: '#4BC0C0',
        pointRadius: 3,
        pointHoverRadius: 5,
        pointBorderColor: '#fff',
        pointBorderWidth: 1
      },
      {
        label: 'Adults (18-59)',
        data: dashboardStats?.ageDistribution?.adults || Array(12).fill(0),
        borderColor: '#3598DB',
        backgroundColor: 'rgba(53, 162, 235, 0.6)',
        borderWidth: 1,
        tension: 0.3,
        fill: true,
        pointBackgroundColor: '#3598DB',
        pointRadius: 3,
        pointHoverRadius: 5,
        pointBorderColor: '#fff',
        pointBorderWidth: 1
      },
      {
        label: 'Seniors (60+)',
        data: dashboardStats?.ageDistribution?.seniors || Array(12).fill(0),
        borderColor: '#FF6384',
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderWidth: 1,
        tension: 0.3,
        fill: true,
        pointBackgroundColor: '#FF6384',
        pointRadius: 3,
        pointHoverRadius: 5,
        pointBorderColor: '#fff',
        pointBorderWidth: 1
      }
    ]
  };

  return (
    <div style={{
      background: '#ffffff',
      borderRadius: '16px',
      padding: '1.5rem',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
      marginBottom: '1.5rem',
      border: '1px solid rgba(0, 0, 0, 0.03)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <h3 style={{
            color: '#2D3748',
            fontSize: '1.1rem',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: '600'
          }}>
            <FaChartArea style={{ color: '#4BC0C0', fontSize: '1rem' }} />
            Patient Age Distribution Composition
          </h3>
          <FaInfoCircle 
            id="age-chart-info" 
            style={{ color: '#A0AEC0', fontSize: '0.9rem', cursor: 'pointer' }} 
          />
          <ReactTooltip 
            anchorId="age-chart-info" 
            place="right"
            content="Shows monthly composition of patients by age groups: Minors (0-17), Adults (18-59), Seniors (60+) as stacked areas"
          />
        </div>
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          fontSize: '0.8rem',
          color: '#718096'
        }}>
          <span>12 Months</span>
        </div>
      </div>
      
      <div style={{ height: '320px', position: 'relative' }}>
        <Chart 
          type='line'
          data={ageDistributionData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: windowWidth <= 768 ? 'bottom' : 'top',
                labels: {
                  usePointStyle: true,
                  padding: 20,
                  font: {
                    family: 'Inter, sans-serif',
                    size: windowWidth <= 768 ? 12 : 13
                  }
                }
              },
              tooltip: {
                mode: 'index',
                intersect: false,
                backgroundColor: '#2D3748',
                titleFont: { size: 14, weight: 'bold' },
                bodyFont: { size: 13 },
                padding: 12,
                cornerRadius: 8,
                displayColors: true,
                callbacks: {
                  label: function(context) {
                    return `${context.dataset.label}: ${context.parsed.y} patients`;
                  },
                  footer: (tooltipItems) => {
                    const total = tooltipItems.reduce((sum, item) => sum + item.parsed.y, 0);
                    return `Total: ${total} patients`;
                  }
                }
              },
              title: {
                display: false
              }
            },
            interaction: {
              mode: 'nearest',
              axis: 'x',
              intersect: false
            },
            scales: {
              x: {
                stacked: true,
                grid: {
                  display: false,
                  drawBorder: false
                },
                ticks: {
                  color: '#718096',
                  font: {
                    size: windowWidth <= 768 ? 10 : 11
                  }
                }
              },
              y: {
                stacked: true,
                beginAtZero: true,
                grid: {
                  color: 'rgba(0, 0, 0, 0.05)',
                  drawBorder: false
                },
                ticks: {
                  color: '#718096',
                  font: {
                    size: windowWidth <= 768 ? 10 : 11
                  },
                  callback: function(value) {
                    return Number.isInteger(value) ? value : '';
                  }
                }
              }
            },
            elements: {
              line: {
                cubicInterpolationMode: 'monotone'
              }
            }
          }}
        />
      </div>
      
      <div style={{
        marginTop: '1rem',
        fontSize: '0.75rem',
        color: '#718096',
        textAlign: 'right',
        fontStyle: 'italic'
      }}>
        Updated: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
      </div>
    </div>
  );
};

export default AgeDistributionChart;