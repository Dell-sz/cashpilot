import { useState } from "react";
import GlobalStyle from "./styles/globalStyles";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import FixedExpenses from "./pages/FixedExpenses";
import Categories from "./pages/Categories";

export default function App() {
  const [activePage, setActivePage] = useState("dashboard");

  const renderPage = () => {
    if (activePage === "dashboard") return <Dashboard />;
    if (activePage === "transactions") return <Transactions />;
    if (activePage === "categories") return <Categories />;
    if (activePage === "fixed") return <FixedExpenses />;
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: "#0f1626", color: "#fff" }}>
      <GlobalStyle />
      <nav style={{ width: "220px", background: "#151c2e", padding: "1rem" }}>
        <h2>CashPilot ✈️</h2>
        <ul style={{ listStyle: "none", padding: 0 }}>
          <li style={{ margin: "1rem 0", cursor: "pointer" }} onClick={() => setActivePage("dashboard")}>Dashboard</li>
          <li style={{ margin: "1rem 0", cursor: "pointer" }} onClick={() => setActivePage("transactions")}>Transações</li>
          <li style={{ margin: "1rem 0", cursor: "pointer" }} onClick={() => setActivePage("categories")}>Categorias</li>
          <li style={{ margin: "1rem 0", cursor: "pointer" }} onClick={() => setActivePage("fixed")}>Gastos Fixos</li>
        </ul>
      </nav>
      <main style={{ flex: 1, overflowY: "auto" }}>{renderPage()}</main>
    </div>
  );
}

