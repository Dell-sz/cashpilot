import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../services/firebaseConfig";
import { useNavigate } from 'react-router-dom';

export default function PasswordReset() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("✅ Um link de redefinição foi enviado para seu e-mail.");
    } catch (error) {
      console.error("Erro ao enviar link de redefinição:", error);
      setMessage("⚠️ Erro ao enviar o link. Verifique o e-mail digitado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#0f172a] text-white min-h-screen flex flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-[#1e293b] p-8 rounded-xl shadow-lg w-[350px]"
      >
        <div className="text-center mb-6">
          <h2 className="text-2xl font-semibold text-[#38bdf8]">Recuperar Senha</h2>
          <p className="text-gray-400 text-sm mt-2">Digite seu e-mail para receber o link de redefinição</p>
        </div>
        <form onSubmit={handleReset} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Digite seu e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-3 rounded-md bg-[#0f172a] text-white border border-[#38bdf8] focus:outline-none focus:ring-2 focus:ring-[#38bdf8]"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-[#38bdf8] text-[#0f172a] font-semibold py-3 rounded-md hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Enviando..." : "Enviar Link"}
          </button>
        </form>
        {message && (
          <p className={`mt-4 text-center text-sm ${message.includes("✅") ? "text-green-400" : "text-red-400"}`}>
            {message}
          </p>
        )}
        <button
          onClick={() => navigate("/login")}
          className="mt-4 text-[#38bdf8] hover:underline text-sm"
        >
          Voltar ao Login
        </button>
      </motion.div>
    </div>
  );
}
