import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { addDoc, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import { useAuth } from '../contexts/AuthContext';

export default function FixedExpenses() {
  const { user } = useAuth();
  const [fixedList, setFixedList] = useState([]);
  const [name, setName] = useState('');
  const [value, setValue] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const loadFixedExpenses = useCallback(async () => {
    if (!user) return;
    const snapshot = await getDocs(collection(db, "users", user.uid, "fixed_expenses"));
    setFixedList(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  }, [user]);

  useEffect(() => {
    loadFixedExpenses();
  }, [loadFixedExpenses]);

  const addFixedExpense = async () => {
    if (!user) {
      alert("Você precisa estar logado para adicionar gastos fixos.");
      return;
    }
    if (!name.trim() || !value) {
      alert('Preencha todos os campos!');
      return;
    }
    setIsAdding(true);
    try {
      await addDoc(collection(db, "users", user.uid, "fixed_expenses"), {
        name: name.trim(),
        value: parseFloat(value)
      });
      setName('');
      setValue('');
      loadFixedExpenses();
    } catch (error) {
      console.error('Erro ao adicionar gasto fixo:', error);
      alert('Erro ao adicionar gasto fixo. Tente novamente.');
    } finally {
      setIsAdding(false);
    }
  };

  const removeFixed = async (id) => {
    if (!user) {
      alert("Você precisa estar logado para remover gastos fixos.");
      return;
    }
    if (!window.confirm('Tem certeza que deseja remover este gasto fixo?')) return;
    try {
      await deleteDoc(doc(db, "users", user.uid, "fixed_expenses", id));
      loadFixedExpenses();
    } catch (error) {
      console.error('Erro ao remover gasto fixo:', error);
      alert('Erro ao remover gasto fixo. Tente novamente.');
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const totalFixedExpenses = fixedList.reduce((acc, item) => acc + parseFloat(item.value || 0), 0);

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
          💼 Gerenciar Gastos Fixos
        </h1>
        <p className="text-gray-300 mb-6 text-lg">
          Controle seus gastos mensais recorrentes
        </p>
      </motion.div>

      {/* Resumo */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-br from-blue-900/50 to-blue-800/50 p-6 rounded-xl shadow-lg border border-blue-500/30 mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-white mb-1">Total de Gastos Fixos</h3>
            <p className="text-blue-200 text-sm">{fixedList.length} itens cadastrados</p>
          </div>
          <div className="text-3xl font-bold text-blue-400">
            {formatCurrency(totalFixedExpenses)}
          </div>
        </div>
      </motion.div>

      {/* Formulário de Adição */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-4 bg-slate-800/60 p-5 rounded-2xl shadow-lg backdrop-blur-sm border border-slate-700 mb-8"
      >
        <h2 className="text-xl text-cyan-400 font-semibold mb-4 flex items-center gap-2">
          ➕ Novo Gasto Fixo
        </h2>

        <div>
          <label className="block text-sm text-gray-300 mb-1">Nome do Gasto</label>
          <input
            type="text"
            placeholder="Ex: Aluguel, Conta de Luz..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-slate-900 text-white border border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            onKeyPress={(e) => e.key === 'Enter' && addFixedExpense()}
          />
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-1">Valor Mensal (R$)</label>
          <input
            type="number"
            placeholder="0,00"
            step="0.01"
            min="0"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full bg-slate-900 text-white border border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            onKeyPress={(e) => e.key === 'Enter' && addFixedExpense()}
          />
        </div>

        <div className="flex gap-3 pt-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={addFixedExpense}
            disabled={isAdding}
            className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold px-4 py-2 rounded-lg transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAdding ? "Adicionando..." : "➕ Adicionar"}
          </motion.button>
        </div>
      </motion.div>

      {/* Lista de Gastos Fixos */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <h3 className="section-title">💼 Gastos Fixos</h3>

        {fixedList.length === 0 ? (
          <div className="bg-gray-800/50 p-12 rounded-xl text-center">
            <div className="text-6xl mb-4">🏠</div>
            <p className="text-gray-400 text-lg">Nenhum gasto fixo cadastrado ainda.</p>
            <p className="text-gray-500 text-sm mt-2">Adicione seu primeiro gasto fixo acima!</p>
          </div>
        ) : (
          <div className="fixed-expense-list">
            {fixedList.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ scale: 1.02 }}
                className="fixed-expense-item bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl shadow-lg border border-gray-700/50"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="text-2xl text-blue-400">🏠</div>
                    <div>
                      <p className="text-white font-medium text-lg">{item.name}</p>
                      <p className="text-gray-400 text-sm">Gasto mensal recorrente</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-xl font-bold text-blue-400">
                      {formatCurrency(item.value)}
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => removeFixed(item.id)}
                      className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-transform transform hover:scale-105"
                    >
                      🗑️ Remover
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
