# 💸 CashPilot - Aplicativo de Controle Financeiro

![React](https://img.shields.io/badge/React-19+-61DAFB?logo=react)
![Firebase](https://img.shields.io/badge/Firebase-Backend-FFCA28?logo=firebase)
![Styled Components](https://img.shields.io/badge/Styled%20Components-%23DB7093?logo=styledcomponents)
![Framer Motion](https://img.shields.io/badge/Framer%20Motion-Animations-0055FF?logo=framer)
![Recharts](https://img.shields.io/badge/Recharts-Charts-8DD6F9?logo=recharts)

> Aplicativo web React completo para controle financeiro pessoal e de pequenos negócios

🔗 **[Demo Online (Vercel)](https://cashpilot.vercel.app)** | 📱 **[Repositório GitHub](https://github.com/seu-usuario/cashpilot)**

## 📚 Sumário

- [📋 Visão Geral](#-visão-geral)
- [🛠️ Tecnologias Utilizadas](#️-tecnologias-utilizadas)
- [📁 Estrutura do Projeto](#-estrutura-do-projeto)
- [🔍 Detalhamento do Código](#-detalhamento-do-código)
- [🚀 Como Executar](#-como-executar)
- [📊 Funcionalidades Principais](#-funcionalidades-principais)
- [🔧 Conceitos Técnicos Importantes](#-conceitos-técnicos-importantes)
- [🎯 Padrões de Código](#-padrões-de-código)
- [📈 Próximas Melhorias](#-próximas-melhorias)

---

## 📋 Visão Geral

O **CashPilot** é um aplicativo web React completo para controle financeiro pessoal e de pequenos negócios, desenvolvido com Firebase como backend. Inclui autenticação de usuários, gerenciamento de transações, categorias, gastos fixos, geração de relatórios mensais em PDF e muito mais.

## 🛠️ Tecnologias Utilizadas

- **Frontend:**
  - React 19+ (com Hooks e Context API)
  - Framer Motion (animações e transições)
  - Styled Components (estilização customizada)
  - Recharts (gráficos interativos)
  - React Router DOM (roteamento SPA)
  - jsPDF & html2canvas (geração de PDFs)

- **Backend:**
  - Firebase Authentication (login, registro, reset de senha)
  - Firebase Firestore (banco de dados NoSQL)

- **Ferramentas de Desenvolvimento:**
  - Create React App
  - ESLint
  - VS Code

## 📁 Estrutura do Projeto

```
cashpilot/
├── public/
│   ├── index.html          # Arquivo HTML principal
│   ├── favicon.ico         # Ícone da aplicação
│   └── manifest.json       # Configuração PWA
├── src/
│   ├── components/         # Componentes reutilizáveis
│   ├── contexts/
│   │   └── AuthContext.js  # Contexto de autenticação
│   ├── pages/             # Páginas principais da aplicação
│   │   ├── LoginPage.js   # Página de login
│   │   ├── RegisterPage.js # Página de registro
│   │   ├── PasswordReset.js # Reset de senha
│   │   ├── Profile.js     # Perfil do usuário
│   │   ├── Dashboard.js   # Dashboard com resumos e gráficos
│   │   ├── Transactions.js # Gerenciamento de transações
│   │   ├── Categories.js  # Gerenciamento de categorias
│   │   ├── FixedExpenses.js # Gerenciamento de gastos fixos
│   │   └── Reports.js     # Relatórios mensais
│   ├── services/
│   │   └── firebaseConfig.js # Configuração do Firebase
│   ├── styles/
│   │   └── globalStyles.js # Estilos globais com Styled Components
│   ├── App.js             # Componente principal da aplicação
│   └── index.js           # Ponto de entrada da aplicação
├── package.json           # Dependências e scripts
└── README.md             # Este arquivo
```

## 🔍 Detalhamento do Código

### 1. `src/App.js` - Componente Principal

```javascript
import { useState } from "react";
import { motion } from "framer-motion";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import GlobalStyle from "./styles/globalStyles";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
// ... imports de páginas

function AppContent() {
  const { loading, logout } = useAuth();
  const [activePage, setActivePage] = useState("dashboard");

  // ... lógica de loading e renderização condicional

  const renderPage = () => {
    switch (activePage) {
      case "dashboard": return <Dashboard />;
      case "transactions": return <Transactions />;
      case "categories": return <Categories />;
      case "fixed": return <FixedExpenses />;
      case "reports": return <Reports />;
      case "profile": return <Profile />;
      default: return <Dashboard />;
    }
  };

  // ... definição de navItems e JSX da sidebar e main content
}

function AuthenticatedApp() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <AppContent />;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/reset" element={<PasswordReset />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/*" element={<AuthenticatedApp />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
```

**Explicação detalhada:**

- **Estrutura de Autenticação:** Usa `AuthProvider` para gerenciar estado global de autenticação. Rotas públicas (login, registro, reset) e protegidas (dashboard e outras).
- **Navegação:** Sidebar animada com navegação baseada em estado (`activePage`). Usa Framer Motion para animações.
- **Layout:** Design dark com gradientes, sidebar fixa de 250px e conteúdo principal responsivo.
- **Roteamento:** React Router com proteção de rotas - usuários não autenticados são redirecionados para login.

### 2. `src/contexts/AuthContext.js` - Contexto de Autenticação

```javascript
import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../services/firebaseConfig';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          setUserType(userDoc.data().userType);
        } else {
          setUserType('personal');
        }
      } else {
        setUser(null);
        setUserType(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // ... funções login, register, loginWithGoogle, logout

  const value = { user, userType, login, register, loginWithGoogle, logout, loading };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
```

**Explicação detalhada:**

- **Estado Global:** Gerencia usuário autenticado, tipo de conta (personal/business) e estado de loading.
- **Persistência:** `onAuthStateChanged` mantém o usuário logado entre sessões.
- **Integração Firestore:** Salva e recupera dados do usuário (tipo de conta, data de criação).
- **Métodos:** Login com email/senha, registro, login com Google, logout.

### 3. `src/services/firebaseConfig.js` - Configuração Firebase

```javascript
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDVlIrkTKXSKZD8xk_cvZlkYghVvVHliB8",
  authDomain: "cashpilot-72594.firebaseapp.com",
  projectId: "cashpilot-72594",
  storageBucket: "cashpilot-72594.firebasestorage.app",
  messagingSenderId: "787849063073",
  appId: "1:787849063073:web:cfcd07ff22f3e90d525ee0"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
```

**Explicação detalhada:**

- **Configuração:** Credenciais do projeto Firebase (substitua pelos seus valores).
- **Inicialização:** Cria instância da app Firebase e exporta auth e db para uso em toda a aplicação.
- **Segurança:** Nunca commite chaves reais em repositórios públicos.

### 4. `src/pages/Dashboard.js` - Dashboard Principal

**Estrutura Geral:**

- **Estados:** `transactions`, `fixedExpenses`, `categories`, `summary`, `loading`
- **useEffect:** Carrega dados do Firestore do usuário autenticado
- **Cálculos:** Computa totais de entradas, saídas, gastos fixos e saldo

**Funções Principais:**

```javascript
const loadData = async () => {
  if (!user) return;
  const transSnapshot = await getDocs(collection(db, "users", user.uid, "transactions"));
  const fixedSnapshot = await getDocs(collection(db, "users", user.uid, "fixed_expenses"));
  const catSnapshot = await getDocs(collection(db, "users", user.uid, "categories"));
  // ... processamento dos dados
};
```

**Renderização:**

- **Cards de Resumo:** 4 cards com entradas, saídas, gastos fixos e saldo
- **Gráficos:** Barra para resumo geral, pizza para distribuição por categoria
- **Animações:** Framer Motion para transições suaves

### 5. `src/pages/Reports.js` - Relatórios Mensais

**Funcionalidades:**

- **Geração de Relatórios:** Cria relatório mensal com totais calculados
- **Armazenamento:** Salva relatórios no Firestore (`users/{uid}/reports`)
- **Download PDF:** Usa jsPDF e html2canvas para gerar PDFs visuais
- **Histórico:** Lista todos os relatórios gerados com opção de download

**Estrutura do PDF:**

- **Cabeçalho:** Logo CashPilot e data do relatório
- **Resumo Visual:** Cards coloridos com entradas, saídas, gastos fixos e saldo
- **Transações:** Lista detalhada das transações do mês
- **Rodapé:** Copyright e data de geração

### 6. `src/pages/Profile.js` - Perfil do Usuário

**Funcionalidades:**

- **Informações da Conta:** Exibe email, tipo de conta e data de criação
- **Segurança:** Link para reset de senha
- **Exclusão de Conta:** Opção perigosa com confirmação de senha e reautenticação
- **Integração:** Remove dados do Firestore e conta do Firebase Auth

### 7. `src/styles/globalStyles.js` - Estilos Globais

```javascript
import { createGlobalStyle } from "styled-components";

const GlobalStyle = createGlobalStyle`
  /* Reset e base */
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: "Inter", system-ui, sans-serif;
    background: radial-gradient(circle at top left, #0f172a, #0a0f1e);
    color: #f8fafc;
    overflow-x: hidden;
    min-height: 100vh;
  }

  /* ... estilos customizados para inputs, buttons, cards, etc. */
`;

export default GlobalStyle;
```

**Explicação:**

- **Reset CSS:** Remove margens e paddings padrão
- **Tema Dark:** Gradientes e cores escuras consistentes
- **Componentes Base:** Estilos para inputs, buttons, cards reutilizáveis
- **Scrollbar Customizada:** Design moderno com cores do tema

## 🚀 Como Executar

1. **Clonar o repositório:**

   ```bash
   git clone https://github.com/seu-usuario/cashpilot.git
   cd cashpilot
   ```

2. **Instalar dependências:**

   ```bash
   npm install
   ```

3. **Configurar Firebase:**
   - Criar projeto no [Firebase Console](https://console.firebase.google.com/)
   - Habilitar Authentication (Email/Password e Google)
   - Habilitar Firestore Database
   - Copiar credenciais para `src/services/firebaseConfig.js`

4. **Executar aplicação:**

   ```bash
   npm start
   ```

5. **Acessar:** <http://localhost:3000>

## 📊 Funcionalidades Principais

### Autenticação Completa

- **Registro:** Criação de conta com email/senha e tipo de conta (Pessoal/MEI)
- **Login:** Autenticação com email/senha ou Google
- **Reset de Senha:** Recuperação via email
- **Perfil:** Visualização e gerenciamento de conta, exclusão de conta

### Dashboard

- **Resumo Financeiro:** Cards com totais de entradas, saídas, gastos fixos e saldo
- **Gráficos Interativos:**
  - Barra: Comparação visual de entradas, saídas e gastos fixos
  - Pizza: Distribuição por categoria (entradas e saídas)
  - Pizza: Gastos fixos individuais

### Transações

- **CRUD Completo:** Criar, ler, atualizar, deletar transações
- **Categorização:** Vinculação com categorias existentes ou criação de novas
- **Datas:** Controle temporal das transações
- **Limpeza em Massa:** Opção de remover todas as transações

### Categorias

- **Gerenciamento Visual:** Interface intuitiva para criar/editar/deletar
- **Cores Personalizáveis:** Cada categoria tem cor associada
- **Edição Inline:** Modificar nome e cor diretamente na lista

### Gastos Fixos

- **Controle Mensal:** Cadastro de despesas recorrentes
- **Cálculo Automático:** Total atualizado dinamicamente
- **Interface Simples:** Foco na usabilidade

### Relatórios

- **Geração Mensal:** Relatórios automáticos com dados do mês atual
- **Exportação PDF:** Downloads visuais e profissionais
- **Histórico:** Acesso a relatórios anteriores

## 🔧 Conceitos Técnicos Importantes

### React Context API

- **AuthContext:** Gerenciamento global de autenticação
- **Provider Pattern:** `AuthProvider` envolve a aplicação
- **Custom Hook:** `useAuth()` para acesso ao contexto

### Firebase Security

- **Regras de Segurança:** Dados isolados por usuário (`users/{uid}/collections`)
- **Reautenticação:** Necessária para operações sensíveis (exclusão de conta)
- **Estrutura de Dados:** Subcoleções para organizar dados por usuário

### Styled Components

- **CSS-in-JS:** Estilos encapsulados em componentes
- **Tema Global:** `GlobalStyle` para consistência
- **Dinâmico:** Props para variações de estilo

### Framer Motion

- **Animações Declarativas:** `motion.div`, `initial`, `animate`
- **Interações:** `whileHover`, `whileTap` para feedback visual
- **Sequências:** `delay` para animações em cascata

### jsPDF + html2canvas

- **Geração de PDF:** Converte HTML/CSS para documento PDF
- **Captura Visual:** `html2canvas` renderiza elementos DOM
- **Customização:** Layout profissional com branding

## 🎯 Padrões de Código

### Estrutura de Componentes

- **Separação por Domínio:** Páginas, componentes, contexts, services
- **Responsabilidade Única:** Cada arquivo/componente tem um propósito claro
- **Reutilização:** Funções utilitárias e componentes base

### Gerenciamento de Estado

- **Local vs Global:** Estados locais com `useState`, global com Context
- **Efeitos Colaterais:** `useEffect` para carregamento de dados
- **Otimização:** `useCallback` para funções estáveis

### Tratamento de Erros

- **Try/Catch:** Em todas as operações assíncronas
- **Feedback Visual:** Alertas e mensagens de erro para usuário
- **Logging:** Console para debug durante desenvolvimento

### Segurança

- **Validação:** Inputs validados no frontend e backend
- **Autenticação:** Rotas protegidas e verificação de usuário
- **Dados Sensíveis:** Senhas não armazenadas localmente

## 📈 Próximas Melhorias

- **PWA (Progressive Web App):** Instalação offline e notificações
- **Sincronização Offline:** Funcionamento sem internet
- **Testes Automatizados:** Cobertura completa com Jest/React Testing Library
- **TypeScript:** Tipagem estática para maior robustez
- **Multi-idioma:** Suporte a português e inglês
- **Exportação Avançada:** Excel, CSV além de PDF
- **Orçamentos:** Definição e monitoramento de metas
- **Relatórios Personalizados:** Filtros por período e categoria
- **Integração Bancária:** Importação automática de transações

---

Este README serve como documentação completa do projeto CashPilot, explicando cada aspecto técnico e funcional para fins educacionais e de referência para desenvolvimento futuro.
