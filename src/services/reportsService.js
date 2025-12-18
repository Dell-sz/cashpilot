// src/services/reportsService.js
import { db } from './firebaseConfig';


import {
  collection,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  getDocs,
  getDoc
} from 'firebase/firestore';

// Serviço para operações CRUD de relatórios
export const reportsService = {
  // Buscar todos os relatórios do usuário
  async getReports(userId) {
    try {
      const reportsRef = collection(db, "users", userId, "reports");
      const q = query(reportsRef, orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Erro ao buscar relatórios:", error);
      throw error;
    }
  },


  // Buscar relatório por ID
  async getReport(userId, reportId) {
    try {
      const reportRef = doc(db, "users", userId, "reports", reportId);
      const snapshot = await getDoc(reportRef);

      if (snapshot.exists()) {
        return { id: snapshot.id, ...snapshot.data() };
      }
      return null;
    } catch (error) {
      console.error("Erro ao buscar relatório:", error);
      throw error;
    }
  },

  // Deletar relatório específico
  async deleteReport(userId, reportId) {
    try {
      const reportRef = doc(db, "users", userId, "reports", reportId);
      await deleteDoc(reportRef);
      return true;
    } catch (error) {
      console.error("Erro ao deletar relatório:", error);
      throw error;
    }
  },

  // Buscar relatórios por ano
  async getReportsByYear(userId, year) {
    try {
      const reportsRef = collection(db, "users", userId, "reports");
      const q = query(
        reportsRef,
        where("year", "==", year),
        orderBy("month", "desc")
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Erro ao buscar relatórios por ano:", error);
      throw error;
    }
  },

  // Buscar relatório por mês e ano
  async getReportByMonthYear(userId, month, year) {
    try {
      const reportsRef = collection(db, "users", userId, "reports");
      const q = query(
        reportsRef,
        where("month", "==", month),
        where("year", "==", year)
      );
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() };
      }
      return null;
    } catch (error) {
      console.error("Erro ao buscar relatório por mês/ano:", error);
      throw error;
    }
  },

  // Deletar relatório por mês e ano
  async deleteReportByMonthYear(userId, month, year) {
    try {
      const report = await this.getReportByMonthYear(userId, month, year);
      if (report) {
        await this.deleteReport(userId, report.id);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Erro ao deletar relatório por mês/ano:", error);
      throw error;
    }
  }
};
