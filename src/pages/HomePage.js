
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import {
  FaPlus, FaShoppingCart, FaFilePdf,
  FaChartLine, FaBell, FaHistory,
  FaArrowRight, FaCalendarDay, FaWallet, FaEye, FaExclamationTriangle
} from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";
import { useTransactions } from "../hooks/useTransactions";
import { useFixedExpenses } from "../hooks/useFixedExpenses";


const HomePage = ({ onNavigate }) => {
  const { user } = useAuth();
  const { transactions } = useTransactions();
  const { fixedExpenses } = useFixedExpenses();
  const [greeting, setGreeting] = useState('');
  const [quickStats, setQuickStats] = useState(null);
  const [showPendingModal, setShowPendingModal] = useState(false);

  useEffect(() => {
    // Saudação baseada no horário
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Bom dia');
    else if (hour < 18) setGreeting('Boa tarde');
    else setGreeting('Boa noite');

    // Carregar estatísticas rápidas
    loadQuickStats();
  }, [transactions, fixedExpenses]);


  const calculateBalance = () => {
    if (!transactions || transactions.length === 0) {
      return 0; // Se não há transações, saldo é zero
    }

    return transactions.reduce((total, transaction) => {
      const amount = parseFloat(transaction.amount || 0);
      return total + amount;
    }, 0);
  };


  const calculateTodaySpent = () => {
    const today = new Date().toDateString();
    return transactions
      .filter(transaction => {
        // Usar 'date' quando disponível, fallback para 'createdAt'
        const transactionDate = new Date(transaction.date || transaction.createdAt?.toDate?.() || transaction.createdAt).toDateString();
        return transactionDate === today && transaction.amount < 0;
      })
      .reduce((total, transaction) => total + Math.abs(parseFloat(transaction.amount || 0)), 0);
  };

  const getPendingItems = () => {
    const pending = [];

    // Gastos fixos próximos ao vencimento (próximos 7 dias)
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    fixedExpenses.forEach(expense => {
      if (expense.dueDate) {
        const dueDate = new Date(expense.dueDate);
        if (dueDate <= nextWeek && dueDate >= new Date()) {
          pending.push({
            type: 'fixed_expense',
            title: expense.name,
            amount: Math.abs(parseFloat(expense.value || 0)),
            dueDate: dueDate,
            description: `Gasto fixo - Vence em ${dueDate.toLocaleDateString('pt-BR')}`
          });
        }
      }
    });


    // Transações com valor alto (> R$ 500) que precisam de atenção
    transactions.forEach(transaction => {
      if (Math.abs(parseFloat(transaction.amount || 0)) > 500) {
        pending.push({
          type: 'high_value',
          title: transaction.description || 'Transação',
          amount: Math.abs(parseFloat(transaction.amount || 0)),
          // Usar 'date' quando disponível, fallback para 'createdAt'
          date: new Date(transaction.date || transaction.createdAt?.toDate?.() || transaction.createdAt),
          description: `Transação de alto valor - ${Math.abs(parseFloat(transaction.amount || 0)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`
        });
      }
    });

    return pending.sort((a, b) => (a.dueDate || a.date) - (b.dueDate || b.date));
  };

  const loadQuickStats = () => {
    const balance = calculateBalance();
    const todaySpent = calculateTodaySpent();
    const pendingItems = getPendingItems();
    const pendingCount = pendingItems.length;

    setQuickStats({
      balance,
      pending: pendingCount,
      todaySpent,
      shoppingLists: 0, // TODO: Implementar quando tiver hook de listas
      pendingItems: pendingItems
    });
  };


  const getUserDisplayName = () => {
    if (user?.displayName) {
      return user.displayName.split(' ')[0]; // Primeiro nome
    }
    if (user?.email) {
      return user.email.split('@')[0]; // Parte do email antes do @
    }
    return 'Usuário';
  };


  const getRecentTransactions = () => {
    return transactions
      .sort((a, b) => new Date(b.date || b.createdAt?.toDate?.() || b.createdAt) - new Date(a.date || a.createdAt?.toDate?.() || a.createdAt))
      .slice(0, 3)
      .map(transaction => {
        // Usar 'date' quando disponível, fallback para 'createdAt'
        const date = new Date(transaction.date || transaction.createdAt?.toDate?.() || transaction.createdAt);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        let timeText;
        if (diffDays === 0) {
          const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
          if (diffHours === 0) {
            const diffMinutes = Math.floor(diffTime / (1000 * 60));
            timeText = diffMinutes <= 1 ? 'Agora mesmo' : `${diffMinutes} min atrás`;
          } else {
            timeText = diffHours === 1 ? '1h atrás' : `${diffHours}h atrás`;
          }
        } else if (diffDays === 1) {
          timeText = 'Ontem';
        } else if (diffDays < 7) {
          timeText = `${diffDays} dias`;
        } else {
          timeText = date.toLocaleDateString('pt-BR');
        }

        return {
          type: 'transaction',
          label: transaction.description || 'Transação',
          amount: parseFloat(transaction.amount || 0),
          time: timeText,
          date: date
        };
      });
  };

  const quickActions = [
    {
      id: 'new-transaction',
      label: 'Nova Transação',
      icon: <FaPlus />,
      color: '#667eea',
      onClick: () => onNavigate('transactions')
    },
    {
      id: 'new-list',
      label: 'Nova Lista',
      icon: <FaShoppingCart />,
      color: '#10b981',
      onClick: () => onNavigate('shopping')
    },
    {
      id: 'report',
      label: 'Relatório',
      icon: <FaFilePdf />,
      color: '#f59e0b',
      onClick: () => onNavigate('reports')
    },
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <FaChartLine />,
      color: '#8b5cf6',
      onClick: () => onNavigate('dashboard')
    }
  ];


  const recentItems = getRecentTransactions();

  return (
    <HomeContainer>

      {/* Header com saudação */}
      <WelcomeSection>
        <div>
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >

            {greeting}, {getUserDisplayName()}! 👋
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Hoje é {new Date().toLocaleDateString('pt-BR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long'
            })}
          </motion.p>
        </div>
        <DateBadge>
          <FaCalendarDay />
          <span>{new Date().getDate()}</span>
        </DateBadge>
      </WelcomeSection>

      {/* Cartões de status rápido */}
      {quickStats && (
        <StatsGrid>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <StatCard color="blue">
              <StatIcon><FaWallet /></StatIcon>
              <StatInfo>
                <StatValue>R$ {quickStats.balance.toFixed(2)}</StatValue>
                <StatLabel>Saldo Disponível</StatLabel>
              </StatInfo>
            </StatCard>
          </motion.div>


          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <StatCard color="orange" onClick={() => setShowPendingModal(true)} style={{ cursor: 'pointer' }}>
              <StatIcon><FaBell /></StatIcon>
              <StatInfo>
                <StatValue>{quickStats.pending}</StatValue>
                <StatLabel>Pendências {quickStats.pending > 0 && <FaEye style={{ marginLeft: '0.5rem', fontSize: '0.75rem' }} />}</StatLabel>
              </StatInfo>
            </StatCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <StatCard color="red">
              <StatIcon><FaHistory /></StatIcon>
              <StatInfo>
                <StatValue>R$ {quickStats.todaySpent.toFixed(2)}</StatValue>
                <StatLabel>Gasto Hoje</StatLabel>
              </StatInfo>
            </StatCard>
          </motion.div>
        </StatsGrid>
      )}

      {/* Ações Rápidas */}
      <Section>
        <SectionTitle>Ações Rápidas</SectionTitle>
        <ActionsGrid>
          {quickActions.map((action, index) => (
            <motion.div
              key={action.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 + (index * 0.1) }}
            >
              <ActionCard
                color={action.color}
                onClick={action.onClick}
              >
                <ActionIcon>{action.icon}</ActionIcon>
                <ActionLabel>{action.label}</ActionLabel>
                <ActionArrow><FaArrowRight /></ActionArrow>
              </ActionCard>
            </motion.div>
          ))}
        </ActionsGrid>
      </Section>

      {/* Atividade Recente */}
      <Section>
        <SectionTitle>Atividade Recente</SectionTitle>
        <ActivityList>
          {recentItems.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.8 + (idx * 0.1) }}
            >
              <ActivityItem>
                <ActivityIcon type={item.type}>
                  {item.type === 'transaction' ? '💰' : '🛒'}
                </ActivityIcon>
                <ActivityInfo>
                  <ActivityLabel>{item.label}</ActivityLabel>
                  <ActivityTime>{item.time}</ActivityTime>
                </ActivityInfo>
                <ActivityAmount type={item.type}>
                  {item.type === 'transaction'
                    ? `R$ ${item.amount.toFixed(2)}`
                    : `${item.items} itens`
                  }
                </ActivityAmount>
              </ActivityItem>
            </motion.div>
          ))}
        </ActivityList>
      </Section>


      {/* Link rápido para seções */}
      <QuickLinks>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.2 }}
        >
          <LinkButton onClick={() => onNavigate('transactions')}>
            Ver todas as transações →
          </LinkButton>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.3 }}
        >
          <LinkButton onClick={() => onNavigate('shopping')}>
            Ver todas as listas →
          </LinkButton>
        </motion.div>
      </QuickLinks>

      {/* Modal de Pendências */}
      {showPendingModal && (
        <ModalOverlay onClick={() => setShowPendingModal(false)}>
          <ModalContent
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={(e) => e.stopPropagation()}
          >
            <ModalHeader>
              <ModalTitle>
                <FaExclamationTriangle style={{ color: '#f59e0b', marginRight: '0.5rem' }} />
                Pendências ({quickStats?.pending || 0})
              </ModalTitle>
              <CloseButton onClick={() => setShowPendingModal(false)}>×</CloseButton>
            </ModalHeader>
            <ModalBody>
              {quickStats?.pendingItems && quickStats.pendingItems.length > 0 ? (
                <PendingList>
                  {quickStats.pendingItems.map((item, index) => (
                    <PendingItem key={index}>
                      <PendingIcon type={item.type}>
                        {item.type === 'fixed_expense' ? '📅' : '💰'}
                      </PendingIcon>
                      <PendingInfo>
                        <PendingTitle>{item.title}</PendingTitle>
                        <PendingDescription>{item.description}</PendingDescription>
                      </PendingInfo>
                      <PendingAmount type={item.type}>
                        {item.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </PendingAmount>
                    </PendingItem>
                  ))}
                </PendingList>
              ) : (
                <EmptyState>
                  <FaBell style={{ fontSize: '3rem', color: '#94a3b8', marginBottom: '1rem' }} />
                  <p>Nenhuma pendência encontrada</p>
                </EmptyState>
              )}
            </ModalBody>
          </ModalContent>
        </ModalOverlay>
      )}
    </HomeContainer>
  );
};

// Estilos
const HomeContainer = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const WelcomeSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  
  h1 {
    font-size: 2rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin: 0;
  }
  
  p {
    color: #94a3b8;
    margin-top: 0.5rem;
    margin: 0;
  }
`;

const DateBadge = styled.div`
  background: rgba(102, 126, 234, 0.1);
  border: 2px solid #667eea;
  border-radius: 50%;
  width: 70px;
  height: 70px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  
  span {
    font-size: 1.5rem;
    font-weight: bold;
    color: #f8fafc;
  }
  
  svg {
    font-size: 1rem;
    color: #667eea;
    margin-bottom: 0.25rem;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: ${props => {
    switch (props.color) {
      case 'blue': return 'linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(102, 126, 234, 0.05))';
      case 'orange': return 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(245, 158, 11, 0.05))';
      case 'red': return 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.05))';
      default: return 'rgba(30, 41, 59, 0.5)';
    }
  }};
  border: 1px solid ${props => {
    switch (props.color) {
      case 'blue': return 'rgba(102, 126, 234, 0.3)';
      case 'orange': return 'rgba(245, 158, 11, 0.3)';
      case 'red': return 'rgba(239, 68, 68, 0.3)';
      default: return 'rgba(148, 163, 184, 0.1)';
    }
  }};
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const StatIcon = styled.div`
  font-size: 1.5rem;
  color: #667eea;
`;

const StatInfo = styled.div`
  flex: 1;
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: #f8fafc;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: #94a3b8;
`;

const Section = styled.div`
  margin-bottom: 2.5rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  color: #f8fafc;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ActionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
`;

const ActionCard = styled.div`
  background: rgba(30, 41, 59, 0.7);
  border: 1px solid ${props => props.color}33;
  border-radius: 10px;
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    transform: translateY(-2px);
    border-color: ${props => props.color};
    background: rgba(30, 41, 59, 0.9);
  }
`;

const ActionIcon = styled.div`
  font-size: 1.25rem;
  color: #667eea;
`;

const ActionLabel = styled.div`
  flex: 1;
  font-weight: 500;
  color: #f8fafc;
`;

const ActionArrow = styled.div`
  color: #94a3b8;
  font-size: 0.875rem;
`;

const ActivityList = styled.div`
  background: rgba(30, 41, 59, 0.5);
  border-radius: 12px;
  border: 1px solid rgba(148, 163, 184, 0.1);
  overflow: hidden;
`;

const ActivityItem = styled.div`
  display: flex;
  align-items: center;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background: rgba(148, 163, 184, 0.05);
  }
`;

const ActivityIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: ${props =>
    props.type === 'transaction'
      ? 'rgba(102, 126, 234, 0.1)'
      : 'rgba(16, 185, 129, 0.1)'
  };
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  margin-right: 1rem;
`;

const ActivityInfo = styled.div`
  flex: 1;
`;

const ActivityLabel = styled.div`
  font-weight: 500;
  color: #f8fafc;
`;

const ActivityTime = styled.div`
  font-size: 0.875rem;
  color: #94a3b8;
`;

const ActivityAmount = styled.div`
  font-weight: 600;
  color: ${props =>
    props.type === 'transaction'
      ? (props.children?.includes('-') ? '#ef4444' : '#10b981')
      : '#f59e0b'
  };
`;

const QuickLinks = styled.div`
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(148, 163, 184, 0.1);
`;


const LinkButton = styled.button`
  background: transparent;
  border: none;
  color: #667eea;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    text-decoration: underline;
  }
`;

// Estilos do Modal
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
`;

const ModalContent = styled(motion.div)`
  background: rgba(30, 41, 59, 0.95);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 16px;
  padding: 0;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
`;

const ModalTitle = styled.h3`
  margin: 0;
  font-size: 1.25rem;
  color: #f8fafc;
  display: flex;
  align-items: center;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.2s;
  
  &:hover {
    color: #f8fafc;
    background: rgba(148, 163, 184, 0.1);
  }
`;

const ModalBody = styled.div`
  padding: 1.5rem;
  max-height: 60vh;
  overflow-y: auto;
`;

const PendingList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const PendingItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(148, 163, 184, 0.05);
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 8px;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(148, 163, 184, 0.1);
    border-color: rgba(245, 158, 11, 0.3);
  }
`;

const PendingIcon = styled.div`
  font-size: 1.5rem;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: ${props =>
    props.type === 'fixed_expense'
      ? 'rgba(245, 158, 11, 0.1)'
      : 'rgba(239, 68, 68, 0.1)'
  };
  display: flex;
  align-items: center;
  justify-content: center;
`;

const PendingInfo = styled.div`
  flex: 1;
`;

const PendingTitle = styled.div`
  font-weight: 600;
  color: #f8fafc;
  margin-bottom: 0.25rem;
`;

const PendingDescription = styled.div`
  font-size: 0.875rem;
  color: #94a3b8;
`;

const PendingAmount = styled.div`
  font-weight: 600;
  color: ${props =>
    props.type === 'fixed_expense' ? '#f59e0b' : '#ef4444'
  };
  font-size: 0.875rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  color: #94a3b8;
  
  p {
    margin: 0;
    font-size: 1rem;
  }
`;

export default HomePage;
