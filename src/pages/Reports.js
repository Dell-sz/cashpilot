
import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { collection, getDocs, addDoc, query, orderBy } from "firebase/firestore";
import { db } from "../services/firebaseConfig";
import { useAuth } from "../contexts/AuthContext";
import { reportsService } from "../services/reportsService";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function Reports() {
  const { user } = useAuth();


  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadReports = useCallback(async () => {
    if (!user) return;
    try {
      const reportsSnapshot = await getDocs(
        query(collection(db, "users", user.uid, "reports"), orderBy("createdAt", "desc"))
      );
      const reportsData = reportsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setReports(reportsData);
    } catch (error) {
      console.error("Erro ao carregar relatórios:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const generateMonthlyReport = async () => {
    if (!user) {
      alert("Você precisa estar logado para gerar relatórios.");
      return;
    }
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    try {
      // Carregar dados do mês atual
      const transSnapshot = await getDocs(collection(db, "users", user.uid, "transactions"));
      const transData = transSnapshot.docs.map((doc) => doc.data());

      const fixedSnapshot = await getDocs(collection(db, "users", user.uid, "fixed_expenses"));
      const fixedData = fixedSnapshot.docs.map((doc) => doc.data());

      // Carregar categorias (não usado atualmente, mas pode ser útil no futuro)
      // const catSnapshot = await getDocs(collection(db, "categories"));

      // Filtrar transações do mês atual
      const monthlyTransactions = transData.filter((t) => {
        const transDate = new Date(t.date);
        return transDate.getMonth() === currentMonth && transDate.getFullYear() === currentYear;
      });

      // Calcular totais do mês
      const entradas = monthlyTransactions
        .filter((t) => (t.type?.toLowerCase() || t.tipo?.toLowerCase()) === "entrada")
        .reduce((acc, t) => acc + parseFloat(t.value || 0), 0);

      const saidas = monthlyTransactions
        .filter((t) => (t.type?.toLowerCase() || t.tipo?.toLowerCase()) === "saída")
        .reduce((acc, t) => acc + parseFloat(t.value || 0), 0);

      const gastosFixos = fixedData.reduce((acc, f) => acc + parseFloat(f.value || 0), 0);

      // Salvar relatório no Firestore
      await addDoc(collection(db, "users", user.uid, "reports"), {
        month: currentMonth,
        year: currentYear,
        entradas,
        saidas,
        gastosFixos,
        saldo: entradas - saidas - gastosFixos,
        transactions: monthlyTransactions,
        createdAt: new Date(),
      });

      alert("Relatório mensal gerado com sucesso!");
      loadReports(); // Recarregar lista
    } catch (error) {
      console.error("Erro ao gerar relatório:", error);
      alert("Erro ao gerar relatório mensal.");
    }
  };


  const handleDeleteReport = async (reportId) => {
    try {
      await reportsService.deleteReport(user.uid, reportId);
      alert("Relatório deletado com sucesso!");
      loadReports(); // Recarregar lista
    } catch (error) {
      console.error("Erro ao deletar relatório:", error);
      alert("Erro ao deletar relatório.");
    }
  };

  const downloadReport = async (report) => {
    // Criar conteúdo HTML para o relatório
    const reportContent = document.createElement("div");
    reportContent.innerHTML = `
      <div style="background: #0f172a; color: #f8fafc; padding: 20px; font-family: Arial, sans-serif;">
        <h1 style="color: #38bdf8; text-align: center;">📊 Relatório Financeiro - CashPilot</h1>
        <h2 style="color: #f8fafc; text-align: center;">${new Date(report.year, report.month).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</h2>
        <div style="display: flex; justify-content: space-around; margin: 20px 0;">
          <div style="background: rgba(34, 197, 94, 0.2); padding: 15px; border-radius: 8px; border: 1px solid #22c55e;">
            <p style="margin: 0; color: #22c55e;">Entradas</p>
            <p style="margin: 0; font-size: 24px; font-weight: bold; color: #22c55e;">R$ ${report.entradas.toFixed(2)}</p>
          </div>
          <div style="background: rgba(239, 68, 68, 0.2); padding: 15px; border-radius: 8px; border: 1px solid #ef4444;">
            <p style="margin: 0; color: #ef4444;">Saídas</p>
            <p style="margin: 0; font-size: 24px; font-weight: bold; color: #ef4444;">R$ ${report.saidas.toFixed(2)}</p>
          </div>
          <div style="background: rgba(59, 130, 246, 0.2); padding: 15px; border-radius: 8px; border: 1px solid #3b82f6;">
            <p style="margin: 0; color: #3b82f6;">Gastos Fixos</p>
            <p style="margin: 0; font-size: 24px; font-weight: bold; color: #3b82f6;">R$ ${report.gastosFixos.toFixed(2)}</p>
          </div>
          <div style="background: rgba(16, 185, 129, 0.2); padding: 15px; border-radius: 8px; border: 1px solid #10b981;">
            <p style="margin: 0; color: #10b981;">Saldo</p>
            <p style="margin: 0; font-size: 24px; font-weight: bold; color: #10b981;">R$ ${report.saldo.toFixed(2)}</p>
          </div>
        </div>
        <h3 style="color: #f8fafc;">Transações do Mês:</h3>
        <ul style="color: #cbd5e1;">
          ${report.transactions.map(t => `<li>${t.category || 'Sem categoria'}: R$ ${t.value} (${t.type || t.tipo}) - ${new Date(t.date).toLocaleDateString('pt-BR')}</li>`).join('')}
        </ul>
        <p style="text-align: center; color: #94a3b8; margin-top: 40px;">CashPilot © 2025 — Seu copiloto financeiro 🚀</p>
      </div>
    `;
    document.body.appendChild(reportContent);

    try {
      const canvas = await html2canvas(reportContent, {
        backgroundColor: "#0f172a",
        scale: 2,
        useCORS: true,
        allowTaint: false,
        scrollX: 0,
        scrollY: 0,
        width: 800,
        height: 600,
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
      pdf.text("📊 Relatório Mensal - CashPilot", 10, 12);

      // Data
      pdf.setFontSize(10);
      pdf.setTextColor("#f8fafc");
      const date = new Date().toLocaleDateString("pt-BR");
      pdf.text(`Gerado em: ${date}`, pageWidth - 60, 12);

      // Imagem
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

      pdf.save(`CashPilot_Relatorio_${new Date(report.year, report.month).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).replace(' ', '_')}.pdf`);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      alert("Erro ao baixar relatório.");
    } finally {
      document.body.removeChild(reportContent);
    }
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center h-full"
      >
        <div className="text-cyan-400 text-xl">Carregando relatórios...</div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="p-6 text-white max-w-4xl mx-auto"
    >
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          📅 Relatórios Mensais
        </h1>
        <p className="text-gray-300 mb-6 text-lg">
          Histórico de relatórios financeiros mensais
        </p>
        <button
          onClick={generateMonthlyReport}
          className="mb-6 bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 hover:scale-105"
        >
          📄 Gerar Relatório Mensal
        </button>
      </motion.div>

      {reports.length === 0 ? (
        <div className="text-center text-gray-400">
          Nenhum relatório encontrado. Gere o primeiro relatório mensal!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => (
            <motion.div
              key={report.id}
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl shadow-lg border border-gray-700/50"
            >
              <h3 className="text-xl font-semibold mb-4 text-gray-200">
                {new Date(report.year, report.month).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
              </h3>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-green-400">Entradas:</span>
                  <span>R$ {report.entradas.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-400">Saídas:</span>
                  <span>R$ {report.saidas.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-400">Gastos Fixos:</span>
                  <span>R$ {report.gastosFixos.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span className={report.saldo >= 0 ? 'text-emerald-400' : 'text-orange-400'}>Saldo:</span>
                  <span className={report.saldo >= 0 ? 'text-emerald-400' : 'text-orange-400'}>R$ {report.saldo.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => downloadReport(report)}
                  className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-2 rounded-lg font-semibold transition-all duration-200 text-sm"
                >
                  📄 Baixar PDF
                </button>
                <button
                  onClick={() => {
                    const confirmDelete = window.confirm(
                      `Tem certeza que deseja deletar o relatório de ${new Date(report.year, report.month).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}?`
                    );
                    if (confirmDelete) {
                      handleDeleteReport(report.id);
                    }
                  }}
                  className="flex-1 bg-red-600 hover:bg-red-500 text-white px-3 py-2 rounded-lg font-semibold transition-all duration-200 text-sm"
                >
                  🗑️ Deletar
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
