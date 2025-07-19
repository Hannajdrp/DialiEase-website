import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate, useLocation } from 'react-router-dom';
import styled, { keyframes, css } from 'styled-components';
import logo from "../../assets/images/logo.png";
import {
  FaHome,
  FaUserInjured,
  FaCalendarAlt,
  FaClock,
  FaUserCircle,
  FaSignOutAlt,
  FaTimes,
  FaBars,
  FaChevronDown,
  FaChevronRight
} from 'react-icons/fa';

// Color variables
const colors = {
  primary: '#395886',
  white: '#FFFFFF',
  green: '#477977',
  lightGray: '#f5f5f5',
  darkGray: '#363949',
  mediumGray: '#7d8da1',
  danger: '#e74c3c'
};

// Animations
const slideIn = keyframes`
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const pulse = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(57, 88, 134, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(57, 88, 134, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(57, 88, 134, 0);
  }
`;

// Main container styles
const Aside = styled.aside`
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: ${colors.white};
  position: fixed;
  left: 0;
  top: 0;
  width: 280px;
  z-index: 100;
  padding: 1.5rem 1rem;
  box-shadow: 4px 0 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  overflow: hidden;
  
  @media screen and (max-width: 768px) {
    transform: translateX(-100%);
    width: 300px;
    ${({ $mobileMenuOpen }) => $mobileMenuOpen && css`
      animation: ${slideIn} 0.3s ease-out forwards;
      box-shadow: 8px 0 30px rgba(0, 0, 0, 0.15);
    `}
  }
`;

const TopSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
`;

const LogoContainer = styled.div`
  display: flex;
  gap: 0.75rem;
  align-items: center;
  transition: all 0.3s ease;
`;

const LogoImage = styled.img`
  width: 2.8rem;
  height: 2.8rem;
  object-fit: contain;
  transition: all 0.3s ease;
`;

const LogoText = styled.h2`
  color: ${colors.primary};
  font-weight: 800;
  font-size: 1.4rem;
  margin: 0;
  letter-spacing: -0.5px;
  transition: all 0.3s ease;
  
  @media screen and (max-width: 1200px) {
    display: none;
  }
`;

const CloseButton = styled.button`
  display: none;
  cursor: pointer;
  color: ${colors.mediumGray};
  background: none;
  border: none;
  font-size: 1.5rem;
  transition: all 0.2s ease;
  
  &:hover {
    color: ${colors.primary};
    transform: scale(1.1);
  }
  
  @media screen and (max-width: 768px) {
    display: block;
  }
`;

const SidebarMenu = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  overflow-y: auto;
  padding: 0.5rem 0;
  scrollbar-width: thin;
  scrollbar-color: ${colors.primary} ${colors.lightGray};

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: ${colors.lightGray};
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: ${colors.primary};
    border-radius: 10px;
  }
`;

const MenuItem = styled.div`
  display: flex;
  align-items: center;
  color: ${colors.darkGray};
  padding: 0.9rem 1.2rem;
  margin: 0.3rem 0;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  
  &:hover {
    background-color: rgba(57, 88, 134, 0.08);
    color: ${colors.primary};
    
    &::after {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 3px;
      background: ${colors.primary};
      border-radius: 0 10px 10px 0;
    }
  }
  
  &.active {
    background-color: rgba(57, 88, 134, 0.1);
    color: ${colors.primary};
    font-weight: 600;
    
    &::after {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 3px;
      background: ${colors.primary};
      border-radius: 0 10px 10px 0;
    }
  }
`;

const MenuIcon = styled.span`
  margin-right: 1.2rem;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  min-width: 24px;
`;

const MenuText = styled.span`
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s ease;
  
  @media screen and (max-width: 1200px) {
    display: none;
  }
`;

const UserProfile = styled.div`
  display: flex;
  align-items: center;
  gap: 1.2rem;
  padding: 1.2rem;
  margin-bottom: 2rem;
  background: rgba(57, 88, 134, 0.05);
  border-radius: 12px;
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    background: rgba(57, 88, 134, 0.1);
  }
`;

const UserAvatar = styled.div`
  width: 3.2rem;
  height: 3.2rem;
  border-radius: 50%;
  background: linear-gradient(135deg, ${colors.primary}, ${colors.green});
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${colors.white};
  font-weight: bold;
  font-size: 1.3rem;
  transition: all 0.3s ease;
  animation: ${pulse} 2s infinite;
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  overflow: hidden;
`;

const UserName = styled.span`
  font-weight: 600;
  color: ${colors.darkGray};
  font-size: 1rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const UserRole = styled.span`
  font-size: 0.85rem;
  color: ${colors.mediumGray};
  margin-top: 0.2rem;
`;

const MobileMenuButton = styled.button`
  display: none;
  position: fixed;
  top: 1.2rem;
  left: 1.2rem;
  z-index: 90;
  background: ${colors.primary};
  color: ${colors.white};
  border: none;
  border-radius: 10px;
  padding: 0.85rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(57, 88, 134, 0.2);
  
  &:hover {
    background: ${colors.green};
    transform: scale(1.05);
  }
  
  @media screen and (max-width: 768px) {
    display: flex;
  }
`;

const Backdrop = styled.div`
  display: ${({ $mobileMenuOpen }) => $mobileMenuOpen ? 'block' : 'none'};
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 90;
  animation: ${fadeIn} 0.3s ease-out;
`;

const LogoutButton = styled(MenuItem)`
  margin-top: auto;
  color: ${colors.danger};
  background: rgba(231, 76, 60, 0.05);
  
  &:hover {
    background-color: rgba(231, 76, 60, 0.1);
    color: ${colors.danger};
    
    &::after {
      background: ${colors.danger};
    }
  }
`;

const SubMenuContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: 1.5rem;
  padding-left: 1rem;
  border-left: 2px dashed rgba(57, 88, 134, 0.2);
  overflow: hidden;
  max-height: ${({ $isOpen }) => $isOpen ? '500px' : '0'};
  transition: max-height 0.3s ease;
`;

const SubMenuItem = styled(MenuItem)`
  padding: 0.7rem 1rem;
  margin: 0.2rem 0;
  font-size: 0.95rem;
  
  &.active {
    font-weight: 500;
  }
`;

const ExpandIcon = styled.span`
  margin-left: auto;
  transition: transform 0.3s ease;
  transform: ${({ $isOpen }) => $isOpen ? 'rotate(0deg)' : 'rotate(-90deg)'};
  font-size: 0.9rem;
  color: ${colors.mediumGray};
`;

const NotificationBadge = styled.span`
  background: ${colors.danger};
  color: ${colors.white};
  border-radius: 50%;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: bold;
  margin-left: auto;
`;

const StaffSidebar = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [openSubMenu, setOpenSubMenu] = React.useState(null);

  const isActive = (path) => {
    return location.pathname.includes(path) ? "active" : "";
  };

  const menuItems = [
    { 
      name: "Dashboard", 
      icon: <FaHome />, 
      path: "/staff/StaffDashboard",
      match: "StaffDashboard"
    },
    { 
      name: "CAPD Patients", 
      icon: <FaUserInjured />, 
      path: "/staff/OutpatientList",
      match: "OutpatientList",
      subItems: [
        { name: "Patients Lists", path: "/staff/OutpatientList", match: "OutpatientList" },
        // { name: "Treatment History", path: "/staff/StaffPDTreatment", match: "StaffPDTreatment" },
      ]
    },
    { 
      name: "Appointments", 
      icon: <FaCalendarAlt />, 
      path: "/staff/PatientScheduleList",
      match: " PatientScheduleList",

    },
    {   
      name: "Profile", 
      icon: <FaUserCircle />, 
      path: "/staff/StaffProfile",
      match: "StaffProfile"
    },
  ];

  const toggleSubMenu = (index) => {
    setOpenSubMenu(openSubMenu === index ? null : index);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const getUserInitials = () => {
    if (!user?.first_name) return "U";
    return `${user.first_name.charAt(0)}${user.last_name?.charAt(0) || ''}`.toUpperCase();
  };

  return (
    <>
      <MobileMenuButton onClick={toggleMobileMenu}>
        {mobileMenuOpen ? <FaTimes /> : <FaBars />}
      </MobileMenuButton>
      
      <Backdrop $mobileMenuOpen={mobileMenuOpen} onClick={toggleMobileMenu} />
      
      <Aside $mobileMenuOpen={mobileMenuOpen}>
        <TopSection>
          <LogoContainer>
            <LogoImage src={logo} alt="Logo" />
            <LogoText>DIALIEASE</LogoText>
          </LogoContainer>
          <CloseButton onClick={toggleMobileMenu}>
            <FaTimes />
          </CloseButton>
        </TopSection>

        {user && (
          <UserProfile onClick={() => navigate('/staff/profile')}>
            <UserAvatar>{getUserInitials()}</UserAvatar>
            <UserInfo>
              <UserName>{user.first_name} {user.last_name}</UserName>
              <UserRole>Medical Staff</UserRole>
            </UserInfo>
          </UserProfile>
        )}

        <SidebarMenu>
          {menuItems.map((item, index) => (
            <React.Fragment key={item.name}>
              <MenuItem
                className={isActive(item.match)}
                onClick={() => {
                  if (item.subItems) {
                    toggleSubMenu(index);
                  } else {
                    navigate(item.path);
                    setMobileMenuOpen(false);
                  }
                }}
              >
                <MenuIcon>{item.icon}</MenuIcon>
                <MenuText>{item.name}</MenuText>
                {item.badge && <NotificationBadge>{item.badge}</NotificationBadge>}
                {item.subItems && (
                  <ExpandIcon $isOpen={openSubMenu === index}>
                    <FaChevronDown />
                  </ExpandIcon>
                )}
              </MenuItem>

              {item.subItems && (
                <SubMenuContainer $isOpen={openSubMenu === index}>
                  {item.subItems.map((subItem) => (
                    <SubMenuItem
                      key={subItem.name}
                      className={isActive(subItem.match)}
                      onClick={() => {
                        navigate(subItem.path);
                        setMobileMenuOpen(false);
                      }}
                    >
                      <MenuIcon>
                        <FaChevronRight size={12} />
                      </MenuIcon>
                      <MenuText>{subItem.name}</MenuText>
                    </SubMenuItem>
                  ))}
                </SubMenuContainer>
              )}
            </React.Fragment>
          ))}

          <LogoutButton onClick={handleLogout}>
            <MenuIcon><FaSignOutAlt /></MenuIcon>
            <MenuText>Logout</MenuText>
          </LogoutButton>
        </SidebarMenu>
      </Aside>
    </>
  );
};

StaffSidebar.propTypes = {
  user: PropTypes.shape({
    first_name: PropTypes.string,
    last_name: PropTypes.string,
    userLevel: PropTypes.string,
  }),
};

export default StaffSidebar;