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
    } catch {
      setError("Credenciais inválidas ou conta inexistente 😕");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0f172a] to-[#1e293b] px-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md bg-[#0b1220]/80 backdrop-blur-lg border border-cyan-500/30 rounded-2xl shadow-2xl p-10"
      >
        <h1 className="text-3xl font-bold text-cyan-400 text-center mb-2">🚀 CashPilot</h1>
        <p className="text-gray-400 text-center mb-10">Acesse seu painel de bordo financeiro</p>

        <form onSubmit={handleLogin} className="flex flex-col space-y-6">
          <div>
            <label className="text-sm text-gray-300 block mb-2">E-mail</label>
            <div className="relative group">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-[#0f172a] border border-gray-700 rounded-lg py-3 px-4 text-gray-100 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 outline-none transition-all placeholder-gray-500"
                placeholder="exemplo@email.com"
              />
              <span className="absolute inset-0 rounded-lg border border-cyan-400/20 opacity-0 group-hover:opacity-100 transition"></span>
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-300 block mb-2">Senha</label>
            <div className="relative group">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-[#0f172a] border border-gray-700 rounded-lg py-3 px-4 text-gray-100 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 outline-none transition-all placeholder-gray-500"
                placeholder="••••••••"
              />
              <span className="absolute inset-0 rounded-lg border border-cyan-400/20 opacity-0 group-hover:opacity-100 transition"></span>
            </div>
          </div>

          {error && <p className="text-red-400 text-center text-sm">{error}</p>}

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-gray-900 font-semibold py-3 rounded-lg shadow-md hover:shadow-cyan-500/20 transition"
          >
            Entrar
          </motion.button>
        </form>

        <div className="text-center text-gray-400 text-sm mt-8">
          Não tem uma conta?{" "}
          <Link to="/register" className="text-cyan-400 hover:text-cyan-300 transition">
            Registre-se
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
