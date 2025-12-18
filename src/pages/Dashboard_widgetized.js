
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ui/ToastContainer';
import Widget from '../components/Widget';
import WidgetsConfigModal from '../components/WidgetsConfigModal';
import {
  FaChartBar, FaShoppingCart,
  FaSlidersH, FaCalendarAlt
} from 'react-icons/fa';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const Dashboard = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [transactions, setTransactions] = useState([]);
  const [fixedExpenses, setFixedExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [summary, setSummary] = useState({ entradas: 0, saidas: 0, saldo: 0, gastosFixos: 0 });
  const [loading, setLoading] = useState(true);
  const [showWidgetsModal, setShowWidgetsModal] = useState(false);

  // Configuração de widgets
  const [widgets, setWidgets] = useState(() => {
    const saved = localStorage.getItem('cashpilot-widgets');
    return saved ? JSON.parse(saved) : [
      { id: 'summary', title: 'Resumo Financeiro', size: 'medium', visible: true },
      { id: 'recent', title: 'Transações Recentes', size: 'medium', visible: true },
      { id: 'chart', title: 'Gráfico de Gastos', size: 'large', visible: true },
      { id: 'shopping', title: 'Listas Ativas', size: 'small', visible: true },
      { id: 'goals', title: 'Metas do Mês', size: 'small', visible: false },
      { id: 'fixed', title: 'Gastos Fixos', size: 'small', visible: true }
    ];
  });

  useEffect(() => {
    localStorage.setItem('cashpilot-widgets', JSON.stringify(widgets));
  }, [widgets]);

  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      try {
        setLoading(true);

        // Carregar transações
        const transSnapshot = await getDocs(collection(db, "users", user.uid, "transactions"));
        const transData = transSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setTransactions(transData);

        // Carregar gastos fixos
        const fixedSnapshot = await getDocs(collection(db, "users", user.uid, "fixed_expenses"));
        const fixedData = fixedSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setFixedExpenses(fixedData);

        // Carregar categorias
        const catSnapshot = await getDocs(collection(db, "users", user.uid, "categories"));
        const catData = catSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setCategories(catData);

        // Calcular totais
        const entradas = transData
          .filter((t) => (t.type?.toLowerCase?.() || t.tipo?.toLowerCase?.()) === "entrada")
          .reduce((acc, t) => acc + parseFloat(t.value || 0), 0);

        const saidas = transData
          .filter((t) => (t.type?.toLowerCase?.() || t.tipo?.toLowerCase?.()) === "saída")
          .reduce((acc, t) => acc + parseFloat(t.value || 0), 0);

        const gastosFixos = fixedData.reduce((acc, f) => acc + parseFloat(f.value || 0), 0);

        setSummary({ entradas, saidas, saldo: entradas - saidas - gastosFixos, gastosFixos });

      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        showError("Erro ao carregar dados do dashboard");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, showError]);

  const toggleWidget = (widgetId) => {
    setWidgets(prev => prev.map(w =>
      w.id === widgetId ? { ...w, visible: !w.visible } : w
    ));
  };

  const removeWidget = (widgetId) => {
    setWidgets(prev => prev.filter(w => w.id !== widgetId));
  };

  const exportToPDF = async () => {
    const dashboard = document.getElementById("dashboard-widgets");
    if (!dashboard) return;

    showSuccess("Gerando relatório PDF...");

    try {
      const canvas = await html2canvas(dashboard, {
        backgroundColor: "#0f172a",
        scale: 3,
        useCORS: true,
        allowTaint: false,
        scrollX: 0,
        scrollY: 0,
        windowWidth: document.body.scrollWidth,
        windowHeight: document.body.scrollHeight,
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Cabeçalho
      pdf.setFillColor("#0f172a");
      pdf.rect(0, 0, pageWidth, 20, "F");
      pdf.setTextColor("#38bdf8");
      pdf.setFontSize(16);
      pdf.text("📊 Relatório Financeiro - CashPilot", 10, 12);

      // Data e hora
      pdf.setFontSize(10);
      pdf.setTextColor("#f8fafc");
      const date = new Date().toLocaleDateString("pt-BR");
      pdf.text(`Gerado em: ${date}`, pageWidth - 60, 12);

      // Imagem do Dashboard
      let yPosition = 25;
      const maxHeight = pageHeight - yPosition - 20;

      if (imgHeight <= maxHeight) {
        pdf.addImage(imgData, "PNG", 10, yPosition, imgWidth, imgHeight);
      } else {
        const scaledHeight = maxHeight;
        const scaledWidth = (imgWidth * scaledHeight) / imgHeight;
        pdf.addImage(imgData, "PNG", (pageWidth - scaledWidth) / 2, yPosition, scaledWidth, scaledHeight);
      }

      // Rodapé
      pdf.setFontSize(9);
      pdf.setTextColor("#94a3b8");
      pdf.text("CashPilot © 2025 — Seu copiloto financeiro 🚀", 10, pageHeight - 10);

      pdf.save(`CashPilot_Relatorio_${date}.pdf`);
      showSuccess("PDF gerado com sucesso!");
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      showError("Erro ao gerar PDF");
    }
  };

  // Componentes de conteúdo para cada widget
  const widgetComponents = {
    summary: <FinancialSummary summary={summary} />,
    recent: <RecentTransactions transactions={transactions.slice(0, 5)} />,
    chart: <SpendingChart transactions={transactions} categories={categories} />,
    shopping: <ActiveShoppingLists />,
    goals: <MonthlyGoals summary={summary} />,
    fixed: <FixedExpensesPreview fixedExpenses={fixedExpenses} />
  };

  if (loading) {
    return (
      <div style={{ padding: "2rem", maxWidth: "1800px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", color: "#f8fafc" }}>
          <h1>Carregando Dashboard...</h1>
        </div>
      </div>
    );
  }

  return (
    <DashboardContainer>
      <DashboardHeader>
        <h1>Dashboard Personalizado</h1>
        <DashboardControls>
          <WidgetsButton onClick={() => setShowWidgetsModal(true)}>
            <FaSlidersH /> Personalizar Widgets
          </WidgetsButton>
          <ExportButton onClick={exportToPDF}>
            📄 Exportar PDF
          </ExportButton>
        </DashboardControls>
      </DashboardHeader>

      <WidgetsGrid id="dashboard-widgets">
        {widgets
          .filter(w => w.visible)
          .map(widget => (
            <Widget
              key={widget.id}
              title={widget.title}
              size={widget.size}
              onRemove={() => removeWidget(widget.id)}
            >
              {widgetComponents[widget.id] || <div>Widget não encontrado</div>}
            </Widget>
          ))
        }
      </WidgetsGrid>

      {/* Modal de configuração de widgets */}
      {showWidgetsModal && (
        <WidgetsConfigModal
          widgets={widgets}
          toggleWidget={toggleWidget}
          onClose={() => setShowWidgetsModal(false)}
        />
      )}
    </DashboardContainer>
  );
};

// Componentes auxiliares para os widgets
const FinancialSummary = ({ summary }) => (
  <SummaryGrid>
    <SummaryCard color="green">
      <SummaryIcon>💰</SummaryIcon>
      <SummaryInfo>
        <SummaryValue>R$ {summary.entradas.toFixed(2)}</SummaryValue>
        <SummaryLabel>Total Entradas</SummaryLabel>
      </SummaryInfo>
    </SummaryCard>

    <SummaryCard color="red">
      <SummaryIcon>💸</SummaryIcon>
      <SummaryInfo>
        <SummaryValue>R$ {summary.saidas.toFixed(2)}</SummaryValue>
        <SummaryLabel>Total Saídas</SummaryLabel>
      </SummaryInfo>
    </SummaryCard>

    <SummaryCard color="blue">
      <SummaryIcon>🏠</SummaryIcon>
      <SummaryInfo>
        <SummaryValue>R$ {summary.gastosFixos.toFixed(2)}</SummaryValue>
        <SummaryLabel>Gastos Fixos</SummaryLabel>
      </SummaryInfo>
    </SummaryCard>

    <SummaryCard color={summary.saldo >= 0 ? "emerald" : "orange"}>
      <SummaryIcon>{summary.saldo >= 0 ? '📈' : '📉'}</SummaryIcon>
      <SummaryInfo>
        <SummaryValue>R$ {summary.saldo.toFixed(2)}</SummaryValue>
        <SummaryLabel>Saldo Atual</SummaryLabel>
      </SummaryInfo>
    </SummaryCard>
  </SummaryGrid>
);

const RecentTransactions = ({ transactions }) => (
  <TransactionsList>
    {transactions.length === 0 ? (
      <EmptyState>Nenhuma transação encontrada</EmptyState>
    ) : (
      transactions.map(transaction => (
        <TransactionItem key={transaction.id}>
          <TransactionIcon>{transaction.type === 'entrada' ? '💰' : '💸'}</TransactionIcon>
          <TransactionInfo>
            <TransactionName>{transaction.description || transaction.category || 'Sem descrição'}</TransactionName>
            <TransactionDate>{new Date(transaction.date?.toDate?.() || transaction.date).toLocaleDateString('pt-BR')}</TransactionDate>
          </TransactionInfo>
          <TransactionAmount type={transaction.type}>
            {transaction.type === 'entrada' ? '+' : '-'}R$ {parseFloat(transaction.value || 0).toFixed(2)}
          </TransactionAmount>
        </TransactionItem>
      ))
    )}
  </TransactionsList>
);

const SpendingChart = ({ transactions, categories }) => {
  const expenseMap = {};
  transactions
    .filter((t) => (t.type?.toLowerCase?.() || t.tipo?.toLowerCase?.()) === "saída")
    .forEach((t) => {
      const cat = t.category || "Sem categoria";
      if (!expenseMap[cat]) expenseMap[cat] = 0;
      expenseMap[cat] += parseFloat(t.value || 0);
    });

  const expenseDetails = Object.entries(expenseMap).map(([name, value]) => ({
    name,
    value,
    color: "#667eea",
  }));

  return (
    <ChartContainer>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={expenseDetails}
            dataKey="value"
            nameKey="name"
            outerRadius={80}
            animationBegin={0}
            animationDuration={800}
          >
            {expenseDetails.map((_, index) => (
              <Cell key={`slice-${index}`} fill={expenseDetails[index].color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: "#1e293b",
              border: "1px solid #667eea",
              borderRadius: "8px",
              color: "#f8fafc"
            }}
          />
          <Legend wrapperStyle={{ color: "#cbd5e1", fontSize: "12px" }} />
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

const ActiveShoppingLists = () => (
  <div style={{ color: "#94a3b8", textAlign: "center", padding: "2rem" }}>
    <FaShoppingCart style={{ fontSize: "2rem", marginBottom: "1rem", opacity: 0.5 }} />
    <p>Nenhuma lista ativa</p>
  </div>
);

const MonthlyGoals = ({ summary }) => (
  <div style={{ color: "#94a3b8", textAlign: "center", padding: "2rem" }}>
    <FaChartBar style={{ fontSize: "2rem", marginBottom: "1rem", opacity: 0.5 }} />
    <p>Metas do mês em desenvolvimento</p>
  </div>
);

const FixedExpensesPreview = ({ fixedExpenses }) => (
  <div style={{ color: "#94a3b8", textAlign: "center", padding: "2rem" }}>
    <FaCalendarAlt style={{ fontSize: "2rem", marginBottom: "1rem", opacity: 0.5 }} />
    <p>{fixedExpenses.length} gastos fixos configurados</p>
  </div>
);

// Estilos
const DashboardContainer = styled.div`
  padding: 2rem;
  max-width: 1800px;
  margin: 0 auto;
`;

const DashboardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  
  h1 {
    color: #f8fafc;
    font-size: 2rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;

const DashboardControls = styled.div`
  display: flex;
  gap: 1rem;
`;

const WidgetsButton = styled.button`
  background: rgba(102, 126, 234, 0.1);
  border: 1px solid #667eea;
  color: #667eea;
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-weight: 500;
  
  &:hover {
    background: rgba(102, 126, 234, 0.2);
  }
`;

const ExportButton = styled.button`
  background: rgba(56, 189, 248, 0.1);
  border: 1px solid #38bdf8;
  color: #38bdf8;
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  
  &:hover {
    background: rgba(56, 189, 248, 0.2);
  }
`;

const WidgetsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  
  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  height: 100%;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const SummaryCard = styled.div`
  background: ${props => {
    switch (props.color) {
      case 'green': return 'linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(34, 197, 94, 0.05))';
      case 'red': return 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.05))';
      case 'blue': return 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.05))';
      case 'emerald': return 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05))';
      case 'orange': return 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(245, 158, 11, 0.05))';
      default: return 'rgba(30, 41, 59, 0.5)';
    }
  }};
  border: 1px solid ${props => {
    switch (props.color) {
      case 'green': return 'rgba(34, 197, 94, 0.3)';
      case 'red': return 'rgba(239, 68, 68, 0.3)';
      case 'blue': return 'rgba(59, 130, 246, 0.3)';
      case 'emerald': return 'rgba(16, 185, 129, 0.3)';
      case 'orange': return 'rgba(245, 158, 11, 0.3)';
      default: return 'rgba(148, 163, 184, 0.1)';
    }
  }};
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  min-height: 80px;
`;

const SummaryIcon = styled.div`
  font-size: 1.5rem;
`;

const SummaryInfo = styled.div`
  flex: 1;
`;

const SummaryValue = styled.div`
  font-size: 1.25rem;
  font-weight: bold;
  color: #f8fafc;
`;

const SummaryLabel = styled.div`
  font-size: 0.875rem;
  color: #94a3b8;
`;

const TransactionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  height: 100%;
`;

const TransactionItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: rgba(30, 41, 59, 0.5);
  border-radius: 6px;
  border: 1px solid rgba(148, 163, 184, 0.1);
`;

const TransactionIcon = styled.div`
  font-size: 1.25rem;
`;

const TransactionInfo = styled.div`
  flex: 1;
`;

const TransactionName = styled.div`
  font-weight: 500;
  color: #f8fafc;
  font-size: 0.875rem;
`;

const TransactionDate = styled.div`
  font-size: 0.75rem;
  color: #94a3b8;
`;

const TransactionAmount = styled.div`
  font-weight: 600;
  color: ${props =>
    props.type === 'entrada' ? '#10b981' : '#ef4444'
  };
  font-size: 0.875rem;
`;

const ChartContainer = styled.div`
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const EmptyState = styled.div`
  color: #94a3b8;
  text-align: center;
  padding: 2rem;
  font-style: italic;
`;

export default Dashboard;
