import React, { useState, useEffect } from "react";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db, auth } from "../services/firebaseConfig";
import { motion } from "framer-motion";

export default function Categorias() {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [newColor, setNewColor] = useState("#38bdf8");
  const [editMode, setEditMode] = useState(false);
  const [editCategory, setEditCategory] = useState(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("#38bdf8");

  // 🔹 Carrega categorias do usuário logado
  const loadCategories = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const catSnap = await getDocs(collection(db, "users", user.uid, "categories"));
      const catData = catSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCategories(catData);
    } catch (error) {
      console.error("Erro ao carregar categorias:", error);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // 🔹 Adicionar nova categoria
  const handleAddCategory = async () => {
    if (!newCategory.trim()) return alert("Digite um nome para a categoria!");
    const user = auth.currentUser;
    if (!user) return;

    await addDoc(collection(db, "users", user.uid, "categories"), {
      name: newCategory,
      color: newColor,
      createdAt: new Date(),
    });

    setNewCategory("");
    loadCategories();
  };

  // 🔹 Deletar categoria
  const handleDeleteCategory = async (id) => {
    const user = auth.currentUser;
    if (!user) return;

    if (!window.confirm("Tem certeza que deseja excluir esta categoria?")) return;

    await deleteDoc(doc(db, "users", user.uid, "categories", id));
    loadCategories();
  };

  // 🔹 Editar categoria
  const handleEditCategory = async () => {
    const user = auth.currentUser;
    if (!user || !editCategory) return;

    const catRef = doc(db, "users", user.uid, "categories", editCategory.id);
    await updateDoc(catRef, {
      name: editName,
      color: editColor,
      updatedAt: new Date(),
    });

    setEditMode(false);
    setEditCategory(null);
    loadCategories();
  };

  return (
    <div className="p-6 text-white">
      <h2 className="text-2xl font-bold mb-4">🎨 Categorias</h2>

      {/* Adicionar categoria */}
      <div className="flex flex-wrap gap-4 mb-6 bg-gray-900 p-4 rounded-lg items-center">
        <input
          type="text"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          placeholder="Nova categoria"
          className="p-2 rounded-md bg-gray-800 text-white border border-gray-600 w-64 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
        <input
          type="color"
          value={newColor}
          onChange={(e) => setNewColor(e.target.value)}
          className="w-10 h-10 border-none rounded cursor-pointer"
        />
        <button
          onClick={handleAddCategory}
          className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-md font-medium transition-all"
        >
          + Adicionar
        </button>
      </div>

      {/* Lista de categorias */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {categories.map((cat) => (
          <motion.div
            key={cat.id}
            whileHover={{ scale: 1.05 }}
            className="bg-gray-900 rounded-lg shadow-lg border border-gray-700 overflow-hidden"
          >
            {/* 🔹 Barra de cor no topo */}
            <div
              className="h-2 w-full"
              style={{
                background: `linear-gradient(90deg, ${cat.color}, ${cat.color}aa)`,
              }}
            ></div>

            {/* 🔹 Conteúdo */}
            <div className="p-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-white">{cat.name}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditCategory(cat);
                    setEditName(cat.name);
                    setEditColor(cat.color);
                    setEditMode(true);
                  }}
                  className="text-yellow-400 hover:text-yellow-300 transition-colors"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDeleteCategory(cat.id)}
                  className="text-red-400 hover:text-red-300 transition-colors"
                >
                  🗑️
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal de edição */}
      {editMode && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gray-800 p-6 rounded-lg shadow-lg w-96"
          >
            <h3 className="text-xl font-bold mb-4 text-cyan-400">Editar Categoria</h3>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full p-2 mb-4 rounded-md bg-gray-900 text-white border border-gray-600 focus:ring-2 focus:ring-cyan-500"
            />
            <div className="flex justify-between items-center mb-4">
              <label>Cor:</label>
              <input
                type="color"
                value={editColor}
                onChange={(e) => setEditColor(e.target.value)}
                className="w-12 h-12 rounded-full border-none cursor-pointer"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setEditMode(false)}
                className="px-4 py-2 bg-gray-700 rounded-md hover:bg-gray-600"
              >
                Cancelar
              </button>
              <button
                onClick={handleEditCategory}
                className="px-4 py-2 bg-cyan-600 rounded-md hover:bg-cyan-500 font-medium"
              >
                Salvar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
