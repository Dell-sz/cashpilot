import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../services/firebaseConfig";
import { useAuth } from "../contexts/AuthContext";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  XAxis,
  ResponsiveContainer,
} from "recharts";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function Dashboard() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [fixedExpenses, setFixedExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [summary, setSummary] = useState({ entradas: 0, saidas: 0, saldo: 0, gastosFixos: 0 });

  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      try {
        // Carregar transações
        const transSnapshot = await getDocs(collection(db, "users", user.uid, "transactions"));
        const transData = transSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        console.log("🔥 Dados do Firestore (Transações):", transData);

        setTransactions(transData);

        // Carregar gastos fixos
        const fixedSnapshot = await getDocs(collection(db, "users", user.uid, "fixed_expenses"));
        const fixedData = fixedSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        console.log("🔥 Dados do Firestore (Gastos Fixos):", fixedData);

        setFixedExpenses(fixedData);

        // Carregar categorias
        const catSnapshot = await getDocs(collection(db, "users", user.uid, "categories"));
        const catData = catSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        console.log("🔥 Dados do Firestore (Categorias):", catData);

        setCategories(catData);

        // Calcular totais
        const entradas = transData
          .filter(
            (t) =>
              (t.type?.toLowerCase?.() || t.tipo?.toLowerCase?.()) === "entrada"
          )
          .reduce((acc, t) => acc + parseFloat(t.value || 0), 0);

        const saidas = transData
          .filter(
            (t) =>
              (t.type?.toLowerCase?.() || t.tipo?.toLowerCase?.()) === "saída"
          )
          .reduce((acc, t) => acc + parseFloat(t.value || 0), 0);

        const gastosFixos = fixedData.reduce((acc, f) => acc + parseFloat(f.value || 0), 0);

        console.log("✅ Entradas:", entradas, "Saídas:", saidas, "Gastos Fixos:", gastosFixos);

        setSummary({ entradas, saidas, saldo: entradas - saidas - gastosFixos, gastosFixos });
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    };

    loadData();
  }, [user]);

  const getColorForCategory = (categoryName) => {
    const category = categories.find(cat => cat.name === categoryName);
    return category ? category.color : "#8884d8"; // Cor padrão se não encontrar
  };

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
    color: getColorForCategory(name, "expense"),
  }));

  const incomeMap = {};
  transactions
    .filter((t) => (t.type?.toLowerCase?.() || t.tipo?.toLowerCase?.()) === "entrada")
    .forEach((t) => {
      const cat = t.category || "Sem categoria";
      if (!incomeMap[cat]) incomeMap[cat] = 0;
      incomeMap[cat] += parseFloat(t.value || 0);
    });
  const incomeDetails = Object.entries(incomeMap).map(([name, value]) => ({
    name,
    value,
    color: getColorForCategory(name, "income"),
  }));

  const fixedColors = ["#3b82f6", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6"];

  const barData = [
    { name: "Entradas", valor: summary.entradas },
    { name: "Saídas", valor: summary.saidas },
    { name: "Gastos Fixos", valor: summary.gastosFixos },
  ];

  const exportToPDF = async () => {
    const dashboard = document.getElementById("dashboard-content");
    if (!dashboard) {
      alert("Erro: não foi possível capturar o dashboard.");
      return;
    }

    // Mostra carregamento
    const loadingMsg = document.createElement("div");
    loadingMsg.innerText = "Gerando relatório...";
    loadingMsg.style.position = "fixed";
    loadingMsg.style.top = "50%";
    loadingMsg.style.left = "50%";
    loadingMsg.style.transform = "translate(-50%, -50%)";
    loadingMsg.style.background = "#0f172a";
    loadingMsg.style.color = "#38bdf8";
    loadingMsg.style.padding = "12px 20px";
    loadingMsg.style.borderRadius = "8px";
    loadingMsg.style.zIndex = "9999";
    document.body.appendChild(loadingMsg);

    try {
      const canvas = await html2canvas(dashboard, {
        backgroundColor: "#0f172a",
        scale: 3, // Aumentado para melhor qualidade
        useCORS: true,
        allowTaint: false,
        scrollX: 0,
        scrollY: 0,
        windowWidth: document.body.scrollWidth,
        windowHeight: document.body.scrollHeight,
        logging: false, // Desabilitar logs para performance
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // 🔹 Cabeçalho
      pdf.setFillColor("#0f172a");
      pdf.rect(0, 0, pageWidth, 20, "F");
      pdf.setTextColor("#38bdf8");
      pdf.setFontSize(16);
      pdf.text("📊 Relatório Financeiro - CashPilot", 10, 12);

      // 🔹 Data e hora
      pdf.setFontSize(10);
      pdf.setTextColor("#f8fafc");
      const date = new Date().toLocaleDateString("pt-BR");
      pdf.text(`Gerado em: ${date}`, pageWidth - 60, 12);

      // 🔹 Imagem do Dashboard - ajustar para caber na página
      let yPosition = 25;
      const maxHeight = pageHeight - yPosition - 20; // Espaço para rodapé

      if (imgHeight <= maxHeight) {
        // Cabe na página
        pdf.addImage(imgData, "PNG", 10, yPosition, imgWidth, imgHeight);
      } else {
        // Se não couber, redimensionar proporcionalmente
        const scaledHeight = maxHeight;
        const scaledWidth = (imgWidth * scaledHeight) / imgHeight;
        pdf.addImage(imgData, "PNG", (pageWidth - scaledWidth) / 2, yPosition, scaledWidth, scaledHeight);
      }

      // 🔹 Rodapé
      pdf.setFontSize(9);
      pdf.setTextColor("#94a3b8");
      pdf.text("CashPilot © 2025 — Seu copiloto financeiro 🚀", 10, pageHeight - 10);

      pdf.save(`CashPilot_Relatorio_${date}.pdf`);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      alert("Ocorreu um erro ao gerar o PDF 😕");
    } finally {
      document.body.removeChild(loadingMsg);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="p-6 text-white max-w-3xl mx-auto"
    >
      <div id="dashboard-content">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            📊 Dashboard Financeiro
          </h1>
          <p className="text-gray-300 mb-6 text-lg">
            Visão geral dos seus gastos e receitas
          </p>
          <button
            onClick={exportToPDF}
            className="mb-6 bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 hover:scale-105"
          >
            📄 Exportar PDF
          </button>
        </motion.div>

        {/* Cards de Resumo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-br from-green-900/50 to-green-800/50 p-6 rounded-xl shadow-lg border border-green-500/30"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-200 text-sm font-medium">Total Entradas</p>
                <p className="text-2xl font-bold text-green-400">R$ {summary.entradas.toFixed(2)}</p>
              </div>
              <div className="text-3xl text-green-400">💰</div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-br from-red-900/50 to-red-800/50 p-6 rounded-xl shadow-lg border border-red-500/30"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-200 text-sm font-medium">Total Saídas</p>
                <p className="text-2xl font-bold text-red-400">R$ {summary.saidas.toFixed(2)}</p>
              </div>
              <div className="text-3xl text-red-400">💸</div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-br from-blue-900/50 to-blue-800/50 p-6 rounded-xl shadow-lg border border-blue-500/30"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-sm font-medium">Gastos Fixos</p>
                <p className="text-2xl font-bold text-blue-400">R$ {summary.gastosFixos.toFixed(2)}</p>
              </div>
              <div className="text-3xl text-blue-400">🏠</div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className={`p-6 rounded-xl shadow-lg border ${summary.saldo >= 0
              ? 'bg-gradient-to-br from-emerald-900/50 to-emerald-800/50 border-emerald-500/30'
              : 'bg-gradient-to-br from-orange-900/50 to-orange-800/50 border-orange-500/30'
              }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${summary.saldo >= 0 ? 'text-emerald-200' : 'text-orange-200'}`}>
                  Saldo Atual
                </p>
                <p className={`text-2xl font-bold ${summary.saldo >= 0 ? 'text-emerald-400' : 'text-orange-400'}`}>
                  R$ {summary.saldo.toFixed(2)}
                </p>
              </div>
              <div className={`text-3xl ${summary.saldo >= 0 ? 'text-emerald-400' : 'text-orange-400'}`}>
                {summary.saldo >= 0 ? '📈' : '📉'}
              </div>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Gráfico de Barras */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl shadow-xl border border-gray-700/50"
          >
            <h3 className="text-xl font-semibold mb-4 text-center text-gray-200">
              📈 Resumo Geral
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <XAxis dataKey="name" tick={{ fill: "#cbd5e1", fontSize: 12 }} />
                <Tooltip
                  cursor={{ fill: "rgba(56, 189, 248, 0.1)" }}
                  contentStyle={{
                    background: "#1e293b",
                    border: "1px solid #38bdf8",
                    borderRadius: "8px",
                    color: "#f8fafc"
                  }}
                />
                <Bar dataKey="valor" radius={[8, 8, 0, 0]}>
                  {barData.map((entry, index) => (
                    <Cell
                      key={`bar-${index}`}
                      fill={index === 0 ? "#22c55e" : index === 1 ? "#ef4444" : "#3b82f6"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Gráfico de Pizza - Saídas */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl shadow-xl border border-gray-700/50"
          >
            <h3 className="text-xl font-semibold mb-4 text-center text-gray-200">
              📊 Saídas por Categoria
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={expenseDetails}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={100}
                  animationBegin={0}
                  animationDuration={800}
                >
                  {expenseDetails.map((entry, index) => (
                    <Cell key={`slice-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "#1e293b",
                    border: "1px solid #38bdf8",
                    borderRadius: "8px",
                    color: "#f8fafc"
                  }}
                />
                <Legend
                  wrapperStyle={{ color: "#cbd5e1", fontSize: "12px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Gráfico de Pizza - Entradas */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl shadow-xl border border-gray-700/50"
          >
            <h3 className="text-xl font-semibold mb-4 text-center text-gray-200">
              💰 Entradas por Categoria
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={incomeDetails}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={100}
                  animationBegin={0}
                  animationDuration={800}
                >
                  {incomeDetails.map((entry, index) => (
                    <Cell key={`slice-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "#1e293b",
                    border: "1px solid #38bdf8",
                    borderRadius: "8px",
                    color: "#f8fafc"
                  }}
                />
                <Legend
                  wrapperStyle={{ color: "#cbd5e1", fontSize: "12px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Gráfico de Pizza - Gastos Fixos */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl shadow-xl border border-gray-700/50"
          >
            <h3 className="text-xl font-semibold mb-4 text-center text-gray-200">
              🏠 Gastos Fixos
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={fixedExpenses.map((f) => ({ name: f.name, value: parseFloat(f.value || 0) }))}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={100}
                  animationBegin={0}
                  animationDuration={800}
                >
                  {fixedExpenses.map((entry, index) => (
                    <Cell key={`slice-${index}`} fill={fixedColors[index % fixedColors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "#1e293b",
                    border: "1px solid #38bdf8",
                    borderRadius: "8px",
                    color: "#f8fafc"
                  }}
                />
                <Legend
                  wrapperStyle={{ color: "#cbd5e1", fontSize: "12px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
