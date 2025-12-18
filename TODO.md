# TODO - Correção do Problema de Data no Calendário das Transações

## Problema Identificado

O calendário das transações está salvando a data selecionada no campo `date`, mas o componente `HomePage.js` está tentando ler do campo `createdAt`, causando discrepância de datas.

## Análise dos Arquivos

### 1. Transactions.js (Componente de transações)

- **Data salva**: `date: newTransaction.date` (data selecionada pelo usuário)
- **Campo usado**: `date` para salvar no Firestore

### 2. useTransactions.js (Hook de transações)

- **Campo automático**: `createdAt: new Date()` (timestamp automático da criação)
- **Problema**: Sobrescreve a data selecionada pelo usuário

### 3. HomePage.js (Página inicial)

- **Campo lido**: `createdAt` para atividade recente
- **Campo lido**: `createdAt` para cálculos de gastos
- **Problema**: Não está lendo o campo `date` correto

## Plano de Correção

### Passo 1: Corrigir o Hook useTransactions.js ✅ CONCLUÍDO

- ✅ Modificar o `addTransaction` para usar a data fornecida pelo usuário
- ✅ Não sobrescrever `createdAt` quando uma data específica é fornecida
- ✅ Manter `createdAt` apenas para timestamps automáticos

### Passo 2: Atualizar HomePage.js ✅ CONCLUÍDO

- ✅ Alterar a lógica para ler do campo `date` quando disponível
- ✅ Manter fallback para `createdAt` para transações antigas
- ✅ Ajustar cálculos de "gasto hoje" para usar a data correta

### Passo 3: Atualizar Transactions.js (se necessário)

- ✅ Já estava salvando a data corretamente no campo `date`

### Passo 4: Testes e Validação

- ✅ Correções implementadas e funcionando
- ✅ HomePage agora usa o campo `date` correto
- ✅ Cálculos de gastos por período funcionaram adequadamente

## Arquivos que Precisam ser Editados

1. `src/hooks/useTransactions.js`
2. `src/pages/HomePage.js`
3. `src/pages/Transactions.js` (se necessário)

## Resultado Esperado

- Data selecionada no calendário será salva corretamente
- HomePage mostrará as transações com as datas corretas
- Menu iniciar não apresentará mais erros relacionados a datas
- Cálculos de gastos por período funcionarão adequadamente
