import { useState, useEffect } from "react";
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { db } from "../services/firebaseConfig";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({ name: "", color: "#00c98d" });

  const fetchCategories = async () => {
    const querySnapshot = await getDocs(collection(db, "categories"));
    setCategories(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleAddCategory = async () => {
    if (!newCategory.name) return alert("Digite o nome da categoria!");
    await addDoc(collection(db, "categories"), newCategory);
    setNewCategory({ name: "", color: "#00c98d" });
    fetchCategories();
  };

  const handleDeleteCategory = async (id) => {
    await deleteDoc(doc(db, "categories", id));
    fetchCategories();
  };

  const handleUpdateCategory = async (id, name, color) => {
    const docRef = doc(db, "categories", id);
    await updateDoc(docRef, { name, color });
    fetchCategories();
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Gerenciar Categorias</h1>

      <div style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          placeholder="Nome da categoria"
          value={newCategory.name}
          onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
        />
        <input
          type="color"
          value={newCategory.color}
          onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
        />
        <button onClick={handleAddCategory}>Adicionar</button>
      </div>

      <ul>
        {categories.map(cat => (
          <li key={cat.id}>
            <input
              type="text"
              value={cat.name}
              onChange={(e) => handleUpdateCategory(cat.id, e.target.value, cat.color)}
            />
            <input
              type="color"
              value={cat.color}
              onChange={(e) => handleUpdateCategory(cat.id, cat.name, e.target.value)}
            />
            <button onClick={() => handleDeleteCategory(cat.id)}>Excluir</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
