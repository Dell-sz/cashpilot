import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../services/firebaseConfig";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch (err) {
      setError("Credenciais inválidas ou conta inexistente 😕");
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
          🚀 CashPilot
        </h1>
        <p className="text-gray-400 text-center mb-8">
          Faça login para acessar seu painel de controle financeiro
        </p>

        <form onSubmit={handleLogin} className="space-y-6">
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

          {error && (
            <p className="text-red-400 text-center text-sm mt-2">{error}</p>
          )}

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="w-full bg-cyan-500 hover:bg-cyan-400 text-gray-900 font-semibold py-3 rounded-lg transition"
          >
            Entrar
          </motion.button>
        </form>

        <div className="text-center text-gray-400 text-sm mt-6">
          Não tem uma conta?{" "}
          <Link
            to="/register"
            className="text-cyan-400 hover:text-cyan-300 transition"
          >
            Registre-se
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
