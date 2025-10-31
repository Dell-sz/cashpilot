import React, { useState } from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../services/firebaseConfig";
import { auth } from "../services/firebaseConfig";

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("personal");
  const [error, setError] = useState("");
  const [isLogin, setIsLogin] = useState(true);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch (err) {
      setError("Credenciais inválidas ou conta inexistente 😕");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      // Save user type to Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        userType: userType,
        createdAt: new Date(),
      });
      navigate("/dashboard");
    } catch (err) {
      setError("Erro ao criar conta. Tente novamente 😕");
    }
  };

  return (
    <Container>
      <Card
        as={motion.div}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Logo>💸 <span>CashPilot</span></Logo>
        <h2>{isLogin ? "Entrar" : "Criar Conta"}</h2>
        <Form onSubmit={isLogin ? handleLogin : handleRegister}>
          {!isLogin && (
            <Input type="text" placeholder="Nome completo" required />
          )}
          <Input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <CheckboxContainer>
            {isLogin && (
              <>
                <input type="checkbox" id="remember" />
                <label htmlFor="remember">Lembrar de mim</label>
              </>
            )}
          </CheckboxContainer>
          {error && <ErrorMessage>{error}</ErrorMessage>}
          <Button type="submit">
            {isLogin ? "Entrar" : "Registrar"}
          </Button>
        </Form>
        <Switch>
          {isLogin ? (
            <>
              Não tem conta?{" "}
              <span onClick={() => setIsLogin(false)}>Cadastre-se</span>
              <br />
              <span onClick={() => navigate("/reset")} className="text-sm text-cyan-400 hover:underline cursor-pointer">
                Esqueceu a senha?
              </span>
            </>
          ) : (
            <>
              Já tem conta?{" "}
              <span onClick={() => setIsLogin(true)}>Entre</span>
            </>
          )}
        </Switch>
      </Card>
    </Container>
  );
};

export default LoginPage;

// ---------- ESTILOS ----------
const Container = styled.div`
  height: 100vh;
  width: 100%;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Card = styled.div`
  background: #1e293b;
  padding: 3rem;
  border-radius: 16px;
  box-shadow: 0 0 25px rgba(56, 189, 248, 0.2);
  width: 380px;
  text-align: center;
  color: #f1f5f9;
  border: 1px solid rgba(56, 189, 248, 0.2);

  h2 {
    margin-bottom: 1.5rem;
    color: #38bdf8;
  }
`;

const Logo = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: #38bdf8;
  margin-bottom: 1rem;

  span {
    color: #f8fafc;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Input = styled.input`
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 0.8rem;
  color: #f8fafc;
  font-size: 1rem;
  outline: none;
  transition: all 0.2s ease;

  &:focus {
    border-color: #38bdf8;
    box-shadow: 0 0 5px #38bdf8;
  }
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  font-size: 0.9rem;
  color: #94a3b8;

  input {
    accent-color: #38bdf8;
    margin-right: 8px;
  }
`;

const ErrorMessage = styled.p`
  color: #ef4444;
  font-size: 0.9rem;
  text-align: center;
`;

const Button = styled.button`
  background: #38bdf8;
  border: none;
  color: #0f172a;
  font-weight: 600;
  padding: 0.8rem;
  border-radius: 8px;
  cursor: pointer;
  transition: 0.3s;

  &:hover {
    background: #0ea5e9;
    transform: scale(1.03);
  }
`;

const Switch = styled.p`
  margin-top: 1rem;
  font-size: 0.9rem;
  color: #94a3b8;

  span {
    color: #38bdf8;
    cursor: pointer;
    font-weight: 600;
  }
`;
