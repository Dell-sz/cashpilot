import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import { useAuth } from '../contexts/AuthContext';

export const useCategories = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCategories = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'users', user.uid, 'categories'));
      const catData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCategories(catData);
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
    } finally {
      setLoading(false);
    }
  };

  const addCategory = async (categoryData) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'users', user.uid, 'categories'), {
        ...categoryData,
        createdAt: new Date()
      });
      await fetchCategories();
    } catch (error) {
      console.error('Erro ao adicionar categoria:', error);
      throw error;
    }
  };

  const updateCategory = async (id, categoryData) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.uid, 'categories', id), categoryData);
      await fetchCategories();
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error);
      throw error;
    }
  };

  const deleteCategory = async (id) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'categories', id));
      await fetchCategories();
    } catch (error) {
      console.error('Erro ao deletar categoria:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [user]);

  return {
    categories,
    loading,
    fetchCategories,
    addCategory,
    updateCategory,
    deleteCategory
  };
};
