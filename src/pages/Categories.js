import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { db } from "../services/firebaseConfig";
import { useAuth } from "../contexts/AuthContext";

export default function Categories() {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({ name: "", color: "#38bdf8" });
  const [isAdding, setIsAdding] = useState(false);

  const fetchCategories = useCallback(async () => {
    if (!user) return;
    const querySnapshot = await getDocs(collection(db, "users", user.uid, "categories"));
    setCategories(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  }, [user]);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const handleAddCategory = async () => {
    if (!user) {
      alert("Você precisa estar logado para adicionar categorias.");
      return;
    }
    if (!newCategory.name.trim()) {
      alert("Digite o nome da categoria!");
      return;
    }
    setIsAdding(true);
    try {
      await addDoc(collection(db, "users", user.uid, "categories"), newCategory);
      setNewCategory({ name: "", color: "#38bdf8" });
      fetchCategories();
    } catch (error) {
      console.error("Erro ao adicionar categoria:", error);
      alert("Erro ao adicionar categoria. Tente novamente.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!user) {
      alert("Você precisa estar logado para excluir categorias.");
      return;
    }
    if (!window.confirm("Tem certeza que deseja excluir esta categoria?")) return;
    try {
      await deleteDoc(doc(db, "users", user.uid, "categories", id));
      fetchCategories();
    } catch (error) {
      console.error("Erro ao excluir categoria:", error);
      alert("Erro ao excluir categoria. Tente novamente.");
    }
  };

  const handleUpdateCategory = async (id, name, color) => {
    if (!user) return;
    try {
      const docRef = doc(db, "users", user.uid, "categories", id);
      await updateDoc(docRef, { name: name.trim(), color });
      fetchCategories();
    } catch (error) {
      console.error("Erro ao atualizar categoria:", error);
    }
  };

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
          🏷️ Gerenciar Categorias
        </h1>
        <p className="text-gray-300 mb-6 text-lg">
          Organize suas transações criando e personalizando categorias
        </p>
      </motion.div>

      {/* Formulário de Adição */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-4 bg-gradient-to-br from-slate-800/80 to-slate-900/80 p-6 rounded-2xl shadow-xl backdrop-blur-sm border border-cyan-500/30 mb-8"
      >
        <h2 className="text-xl text-cyan-400 font-semibold mb-4 flex items-center gap-2">
          ➕ Nova Categoria
        </h2>

        <div>
          <label className="block text-sm text-gray-300 mb-1">Nome da Categoria</label>
          <input
            type="text"
            placeholder="Ex: Alimentação, Transporte..."
            value={newCategory.name}
            onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
            className="w-full bg-slate-900 text-white border border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
          />
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-1">Cor</label>
          <input
            type="color"
            value={newCategory.color}
            onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
            className="w-full h-10 bg-slate-900 border border-slate-600 rounded-lg cursor-pointer"
          />
        </div>

        <div className="flex gap-3 pt-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAddCategory}
            disabled={isAdding}
            className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold px-4 py-2 rounded-lg transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAdding ? "Adicionando..." : "➕ Adicionar"}
          </motion.button>
        </div>
      </motion.div>

      {/* Lista de Categorias */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <h2 className="text-xl font-semibold text-white mb-4">📋 Categorias Existentes</h2>
        {categories.length === 0 ? (
          <div className="bg-gray-800/50 p-8 rounded-xl text-center">
            <div className="text-4xl mb-4">📭</div>
            <p className="text-gray-400">Nenhuma categoria criada ainda.</p>
            <p className="text-gray-500 text-sm mt-2">Adicione sua primeira categoria acima!</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {categories.map((cat, index) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 p-6 rounded-xl shadow-xl border border-cyan-500/20 hover:border-cyan-400/40 transition-all duration-300"
              >
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="flex items-center gap-3 flex-1">
                    <div
                      className="w-6 h-6 rounded-full border-2 border-white/20 shadow-lg"
                      style={{ backgroundColor: cat.color }}
                    ></div>
                    <input
                      type="text"
                      value={cat.name}
                      onChange={(e) => handleUpdateCategory(cat.id, e.target.value, cat.color)}
                      className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={cat.color}
                      onChange={(e) => handleUpdateCategory(cat.id, cat.name, e.target.value)}
                      className="w-12 h-10 bg-gray-700 border border-gray-600 rounded-lg cursor-pointer"
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-transform transform hover:scale-105"
                    >
                      🗑️ Excluir
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
