import React, { useState } from 'react';
import styled from 'styled-components';
import ResponsiveSidebar from './components/ResponsiveSidebar';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Categories from './pages/Categories';
import { useAuth } from './contexts/AuthContext';

const AppContent = () => {
  const [activePage, setActivePage] = useState('dashboard');
  const { logout } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'transactions', label: 'Transações', icon: '💰' },
    { id: 'categories', label: 'Categorias', icon: '🏷️' }
  ];

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <Dashboard />;
      case 'transactions': return <Transactions />;
      case 'categories': return <Categories />;
      default: return <Dashboard />;
    }
  };

  return (
    <Container>
      <ResponsiveSidebar
        navItems={navItems}
        activePage={activePage}
        setActivePage={setActivePage}
        onLogout={logout}
      />
      <MainContent>
        {renderPage()}
      </MainContent>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  min-height: 100vh;
`;

const MainContent = styled.main`
  flex: 1;
  padding: 1.5rem;
  
  @media (max-width: 768px) {
    padding: 1rem;
    padding-top: 5rem;
    width: 100%;
  }
  
  @media (max-width: 480px) {
    padding: 0.75rem;
    padding-top: 5rem;
  }
`;

export default AppContent;

