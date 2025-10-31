import { createGlobalStyle } from "styled-components";

const GlobalStyle = createGlobalStyle`
  /* Reset e base */
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    transition: all 0.2s ease;
  }

  html {
    scroll-behavior: smooth;
  }

  body {
    font-family: "Inter", system-ui, sans-serif;
    background: radial-gradient(circle at top left, #0f172a, #0a0f1e);
    color: #f8fafc;
    overflow-x: hidden;
    min-height: 100vh;
    line-height: 1.5;
  }

  h1, h2, h3, h4 {
    color: #38bdf8;
    font-weight: 600;
    letter-spacing: 0.5px;
  }

  h1 {
    font-size: 2.2rem;
  }

  h2 {
    font-size: 1.6rem;
  }

  p {
    color: #cbd5e1;
  }

  a {
    text-decoration: none;
    color: #38bdf8;
    cursor: pointer;
    transition: 0.3s ease;
  }

  a:hover {
    color: #0ea5e9;
    text-shadow: 0 0 8px rgba(56,189,248,0.6);
  }

  /* Inputs e selects */
  input, select, textarea {
    background: #1e293b;
    border: 1px solid #334155;
    color: #f8fafc;
    padding: 10px 14px;
    border-radius: 8px;
    width: 100%;
    font-size: 0.95rem;
    margin-top: 6px;
    margin-bottom: 12px;
    outline: none;
    transition: border 0.2s ease, box-shadow 0.2s ease;
  }

  input:focus, select:focus, textarea:focus {
    border-color: #38bdf8;
    box-shadow: 0 0 0 2px rgba(56,189,248,0.3);
  }

  /* Botões */
  button {
    background: linear-gradient(90deg, #38bdf8, #0ea5e9);
    border: none;
    color: #0f172a;
    font-weight: 600;
    padding: 10px 16px;
    border-radius: 8px;
    cursor: pointer;
    transition: transform 0.15s ease, box-shadow 0.15s ease;
  }

  button:hover {
    transform: scale(1.05);
    box-shadow: 0 0 10px rgba(56,189,248,0.5);
  }

  button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  /* Containers */
  .card {
    background: rgba(30,41,59,0.7);
    border: 1px solid rgba(56,189,248,0.15);
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    backdrop-filter: blur(8px);
  }

  .section-title {
    color: #38bdf8;
    font-weight: 600;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  /* Scrollbar customizada */
  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-track {
    background: #1e293b;
  }

  ::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, #38bdf8, #0ea5e9);
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: #0ea5e9;
  }

  /* Pequeno brilho nos títulos */
  h1, h2 {
    text-shadow: 0 0 8px rgba(56,189,248,0.25);
  }

  /* ---- ÁREA DE HISTÓRICOS ---- */
  .transaction-list,
  .fixed-expense-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-top: 16px;
    padding: 16px;
    background: rgba(30, 41, 59, 0.6);
    border-radius: 12px;
    box-shadow: 0 0 12px rgba(56, 189, 248, 0.1);
  }

  /* Cada item do histórico */
  .transaction-item,
  .fixed-expense-item {
    background: rgba(15, 23, 42, 0.9);
    border: 1px solid rgba(56, 189, 248, 0.3);
    border-radius: 10px;
    padding: 12px 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: all 0.2s ease;
  }

  .transaction-item:hover,
  .fixed-expense-item:hover {
    transform: scale(1.02);
    background: rgba(30, 58, 138, 0.4);
    border-color: #38bdf8;
  }

  /* Texto dentro dos cards */
  .transaction-item p,
  .fixed-expense-item p {
    margin: 0;
    color: #e2e8f0;
    font-size: 0.95rem;
  }

  /* Título da seção */
  .section-title {
    font-size: 1.4rem;
    font-weight: 600;
    color: #38bdf8;
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 10px;
  }
`;

export default GlobalStyle;
