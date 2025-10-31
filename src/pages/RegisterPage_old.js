import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../services/firebaseConfig";
import { doc, setDoc } from "firebase/firestore";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accountType, setAccountType] = useState("pessoal"); // pessoal ou MEI
  const [error, setError] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, "users", userCred.user.uid), {
        email,
        accountType,
        createdAt: new Date(),
      });
      navigate("/dashboard");
    } catch (err) {
      setError("Erro ao criar conta. Tente novamente 😢");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f172a] to-[#1e293b] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-gray-900 border border-cyan-500/30 rounded-2xl shadow-xl p-8 w-full max-w-md"
      >
        <h1 className="text-3xl font-bold text-cyan-400 text-center mb-6">
          ✨ Criar Conta
        </h1>
        <p className="text-gray-400 text-center mb-8">
          Escolha o tipo de conta e comece a monitorar suas finanças
        </p>

        <form onSubmit={handleRegister} className="space-y-6">
          <div>
            <label className="text-sm text-gray-300 block mb-1">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-gray-100 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500 outline-none transition"
            />
          </div>

          <div>
            <label className="text-sm text-gray-300 block mb-1">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-gray-100 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500 outline-none transition"
            />
          </div>

          <div>
            <label className="text-sm text-gray-300 block mb-1">Tipo de Conta</label>
            <select
              value={accountType}
              onChange={(e) => setAccountType(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-gray-100 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500 outline-none transition"
            >
              <option value="pessoal">Pessoal</option>
              <option value="mei">MEI</option>
            </select>
          </div>

          {error && (
            <p className="text-red-400 text-center text-sm mt-2">{error}</p>
          )}

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="w-full bg-cyan-500 hover:bg-cyan-400 text-gray-900 font-semibold py-3 rounded-lg transition"
          >
            Criar Conta
          </motion.button>
        </form>

        <div className="text-center text-gray-400 text-sm mt-6">
          Já tem uma conta?{" "}
          <Link
            to="/login"
            className="text-cyan-400 hover:text-cyan-300 transition"
          >
            Entrar
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
