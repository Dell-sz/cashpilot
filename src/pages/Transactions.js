import { useEffect, useState } from "react";
import { collection, getDocs, addDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "../services/firebaseConfig";

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newTransaction, setNewTransaction] = useState({ type: "Saída", category: "", value: "", customCategory: "", date: "" });

  const fetchTransactions = async () => {
    const querySnapshot = await getDocs(collection(db, "transactions"));
    setTransactions(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const fetchCategories = async () => {
    const querySnapshot = await getDocs(collection(db, "categories"));
    setCategories(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  useEffect(() => {
    fetchTransactions();
    fetchCategories();
  }, []);

  const handleAddTransaction = async () => {
    const categoryToSave = newTransaction.category === "Outra" ? newTransaction.customCategory : newTransaction.category;
    if (!categoryToSave || !newTransaction.value) return alert("Preencha todos os campos!");
    await addDoc(collection(db, "transactions"), {
      ...newTransaction,
      category: categoryToSave,
      value: parseFloat(newTransaction.value),
      date: newTransaction.date || new Date().toISOString().split("T")[0]
    });
    setNewTransaction({ type: "Saída", category: "", value: "", customCategory: "", date: "" });
    fetchTransactions();
  };

  const handleClearTransactions = async () => {
    if (!window.confirm("Tem certeza que quer apagar todas as transações?")) return;
    const querySnapshot = await getDocs(collection(db, "transactions"));
    for (const document of querySnapshot.docs) {
      await deleteDoc(doc(db, "transactions", document.id));
    }
    fetchTransactions();
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Transações</h1>
      <div style={{ marginBottom: "1rem" }}>
        <select
          value={newTransaction.type}
          onChange={(e) => setNewTransaction({ ...newTransaction, type: e.target.value })}
        >
          <option value="Entrada">Entrada</option>
          <option value="Saída">Saída</option>
        </select>

        <select
          value={newTransaction.category}
          onChange={(e) => setNewTransaction({ ...newTransaction, category: e.target.value })}
        >
          <option value="">Selecione a categoria</option>
          {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
          <option value="Outra">Outra</option>
        </select>

        {newTransaction.category === "Outra" && (
          <input
            type="text"
            placeholder="Digite a categoria"
            value={newTransaction.customCategory}
            onChange={(e) => setNewTransaction({ ...newTransaction, customCategory: e.target.value })}
          />
        )}

        <input
          type="number"
          placeholder="Valor"
          value={newTransaction.value}
          onChange={(e) => setNewTransaction({ ...newTransaction, value: e.target.value })}
        />

        <input
          type="date"
          value={newTransaction.date}
          onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
        />

        <button onClick={handleAddTransaction}>Adicionar</button>
        <button onClick={handleClearTransactions} style={{ marginLeft: "1rem", background: "#ff4c60", color: "#fff" }}>
          Apagar todas
        </button>
      </div>

      <div>
        {transactions.map(t => (
          <div key={t.id} style={{
            background: t.type === "Entrada" ? "#073b2c" : "#3b0d0d",
            color: "#fff",
            padding: "1rem",
            borderRadius: "12px",
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "0.5rem"
          }}>
            <div>{t.type} — {t.category} <br /> <small>{t.date}</small></div>
            <div>{t.type === "Entrada" ? "+" : "-"} R$ {t.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
