import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { devices } from '../styles/breakpoints';
import { FaBars, FaTimes } from 'react-icons/fa';

const ResponsiveSidebar = ({ children, navItems, activePage, setActivePage, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleNavClick = (id) => {
    setActivePage(id);
    if (isMobile) setIsOpen(false);
  };

  return (
    <>
      {isMobile && (
        <MenuButton onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </MenuButton>
      )}

      {isMobile && isOpen && (
        <Overlay onClick={() => setIsOpen(false)} />
      )}

      <SidebarContainer $isOpen={isOpen} $isMobile={isMobile}>
        <Logo>💸 CashPilot</Logo>

        <NavItems>
          {navItems.map(item => (
            <NavItem
              key={item.id}
              $active={activePage === item.id}
              onClick={() => handleNavClick(item.id)}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavItem>
          ))}
        </NavItems>

        <LogoutButton onClick={onLogout}>
          🚪 Sair
        </LogoutButton>
      </SidebarContainer>
    </>
  );
};

// ESTILOS COMPLETOS COM RESPONSIVIDADE
const SidebarContainer = styled.div`
  position: ${props => props.$isMobile ? 'fixed' : 'relative'};
  top: 0;
  left: 0;
  width: 250px;
  height: 100vh;
  background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);
  padding: 2rem 1rem;
  display: flex;
  flex-direction: column;
  transition: transform 0.3s ease;
  z-index: 1000;
  
  ${devices.tablet} {
    transform: ${props => props.$isOpen ? 'translateX(0)' : 'translateX(-100%)'};
    position: fixed;
    box-shadow: 2px 0 10px rgba(0,0,0,0.3);
  }
`;

const MenuButton = styled.button`
  position: fixed;
  top: 1rem;
  left: 1rem;
  z-index: 1100;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  backdrop-filter: blur(4px);
  z-index: 999;
`;

const Logo = styled.h1`
  font-size: 1.5rem;
  color: white;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255,255,255,0.1);
`;

const NavItems = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const NavItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  color: ${props => props.$active ? '#667eea' : '#cbd5e1'};
  background: ${props => props.$active ? 'rgba(102,126,234,0.1)' : 'transparent'};
  font-weight: ${props => props.$active ? '600' : '400'};
  
  &:hover {
    background: rgba(102,126,234,0.2);
    color: white;
  }
`;

const LogoutButton = styled.button`
  background: transparent;
  border: 1px solid #ef4444;
  color: #ef4444;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  margin-top: 2rem;
  
  &:hover {
    background: rgba(239,68,68,0.1);
  }
`;

export default ResponsiveSidebar;

