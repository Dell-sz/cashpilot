import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import { useAuth } from '../contexts/AuthContext';

export const useFixedExpenses = () => {
  const { user } = useAuth();
  const [fixedExpenses, setFixedExpenses] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchFixedExpenses = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'users', user.uid, 'fixed_expenses'));
      const fixedData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setFixedExpenses(fixedData);
    } catch (error) {
      console.error('Erro ao buscar gastos fixos:', error);
    } finally {
      setLoading(false);
    }
  };

  const addFixedExpense = async (expenseData) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'users', user.uid, 'fixed_expenses'), {
        ...expenseData,
        createdAt: new Date()
      });
      await fetchFixedExpenses();
    } catch (error) {
      console.error('Erro ao adicionar gasto fixo:', error);
      throw error;
    }
  };

  const updateFixedExpense = async (id, expenseData) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.uid, 'fixed_expenses', id), expenseData);
      await fetchFixedExpenses();
    } catch (error) {
      console.error('Erro ao atualizar gasto fixo:', error);
      throw error;
    }
  };

  const deleteFixedExpense = async (id) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'fixed_expenses', id));
      await fetchFixedExpenses();
    } catch (error) {
      console.error('Erro ao deletar gasto fixo:', error);
      throw error;
    }
  };

  const getTotalFixedExpenses = () => {
    return fixedExpenses.reduce((total, expense) => total + parseFloat(expense.value || 0), 0);
  };

  useEffect(() => {
    fetchFixedExpenses();
  }, [user]);

  return {
    fixedExpenses,
    loading,
    fetchFixedExpenses,
    addFixedExpense,
    updateFixedExpense,
    deleteFixedExpense,
    getTotalFixedExpenses
  };
};
