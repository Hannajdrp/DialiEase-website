import styled from 'styled-components';



export const DashboardContainer = styled.div`
  display: flex;
  gap: 1.5rem;
  padding: 2rem;
  font-family: 'Poppins', sans-serif;
  background-color: #f8f9fa;
  color: #2c3e50;
  min-height: 100vh;
    margin-Top: -660px;
  width: 101%;
  margin-right: 80px;
`;
export const PatientCountBadge = styled.span`
  background-color: #477977;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 500;
`;

export const ConfirmedBadge = styled.span`
  background-color: #e6f2f1;
  color: #477977;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.7rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

export const PendingBadge = styled.span`
  background-color: #fff8e6;
  color: #cc8e35;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.7rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

export const MainContent = styled.main`
  flex: 2.5;
  margin-left: 280px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

export const Sidebar = styled.div`
  flex: 1.3;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  background: white;
  padding: 1rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);

`;

export const Title = styled.h1`
  font-size: 1.8rem;
  margin: 0;
  color: #395886;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 600;
`;

export const DateTime = styled.p`
  margin: 0.25rem 0 0 0;
  color: #7f8c8d;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

export const NotificationButton = styled.button`
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f5f5f5;
  }

  span {
    color: #2c3e50;
    font-size: 0.9rem;
  }
`;

export const UserProfile = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: #fff;
  padding: 0.5rem 1rem;
  border-radius: 50px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
`;

export const UserAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #395886;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1rem;
`;

export const UserName = styled.span`
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.9rem;
`;

export const UserRole = styled.span`
  color: #7f8c8d;
  font-size: 0.75rem;
  display: block;
`;

export const ErrorContainer = styled.div`
  background: #ffebee;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  border-left: 4px solid #f44336;

  h3, h4 {
    margin-top: 0;
    color: #d32f2f;
    font-size: 0.95rem;
  }

  p {
    color: #d32f2f;
    font-size: 0.85rem;
    margin-bottom: 0.5rem;
  }

  ul {
    margin-bottom: 0;
    padding-left: 1.25rem;
    font-size: 0.85rem;
  }

  li {
    color: #d32f2f;
  }
`;

export const RetryButton = styled.button`
  background: #f44336;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 0.5rem;

  &:hover {
    background: #d32f2f;
  }
`;

export const WelcomeBanner = styled.div`
  background: linear-gradient(135deg, #395886 0%, #2c3e50 100%);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
  height: 200px;
  overflow: hidden;
  position: relative;
  margin-bottom: 1.5rem;

  h2 {
    margin: 0 0 1rem 0;
    font-size: 1.5rem;
    font-weight: 600;
  }
`;

export const WelcomeContent = styled.div`
  max-width: 60%;
  z-index: 2;
`;

export const WelcomeMessage = styled.p`
  margin: 0 0 1.5rem 0;
  font-size: 0.95rem;
  opacity: 0.9;
  line-height: 1.5;
`;

export const WelcomeStats = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.95rem;
  font-weight: 500;

  div {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`;

export const DoctorImage = styled.img`
  width: 40%;
  height: auto;
  object-fit: contain;
  position: absolute;
  right: 0;
  bottom: 0;
  z-index: 1;
`;

export const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const MetricCard = styled.div`
  background: #ffffff;
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  gap: 1rem;
`;

export const MetricIcon = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 12px;
  background: ${props => props.$background || '#f5f7fa'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
`;

export const MetricContent = styled.div`
  flex: 1;
`;

export const MetricLabel = styled.div`
  color: #7f8c8d;
  font-size: 0.85rem;
  margin-bottom: 0.25rem;
`;

export const MetricValue = styled.div`
  color: #2c3e50;
  font-size: 1.5rem;
  font-weight: 600;
`;

export const ChartContainer = styled.div`
  background: #ffffff;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin-bottom: 1.5rem;
`;

export const ScheduleTabs = styled.div`
  display: flex;
  border-bottom: 1px solid #e0e0e0;
  margin-bottom: 1rem;
`;

export const TabButton = styled.button`
  flex: 1;
  padding: 0.75rem;
  background: ${props => props.active ? '#f0f7f7' : 'transparent'};
  border: none;
  border-bottom: 2px solid ${props => props.active ? '#477977' : 'transparent'};
  color: ${props => props.active ? '#477977' : '#666'};
  font-weight: ${props => props.active ? '600' : '400'};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s ease;

  &:hover {
    background: #f0f7f7;
  }

  svg {
    font-size: 0.9rem;
  }
`;

export const ChartHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;

  h3 {
    color: #395886;
    font-size: 1rem;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 600;
  }
`;

export const TimeRangeToggle = styled.div`
  display: flex;
  gap: 0.5rem;
  background: #f5f7fa;
  border-radius: 8px;
  padding: 0.25rem;
`;

export const TimeRangeButton = styled.button`
  padding: 0.5rem 1rem;
  background: ${props => props.$active ? '#477977' : 'transparent'};
  color: ${props => props.$active ? 'white' : '#2c3e50'};
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 500;
  transition: all 0.2s ease;
`;

export const ChartContent = styled.div`
  height: 250px;
`;

export const EmptyChart = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #7f8c8d;
  font-size: 0.9rem;
  padding: 2rem;

  svg {
    font-size: 2rem;
    margin-bottom: 1rem;
    opacity: 0.5;
  }
`;

export const ScheduleGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;

  @media (max-width: 1200px) {
    grid-template-columns: 1fr 1fr;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const ScheduleCard = styled.div`
  background: #ffffff;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
`;

export const ScheduleHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;

  h3 {
    color: #395886;
    font-size: 1rem;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 600;
  }
`;

export const PatientCount = styled.span`
  background: #477977;
  color: white;
  border-radius: 20px;
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
`;

export const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  background: #f5f7fa;
  border-radius: 20px;
  padding: 0.5rem 1rem;
  margin-bottom: 1rem;
  border: 1px solid #e0e6ed;

  svg {
    color: #7f8c8d;
    margin-right: 8px;
    font-size: 0.9rem;
  }

  input {
    border: none;
    background: transparent;
    width: 100%;
    font-size: 0.9rem;
    color: #2c3e50;

    &:focus {
      outline: none;
    }

    &::placeholder {
      color: #95a5a6;
    }
  }
`;

export const PatientList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding-right: 0.5rem;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 10px;
  }
`;

export const PatientItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  border-radius: 8px;
  background: ${props => props.index % 2 === 0 ? '#f8f9fa' : 'transparent'};
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 0.5rem;
  
  &:hover {
    background: #f1f3f5;
  }
`;

export const PatientInfo = styled.div`
  flex: 1;
`;

export const PatientName = styled.p`
  margin: 0 0 0.25rem 0;
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.9rem;
`;

export const PatientTime = styled.p`
  margin: 0;
  font-size: 0.8rem;
  color: #7f8c8d;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const PrescribeButton = styled.button`
  background: #477977;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #395886;
  }
`;

export const NotesButton = styled.button`
  background: #f0f7f7;
  color: #477977;
  border: none;
  border-radius: 6px;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #e0efef;
  }
`;

export const EmptySchedule = styled.div`
  text-align: center;
  padding: 2rem 1rem;
  color: #7f8c8d;
  font-size: 0.9rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  svg {
    font-size: 2rem;
    margin-bottom: 1rem;
    opacity: 0.5;
  }
`;

export const NextPatientCard = styled.div`
  background: #ffffff;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);

  h3 {
    color: #395886;
    font-size: 1rem;
    margin: 0 0 1.25rem 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 600;
  }
`;

export const NextPatientInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;

  div {
    h4 {
      margin: 0 0 0.25rem 0;
      font-size: 1.1rem;
      color: #2c3e50;
      font-weight: 600;
    }

    p {
      margin: 0.25rem 0;
      font-size: 0.85rem;
      color: #7f8c8d;
    }
  }
`;

export const NextPatientDetails = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 0.75rem;
  margin-bottom: 1rem;

  p {
    margin: 0.25rem 0;
    font-size: 0.9rem;
    color: #2c3e50;
    line-height: 1.5;
  }
`;

export const NextPatientActions = styled.div`
  display: flex;
  justify-content: space-between;
  border-top: 1px solid #e9ecef;
  padding-top: 1rem;

  div:first-child {
    color: #477977;
    font-size: 0.9rem;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  div:last-child {
    display: flex;
    gap: 0.75rem;
  }
`;

export const DetailsButton = styled.button`
  padding: 0.5rem 1rem;
  background: transparent;
  color: #477977;
  border: 1px solid #477977;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  
  &:hover {
    background: #477977;
    color: white;
  }
`;

export const PrescribeButtonMain = styled.button`
  padding: 0.5rem 1rem;
  background: #477977;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  
  &:hover {
    background: #395886;
  }
`;

export const AppointmentsCard = styled.div`
  background: #ffffff;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
`;

export const AppointmentsHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.25rem;

  h3 {
    color: #395886;
    font-size: 1rem;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 600;
  }
`;

export const AppointmentsList = styled.div`
  height: 300px;
  overflow-y: auto;
  padding-right: 0.5rem;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 10px;
  }
`;

export const AppointmentsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: white;
  font-size: 0.85rem;

  th {
    padding: 0.75rem 1rem;
    text-align: left;
    color: #395886;
    border-bottom: 1px solid #477977;
    font-weight: 600;
    position: sticky;
    top: 0;
    background: white;
  }

  tr {
    cursor: pointer;
    transition: background-color 0.2s;
    
    &:hover {
      background-color: #f8f9fa;
    }
  }

  td {
    padding: 0.75rem 1rem;
    text-align: left;
    border-bottom: 1px solid #e9ecef;
    color: #2c3e50;
  }

  td:last-child {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`;

export const TodayIndicator = styled.span`
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #477977;
  margin-right: 6px;
`;

export const TomorrowIndicator = styled.span`
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #395886;
  margin-right: 6px;
`;

export const EmptyAppointments = styled.div`
  text-align: center;
  padding: 2rem 1rem;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  div:first-child {
    width: 60px;
    height: 60px;
    background: #f8f9fa;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1rem;
    color: #adb5bd;
    font-size: 1.5rem;
  }

  div:nth-child(2) {
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: #2c3e50;
  }

  p {
    color: #7f8c8d;
    font-size: 0.85rem;
    margin: 0;
    max-width: 200px;
  }
`;

export const CalendarCard = styled.div`
  background: #ffffff;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin-top: 1rem;

  h3 {
    color: #395886;
    font-size: 1rem;
    margin: 0 0 1.25rem 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 600;
  }
`;

//patient schedule modal styles
// Add to DoctorDashboardStyles.js
export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

export const ModalContainer = styled.div`
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
`;

export const ModalHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f8f9fa;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;

  h3 {
    margin: 0;
    font-size: 1.25rem;
    color: #477977;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`;

export const ModalContent = styled.div`
  padding: 1.5rem;
  flex: 1;
`;

export const ModalFooter = styled.div`
  padding: 1rem 1.5rem;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: flex-end;
  background-color: #f8f9fa;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
`;

export const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.25rem;
  color: #777;
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: #333;
  }
`;

export const ModalButton = styled.button`
  padding: 0.5rem 1.25rem;
  background-color: #477977;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: background-color 0.2s;

  &:hover {
    background-color: #3a6361;
  }
`;

export const PatientProfileSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #eee;
`;

export const PatientAvatarLarge = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: #477977;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
`;

export const NextAppointment = styled.div`
  font-size: 0.7rem;
  color: #666;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  margin-top: 0.2rem;
`;



export const PatientNameLarge = styled.h4`
  margin: 0.5rem 0;
  font-size: 1.25rem;
  color: #333;
`;

export const PatientId = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #666;
  font-size: 0.875rem;
`;

export const DetailsSection = styled.div`
  margin-bottom: 1.5rem;
`;

export const SectionTitle = styled.h5`
  margin: 0 0 1rem 0;
  font-size: 1rem;
  color: #477977;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const DetailsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
`;

export const DetailItem = styled.div`
  display: flex;
  gap: 0.75rem;
  padding: 0.75rem;
  background-color: #f8f9fa;
  border-radius: 6px;
`;

export const DetailIcon = styled.div`
  color: #477977;
  font-size: 1rem;
  display: flex;
  align-items: center;
`;

export const DetailLabel = styled.div`
  font-size: 0.75rem;
  color: #666;
  margin-bottom: 0.25rem;
`;

export const DetailValue = styled.div`
  font-size: 0.875rem;
  font-weight: 500;
  color: #333;
`;

export const AppointmentDetails = styled.div`
  background-color: #f0f7f6;
  padding: 1rem;
  border-radius: 6px;
  border-left: 4px solid #477977;
`;

export const AppointmentDateTime = styled.div`
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: #333;
`;

export const AppointmentStatus = styled.div`
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  background-color: ${props => 
    props.$status === 'Completed' ? '#e8f5e9' : 
    props.$status === 'Cancelled' ? '#ffebee' : 
    props.$status === 'Rescheduled' ? '#fff8e1' : 
    '#e3f2fd'};
  color: ${props => 
    props.$status === 'Completed' ? '#388e3c' : 
    props.$status === 'Cancelled' ? '#d32f2f' : 
    props.$status === 'Rescheduled' ? '#ffa000' : 
    '#1976d2'};
`;

export const AppointmentNotes = styled.div`
  font-size: 0.875rem;
  color: #666;
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;

  svg {
    color: #477977;
    flex-shrink: 0;
  }
`;

export const NoAppointment = styled.div`
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 6px;
  color: #666;
  text-align: center;
  font-size: 0.875rem;
`;

export const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;
  background-color: #f8f9fa;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9999;
`;

export const LoadingSpinner = styled.div`
  width: clamp(50px, 10vw, 80px);
  height: clamp(50px, 10vw, 80px);
  border: 5px solid rgba(243, 243, 243, 0.6);
  border-top: 5px solid #395886;
  border-right: 5px solid rgba(57, 88, 134, 0.7);
  border-bottom: 5px solid rgba(57, 88, 134, 0.4);
  border-radius: 50%;
  animation: spin 1.2s cubic-bezier(0.5, 0.1, 0.4, 0.9) infinite;
  will-change: transform;
  box-shadow: 0 4px 12px rgba(57, 88, 134, 0.1);

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

export const LoadingText = styled.p`
  color: #395886;
  font-size: clamp(16px, 3vw, 20px);
  font-weight: 500;
  font-family: 'Poppins', sans-serif;
  animation: fadePulse 1.5s ease-in-out infinite;
  margin-top: 1.5rem;

  @keyframes fadePulse {
    0%, 100% { opacity: 0.8; }
    50% { opacity: 1; }
  }
`;

export const LoadingDots = styled.span`
  display: inline-block;
  animation: dotPulse 1.5s infinite;

  @keyframes dotPulse {
    0% { opacity: 0.2; transform: translateY(0); }
    20% { opacity: 1; transform: translateY(-3px); }
    40%, 100% { opacity: 0.2; transform: translateY(0); }
  }
`;