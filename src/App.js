import React, { useState } from "react";
import { motion } from "framer-motion";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import GlobalStyle from "./styles/globalStyles";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ToastProvider } from "./components/ui/ToastContainer";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import PasswordReset from "./pages/PasswordReset";
import Profile from "./pages/Profile";
import Dashboard from "./pages/Dashboard";


import Transactions from "./pages/Transactions";
import FixedExpenses from "./pages/FixedExpenses";
import Categories from "./pages/Categories";
import Reports from "./pages/Reports";
import ShoppingList from "./pages/ShoppingList";
import HomePage from "./pages/HomePage";

// Import React Icons
import {
  FaMoneyBillWave, FaChartBar, FaExchangeAlt, FaTags, FaFilePdf,
  FaCalendarAlt, FaShoppingCart, FaUserCog, FaUser, FaChevronDown, FaHome
} from "react-icons/fa";


function AppContent() {
  const { loading, logout } = useAuth();
  const [activePage, setActivePage] = useState("home");


  // NOVA ESTRUTURA DE MENU
  const menuSections = [
    {
      id: "finance",
      title: "💰 Finanças",
      icon: <FaMoneyBillWave />,
      items: [
        { id: "home", label: "Início", icon: <FaHome /> },
        { id: "dashboard", label: "Dashboard", icon: <FaChartBar /> },
        { id: "transactions", label: "Transações", icon: <FaExchangeAlt /> },
        { id: "categories", label: "Categorias", icon: <FaTags /> },
        { id: "reports", label: "Relatórios", icon: <FaFilePdf /> }
      ]
    },
    {
      id: "planning",
      title: "📅 Planejamento",
      icon: <FaCalendarAlt />,
      items: [
        { id: "fixed", label: "Gastos Fixos", icon: <FaCalendarAlt /> },
        { id: "shopping", label: "Lista de Compras", icon: <FaShoppingCart /> }
      ]
    },
    {
      id: "account",
      title: "👤 Conta",
      icon: <FaUserCog />,
      items: [
        { id: "profile", label: "Perfil", icon: <FaUser /> }
      ]
    }
  ];

  // Estado para controlar seções expandidas
  const [expandedSections, setExpandedSections] = useState(['finance', 'planning', 'account']);

  // Função para alternar seção
  const toggleSection = (sectionId) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    );
  }


  const renderPage = () => {
    if (activePage === "home") return <HomePage onNavigate={setActivePage} />;
    if (activePage === "dashboard") return <Dashboard />;
    if (activePage === "transactions") return <Transactions />;
    if (activePage === "categories") return <Categories />;
    if (activePage === "fixed") return <FixedExpenses />;
    if (activePage === "shopping") return <ShoppingList />;
    if (activePage === "reports") return <Reports />;
    if (activePage === "profile") return <Profile />;
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: "#0f172a", color: "#f8fafc" }}>
      <GlobalStyle />
      {/* Sidebar */}
      <motion.nav
        initial={{ x: -250 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          width: "250px",
          background: "#1e293b",
          padding: "1.5rem",
          boxShadow: "2px 0 10px rgba(0,0,0,0.3)",
          borderRight: "1px solid #334155"
        }}
      >
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{
            fontSize: "1.5rem",
            marginBottom: "2rem",
            color: "#38bdf8",
            fontWeight: "bold"
          }}
        >
          🚀 CashPilot
        </motion.h2>

        {/* NOVA ESTRUTURA DE MENU CATEGORIZADO */}
        {menuSections.map((section, sectionIndex) => (
          <div key={section.id} style={{ marginBottom: "1rem" }}>
            {/* Cabeçalho da Seção */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * sectionIndex }}
              onClick={() => toggleSection(section.id)}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "0.75rem 1rem",
                cursor: "pointer",
                color: expandedSections.includes(section.id) ? "#667eea" : "#94a3b8",
                transition: "all 0.3s",
                borderRadius: "8px",
                marginBottom: "0.5rem",
                background: expandedSections.includes(section.id) ? "rgba(102, 126, 234, 0.1)" : "transparent"
              }}
              whileHover={{ background: "rgba(102, 126, 234, 0.1)" }}
            >
              <div style={{ marginRight: "0.75rem", fontSize: "1rem" }}>
                {section.icon}
              </div>
              <span style={{ fontWeight: "600", fontSize: "0.9rem", flex: 1 }}>
                {section.title}
              </span>
              <motion.div
                animate={{ rotate: expandedSections.includes(section.id) ? 0 : -90 }}
                transition={{ duration: 0.3 }}
                style={{ fontSize: "0.8rem" }}
              >
                <FaChevronDown />
              </motion.div>
            </motion.div>

            {/* Items da Seção */}
            <motion.div
              initial={false}
              animate={{
                maxHeight: expandedSections.includes(section.id) ? "500px" : "0",
                opacity: expandedSections.includes(section.id) ? 1 : 0
              }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              style={{
                overflow: "hidden",
                marginLeft: "1.5rem"
              }}
            >
              {section.items.map((item, itemIndex) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * itemIndex }}
                  onClick={() => setActivePage(item.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "0.5rem 1rem",
                    margin: "0.25rem 0",
                    cursor: "pointer",
                    borderRadius: "6px",
                    background: activePage === item.id ? "rgba(102, 126, 234, 0.2)" : "transparent",
                    color: activePage === item.id ? "#667eea" : "#cbd5e1",
                    borderLeft: activePage === item.id ? "3px solid #667eea" : "3px solid transparent",
                    transition: "all 0.3s"
                  }}
                  whileHover={{
                    background: activePage === item.id
                      ? "rgba(102, 126, 234, 0.3)"
                      : "rgba(148, 163, 184, 0.1)"
                  }}
                >
                  <div style={{ marginRight: "0.75rem", fontSize: "0.9rem" }}>
                    {item.icon}
                  </div>
                  <span style={{ fontSize: "0.875rem" }}>
                    {item.label}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        ))}

        {/* Botão de Sair */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 * menuSections.length }}
          onClick={logout}
          style={{
            marginTop: "2rem",
            cursor: "pointer",
            padding: "0.75rem 1rem",
            borderRadius: "8px",
            transition: "all 0.3s ease",
            background: "transparent",
            border: "none",
            display: "flex",
            alignItems: "center",
            color: "#94a3b8"
          }}
          whileHover={{ scale: 1.05, backgroundColor: "#334155" }}
          whileTap={{ scale: 0.95 }}
        >
          <span style={{ marginRight: "0.5rem" }}>🚪</span>
          Sair
        </motion.div>
      </motion.nav>

      {/* Main Content */}
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "1.5rem",
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)"
        }}
      >
        {renderPage()}
      </motion.main>
    </div>
  );
}

function AuthenticatedApp() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <AppContent />;
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/reset" element={<PasswordReset />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/*" element={<AuthenticatedApp />} />
          </Routes>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}
