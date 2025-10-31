import { useState } from "react";
import { motion } from "framer-motion";
import GlobalStyle from "./styles/globalStyles";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Login from "./components/Login";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import FixedExpenses from "./pages/FixedExpenses";
import Categories from "./pages/Categories";
import Reports from "./pages/Reports";

function AppContent() {
  const { user, loading, logout } = useAuth();
  const [activePage, setActivePage] = useState("dashboard");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const renderPage = () => {
    if (activePage === "dashboard") return <Dashboard />;
    if (activePage === "transactions") return <Transactions />;
    if (activePage === "categories") return <Categories />;
    if (activePage === "fixed") return <FixedExpenses />;
    if (activePage === "reports") return <Reports />;
  };

  const navItems = [
    { key: "dashboard", label: "Dashboard", icon: "📊" },
    { key: "transactions", label: "Transações", icon: "💳" },
    { key: "categories", label: "Categorias", icon: "🏷️" },
    { key: "fixed", label: "Gastos Fixos", icon: "💼" },
    { key: "reports", label: "Relatórios", icon: "📅" },
  ];

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
        <ul style={{ listStyle: "none", padding: 0 }}>
          {navItems.map((item, index) => (
            <motion.li
              key={item.key}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
              style={{
                margin: "0.75rem 0",
                cursor: "pointer",
                padding: "0.75rem 1rem",
                borderRadius: "8px",
                transition: "all 0.3s ease",
                background: activePage === item.key ? "#334155" : "transparent",
                border: activePage === item.key ? "1px solid #38bdf8" : "none"
              }}
              onClick={() => setActivePage(item.key)}
              whileHover={{ scale: 1.05, backgroundColor: "#334155" }}
              whileTap={{ scale: 0.95 }}
            >
              <span style={{ marginRight: "0.5rem" }}>{item.icon}</span>
              {item.label}
            </motion.li>
          ))}
          <motion.li
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * navItems.length }}
            style={{
              margin: "0.75rem 0",
              cursor: "pointer",
              padding: "0.75rem 1rem",
              borderRadius: "8px",
              transition: "all 0.3s ease",
              background: "transparent",
              border: "none"
            }}
            onClick={logout}
            whileHover={{ scale: 1.05, backgroundColor: "#334155" }}
            whileTap={{ scale: 0.95 }}
          >
            <span style={{ marginRight: "0.5rem" }}>🚪</span>
            Sair
          </motion.li>
        </ul>
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

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

