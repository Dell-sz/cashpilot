import { useEffect, useState } from "react";
import styled from "styled-components";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../services/firebaseConfig";
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";

const Container = styled.div`padding: 2rem; text-align: center;`;
const SummaryBox = styled.div`display:flex; justify-content:space-around; gap:1rem; margin-bottom:2rem;`;
const Card = styled.div`background:#151c2e; padding:1.5rem; border-radius:16px; flex:1; box-shadow:0px 4px 12px rgba(0,0,0,0.2);`;
const CardTitle = styled.h3`color:#00c98d; margin-bottom:.5rem;`;
const CardValue = styled.p`font-size:1.5rem; font-weight:bold;`;

export default function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [entradaData, setEntradaData] = useState([]);
  const [saidaData, setSaidaData] = useState([]);
  const [fixedExpenses, setFixedExpenses] = useState([]);

  // Pega transações
  useEffect(() => {
    const fetchData = async () => {
      const tSnap = await getDocs(collection(db, "transactions"));
      const data = tSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTransactions(data);

      const fSnap = await getDocs(collection(db, "fixedExpenses"));
      const fixed = fSnap.docs.map(doc => doc.data());
      setFixedExpenses(fixed);

      const cSnap = await getDocs(collection(db, "categories"));
      setCategories(cSnap.docs.map(doc => doc.data()));

      // Entradas por categoria
      const entradas = [...new Set(data.filter(t => t.type === "Entrada").map(t => t.category))].map(cat => {
        const value = data.filter(t => t.type === "Entrada" && t.category === cat).reduce((acc, t) => acc + t.value, 0);
        return { name: cat, value };
      });
      setEntradaData(entradas);

      // Saídas por categoria
      const saidas = [...new Set(data.filter(t => t.type === "Saída").map(t => t.category))].map(cat => {
        const value = data.filter(t => t.type === "Saída" && t.category === cat).reduce((acc, t) => acc + t.value, 0);
        return { name: cat, value };
      });
      setSaidaData(saidas);
    };
    fetchData();
  }, []);

  const totalEntradas = transactions.filter(t => t.type === "Entrada").reduce((acc, t) => acc + t.value, 0);
  const totalSaidas = transactions.filter(t => t.type === "Saída").reduce((acc, t) => acc + t.value, 0);
  const saldo = totalEntradas - totalSaidas;
  const totalFixed = fixedExpenses.reduce((acc, t) => acc + t.value, 0);

  const getCategoryColor = (name) => {
    const cat = categories.find(c => c.name === name);
    return cat ? cat.color : "#808080";
  };

  return (
    <Container>
      <h1>Resumo Financeiro</h1>
      <SummaryBox>
        <Card><CardTitle>Entradas</CardTitle><CardValue>R$ {totalEntradas}</CardValue></Card>
        <Card><CardTitle>Saídas</CardTitle><CardValue>R$ {totalSaidas}</CardValue></Card>
        <Card><CardTitle>Gastos Fixos</CardTitle><CardValue>R$ {totalFixed}</CardValue></Card>
        <Card><CardTitle>Saldo</CardTitle><CardValue>R$ {saldo}</CardValue></Card>
      </SummaryBox>

      <h2>Total Entradas x Saídas</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={[{ name: "Total", Entradas: totalEntradas, Saídas: totalSaidas }]}>
          <XAxis dataKey="name" stroke="#fff" />
          <YAxis stroke="#fff" />
          <Tooltip />
          <Legend />
          <Bar dataKey="Entradas" fill="#00c98d" />
          <Bar dataKey="Saídas" fill="#ff4c60" />
        </BarChart>
      </ResponsiveContainer>

      <h2>Detalhes das Entradas</h2>
      {entradaData.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={entradaData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
              {entradaData.map((entry, index) => <Cell key={index} fill={getCategoryColor(entry.name)} />)}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      ) : <p>Nenhuma entrada para mostrar.</p>}

      <h2>Detalhes das Saídas</h2>
      {saidaData.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={saidaData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
              {saidaData.map((entry, index) => <Cell key={index} fill={getCategoryColor(entry.name)} />)}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      ) : <p>Nenhuma saída para mostrar.</p>}
    </Container>
  );
}
