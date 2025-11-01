import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { collection, getDocs, addDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "../services/firebaseConfig";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../components/ui/ToastContainer";

export default function Transactions() {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newTransaction, setNewTransaction] = useState({ type: "Saída", category: "", value: "", customCategory: "", date: "" });
  const [isAdding, setIsAdding] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterDate, setFilterDate] = useState("");

  const fetchTransactions = useCallback(async () => {
    if (!user) return;
    try {
      const querySnapshot = await getDocs(collection(db, "users", user.uid, "transactions"));
      setTransactions(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Erro ao buscar transações:", error);
      showError("Erro ao carregar transações");
    }
  }, [user, showError]);

  const fetchCategories = useCallback(async () => {
    if (!user) return;
    try {
      const querySnapshot = await getDocs(collection(db, "users", user.uid, "categories"));
      setCategories(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Erro ao buscar categorias:", error);
      showError("Erro ao carregar categorias");
    }
  }, [user, showError]);

  useEffect(() => {
    fetchTransactions();
    fetchCategories();
  }, [fetchTransactions, fetchCategories]);

  const handleAddTransaction = async () => {
    if (!user) {
      showError("Você precisa estar logado para adicionar transações.");
      return;
    }
    const categoryToSave = newTransaction.category === "Outra" ? newTransaction.customCategory : newTransaction.category;
    if (!categoryToSave || !newTransaction.value) {
      showError("Preencha todos os campos!");
      return;
    }
    setIsAdding(true);
    try {
      await addDoc(collection(db, "users", user.uid, "transactions"), {
        ...newTransaction,
        category: categoryToSave,
        value: parseFloat(newTransaction.value),
        date: newTransaction.date || new Date().toISOString().split("T")[0]
      });
      setNewTransaction({ type: "Saída", category: "", value: "", customCategory: "", date: "" });
      fetchTransactions();
      showSuccess("Transação adicionada com sucesso!");
    } catch (error) {
      console.error("Erro ao adicionar transação:", error);
      showError("Erro ao adicionar transação. Tente novamente.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleClearTransactions = async () => {
    if (!user) {
      showError("Você precisa estar logado para limpar transações.");
      return;
    }
    if (!window.confirm("Tem certeza que quer apagar todas as transações? Esta ação não pode ser desfeita!")) return;
    setIsClearing(true);
    try {
      const querySnapshot = await getDocs(collection(db, "users", user.uid, "transactions"));
      const deletePromises = querySnapshot.docs.map(document =>
        deleteDoc(doc(db, "users", user.uid, "transactions", document.id))
      );
      await Promise.all(deletePromises);
      fetchTransactions();
      showSuccess("Todas as transações foram removidas!");
    } catch (error) {
      console.error("Erro ao limpar transações:", error);
      showError("Erro ao limpar transações. Tente novamente.");
    } finally {
      setIsClearing(false);
    }
  };

  const deleteTransaction = async (id) => {
    if (!user) {
      showError("Você precisa estar logado para excluir transações.");
      return;
    }
    if (!window.confirm("Tem certeza que deseja excluir esta transação?")) return;
    try {
      await deleteDoc(doc(db, "users", user.uid, "transactions", id));
      fetchTransactions();
      showSuccess("Transação excluída com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir transação:", error);
      showError("Erro ao excluir transação. Tente novamente.");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Sem data";
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Lógica de filtragem
  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch = searchTerm === "" ||
      (t.category || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.value.toString().includes(searchTerm);

    const matchesCategory = filterCategory === "" || t.category === filterCategory;
    const matchesType = filterType === "" || t.type === filterType;

    const transactionDate = new Date(t.date);
    const filterDateObj = filterDate ? new Date(filterDate) : null;

    const matchesDate = !filterDateObj || transactionDate.toDateString() === filterDateObj.toDateString();

    return matchesSearch && matchesCategory && matchesType && matchesDate;
  });

  // Render helper to avoid deep inline ternary/map in JSX (fixes parsing/unexpected token)
  const transactionsList = (() => {
    if (transactions.length === 0) {
      return (
        <div className="bg-gray-800/50 p-12 rounded-xl text-center">
          <div className="text-6xl mb-4">📊</div>
          <p className="text-gray-400 text-lg">Nenhuma transação registrada ainda.</p>
          <p className="text-gray-500 text-sm mt-2">Adicione sua primeira transação acima!</p>
        </div>
      );
    }

    if (filteredTransactions.length === 0) {
      return (
        <div className="bg-gray-800/50 p-12 rounded-xl text-center">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-gray-400 text-lg">Nenhuma transação encontrada com os filtros aplicados.</p>
          <p className="text-gray-500 text-sm mt-2">Tente ajustar os filtros ou limpe-os para ver todas as transações.</p>
        </div>
      );
    }

    return filteredTransactions
      .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
      .map((t, index) => (
        <motion.div
          key={t.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 * index }}
          whileHover={{ scale: 1.02 }}
          className={`transaction-item p-4 rounded-xl shadow-lg border transition-all duration-200 ${t.type === "Entrada" ? "bg-gradient-to-r from-green-900/50 to-green-800/50 border-green-500/30" : "bg-gradient-to-r from-red-900/50 to-red-800/50 border-red-500/30"}`}
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className={`text-2xl ${t.type === "Entrada" ? "text-green-400" : "text-red-400"}`}>
                {t.type === "Entrada" ? "💰" : "💸"}
              </div>
              <div>
                <p className="text-white font-medium">{t.category || "Sem categoria"}</p>
                <p className="text-gray-400 text-sm">{formatDate(t.date)}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <p className={`text-xl font-bold ${t.type === "Entrada" ? "text-green-400" : "text-red-400"}`}>
                {t.type === "Entrada" ? "+" : "-"}{formatCurrency(t.value)}
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => deleteTransaction(t.id)}
                className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-transform transform hover:scale-105"
              >
                🗑️ Excluir
              </motion.button>
            </div>
          </div>
        </motion.div>
      ));
  })();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="p-6 text-white max-w-3xl mx-auto"
    >
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          💳 Gerenciar Transações
        </h1>
        <p className="text-gray-300 mb-6 text-lg">
          Adicione e visualize suas entradas e saídas financeiras
        </p>
      </motion.div>

      {/* Formulário de Adição */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-4 bg-slate-800/60 p-5 rounded-2xl shadow-lg backdrop-blur-sm border border-slate-700 mb-8"
      >
        <h2 className="text-xl text-cyan-400 font-semibold mb-4 flex items-center gap-2">
          ➕ Nova Transação
        </h2>

        <div>
          <label className="block text-sm text-gray-300 mb-1">Tipo</label>
          <select
            value={newTransaction.type}
            onChange={(e) => setNewTransaction({ ...newTransaction, type: e.target.value })}
            className="w-full bg-slate-900 text-white border border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400"
          >
            <option value="Saída">💸 Saída</option>
            <option value="Entrada">💰 Entrada</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-1">Categoria</label>
          <select
            value={newTransaction.category}
            onChange={(e) => setNewTransaction({ ...newTransaction, category: e.target.value })}
            className="w-full bg-slate-900 text-white border border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400"
          >
            <option value="">Selecione uma categoria...</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.name}>
                ● {cat.name}
              </option>
            ))}
            <option value="Outra">➕ Criar nova categoria</option>
          </select>
        </div>

        {newTransaction.category === "Outra" && (
          <div>
            <label className="block text-sm text-gray-300 mb-1">Nova Categoria</label>
            <input
              type="text"
              placeholder="Digite a categoria"
              value={newTransaction.customCategory}
              onChange={(e) => setNewTransaction({ ...newTransaction, customCategory: e.target.value })}
              className="w-full bg-slate-900 text-white border border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
          </div>
        )}

        <div>
          <label className="block text-sm text-gray-300 mb-1">Valor (R$)</label>
          <input
            type="number"
            placeholder="0,00"
            step="0.01"
            min="0"
            value={newTransaction.value}
            onChange={(e) => setNewTransaction({ ...newTransaction, value: e.target.value })}
            className="w-full bg-slate-900 text-white border border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            onKeyPress={(e) => e.key === 'Enter' && handleAddTransaction()}
          />
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-1">Data</label>
          <input
            type="date"
            value={newTransaction.date}
            onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
            className="w-full bg-slate-900 text-white border border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400"
          />
        </div>

        <div className="flex gap-3 pt-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAddTransaction}
            disabled={isAdding}
            className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold px-4 py-2 rounded-lg transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAdding ? "Adicionando..." : "➕ Adicionar"}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleClearTransactions}
            disabled={isClearing}
            className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isClearing ? "Limpando..." : "🗑️ Limpar"}
          </motion.button>
        </div>
      </motion.div>

      {/* Filtros e Pesquisa */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="space-y-4 bg-slate-800/60 p-5 rounded-2xl shadow-lg backdrop-blur-sm border border-slate-700 mb-8"
      >
        <h2 className="text-xl text-cyan-400 font-semibold mb-4 flex items-center gap-2">
          🔍 Filtros e Pesquisa
        </h2>

        <div className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 text-white border border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
          </div>
          <div className="flex-1">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full bg-slate-900 text-white border border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            >
              <option value="">Categoria</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.name}>
                  ● {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full bg-slate-900 text-white border border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            >
              <option value="">Tipo</option>
              <option value="Entrada">💰 Entrada</option>
              <option value="Saída">💸 Saída</option>
            </select>
          </div>
          <div className="flex-1">
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full bg-slate-900 text-white border border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
          </div>
          <div className="flex-1">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setSearchTerm("");
                setFilterCategory("");
                setFilterType("");
                setFilterDate("");
              }}
              className="w-full bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-transform transform hover:scale-105"
            >
              🗑️ Limpar
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Lista de Transações */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="section-title">📜 Histórico de Transações</h3>
          <span className="text-gray-400 text-sm">{filteredTransactions.length} transações</span>
        </div>

        <div className="transaction-list">
          {transactionsList}
        </div>
      </motion.div>
    </motion.div>
  );
}
