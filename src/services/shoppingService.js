// src/services/shoppingService.js
import { db } from './firebaseConfig';


import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  getDocs,
  getDoc,
  serverTimestamp
} from 'firebase/firestore';

// Estrutura principal da lista de compras
export const shoppingListStructure = {
  name: "string",
  items: [{
    name: "string",
    category: "string",
    quantity: 1,
    estimatedPrice: 0,
    priority: "medium", // high, medium, low
    purchased: false,
    notes: "",
    createdAt: new Date()
  }],
  budget: 0,
  totalEstimated: 0,
  store: "",
  dueDate: null,
  createdAt: new Date()
};

// Serviço de operações CRUD
export const shoppingService = {
  // Buscar todas as listas do usuário
  async getLists(userId) {
    try {
      const listsRef = collection(db, "users", userId, "shopping_lists");
      const q = query(listsRef, orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Erro ao buscar listas:", error);
      throw error;
    }
  },

  // Criar nova lista
  async createList(userId, listData) {
    try {
      const listsRef = collection(db, "users", userId, "shopping_lists");
      const data = {
        ...listData,
        createdAt: serverTimestamp(),
        totalEstimated: this.calculateTotal(listData.items)
      };

      const docRef = await addDoc(listsRef, data);
      return docRef;
    } catch (error) {
      console.error("Erro ao criar lista:", error);
      throw error;
    }
  },

  // Atualizar lista existente
  async updateList(userId, listId, updates) {
    try {
      const listRef = doc(db, "users", userId, "shopping_lists", listId);
      const data = {
        ...updates,
        updatedAt: serverTimestamp()
      };

      if (updates.items) {
        data.totalEstimated = this.calculateTotal(updates.items);
      }

      await updateDoc(listRef, data);
    } catch (error) {
      console.error("Erro ao atualizar lista:", error);
      throw error;
    }
  },

  // Deletar lista
  async deleteList(userId, listId) {
    try {
      const listRef = doc(db, "users", userId, "shopping_lists", listId);
      await deleteDoc(listRef);
    } catch (error) {
      console.error("Erro ao deletar lista:", error);
      throw error;
    }
  },

  // Calcular total estimado dos itens
  calculateTotal(items) {
    if (!items || items.length === 0) return 0;

    return items.reduce((total, item) => {
      const price = parseFloat(item.estimatedPrice) || 0;
      const quantity = parseInt(item.quantity) || 0;
      return total + (price * quantity);
    }, 0);
  },


  // Buscar uma lista específica
  async getList(userId, listId) {
    try {
      const listRef = doc(db, "users", userId, "shopping_lists", listId);
      const snapshot = await getDoc(listRef);

      if (snapshot.exists()) {
        return { id: snapshot.id, ...snapshot.data() };
      }
      return null;
    } catch (error) {
      console.error("Erro ao buscar lista:", error);
      throw error;
    }
  },

  // Marcar item como comprado/não comprado
  async toggleItemPurchased(userId, listId, itemIndex) {
    try {
      const list = await this.getList(userId, listId);
      if (!list || !list.items[itemIndex]) return;

      const updatedItems = [...list.items];
      updatedItems[itemIndex].purchased = !updatedItems[itemIndex].purchased;

      await this.updateList(userId, listId, { items: updatedItems });
    } catch (error) {
      console.error("Erro ao marcar item:", error);
      throw error;
    }
  },

  // Adicionar item a uma lista
  async addItem(userId, listId, newItem) {
    try {
      const list = await this.getList(userId, listId);
      if (!list) return;

      const updatedItems = [...list.items, { ...newItem, purchased: false }];
      await this.updateList(userId, listId, { items: updatedItems });
    } catch (error) {
      console.error("Erro ao adicionar item:", error);
      throw error;
    }
  },


  // Remover item de uma lista
  async removeItem(userId, listId, itemIndex) {
    try {
      const list = await this.getList(userId, listId);
      if (!list) return;

      const updatedItems = list.items.filter((_, index) => index !== itemIndex);
      await this.updateList(userId, listId, { items: updatedItems });
    } catch (error) {
      console.error("Erro ao remover item:", error);
      throw error;
    }
  },

  // Atualizar item específico
  async updateItem(userId, listId, itemIndex, updatedItem) {
    try {
      const list = await this.getList(userId, listId);
      if (!list || !list.items[itemIndex]) return;

      const updatedItems = [...list.items];
      updatedItems[itemIndex] = { ...updatedItems[itemIndex], ...updatedItem };

      await this.updateList(userId, listId, { items: updatedItems });
    } catch (error) {
      console.error("Erro ao atualizar item:", error);
      throw error;
    }
  }
};
