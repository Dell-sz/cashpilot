
// src/pages/ShoppingList.js
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { shoppingService } from '../services/shoppingService';



const ShoppingListPage = () => {
  const { user } = useAuth();
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewListModal, setShowNewListModal] = useState(false);







  const [selectedList, setSelectedList] = useState(null);
  const [showListDetail, setShowListDetail] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingList, setEditingList] = useState(null);
  const [newList, setNewList] = useState({
    name: '',
    store: '',
    budget: '',
    items: [{ name: '', category: '', quantity: 1, estimatedPrice: '', priority: 'medium' }]
  });

  const loadLists = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const userLists = await shoppingService.getLists(user.uid);
      setLists(userLists);
    } catch (error) {
      console.error('Erro ao carregar listas:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadLists();
  }, [loadLists]);

  const handleCreateList = async () => {
    if (!user || !newList.name.trim()) return;

    try {
      const listData = {
        name: newList.name.trim(),
        store: newList.store.trim(),
        budget: parseFloat(newList.budget) || 0,
        items: newList.items.filter(item => item.name.trim() !== '')
      };

      await shoppingService.createList(user.uid, listData);
      setShowNewListModal(false);
      setNewList({
        name: '',
        store: '',
        budget: '',
        items: [{ name: '', category: '', quantity: 1, estimatedPrice: '', priority: 'medium' }]
      });
      loadLists();
    } catch (error) {
      console.error('Erro ao criar lista:', error);
      alert('Erro ao criar lista. Tente novamente.');
    }
  };


  const handleToggleItem = async (listId, itemIndex) => {
    if (!user) return;

    try {
      await shoppingService.toggleItemPurchased(user.uid, listId, itemIndex);
      loadLists(); // Recarregar para atualizar
    } catch (error) {
      console.error('Erro ao marcar item:', error);
    }
  };

  const handleViewList = (list) => {
    setSelectedList(list);
    setShowListDetail(true);
  };

  const handleShareList = (list) => {
    setSelectedList(list);
    setShowShareModal(true);
  };


  const handleDeleteList = async (listId) => {
    if (!user || !window.confirm('Tem certeza que deseja excluir esta lista?')) return;

    try {
      await shoppingService.deleteList(user.uid, listId);
      loadLists();
    } catch (error) {
      console.error('Erro ao deletar lista:', error);
      alert('Erro ao deletar lista. Tente novamente.');
    }
  };

  const handleEditList = (list) => {
    setEditingList({
      id: list.id,
      name: list.name,
      store: list.store || '',
      budget: list.budget?.toString() || '',
      items: list.items?.map(item => ({
        name: item.name,
        category: item.category || '',
        quantity: item.quantity,
        estimatedPrice: item.estimatedPrice?.toString() || '',
        priority: item.priority || 'medium',
        purchased: item.purchased
      })) || []
    });
    setShowEditModal(true);
  };


  const handleUpdateList = async () => {
    if (!user || !editingList || !editingList.name.trim()) return;

    try {
      const listData = {
        name: editingList.name.trim(),
        store: editingList.store.trim(),
        budget: parseFloat(editingList.budget) || 0,
        items: editingList.items.filter(item => item.name.trim() !== '')
      };

      await shoppingService.updateList(user.uid, editingList.id, listData);
      setShowEditModal(false);
      setEditingList(null);
      loadLists();
    } catch (error) {
      console.error('Erro ao atualizar lista:', error);
      alert('Erro ao atualizar lista. Tente novamente.');
    }
  };

  // Funções para gerenciar itens na edição
  const addEditItemField = () => {
    setEditingList(prev => ({
      ...prev,
      items: [...prev.items, { name: '', category: '', quantity: 1, estimatedPrice: '', priority: 'medium', purchased: false }]
    }));
  };

  const removeEditItemField = (index) => {
    if (editingList.items.length > 1) {
      setEditingList(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
      }));
    }
  };

  const updateEditItem = (index, field, value) => {
    const updatedItems = [...editingList.items];
    updatedItems[index][field] = value;
    setEditingList(prev => ({ ...prev, items: updatedItems }));
  };




  const handleRemoveItemFromList = async (listId, itemIndex) => {
    if (!user) return;

    try {
      await shoppingService.removeItem(user.uid, listId, itemIndex);
      loadLists();
    } catch (error) {
      console.error('Erro ao remover item:', error);
    }
  };

  const addItemField = () => {
    setNewList(prev => ({
      ...prev,
      items: [...prev.items, { name: '', category: '', quantity: 1, estimatedPrice: '', priority: 'medium' }]
    }));
  };

  const removeItemField = (index) => {
    if (newList.items.length > 1) {
      setNewList(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
      }));
    }
  };

  const updateItem = (index, field, value) => {
    const updatedItems = [...newList.items];
    updatedItems[index][field] = value;
    setNewList(prev => ({ ...prev, items: updatedItems }));
  };

  const getProgressColor = (total, budget) => {
    if (!budget || budget === 0) return '#64748b';
    const percentage = (total / budget) * 100;
    if (percentage > 90) return '#ef4444';
    if (percentage > 70) return '#f59e0b';
    return '#10b981';
  };

  if (loading) {
    return (
      <LoadingContainer>
        <LoadingSpinner />
        <p>Carregando suas listas de compras...</p>
      </LoadingContainer>
    );
  }

  return (
    <Container>
      <Header>
        <Title>
          <motion.span
            initial={{ rotate: 0 }}
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{ fontSize: '1.5rem' }}
          >
            🛒
          </motion.span>
          <h1>Lista de Compras</h1>
        </Title>
        <AddButton
          onClick={() => setShowNewListModal(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span>+</span> Nova Lista
        </AddButton>
      </Header>

      {/* Grid de Listas Existentes */}
      {lists.length === 0 ? (
        <EmptyState>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ textAlign: 'center' }}
          >
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🛍️</div>
            <h3>Nenhuma lista criada ainda</h3>
            <p>Crie sua primeira lista de compras para começar!</p>
            <CreateFirstButton onClick={() => setShowNewListModal(true)}>
              Criar Primeira Lista
            </CreateFirstButton>
          </motion.div>
        </EmptyState>
      ) : (
        <ListsGrid>
          {lists.map((list, index) => (
            <ListCard
              key={list.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <ListHeader>
                <h3>{list.name}</h3>
                <StatusBadge
                  total={list.totalEstimated || 0}
                  budget={list.budget || 0}
                />
              </ListHeader>

              <ListInfo>
                {list.store && (
                  <InfoItem>
                    <span>🏪</span>
                    <span>{list.store}</span>
                  </InfoItem>
                )}
                <InfoItem>
                  <span>💰</span>
                  <span>R$ {(list.totalEstimated || 0).toFixed(2)}
                    {list.budget && list.budget > 0 && ` / R$ ${list.budget.toFixed(2)}`}
                  </span>
                </InfoItem>

                {list.budget && list.budget > 0 && (
                  <ProgressBarContainer>
                    <ProgressFill
                      progress={Math.min(((list.totalEstimated || 0) / list.budget) * 100, 100)}
                      color={getProgressColor(list.totalEstimated || 0, list.budget)}
                    />
                  </ProgressBarContainer>
                )}
              </ListInfo>

              <ItemsPreview>
                <ItemsTitle>Itens ({list.items?.length || 0})</ItemsTitle>
                {list.items?.slice(0, 4).map((item, idx) => (
                  <Item key={idx} purchased={item.purchased}>
                    <motion.span
                      onClick={() => handleToggleItem(list.id, idx)}
                      style={{ cursor: 'pointer' }}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {item.purchased ? '✅' : '⭕'}
                    </motion.span>
                    <span className={item.purchased ? 'purchased' : ''}>
                      {item.quantity}x {item.name}
                    </span>
                    {item.estimatedPrice && (
                      <span className="price">
                        R$ {(item.estimatedPrice * item.quantity).toFixed(2)}
                      </span>
                    )}
                  </Item>
                ))}
                {list.items?.length > 4 && (
                  <MoreItems>+{list.items.length - 4} itens...</MoreItems>
                )}

                {(!list.items || list.items.length === 0) && (
                  <EmptyItems>Nenhum item adicionado</EmptyItems>
                )}
              </ItemsPreview>



              <CardActions>
                <ActionButton
                  primary
                  onClick={() => handleViewList(list)}
                >
                  Ver Lista Completa
                </ActionButton>
                <ActionButton
                  onClick={() => handleEditList(list)}
                >
                  ✏️ Editar
                </ActionButton>
                <ActionButton
                  secondary
                  onClick={() => handleShareList(list)}
                >
                  Compartilhar
                </ActionButton>
              </CardActions>
            </ListCard>
          ))}
        </ListsGrid>
      )}


      {/* Modal para Ver Lista Completa */}
      <AnimatePresence>
        {showListDetail && selectedList && (
          <ModalOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowListDetail(false)}
          >
            <DetailModalContainer
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <ModalHeader>
                <div>
                  <h2>{selectedList.name}</h2>
                  {selectedList.store && <p style={{ color: '#94a3b8', margin: '0.5rem 0' }}>🏪 {selectedList.store}</p>}
                </div>
                <CloseButton onClick={() => setShowListDetail(false)}>×</CloseButton>
              </ModalHeader>

              <ModalBody>
                <DetailInfo>
                  <InfoCard>
                    <h4>💰 Orçamento</h4>
                    <p>R$ {(selectedList.totalEstimated || 0).toFixed(2)}
                      {selectedList.budget && selectedList.budget > 0 && ` / R$ ${selectedList.budget.toFixed(2)}`}
                    </p>
                    {selectedList.budget && selectedList.budget > 0 && (
                      <ProgressBarContainer>
                        <ProgressFill
                          progress={Math.min(((selectedList.totalEstimated || 0) / selectedList.budget) * 100, 100)}
                          color={getProgressColor(selectedList.totalEstimated || 0, selectedList.budget)}
                        />
                      </ProgressBarContainer>
                    )}
                  </InfoCard>
                </DetailInfo>

                <ItemsList>
                  <h4>🛒 Itens da Lista ({selectedList.items?.length || 0})</h4>
                  {selectedList.items?.map((item, idx) => (
                    <DetailItem key={idx} purchased={item.purchased}>
                      <ItemCheckbox
                        onClick={() => handleToggleItem(selectedList.id, idx)}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        {item.purchased ? '✅' : '⭕'}
                      </ItemCheckbox>
                      <ItemDetails>
                        <ItemName className={item.purchased ? 'purchased' : ''}>
                          {item.quantity}x {item.name}
                        </ItemName>
                        {item.category && <ItemCategory>{item.category}</ItemCategory>}
                      </ItemDetails>
                      <ItemPrice>
                        {item.estimatedPrice ? `R$ ${(item.estimatedPrice * item.quantity).toFixed(2)}` : 'Sem preço'}
                      </ItemPrice>
                      <RemoveItemButton onClick={() => handleRemoveItemFromList(selectedList.id, idx)}>
                        🗑️
                      </RemoveItemButton>
                    </DetailItem>
                  ))}
                </ItemsList>
              </ModalBody>

              <ModalActions>
                <Button
                  secondary
                  onClick={() => handleDeleteList(selectedList.id)}
                  style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}
                >
                  🗑️ Excluir Lista
                </Button>
                <Button onClick={() => setShowListDetail(false)}>
                  ✅ Concluir
                </Button>
              </ModalActions>
            </DetailModalContainer>
          </ModalOverlay>
        )}
      </AnimatePresence>

      {/* Modal para Compartilhar */}
      <AnimatePresence>
        {showShareModal && selectedList && (
          <ModalOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowShareModal(false)}
          >
            <ShareModalContainer
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <ModalHeader>
                <h2>📤 Compartilhar Lista</h2>
                <CloseButton onClick={() => setShowShareModal(false)}>×</CloseButton>
              </ModalHeader>

              <ModalBody>
                <ShareHeader>
                  <h3>{selectedList.name}</h3>
                  <p>{selectedList.items?.length || 0} itens • R$ {(selectedList.totalEstimated || 0).toFixed(2)}</p>
                </ShareHeader>

                <ShareOptions>
                  <ShareButton
                    onClick={() => {
                      const shareText = `🛒 Lista de Compras: ${selectedList.name}\n\n${selectedList.items?.map(item =>
                        `${item.purchased ? '✅' : '⭕'} ${item.quantity}x ${item.name}${item.estimatedPrice ? ` - R$ ${(item.estimatedPrice * item.quantity).toFixed(2)}` : ''}`
                      ).join('\n') || 'Nenhum item'}\n\n💰 Total: R$ ${(selectedList.totalEstimated || 0).toFixed(2)}`;

                      if (navigator.share) {
                        navigator.share({
                          title: `Lista de Compras - ${selectedList.name}`,
                          text: shareText
                        });
                      } else {
                        navigator.clipboard.writeText(shareText);
                        alert('Lista copiada para a área de transferência!');
                      }
                    }}
                  >
                    📱 Compartilhar
                  </ShareButton>

                  <ShareButton
                    onClick={() => {
                      const shareText = `🛒 Lista de Compras: ${selectedList.name}\n\n${selectedList.items?.map(item =>
                        `${item.purchased ? '✅' : '⭕'} ${item.quantity}x ${item.name}${item.estimatedPrice ? ` - R$ ${(item.estimatedPrice * item.quantity).toFixed(2)}` : ''}`
                      ).join('\n') || 'Nenhum item'}\n\n💰 Total: R$ ${(selectedList.totalEstimated || 0).toFixed(2)}`;
                      navigator.clipboard.writeText(shareText);
                      alert('Lista copiada para a área de transferência!');
                    }}
                  >
                    📋 Copiar Texto
                  </ShareButton>

                  <ShareButton
                    onClick={() => {
                      const whatsappText = `🛒 Lista de Compras: ${selectedList.name}\n\n${selectedList.items?.map(item =>
                        `${item.purchased ? '✅' : '⭕'} ${item.quantity}x ${item.name}${item.estimatedPrice ? ` - R$ ${(item.estimatedPrice * item.quantity).toFixed(2)}` : ''}`
                      ).join('\n') || 'Nenhum item'}\n\n💰 Total: R$ ${(selectedList.totalEstimated || 0).toFixed(2)}`;
                      window.open(`https://wa.me/?text=${encodeURIComponent(whatsappText)}`, '_blank');
                    }}
                  >
                    💬 WhatsApp
                  </ShareButton>
                </ShareOptions>

                <SharePreview>
                  <h4>📝 Preview:</h4>
                  <PreviewBox>
                    <PreviewTitle>🛒 {selectedList.name}</PreviewTitle>
                    <PreviewItems>
                      {selectedList.items?.slice(0, 3).map((item, idx) => (
                        <PreviewItem key={idx}>
                          {item.purchased ? '✅' : '⭕'} {item.quantity}x {item.name}
                          {item.estimatedPrice && ` - R$ ${(item.estimatedPrice * item.quantity).toFixed(2)}`}
                        </PreviewItem>
                      ))}
                      {selectedList.items?.length > 3 && <PreviewMore>+{selectedList.items.length - 3} itens...</PreviewMore>}
                    </PreviewItems>
                    <PreviewTotal>💰 Total: R$ {(selectedList.totalEstimated || 0).toFixed(2)}</PreviewTotal>
                  </PreviewBox>
                </SharePreview>
              </ModalBody>

              <ModalActions>
                <Button secondary onClick={() => setShowShareModal(false)}>
                  Cancelar
                </Button>
              </ModalActions>
            </ShareModalContainer>
          </ModalOverlay>
        )}
      </AnimatePresence>


      {/* Modal para Nova Lista */}
      <AnimatePresence>
        {showNewListModal && (
          <ModalOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowNewListModal(false)}
          >
            <ModalContainer
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <ModalHeader>
                <h2>Criar Nova Lista</h2>
                <CloseButton onClick={() => setShowNewListModal(false)}>×</CloseButton>
              </ModalHeader>

              <FormGroup>
                <label>Nome da Lista *</label>
                <Input
                  value={newList.name}
                  onChange={(e) => setNewList(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Supermercado Semanal"
                  autoFocus
                />
              </FormGroup>

              <FormRow>
                <FormGroup>
                  <label>Loja (opcional)</label>
                  <Input
                    value={newList.store}
                    onChange={(e) => setNewList(prev => ({ ...prev, store: e.target.value }))}
                    placeholder="Ex: Carrefour"
                  />
                </FormGroup>
                <FormGroup>
                  <label>Orçamento (R$)</label>
                  <Input
                    type="number"
                    value={newList.budget}
                    onChange={(e) => setNewList(prev => ({ ...prev, budget: e.target.value }))}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </FormGroup>
              </FormRow>

              <ItemsSection>
                <SectionTitle>
                  Itens da Lista
                  <AddItemButton onClick={addItemField}>
                    <span>+</span> Adicionar Item
                  </AddItemButton>
                </SectionTitle>

                {newList.items.map((item, index) => (
                  <ItemRow key={index}>
                    <ItemInput
                      placeholder="Nome do item"
                      value={item.name}
                      onChange={(e) => updateItem(index, 'name', e.target.value)}
                    />
                    <SmallInput
                      placeholder="Categoria"
                      value={item.category}
                      onChange={(e) => updateItem(index, 'category', e.target.value)}
                    />
                    <NumberInput
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                      min="1"
                    />
                    <CurrencyInput
                      type="number"
                      placeholder="R$"
                      value={item.estimatedPrice}
                      onChange={(e) => updateItem(index, 'estimatedPrice', e.target.value)}
                      step="0.01"
                      min="0"
                    />
                    {newList.items.length > 1 && (
                      <RemoveItemButton onClick={() => removeItemField(index)}>
                        🗑️
                      </RemoveItemButton>
                    )}
                  </ItemRow>
                ))}
              </ItemsSection>

              <ModalActions>
                <Button secondary onClick={() => setShowNewListModal(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleCreateList}
                  disabled={!newList.name.trim()}
                >
                  <span>+</span> Criar Lista
                </Button>
              </ModalActions>
            </ModalContainer>
          </ModalOverlay>
        )}
      </AnimatePresence>

      {/* Modal para Editar Lista */}
      <AnimatePresence>
        {showEditModal && editingList && (
          <ModalOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowEditModal(false)}
          >
            <ModalContainer
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <ModalHeader>
                <h2>✏️ Editar Lista</h2>
                <CloseButton onClick={() => setShowEditModal(false)}>×</CloseButton>
              </ModalHeader>

              <FormGroup>
                <label>Nome da Lista *</label>
                <Input
                  value={editingList.name}
                  onChange={(e) => setEditingList(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Supermercado Semanal"
                  autoFocus
                />
              </FormGroup>

              <FormRow>
                <FormGroup>
                  <label>Loja (opcional)</label>
                  <Input
                    value={editingList.store}
                    onChange={(e) => setEditingList(prev => ({ ...prev, store: e.target.value }))}
                    placeholder="Ex: Carrefour"
                  />
                </FormGroup>
                <FormGroup>
                  <label>Orçamento (R$)</label>
                  <Input
                    type="number"
                    value={editingList.budget}
                    onChange={(e) => setEditingList(prev => ({ ...prev, budget: e.target.value }))}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </FormGroup>
              </FormRow>

              <ItemsSection>
                <SectionTitle>
                  Itens da Lista
                  <AddItemButton onClick={addEditItemField}>
                    <span>+</span> Adicionar Item
                  </AddItemButton>
                </SectionTitle>

                {editingList.items.map((item, index) => (
                  <ItemRow key={index}>
                    <ItemInput
                      placeholder="Nome do item"
                      value={item.name}
                      onChange={(e) => updateEditItem(index, 'name', e.target.value)}
                    />
                    <SmallInput
                      placeholder="Categoria"
                      value={item.category}
                      onChange={(e) => updateEditItem(index, 'category', e.target.value)}
                    />
                    <NumberInput
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateEditItem(index, 'quantity', parseInt(e.target.value) || 1)}
                      min="1"
                    />
                    <CurrencyInput
                      type="number"
                      placeholder="R$"
                      value={item.estimatedPrice}
                      onChange={(e) => updateEditItem(index, 'estimatedPrice', e.target.value)}
                      step="0.01"
                      min="0"
                    />
                    {editingList.items.length > 1 && (
                      <RemoveItemButton onClick={() => removeEditItemField(index)}>
                        🗑️
                      </RemoveItemButton>
                    )}
                  </ItemRow>
                ))}
              </ItemsSection>

              <ModalActions>
                <Button secondary onClick={() => setShowEditModal(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleUpdateList}
                  disabled={!editingList.name.trim()}
                >
                  <span>💾</span> Salvar Alterações
                </Button>
              </ModalActions>
            </ModalContainer>
          </ModalOverlay>
        )}
      </AnimatePresence>
    </Container>
  );
};

// Componente para mostrar status do orçamento
const StatusBadge = ({ total, budget }) => {
  if (!budget || budget === 0) return <Badge>Sem orçamento</Badge>;

  const percentage = (total / budget) * 100;
  let status = 'success';

  if (percentage > 90) status = 'danger';
  else if (percentage > 70) status = 'warning';

  return (
    <Badge status={status}>
      {percentage.toFixed(0)}% do orçamento
    </Badge>
  );
};

// Componente de loading
const LoadingSpinner = () => (
  <motion.div
    animate={{ rotate: 360 }}
    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    style={{
      width: '40px',
      height: '40px',
      border: '3px solid #334155',
      borderTop: '3px solid #38bdf8',
      borderRadius: '50%'
    }}
  />
);

// ============= ESTILOS =============
const Container = styled.div`
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 60vh;
  color: #94a3b8;
  
  p {
    margin-top: 1rem;
    font-size: 1.1rem;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  
  h1 {
    font-size: 2rem;
    background: linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin: 0;
  }
`;

const AddButton = styled(motion.button)`
  background: linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 1rem;
  
  span {
    font-size: 1.2rem;
  }
`;

const EmptyState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 60vh;
  color: #94a3b8;
  
  h3 {
    color: #f8fafc;
    margin-bottom: 0.5rem;
  }
  
  p {
    margin-bottom: 2rem;
  }
`;

const CreateFirstButton = styled.button`
  background: linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  font-size: 1rem;
`;

const ListsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
`;

const ListCard = styled(motion.div)`
  background: rgba(30, 41, 59, 0.8);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid rgba(148, 163, 184, 0.2);
  backdrop-filter: blur(10px);
  transition: all 0.3s;
  
  &:hover {
    border-color: #38bdf8;
    transform: translateY(-4px);
    box-shadow: 0 10px 25px rgba(56, 189, 248, 0.2);
  }
`;

const ListHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  
  h3 {
    font-size: 1.25rem;
    color: #f8fafc;
    margin: 0;
  }
`;

const Badge = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${props => {
    switch (props.status) {
      case 'danger': return 'linear-gradient(135deg, #ef4444, #dc2626)';
      case 'warning': return 'linear-gradient(135deg, #f59e0b, #d97706)';
      default: return 'linear-gradient(135deg, #10b981, #059669)';
    }
  }};
  color: white;
`;

const ListInfo = styled.div`
  margin-bottom: 1.5rem;
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #94a3b8;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
  
  span:first-child {
    font-size: 1rem;
  }
`;

const ProgressBarContainer = styled.div`
  height: 6px;
  background: rgba(148, 163, 184, 0.1);
  border-radius: 3px;
  margin-top: 0.75rem;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  width: ${props => props.progress}%;
  background: ${props => props.color || '#38bdf8'};
  border-radius: 3px;
  transition: width 0.5s ease;
`;

const ItemsPreview = styled.div`
  margin-bottom: 1.5rem;
`;

const ItemsTitle = styled.h4`
  color: #cbd5e1;
  margin-bottom: 0.75rem;
  font-size: 0.9rem;
  font-weight: 600;
`;

const Item = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
  
  span:nth-child(2) {
    flex: 1;
    font-size: 0.875rem;
    color: #e2e8f0;
    
    &.purchased {
      text-decoration: line-through;
      color: #64748b;
    }
  }
  
  .price {
    font-size: 0.75rem;
    color: #94a3b8;
    font-weight: 500;
  }
`;

const MoreItems = styled.div`
  color: #64748b;
  font-size: 0.75rem;
  text-align: center;
  padding-top: 0.5rem;
  font-style: italic;
`;

const EmptyItems = styled.div`
  color: #64748b;
  font-size: 0.875rem;
  text-align: center;
  padding: 1rem;
  font-style: italic;
`;

const CardActions = styled.div`
  display: flex;
  gap: 0.75rem;
`;

const ActionButton = styled.button`
  flex: 1;
  padding: 0.5rem;
  border-radius: 6px;
  border: 1px solid ${props => props.secondary ? '#475569' : 'transparent'};
  background: ${props => props.secondary ? 'transparent' : 'rgba(56, 189, 248, 0.1)'};
  color: ${props => props.secondary ? '#94a3b8' : '#38bdf8'};
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  
  &:hover {
    background: ${props => props.secondary ? 'rgba(148, 163, 184, 0.1)' : 'rgba(56, 189, 248, 0.2)'};
  }
`;

// Estilos do Modal
const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(5px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContainer = styled(motion.div)`
  background: #1e293b;
  border-radius: 16px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
  
  h2 {
    font-size: 1.5rem;
    color: #f8fafc;
    margin: 0;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.25rem;
  
  &:hover {
    color: #f8fafc;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;
  padding: 0 1.5rem;
  
  label {
    display: block;
    margin-bottom: 0.5rem;
    color: #cbd5e1;
    font-size: 0.875rem;
    font-weight: 500;
  }
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  padding: 0 1.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 8px;
  color: #f8fafc;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #38bdf8;
    box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.1);
  }
  
  &::placeholder {
    color: #64748b;
  }
`;

const ItemsSection = styled.div`
  margin: 1.5rem 0;
  padding: 0 1.5rem;
`;

const SectionTitle = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  
  h3 {
    color: #f8fafc;
    font-size: 1.125rem;
    margin: 0;
  }
`;

const AddItemButton = styled.button`
  background: rgba(56, 189, 248, 0.1);
  border: 1px dashed #38bdf8;
  border-radius: 6px;
  color: #38bdf8;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  span {
    font-size: 1rem;
  }
  
  &:hover {
    background: rgba(56, 189, 248, 0.2);
  }
`;

const ItemRow = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 0.5fr 1fr auto;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  align-items: center;
`;

const ItemInput = styled(Input)`
  grid-column: 1;
`;

const SmallInput = styled(Input)`
  grid-column: 2;
`;

const NumberInput = styled(Input)`
  grid-column: 3;
  text-align: center;
`;

const CurrencyInput = styled(Input)`
  grid-column: 4;
`;

const RemoveItemButton = styled.button`
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 6px;
  color: #ef4444;
  padding: 0.5rem;
  cursor: pointer;
  font-size: 0.875rem;
  
  &:hover {
    background: rgba(239, 68, 68, 0.2);
  }
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid rgba(148, 163, 184, 0.1);
`;


const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  transition: all 0.2s;
  
  background: ${props => props.secondary
    ? 'transparent'
    : 'linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%)'
  };
  color: ${props => props.secondary ? '#94a3b8' : 'white'};
  border: ${props => props.secondary ? '1px solid #475569' : 'none'};
  
  &:hover:not(:disabled) {
    background: ${props => props.secondary
    ? 'rgba(148, 163, 184, 0.1)'
    : 'linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)'
  };
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// Estilos do Modal de Detalhes
const DetailModalContainer = styled(motion.div)`
  background: #1e293b;
  border-radius: 16px;
  width: 90%;
  max-width: 700px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
`;

const ModalBody = styled.div`
  padding: 1.5rem;
`;

const DetailInfo = styled.div`
  margin-bottom: 2rem;
`;

const InfoCard = styled.div`
  background: rgba(56, 189, 248, 0.1);
  border: 1px solid rgba(56, 189, 248, 0.2);
  border-radius: 8px;
  padding: 1rem;
  
  h4 {
    color: #38bdf8;
    margin: 0 0 0.5rem 0;
    font-size: 1rem;
  }
  
  p {
    color: #e2e8f0;
    margin: 0;
    font-size: 1.125rem;
    font-weight: 600;
  }
`;

const ItemsList = styled.div`
  margin-bottom: 2rem;
  
  h4 {
    color: #f8fafc;
    margin: 0 0 1rem 0;
    font-size: 1.125rem;
  }
`;

const DetailItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
  opacity: ${props => props.purchased ? 0.6 : 1};
`;

const ItemCheckbox = styled(motion.button)`
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.25rem;
  
  &:hover {
    transform: scale(1.1);
  }
`;

const ItemDetails = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const ItemName = styled.span`
  color: #e2e8f0;
  font-weight: 500;
  
  &.purchased {
    text-decoration: line-through;
    color: #64748b;
  }
`;

const ItemCategory = styled.span`
  color: #94a3b8;
  font-size: 0.75rem;
`;

const ItemPrice = styled.div`
  color: #38bdf8;
  font-weight: 600;
  font-size: 0.875rem;
`;

// Estilos do Modal de Compartilhar
const ShareModalContainer = styled(motion.div)`
  background: #1e293b;
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
`;

const ShareHeader = styled.div`
  margin-bottom: 1.5rem;
  
  h3 {
    color: #f8fafc;
    margin: 0 0 0.5rem 0;
    font-size: 1.25rem;
  }
  
  p {
    color: #94a3b8;
    margin: 0;
    font-size: 0.875rem;
  }
`;

const ShareOptions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 2rem;
`;

const ShareButton = styled.button`
  background: rgba(56, 189, 248, 0.1);
  border: 1px solid rgba(56, 189, 248, 0.2);
  border-radius: 8px;
  color: #38bdf8;
  padding: 0.75rem 1rem;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  text-align: left;
  
  &:hover {
    background: rgba(56, 189, 248, 0.2);
  }
`;

const SharePreview = styled.div`
  margin-bottom: 1.5rem;
  
  h4 {
    color: #cbd5e1;
    margin: 0 0 1rem 0;
    font-size: 0.875rem;
    font-weight: 600;
  }
`;

const PreviewBox = styled.div`
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 8px;
  padding: 1rem;
`;

const PreviewTitle = styled.div`
  color: #f8fafc;
  font-weight: 600;
  margin-bottom: 0.75rem;
  font-size: 1rem;
`;

const PreviewItems = styled.div`
  margin-bottom: 0.75rem;
`;

const PreviewItem = styled.div`
  color: #94a3b8;
  font-size: 0.875rem;
  padding: 0.25rem 0;
`;

const PreviewMore = styled.div`
  color: #64748b;
  font-size: 0.75rem;
  font-style: italic;
  margin-top: 0.5rem;
`;

const PreviewTotal = styled.div`
  color: #38bdf8;
  font-weight: 600;
  font-size: 0.875rem;
  border-top: 1px solid rgba(148, 163, 184, 0.1);
  padding-top: 0.75rem;
`;

export default ShoppingListPage;
