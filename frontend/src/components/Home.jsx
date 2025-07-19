import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTypewriter, Cursor } from "react-simple-typewriter";
import { 
  FaArrowDown, FaHospital, FaHeartbeat, FaUsers, 
  FaCog, FaChartLine, FaMobileAlt, FaBars, 
  FaTimes, FaDownload 
} from "react-icons/fa";
import styled, { createGlobalStyle, css } from "styled-components";
import logoImage from "../assets/images/logo.PNG";
import doctorPic from "../assets/images/doctorPic.PNG";
import staffPic from "../assets/images/staffPic.PNG";

// Color palette
const colors = {
  primary: "#395886",
  secondary: "#638ECB",
  accent: "#477977",
  white: "#ffffff",
  lightGray: "#f8fafc",
  textDark: "#1e293b",
  textLight: "#64748b",
};

// Responsive breakpoints
const breakpoints = {
  xs: "480px",
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  xxl: "1536px",
};

// Global styles for consistent baseline
const GlobalStyles = createGlobalStyle`
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html {
    scroll-behavior: smooth;
    -webkit-text-size-adjust: 100%;
    font-size: 100%;
    
    @media (max-width: ${breakpoints.xxl}) {
      font-size: 95%;
    }
    
    @media (max-width: ${breakpoints.lg}) {
      font-size: 90%;
    }
    
    @media (max-width: ${breakpoints.md}) {
      font-size: 85%;
    }
    
    @media (max-width: ${breakpoints.sm}) {
      font-size: 82%;
    }
    
    @media (max-width: ${breakpoints.xs}) {
      font-size: 80%;
    }
  }

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 
                 Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
    overflow-x: hidden;
  }

  img {
    max-width: 100%;
    height: auto;
    display: block;
  }

  button {
    font-family: inherit;
  }

  a {
    text-decoration: none;
    color: inherit;
  }
`;

// Container component
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  width: 100%;
  background: ${colors.white};
  overflow-x: hidden;
  padding-top: 245vh; /* Increased top space using relative units */

  @media (max-width: ${breakpoints.xl}) {
    padding-top: 25vh;
  }

  @media (max-width: ${breakpoints.lg}) {
    padding-top: 20vh;
  }

  @media (max-width: ${breakpoints.md}) {
    padding-top: 18vh;
  }

  @media (max-width: ${breakpoints.sm}) {
    padding-top: 15vh;
  }

  @media (max-width: ${breakpoints.xs}) {
    padding-top: 12vh;
  }
`;


// Header component
const Header = styled.header`
  width: 100%;
  padding: 1rem 0;
  position: fixed;
  top: 0;
  z-index: 1000;
  background: ${colors.white};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  
  @media (max-width: ${breakpoints.md}) {
    padding: 0.8rem 0;
  }
`;

const NavContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1.5rem;

  @media (min-width: ${breakpoints.lg}) {
    padding: 0 3.75rem;
  }
  
  @media (max-width: ${breakpoints.sm}) {
    padding: 0 1rem;
  }
`;

const LogoLink = styled(Link)`
  font-size: 1.5rem;
  font-weight: 700;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: ${colors.primary};

  img {
    height: 2.5rem;
    width: auto;
    
    @media (max-width: ${breakpoints.sm}) {
      height: 2rem;
    }
  }
  
  @media (max-width: ${breakpoints.sm}) {
    font-size: 1.2rem;
    gap: 0.5rem;
  }
`;

const NavLinks = styled.nav`
  display: none;
  gap: 2rem;
  align-items: center;

  @media (min-width: ${breakpoints.md}) {
    display: flex;
  }
  
  @media (min-width: ${breakpoints.lg}) {
    gap: 2.5rem;
  }
`;

const NavLink = styled(Link)`
  color: ${colors.textDark};
  font-weight: 500;
  font-size: 0.95rem;
  transition: color 0.2s ease;
  position: relative;
  padding: 0.5rem 0;

  &:hover {
    color: ${colors.accent};
  }

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 0;
    height: 2px;
    background: ${colors.accent};
    transition: width 0.3s ease;
  }

  &:hover::after {
    width: 100%;
  }
  
  @media (max-width: ${breakpoints.lg}) {
    font-size: 0.9rem;
  }
`;

const LoginButton = styled(Link)`
  color: ${colors.white};
  background-color: ${colors.primary};
  padding: 0.6rem 1.2rem;
  border-radius: 0.375rem;
  font-weight: 500;
  transition: all 0.2s ease;
  font-size: 0.95rem;
  white-space: nowrap;

  &:hover {
    background-color: ${colors.accent};
    transform: translateY(-1px);
  }
  
  @media (max-width: ${breakpoints.lg}) {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
  }
`;

const MobileMenuButton = styled.button`
  background: none;
  border: none;
  color: ${colors.primary};
  font-size: 1.5rem;
  cursor: pointer;
  display: block;
  padding: 0.5rem;
  z-index: 1100;

  @media (min-width: ${breakpoints.md}) {
    display: none;
  }
  
  @media (max-width: ${breakpoints.sm}) {
    font-size: 1.3rem;
  }
`;

const MobileNavLinks = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  position: fixed;
  top: 4.5rem;
  right: 1rem;
  background: ${colors.white};
  padding: 2rem;
  border-radius: 0.75rem;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  width: calc(100% - 2rem);
  max-width: 22rem;
  
  @media (max-width: ${breakpoints.xs}) {
    top: 4rem;
    padding: 1.5rem;
    gap: 1.2rem;
  }
`;

// Main content components
const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  margin: 0 auto;
  padding-top: 5rem;
  
  @media (min-width: ${breakpoints.md}) {
    padding-top: 6rem;
  }
  
  @media (min-width: ${breakpoints.lg}) {
    padding-top: 7.5rem;
  }
`;

const Section = styled.section`
  width: 100%;
  padding: 4rem 0;
  
  @media (min-width: ${breakpoints.md}) {
    padding: 5rem 0;
  }
  
  @media (min-width: ${breakpoints.lg}) {
    padding: 6.25rem 0;
  }
`;

const ConstrainedWidth = styled.div`
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1.5rem;

  @media (min-width: ${breakpoints.lg}) {
    padding: 0 3.75rem;
  }
  
  @media (max-width: ${breakpoints.sm}) {
    padding: 0 1rem;
  }
`;

// Hero section components
const HeroSection = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 4rem;
  gap: 3rem;

  @media (min-width: ${breakpoints.lg}) {
    flex-direction: row;
    gap: 5rem;
    margin-bottom: 6.25rem;
  }
  
  @media (max-width: ${breakpoints.sm}) {
    gap: 2rem;
    margin-bottom: 3rem;
  }
`;

const HeroText = styled.div`
  flex: 1;
  text-align: center;
  order: 2;

  @media (min-width: ${breakpoints.lg}) {
    text-align: left;
    order: 1;
  }
`;

const HeroImageContainer = styled.div`
  flex: 1;
  position: relative;
  width: 100%;
  order: 1;
  
  @media (min-width: ${breakpoints.lg}) {
    order: 2;
  }
`;

const HeroImage = styled(motion.img)`
  width: 100%;
  max-width: 43.75rem;
  border-radius: 1rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.01);
  }
  
  @media (max-width: ${breakpoints.md}) {
    max-height: 25rem;
    object-fit: cover;
  }
`;

const Heading = styled.h1`
  font-size: clamp(2rem, 6vw, 3.5rem);
  margin-bottom: 1.2rem;
  color: ${colors.primary};
  font-weight: 700;
  line-height: 1.2;

  span {
    color: ${colors.accent};
  }
  
  @media (max-width: ${breakpoints.sm}) {
    font-size: clamp(1.8rem, 6vw, 2.5rem);
    margin-bottom: 1rem;
  }
`;

const Subheading = styled.p`
  font-size: 1.1rem;
  color: ${colors.textLight};
  margin-bottom: 1.8rem;
  line-height: 1.6;
  font-weight: 400;
  max-width: 42rem;
  margin-left: auto;
  margin-right: auto;

  @media (min-width: ${breakpoints.lg}) {
    margin-left: 0;
    margin-right: 0;
    font-size: 1.25rem;
  }
  
  @media (max-width: ${breakpoints.sm}) {
    font-size: 1rem;
    margin-bottom: 1.5rem;
  }
`;

const AnimatedText = styled(motion.div)`
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 2rem;
  color: ${colors.accent};
  
  @media (max-width: ${breakpoints.sm}) {
    font-size: 1rem;
    margin-bottom: 1.5rem;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  justify-content: center;
  width: 100%;

  @media (min-width: ${breakpoints.sm}) {
    flex-direction: row;
    justify-content: flex-start;
    gap: 1.25rem;
  }
  
  @media (max-width: ${breakpoints.xs}) {
    flex-direction: column;
    align-items: center;
  }
`;

const Button = styled(motion.button)`
  padding: 0.9rem 1.8rem;
  font-size: 1rem;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  max-width: 16rem;
  
  @media (min-width: ${breakpoints.sm}) {
    width: auto;
    padding: 1rem 2.25rem;
    font-size: 1.1rem;
    gap: 0.625rem;
  }
  
  @media (max-width: ${breakpoints.xs}) {
    padding: 0.8rem 1.5rem;
    font-size: 0.95rem;
  }
`;

const PrimaryButton = styled(Button)`
  background-color: ${colors.primary};
  color: ${colors.white};

  &:hover {
    background-color: ${colors.secondary};
  }
`;

const SecondaryButton = styled(Button)`
  background-color: transparent;
  color: ${colors.primary};
  border: 1px solid ${colors.primary};

  &:hover {
    background-color: ${colors.lightGray};
  }
`;

const DownloadButton = styled(Button)`
  background-color: ${colors.accent};
  color: ${colors.white};

  &:hover {
    background-color: #3a8a87;
  }
`;

// Features section components
const FeaturesSection = styled(Section)`
  background: ${colors.lightGray};
`;

const SectionTitle = styled(motion.h2)`
  font-size: clamp(1.8rem, 4vw, 2.8rem);
  color: ${colors.primary};
  margin-bottom: 3rem;
  font-weight: 600;
  text-align: center;
  
  @media (max-width: ${breakpoints.sm}) {
    margin-bottom: 2rem;
  }
`;

const CardsContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  width: 100%;

  @media (min-width: ${breakpoints.sm}) {
    grid-template-columns: repeat(2, 1fr);
    gap: 2rem;
  }

  @media (min-width: ${breakpoints.lg}) {
    grid-template-columns: repeat(4, 1fr);
    gap: 2.5rem;
  }
  
  @media (max-width: ${breakpoints.xs}) {
    gap: 1.2rem;
  }
`;

const Card = styled(motion.div)`
  background: ${colors.white};
  padding: 1.8rem;
  border-radius: 1rem;
  text-align: left;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.03);
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-0.3125rem);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  }
  
  @media (min-width: ${breakpoints.lg}) {
    padding: 2.5rem;
  }
  
  @media (max-width: ${breakpoints.sm}) {
    padding: 1.5rem;
  }
`;

const Icon = styled.div`
  font-size: 2rem;
  margin-bottom: 1.2rem;
  color: ${colors.accent};
  
  @media (min-width: ${breakpoints.lg}) {
    font-size: 2.25rem;
    margin-bottom: 1.5rem;
  }
`;

const CardTitle = styled.h3`
  margin-bottom: 0.8rem;
  color: ${colors.primary};
  font-size: 1.2rem;
  font-weight: 600;
  
  @media (min-width: ${breakpoints.lg}) {
    font-size: 1.3rem;
    margin-bottom: 1rem;
  }
`;

const CardText = styled.p`
  color: ${colors.textLight};
  line-height: 1.6;
  font-size: 0.95rem;
  
  @media (min-width: ${breakpoints.lg}) {
    font-size: 1rem;
  }
`;

// Image grid components
const ImageGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  width: 100%;
  margin: 3rem 0;

  @media (min-width: ${breakpoints.md}) {
    grid-template-columns: repeat(2, 1fr);
    gap: 2.5rem;
    margin: 5rem 0;
  }
  
  @media (max-width: ${breakpoints.sm}) {
    margin: 2.5rem 0;
    gap: 1.2rem;
  }
`;

const ImageCard = styled(motion.div)`
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  height: 100%;
  min-height: 20rem;
  
  @media (max-width: ${breakpoints.md}) {
    order: 1;
    min-height: 15rem;
  }
`;

const TextCard = styled(motion.div)`
  border-radius: 1rem;
  background: linear-gradient(135deg, ${colors.lightGray}, ${colors.white});
  padding: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  
  @media (max-width: ${breakpoints.md}) {
    order: 2;
    padding: 1.5rem;
  }
  
  @media (min-width: ${breakpoints.lg}) {
    padding: 3.75rem;
  }
`;

const TextCardTitle = styled.h3`
  font-size: 1.5rem;
  color: ${colors.primary};
  margin-bottom: 1.2rem;
  font-weight: 600;
  
  @media (min-width: ${breakpoints.lg}) {
    font-size: 1.8rem;
    margin-bottom: 1.5rem;
  }
  
  @media (max-width: ${breakpoints.sm}) {
    font-size: 1.3rem;
  }
`;

const TextCardText = styled.p`
  color: ${colors.textLight};
  line-height: 1.6;
  margin-bottom: 1.5rem;
  font-size: 1rem;
  
  @media (min-width: ${breakpoints.lg}) {
    font-size: 1.1rem;
    margin-bottom: 2rem;
  }
  
  @media (max-width: ${breakpoints.sm}) {
    font-size: 0.95rem;
  }
`;

// CTA section components
const CTASection = styled(Section)`
  background: linear-gradient(135deg, ${colors.primary}, ${colors.accent});
  color: ${colors.white};
  text-align: center;
  padding: 4rem 0;
  
  @media (min-width: ${breakpoints.md}) {
    padding: 5rem 0;
  }
`;

const CTATitle = styled.h2`
  font-size: clamp(1.8rem, 4vw, 2.3rem);
  margin-bottom: 1.2rem;
  font-weight: 600;
  color: ${colors.white};
  
  @media (min-width: ${breakpoints.lg}) {
    font-size: clamp(2rem, 4vw, 2.5rem);
    margin-bottom: 1.5rem;
  }
`;

const CTAText = styled.p`
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 2rem;
  max-width: 43.75rem;
  margin-left: auto;
  margin-right: auto;
  
  @media (max-width: ${breakpoints.sm}) {
    font-size: 1rem;
    margin-bottom: 1.5rem;
  }
`;

// Footer components
const Footer = styled.footer`
  width: 100%;
  padding: 3rem 0 2rem;
  background: ${colors.textDark};
  color: ${colors.white};
  
  @media (min-width: ${breakpoints.lg}) {
    padding: 5rem 0 2.5rem;
  }
`;

const FooterContent = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2.5rem;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1.5rem;

  @media (min-width: ${breakpoints.sm}) {
    grid-template-columns: repeat(2, 1fr);
    gap: 3rem;
  }

  @media (min-width: ${breakpoints.lg}) {
    grid-template-columns: repeat(5, 1fr);
    padding: 0 3.75rem;
    gap: 3.75rem;
  }
  
  @media (max-width: ${breakpoints.sm}) {
    padding: 0 1rem;
    gap: 2rem;
  }
`;

const FooterLogo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.2rem;

  img {
    height: 2.2rem;
    width: auto;
    
    @media (max-width: ${breakpoints.sm}) {
      height: 2rem;
    }
  }

  span {
    font-size: 1.3rem;
    font-weight: 600;
    color: ${colors.white};
    
    @media (max-width: ${breakpoints.sm}) {
      font-size: 1.2rem;
    }
  }
`;

const FooterText = styled.p`
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.95rem;
  line-height: 1.6;
  margin-bottom: 1.5rem;
  
  @media (max-width: ${breakpoints.sm}) {
    font-size: 0.9rem;
  }
`;

const FooterColumn = styled.div`
  display: flex;
  flex-direction: column;
`;

const FooterHeading = styled.h4`
  font-size: 1rem;
  color: ${colors.white};
  margin-bottom: 1.2rem;
  font-weight: 600;
  
  @media (min-width: ${breakpoints.lg}) {
    font-size: 1.1rem;
    margin-bottom: 1.5rem;
  }
`;

const FooterLink = styled(Link)`
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  margin-bottom: 0.8rem;
  display: block;
  transition: color 0.2s ease;

  &:hover {
    color: ${colors.white};
  }
  
  @media (min-width: ${breakpoints.lg}) {
    font-size: 0.95rem;
    margin-bottom: 1rem;
  }
`;

const Copyright = styled.div`
  text-align: center;
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.85rem;
  
  @media (min-width: ${breakpoints.lg}) {
    margin-top: 5rem;
  }
  
  @media (max-width: ${breakpoints.sm}) {
    margin-top: 2rem;
    padding-top: 1.5rem;
  }
`;

function Home() {
  const [text] = useTypewriter({
    words: ["connected", "efficient", "secure", "accessible", "life-changing"],
    loop: 0,
    typeSpeed: 80,
    deleteSpeed: 40,
    delaySpeed: 2000,
  });

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check for mobile viewport
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < parseInt(breakpoints.md));
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);

    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMenuOpen && !event.target.closest('.mobile-menu')) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  // Features data
  const features = [
    {
      title: "Real-time Monitoring",
      icon: <FaHeartbeat />,
      desc: "Track patient vitals and treatment metrics as they happen with our advanced monitoring system.",
    },
    {
      title: "Centralized Records",
      icon: <FaHospital />,
      desc: "All patient data securely organized in one location for comprehensive treatment decisions.",
    },
    {
      title: "IoT Integration",
      icon: <FaCog />,
      desc: "Seamless connection with dialysis machines and medical devices for automated data collection.",
    },
    {
      title: "Patient Portal",
      icon: <FaUsers />,
      desc: "Empower patients with access to their treatment data and educational resources.",
    },
  ];

  return (
    <>
      <GlobalStyles />
      <Container>
        <Header>
          <NavContainer>
            <LogoLink to="/">
              <img src={logoImage} alt="Dialiease Logo" />
              <span>Dialiease</span>
            </LogoLink>
            
            <NavLinks>
              <NavLink to="/about">About</NavLink>
              <NavLink to="/contact">Contact</NavLink>
              <LoginButton to="/login">Login</LoginButton>
            </NavLinks>

            <MobileMenuButton 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMenuOpen ? <FaTimes /> : <FaBars />}
            </MobileMenuButton>
          </NavContainer>

          {isMenuOpen && (
            <MobileNavLinks
              className="mobile-menu"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <NavLink to="/about" onClick={() => setIsMenuOpen(false)}>
                About
              </NavLink>
              <NavLink to="/contact" onClick={() => setIsMenuOpen(false)}>
                Contact
              </NavLink>
              <LoginButton to="/login" onClick={() => setIsMenuOpen(false)}>
                Login
              </LoginButton>
            </MobileNavLinks>
          )}
        </Header>

        <ContentWrapper>
          {/* Hero Section */}
          <Section>
            <ConstrainedWidth>
              <HeroSection
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <HeroText>
                  <Heading>
                    Modern dialysis care <span>simplified</span>
                  </Heading>
                  <Subheading>
                    Dialiease streamlines dialysis management with intuitive technology that enhances patient care and clinical workflows.
                  </Subheading>
                  <AnimatedText
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                  >
                    Making treatment <span>{text}</span>
                    <Cursor cursorStyle="|" cursorColor={colors.accent} />
                  </AnimatedText>
                  <ButtonContainer>
                    <Link to="/login">
                      <PrimaryButton
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Get Started
                      </PrimaryButton>
                    </Link>
                    <DownloadButton
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <FaDownload /> Download App
                    </DownloadButton>
                  </ButtonContainer>
                </HeroText>
                <HeroImageContainer>
                  <HeroImage 
                    src={staffPic} 
                    alt="Medical staff using Dialiease" 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                  />
                </HeroImageContainer>
              </HeroSection>
            </ConstrainedWidth>
          </Section>

          {/* Features Section */}
          <FeaturesSection>
            <ConstrainedWidth>
              <SectionTitle
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                Designed for better outcomes
              </SectionTitle>
              
              <CardsContainer>
                {features.map((item, i) => (
                  <Card
                    key={i}
                    whileHover={{ transform: "translateY(-5px)" }}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Icon>{item.icon}</Icon>
                    <CardTitle>{item.title}</CardTitle>
                    <CardText>{item.desc}</CardText>
                  </Card>
                ))}
              </CardsContainer>
            </ConstrainedWidth>
          </FeaturesSection>

          {/* Image Grid Section */}
          <Section>
            <ConstrainedWidth>
              <ImageGrid>
                <ImageCard
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  viewport={{ once: true }}
                >
                  <img 
                    src={doctorPic} 
                    alt="Medical staff collaborating" 
                    style={{ 
                      width: "100%", 
                      height: "100%", 
                      objectFit: "cover",
                    }} 
                  />
                </ImageCard>
                <TextCard
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  viewport={{ once: true }}
                >
                  <TextCardTitle>Collaborative Care Approach</TextCardTitle>
                  <TextCardText>
                    Our platform enables seamless collaboration between nephrologists, nurses, and technicians for comprehensive patient care and better treatment outcomes.
                  </TextCardText>
                  <ButtonContainer>
                    <Link to="/about">
                      <SecondaryButton
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Learn More
                      </SecondaryButton>
                    </Link>
                    <DownloadButton
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <FaDownload /> Case Studies
                    </DownloadButton>
                  </ButtonContainer>
                </TextCard>
              </ImageGrid>
            </ConstrainedWidth>
          </Section>

          {/* CTA Section */}
          <CTASection>
            <ConstrainedWidth>
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <CTATitle>Ready to transform your dialysis care?</CTATitle>
                <CTAText>
                  Join leading healthcare providers delivering better patient outcomes with Dialiease.
                </CTAText>
                <ButtonContainer>
                  <Link to="/login">
                    <PrimaryButton
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      style={{
                        backgroundColor: colors.white,
                        color: colors.primary,
                        padding: "1rem 2.5rem",
                      }}
                    >
                      Get Started Today
                    </PrimaryButton>
                  </Link>
                </ButtonContainer>
              </motion.div>
            </ConstrainedWidth>
          </CTASection>

          {/* Footer */}
          <Footer>
            <FooterContent>
              <FooterColumn>
                <FooterLogo>
                  <img src={logoImage} alt="Dialiease Logo" />
                  <span>Dialiease</span>
                </FooterLogo>
                <FooterText>
                  Empowering better dialysis care through intuitive technology and innovative solutions.
                </FooterText>
              </FooterColumn>
              <FooterColumn>
                <FooterHeading>Product</FooterHeading>
                <FooterLink to="/features">Features</FooterLink>
                <FooterLink to="/pricing">Pricing</FooterLink>
                <FooterLink to="/integrations">Integrations</FooterLink>
              </FooterColumn>
              <FooterColumn>
                <FooterHeading>Company</FooterHeading>
                <FooterLink to="/about">About Us</FooterLink>
                <FooterLink to="/blog">Blog</FooterLink>
                <FooterLink to="/careers">Careers</FooterLink>
                <FooterLink to="/press">Press</FooterLink>
              </FooterColumn>
              <FooterColumn>
                <FooterHeading>Resources</FooterHeading>
                <FooterLink to="/support">Support</FooterLink>
                <FooterLink to="/docs">Documentation</FooterLink>
                <FooterLink to="/contact">Contact</FooterLink>
                <FooterLink to="/webinars">Webinars</FooterLink>
              </FooterColumn>
              <FooterColumn>
                <FooterHeading>Legal</FooterHeading>
                <FooterLink to="/privacy">Privacy Policy</FooterLink>
                <FooterLink to="/terms">Terms of Service</FooterLink>
                <FooterLink to="/security">Security</FooterLink>
                <FooterLink to="/compliance">Compliance</FooterLink>
              </FooterColumn>
            </FooterContent>
            <Copyright>
              &copy; {new Date().getFullYear()} Dialiease. All rights reserved.
            </Copyright>
          </Footer>
        </ContentWrapper>
      </Container>
    </>
  );
}

export default Home;  