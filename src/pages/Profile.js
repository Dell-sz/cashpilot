import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { deleteUser, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { doc, deleteDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../services/firebaseConfig";

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }
      } catch (error) {
        console.error("Erro ao carregar dados do usuário:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [user]);

  const handleDeleteAccount = async () => {
    const password = prompt("Confirme sua senha para excluir a conta:");
    if (!password) return;

    setDeleteLoading(true);
    setMessage("");

    try {
      // Reautentica antes de deletar
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);

      // Deleta dados do Firestore (coleções do usuário)
      await deleteDoc(doc(db, "users", user.uid));

      // Deleta a conta do Auth
      await deleteUser(user);

      alert("Conta excluída com sucesso 💀");
      logout();
      navigate("/login");
    } catch (error) {
      console.error("Erro ao excluir conta:", error);
      setMessage("Erro ao excluir conta. Verifique sua senha e tente novamente.");
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    );
  }

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
          👤 Perfil do Usuário
        </h1>
        <p className="text-gray-300 mb-6 text-lg">
          Gerencie suas informações e configurações de conta
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl shadow-xl border border-gray-700/50 mb-8"
      >
        <h3 className="text-xl font-semibold mb-4 text-gray-200">Informações da Conta</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">E-mail</label>
            <p className="text-cyan-400">{user?.email}</p>
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Tipo de Conta</label>
            <p className="text-cyan-400">{userData?.userType === "personal" ? "Pessoal" : "MEI"}</p>
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Data de Criação</label>
            <p className="text-cyan-400">
              {userData?.createdAt?.toDate ? userData.createdAt.toDate().toLocaleDateString('pt-BR') : 'N/A'}
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl shadow-xl border border-gray-700/50 mb-8"
      >
        <h3 className="text-xl font-semibold mb-4 text-gray-200">Segurança</h3>
        <div className="space-y-4">
          <button
            onClick={() => navigate("/reset")}
            className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 hover:scale-105"
          >
            🔑 Redefinir Senha
          </button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-gradient-to-br from-red-900/50 to-red-800/50 p-6 rounded-xl shadow-xl border border-red-500/30"
      >
        <h3 className="text-xl font-semibold mb-4 text-red-200">Zona de Perigo</h3>
        <p className="text-red-300 text-sm mb-4">
          Atenção: Esta ação é irreversível. Todos os seus dados serão perdidos permanentemente.
        </p>
        <button
          onClick={handleDeleteAccount}
          disabled={deleteLoading}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {deleteLoading ? "Excluindo..." : "🗑️ Excluir Conta"}
        </button>
        {message && (
          <p className="mt-4 text-red-400 text-sm">{message}</p>
        )}
      </motion.div>
    </motion.div>
  );
}
