import React, { useState, useEffect, useCallback } from 'react';
import styled, { css } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBars, FaTimes, FaChevronDown, FaSignOutAlt } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * CashPilot Mobile-First Responsive Menu (MVP Simplified)
 */

// ============= STYLES =============

const MobileMenuContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: var(--z-mobile-menu);
`;

const MobileHeader = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: calc(var(--z-mobile-menu) + 100);
  
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-sm) var(--space-md);
  padding-top: calc(var(--space-sm) + env(safe-area-inset-top, 0));
  
  background: rgba(15, 23, 42, 0.95);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  
  border-bottom: 1px solid rgba(56, 189, 248, 0.1);
  height: 60px;
  min-height: 60px;
  
  @media (min-width: 1024px) {
    display: none;
  }
`;

const MobileLogo = styled.h1`
  font-size: var(--fs-lg);
  font-weight: var(--fw-bold);
  color: #38bdf8;
  margin: 0;
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  
  @media (min-width: 1024px) {
    display: none;
  }
`;

const MenuToggle = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  
  background: rgba(56, 189, 248, 0.1);
  border: 1px solid rgba(56, 189, 248, 0.2);
  border-radius: var(--radius-md);
  
  color: #38bdf8;
  font-size: var(--fs-lg);
  cursor: pointer;
  
  transition: all var(--transition-fast);
  -webkit-tap-highlight-color: transparent;
  
  &:hover {
    background: rgba(56, 189, 248, 0.2);
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

const LogoutButtonHeader = styled.button`
  background: transparent;
  border: 1px solid #ef4444;
  color: #ef4444;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: var(--fs-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
  
  &:hover {
    background: rgba(239, 68, 68, 0.2);
  }
`;

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  z-index: calc(var(--z-mobile-menu) + 50);
  
  @supports (padding: env(safe-area-inset-top)) {
    padding-top: env(safe-area-inset-top);
  }
`;

const MenuPanel = styled(motion.div)`
  position: fixed;
  top: 0;
  right: 0;
  width: 280px;
  max-width: 85vw;
  height: 100%;
  
  background: #1e293b;
  z-index: calc(var(--z-mobile-menu) + 100);
  box-shadow: -10px 0 40px rgba(0, 0, 0, 0.5);
  
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  
  @supports (padding: env(safe-area-inset-top)) {
    padding-top: calc(env(safe-area-inset-top) + 60px);
  }
`;

const MenuHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-md);
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
`;

const MenuLogo = styled.div`
  font-size: var(--fs-xl);
  font-weight: var(--fw-bold);
  color: #38bdf8;
  display: flex;
  align-items: center;
  gap: var(--space-sm);
`;

const CloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  
  background: transparent;
  border: none;
  border-radius: var(--radius-md);
  
  color: #94a3b8;
  font-size: var(--fs-xl);
  cursor: pointer;
  
  transition: all var(--transition-fast);
  
  &:hover {
    background: rgba(148, 163, 184, 0.1);
    color: #f8fafc;
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

const MenuContent = styled.div`
  padding: var(--space-md);
  padding-bottom: calc(var(--space-md) + env(safe-area-inset-bottom, 0));
`;

const Section = styled.div`
  margin-bottom: var(--space-lg);
  
  @media (min-width: 1024px) {
    margin-bottom: var(--space-md);
  }
`;

const SectionTitle = styled.span`
  font-weight: var(--fw-semibold);
  font-size: var(--fs-sm);
  color: #94a3b8;
  padding: var(--space-sm) var(--space-md);
  display: block;
  margin-bottom: var(--space-xs);
`;

const MenuItem = styled.button`
  display: flex;
  align-items: center;
  width: 100%;
  padding: var(--space-sm) var(--space-md);
  
  background: ${props => props.$active
    ? 'rgba(102, 126, 234, 0.2)'
    : 'transparent'};
  border: none;
  border-left: ${props => props.$active
    ? '3px solid #667eea'
    : '3px solid transparent'};
  border-radius: 0 var(--radius-md) var(--radius-md) 0;
  
  color: ${props => props.$active ? '#667eea' : '#cbd5e1'};
  font-size: var(--fs-base);
  font-weight: var(--fw-medium);
  
  cursor: pointer;
  transition: all var(--transition-fast);
  -webkit-tap-highlight-color: transparent;
  min-height: 48px;
  
  &:hover {
    background: ${props => props.$active
    ? 'rgba(102, 126, 234, 0.3)'
    : 'rgba(148, 163, 184, 0.05)'};
  }
  
  &:active {
    transform: scale(0.98);
  }
`;

const ItemIcon = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  margin-right: var(--space-sm);
  font-size: var(--fs-base);
`;

const ItemLabel = styled.span`
  flex: 1;
  text-align: left;
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  gap: var(--space-sm);
  padding: var(--space-md);
  margin-top: var(--space-lg);
  
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: var(--radius-lg);
  
  color: #ef4444;
  font-size: var(--fs-base);
  font-weight: var(--fw-semibold);
  
  cursor: pointer;
  transition: all var(--transition-fast);
  -webkit-tap-highlight-color: transparent;
  min-height: 48px;
  
  &:hover {
    background: rgba(239, 68, 68, 0.2);
  }
  
  &:active {
    transform: scale(0.98);
  }
  
  @media (min-width: 1024px) {
    margin-top: var(--space-md);
  }
`;

// Desktop Sidebar
const DesktopNav = styled.nav`
  width: 260px;
  background: #1e293b;
  padding: var(--space-lg);
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.3);
  border-right: 1px solid #334155;
  height: 100vh;
  position: sticky;
  top: 0;
  display: none;
  
  @media (min-width: 1024px) {
    display: flex;
    flex-direction: column;
  }
`;

const DesktopLogo = styled.div`
  font-size: var(--fs-2xl);
  font-weight: var(--fw-bold);
  color: #38bdf8;
  margin-bottom: var(--space-xl);
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) 0;
`;

const DesktopSection = styled.div`
  margin-bottom: var(--space-md);
`;

const DesktopSectionHeader = styled.div`
  font-size: var(--fs-sm);
  color: #94a3b8;
  padding: var(--space-sm) var(--space-md);
  margin-bottom: var(--space-xs);
`;

const DesktopMenuItem = styled.div`
  display: flex;
  align-items: center;
  padding: var(--space-sm) var(--space-md);
  margin: 2px 0;
  cursor: pointer;
  border-radius: var(--radius-md);
  
  background: ${props => props.$active
    ? 'rgba(102, 126, 234, 0.2)'
    : 'transparent'};
  color: ${props => props.$active ? '#667eea' : '#cbd5e1'};
  border-left: ${props => props.$active
    ? '3px solid #667eea'
    : '3px solid transparent'};
  
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.$active
    ? 'rgba(102, 126, 234, 0.3)'
    : 'rgba(148, 163, 184, 0.05)'};
  }
`;

const DesktopItemIcon = styled.span`
  margin-right: var(--space-sm);
  font-size: var(--fs-sm);
`;

const DesktopItemLabel = styled.span`
  font-size: var(--fs-sm);
`;

const DesktopLogout = styled.div`
  margin-top: auto;
  padding-top: var(--space-md);
  border-top: 1px solid rgba(148, 163, 184, 0.1);
`;

const DesktopLogoutButton = styled.div`
  display: flex;
  align-items: center;
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-md);
  cursor: pointer;
  color: #94a3b8;
  background: transparent;
  border: none;
  min-height: 44px;
  
  transition: all 0.3s ease;
  
  &:hover {
    background: #334155;
    color: #f8fafc;
  }
  
  span {
    margin-right: var(--space-xs);
  }
`;

// Layout responsivo
const ResponsiveLayoutWrapper = styled.div`
  display: flex;
  min-height: 100vh;
  background: #0f172a;
`;

const MainContent = styled.main`
  flex: 1;
  overflow-y: auto;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  min-height: 100vh;
  
  @media (min-width: 1024px) {
    margin-left: 0;
  }
`;

// ============= NAV ITEMS (MVP SIMPLIFIED) =============

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: "📊" },
  { id: "transactions", label: "Transações", icon: "💰" },
  { id: "categories", label: "Categorias", icon: "🏷️" }
];

// ============= DESKTOP SIDEBAR COMPONENT =============

export function DesktopSidebar({ onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const getActivePage = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'dashboard';
    if (path === '/transactions') return 'transactions';
    if (path === '/categories') return 'categories';
    return 'dashboard';
  };

  return (
    <DesktopNav>
      <DesktopLogo>🚀 CashPilot</DesktopLogo>

      <DesktopSection>
        <DesktopSectionHeader>📋 MENU</DesktopSectionHeader>
        {navItems.map((item) => (
          <DesktopMenuItem
            key={item.id}
            $active={getActivePage() === item.id}
            onClick={() => navigate(`/${item.id === 'dashboard' ? '' : item.id}`)}
          >
            <DesktopItemIcon>{item.icon}</DesktopItemIcon>
            <DesktopItemLabel>{item.label}</DesktopItemLabel>
          </DesktopMenuItem>
        ))}
      </DesktopSection>

      <DesktopLogout>
        <DesktopLogoutButton onClick={onLogout}>
          <span>🚪</span>
          <span>Sair</span>
        </DesktopLogoutButton>
      </DesktopLogout>
    </DesktopNav>
  );
}

// ============= MOBILE MENU COMPONENT =============

export default function MobileMenu({ onLogout }) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const getActivePage = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'dashboard';
    if (path === '/transactions') return 'transactions';
    if (path === '/categories') return 'categories';
    return 'dashboard';
  };

  // Close menu when navigating
  const handleNavigate = useCallback((pageId) => {
    navigate(`/${pageId === 'dashboard' ? '' : pageId}`);
    setIsOpen(false);
  }, [navigate]);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <MobileMenuContainer>
      {/* Mobile Header */}
      <MobileHeader>
        <MobileLogo>🚀 CashPilot</MobileLogo>
        <LogoutButtonHeader onClick={onLogout}>
          🚪 Sair
        </LogoutButtonHeader>
        <MenuToggle onClick={() => setIsOpen(true)} aria-label="Abrir menu">
          <FaBars />
        </MenuToggle>
      </MobileHeader>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <Overlay
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />
            <MenuPanel
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              <MenuHeader>
                <MenuLogo>🚀 CashPilot</MenuLogo>
                <CloseButton onClick={() => setIsOpen(false)} aria-label="Fechar menu">
                  <FaTimes />
                </CloseButton>
              </MenuHeader>

              <MenuContent>
                <Section>
                  <SectionTitle>📋 MENU</SectionTitle>
                  {navItems.map((item) => (
                    <MenuItem
                      key={item.id}
                      $active={getActivePage() === item.id}
                      onClick={() => handleNavigate(item.id)}
                    >
                      <ItemIcon>{item.icon}</ItemIcon>
                      <ItemLabel>{item.label}</ItemLabel>
                    </MenuItem>
                  ))}
                </Section>

                <LogoutButton onClick={onLogout}>
                  <FaSignOutAlt />
                  <span>Sair</span>
                </LogoutButton>
              </MenuContent>
            </MenuPanel>
          </>
        )}
      </AnimatePresence>
    </MobileMenuContainer>
  );
}

// ============= RESPONSIVE LAYOUT COMPONENT =============

export function ResponsiveLayout({ children, onLogout }) {
  return (
    <ResponsiveLayoutWrapper>
      <DesktopSidebar onLogout={onLogout} />
      <MobileMenu onLogout={onLogout} />
      <MainContent>
        {children}
      </MainContent>
    </ResponsiveLayoutWrapper>
  );
}

