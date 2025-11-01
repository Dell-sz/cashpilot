import { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import { useAuth } from '../contexts/AuthContext';

export const useTransactions = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchTransactions = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'users', user.uid, 'transactions'));
      const transData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTransactions(transData);
    } catch (error) {
      console.error('Erro ao buscar transações:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const addTransaction = async (transactionData) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'users', user.uid, 'transactions'), {
        ...transactionData,
        createdAt: new Date()
      });
      await fetchTransactions(); // Recarrega lista
    } catch (error) {
      console.error('Erro ao adicionar transação:', error);
      throw error;
    }
  };

  const updateTransaction = async (id, transactionData) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.uid, 'transactions', id), transactionData);
      await fetchTransactions();
    } catch (error) {
      console.error('Erro ao atualizar transação:', error);
      throw error;
    }
  };

  const deleteTransaction = async (id) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'transactions', id));
      await fetchTransactions();
    } catch (error) {
      console.error('Erro ao deletar transação:', error);
      throw error;
    }
  };

  const clearAllTransactions = async () => {
    if (!user) return;
    try {
      const querySnapshot = await getDocs(collection(db, 'users', user.uid, 'transactions'));
      const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
      setTransactions([]);
    } catch (error) {
      console.error('Erro ao limpar transações:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return {
    transactions,
    loading,
    fetchTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    clearAllTransactions
  };
};
