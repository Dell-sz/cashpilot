# CashPilot - Aplicativo de Controle Financeiro

## 📋 Visão Geral

O **CashPilot** é um aplicativo web React para controle financeiro pessoal, desenvolvido com Firebase como backend. Permite gerenciar transações, categorias, gastos fixos e visualizar dashboards com gráficos interativos.

## 🛠️ Tecnologias Utilizadas

- **Frontend:**
  - React 18+ (com Hooks)
  - Framer Motion (animações)
  - Tailwind CSS (estilização)
  - Recharts (gráficos)
  - React Router (roteamento)

- **Backend:**
  - Firebase Firestore (banco de dados NoSQL)
  - Firebase SDK

- **Ferramentas de Desenvolvimento:**
  - Create React App
  - ESLint
  - VS Code

## 📁 Estrutura do Projeto

```
cashpilot/
├── public/
│   ├── index.html          # Arquivo HTML principal
│   └── favicon.ico         # Ícone da aplicação
├── src/
│   ├── components/         # Componentes reutilizáveis
│   ├── pages/             # Páginas principais da aplicação
│   │   ├── Dashboard.js   # Dashboard com resumos e gráficos
│   │   ├── Transactions.js # Gerenciamento de transações
│   │   ├── Categories.js  # Gerenciamento de categorias
│   │   └── FixedExpenses.js # Gerenciamento de gastos fixos
│   ├── services/
│   │   └── firebaseConfig.js # Configuração do Firebase
│   ├── styles/
│   │   └── globalStyles.js # Estilos globais CSS
│   ├── App.js             # Componente principal da aplicação
│   ├── index.js           # Ponto de entrada da aplicação
│   └── index.css          # Estilos CSS globais
├── package.json           # Dependências e scripts
└── README.md             # Este arquivo
```

## 🔍 Detalhamento do Código

### 1. `src/App.js` - Componente Principal

```javascript
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Categories from './pages/Categories';
import FixedExpenses from './pages/FixedExpenses';
import './styles/globalStyles.js';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Sidebar />
        <main className="ml-64 p-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/fixed-expenses" element={<FixedExpenses />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
```

**Explicação detalhada:**

- **Importações:** Carrega React, React Router para navegação, Framer Motion para animações, componentes das páginas e estilos globais.
- **Estrutura JSX:** Usa `BrowserRouter` para gerenciar rotas. O layout principal tem uma sidebar fixa (64px à esquerda) e o conteúdo principal com padding.
- **Background:** Gradiente escuro de slate para tema dark.
- **Rotas:** Define 4 rotas principais: dashboard (página inicial), transações, categorias e gastos fixos.
- **Sidebar:** Componente de navegação lateral (não mostrado no código, mas referenciado).

### 2. `src/services/firebaseConfig.js` - Configuração Firebase

```javascript
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
```

**Explicação detalhada:**

- **Importações:** Inicializa o Firebase App e obtém a instância do Firestore.
- **Configuração:** Objeto com credenciais do projeto Firebase (deve ser preenchido com dados reais).
- **Inicialização:** Cria a instância da aplicação Firebase e exporta o banco de dados Firestore.
- **Uso:** Todos os componentes usam `db` para operações CRUD no Firestore.

### 3. `src/pages/Dashboard.js` - Dashboard Principal

**Estrutura Geral:**

- **Estados:** `transactions`, `fixedExpenses`, `categories`, `summary`
- **useEffect:** Carrega dados do Firestore ao montar o componente
- **Cálculos:** Computa totais de entradas, saídas, gastos fixos e saldo

**Funções Principais:**

```javascript
const loadData = async () => {
  // Carrega transações, gastos fixos e categorias do Firestore
  // Calcula totais e atualiza estados
};
```

**Renderização:**

- **Cards de Resumo:** 4 cards mostrando entradas, saídas, gastos fixos e saldo
- **Gráficos:** Barra para resumo geral, pizza para saídas/categorias, entradas/categorias e gastos fixos
- **Animações:** Usa Framer Motion para transições suaves

**Detalhes Técnicos:**

- **Filtragem:** Usa `filter()` para separar entradas e saídas baseado em `type` ou `tipo`
- **Mapeamento:** Cria objetos `expenseMap` e `incomeMap` para agrupar por categoria
- **Cores:** Função `getColorForCategory()` busca cores das categorias no Firestore
- **Formatação:** Usa `toFixed(2)` para 2 casas decimais nos valores

### 4. `src/pages/Transactions.js` - Gerenciamento de Transações

**Estados:**

- `transactions`: Lista de transações
- `categories`: Lista de categorias disponíveis
- `newTransaction`: Objeto para nova transação
- `isAdding`, `isClearing`: Estados de loading

**Funções CRUD:**

- `fetchTransactions()`: Carrega transações do Firestore
- `handleAddTransaction()`: Adiciona nova transação com validação
- `handleClearTransactions()`: Remove todas as transações
- `deleteTransaction(id)`: Remove transação específica

**Formulário:**

- Campos: Tipo (Entrada/Saída), Categoria (select com opção "Outra"), Valor, Data
- Validação: Verifica se categoria e valor estão preenchidos
- Enter key: Permite adicionar pressionando Enter

**Lista de Transações:**

- Ordenação: Por data decrescente (`sort()` com `new Date()`)
- Formatação: `formatDate()` e `formatCurrency()` para exibição
- Cores: Verde para entradas, vermelho para saídas

### 5. `src/pages/Categories.js` - Gerenciamento de Categorias

**Estados:**

- `categories`: Lista de categorias
- `newCategory`: Objeto com name e color
- `isAdding`: Estado de loading

**Funções CRUD:**

- `fetchCategories()`: Carrega categorias do Firestore
- `handleAddCategory()`: Adiciona categoria com validação
- `handleDeleteCategory()`: Remove categoria com confirmação
- `handleUpdateCategory()`: Atualiza nome e cor inline

**Interface:**

- **Formulário:** Input para nome e color picker
- **Lista:** Cada categoria tem inputs editáveis para nome e cor
- **Inline Editing:** Permite editar diretamente nos campos
- **Confirmação:** `window.confirm()` antes de deletar

### 6. `src/pages/FixedExpenses.js` - Gastos Fixos

**Estados:**

- `fixedList`: Array de gastos fixos
- `name`, `value`: Campos do formulário
- `isAdding`: Estado de loading

**Funções:**

- `loadFixedExpenses()`: Carrega gastos fixos
- `addFixedExpense()`: Adiciona novo gasto fixo
- `removeFixed()`: Remove gasto fixo específico

**Cálculo:**

- `totalFixedExpenses`: Soma de todos os valores usando `reduce()`

**Interface:**

- **Card de Resumo:** Mostra total de gastos fixos
- **Formulário:** Nome e valor mensal
- **Lista:** Cards com nome, valor e botão remover

### 7. `src/styles/globalStyles.js` - Estilos Globais

```javascript
import './index.css';

// Estilos globais adicionais podem ser definidos aqui
```

**Explicação:**

- Importa estilos base do Tailwind CSS
- Pode conter estilos customizados adicionais

### 8. `src/index.js` - Ponto de Entrada

```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

**Explicação:**

- Cria o root React e renderiza o componente App
- Usa React 18+ com `createRoot`
- StrictMode para desenvolvimento

## 🚀 Como Executar

1. **Instalar dependências:**

   ```bash
   npm install
   ```

2. **Configurar Firebase:**
   - Criar projeto no Firebase Console
   - Habilitar Firestore
   - Copiar credenciais para `firebaseConfig.js`

3. **Executar aplicação:**

   ```bash
   npm start
   ```

4. **Acessar:** <http://localhost:3000>

## 📊 Funcionalidades Principais

### Dashboard

- **Resumo Financeiro:** Cards com totais de entradas, saídas, gastos fixos e saldo
- **Gráficos Interativos:**
  - Barra: Comparação visual de entradas, saídas e gastos fixos
  - Pizza: Distribuição por categoria (entradas e saídas)
  - Pizza: Gastos fixos individuais

### Transações

- **CRUD Completo:** Criar, ler, atualizar, deletar transações
- **Categorização:** Vinculação com categorias existentes
- **Criação de Categorias:** Opção de criar categoria nova durante transação
- **Datas:** Controle temporal das transações
- **Limpeza em Massa:** Opção de remover todas as transações

### Categorias

- **Gerenciamento Visual:** Interface intuitiva para criar/editar/deletar
- **Cores Personalizáveis:** Cada categoria tem cor associada
- **Edição Inline:** Modificar nome e cor diretamente na lista
- **Validação:** Prevenção de categorias vazias

### Gastos Fixos

- **Controle Mensal:** Cadastro de despesas recorrentes
- **Cálculo Automático:** Total atualizado dinamicamente
- **Interface Simples:** Foco na usabilidade

## 🔧 Conceitos Técnicos Importantes

### React Hooks

- **useState:** Gerenciamento de estado local
- **useEffect:** Efeitos colaterais (carregamento de dados)

### Firebase Firestore

- **Coleções:** `transactions`, `categories`, `fixed_expenses`
- **Operações:** `getDocs()`, `addDoc()`, `updateDoc()`, `deleteDoc()`
- **Estrutura de Dados:** Documentos com campos variados

### Tailwind CSS

- **Classes Utilitárias:** Estilização rápida e consistente
- **Responsividade:** `md:grid-cols-2`, `sm:flex-row`
- **Tema Dark:** Cores escuras com gradientes

### Framer Motion

- **Animações:** `motion.div`, `initial`, `animate`, `transition`
- **Interações:** `whileHover`, `whileTap`
- **Sequências:** `delay` para animações em cascata

### Recharts

- **Componentes:** `BarChart`, `PieChart`, `ResponsiveContainer`
- **Dados:** Arrays de objetos com `name` e `value`
- **Customização:** `Tooltip`, `Legend`, cores dinâmicas

## 🎯 Padrões de Código

### Estrutura de Componentes

- **Separação de Responsabilidades:** Cada página tem sua lógica isolada
- **Reutilização:** Funções utilitárias (formatação, cálculos)
- **Estado Centralizado:** Dados vêm do Firestore, não de props

### Tratamento de Erros

- **Try/Catch:** Em todas as operações assíncronas
- **Alertas:** Feedback visual para usuário
- **Console Logging:** Debug durante desenvolvimento

### Performance

- **Lazy Loading:** Dados carregados apenas quando necessário
- **Memoização:** Evita recálculos desnecessários
- **Otimização:** `useEffect` com dependências corretas

## 📈 Próximas Melhorias

- Autenticação de usuários
- Exportação de relatórios (PDF/Excel)
- Notificações de orçamento
- Sincronização offline
- Testes automatizados
- TypeScript para tipagem
- PWA (Progressive Web App)

---

Este README serve como documentação completa do projeto CashPilot, explicando cada aspecto técnico e funcional para fins educacionais.
