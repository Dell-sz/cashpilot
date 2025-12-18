import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const WidgetsConfigModal = ({ widgets, toggleWidget, onClose }) => {
  return (
    <ModalOverlay>
      <ModalContainer
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        <ModalHeader>
          <h2>Personalizar Dashboard</h2>
          <CloseButton onClick={onClose}>×</CloseButton>
        </ModalHeader>

        <ModalContent>
          <p>Marque os widgets que deseja exibir:</p>

          <WidgetsList>
            {widgets.map(widget => (
              <WidgetItem key={widget.id}>
                <Checkbox
                  type="checkbox"
                  checked={widget.visible}
                  onChange={() => toggleWidget(widget.id)}
                />
                <WidgetInfo>
                  <WidgetName>{widget.title}</WidgetName>
                  <WidgetSize>Tamanho: {widget.size}</WidgetSize>
                </WidgetInfo>
                <WidgetPreview>
                  {widget.visible ? '👁️' : '🚫'}
                </WidgetPreview>
              </WidgetItem>
            ))}
          </WidgetsList>
        </ModalContent>

        <ModalActions>
          <Button onClick={onClose}>Aplicar</Button>
        </ModalActions>
      </ModalContainer>
    </ModalOverlay>
  );
};

// Estilos
const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContainer = styled(motion.div)`
  background: #1e293b;
  border-radius: 12px;
  border: 1px solid #334155;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #334155;
  
  h2 {
    color: #f8fafc;
    margin: 0;
    font-size: 1.25rem;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  
  &:hover {
    color: #f8fafc;
    background: rgba(148, 163, 184, 0.1);
  }
`;

const ModalContent = styled.div`
  padding: 1.5rem;
  
  p {
    color: #94a3b8;
    margin-bottom: 1.5rem;
  }
`;

const WidgetsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 400px;
  overflow-y: auto;
`;

const WidgetItem = styled.div`
  display: flex;
  align-items: center;
  padding: 1rem;
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid #334155;
  border-radius: 8px;
  transition: all 0.3s;
  
  &:hover {
    border-color: #667eea;
    background: rgba(30, 41, 59, 0.7);
  }
`;

const Checkbox = styled.input`
  margin-right: 1rem;
  width: 1.125rem;
  height: 1.125rem;
  cursor: pointer;
  
  &:checked {
    color: #667eea;
  }
`;

const WidgetInfo = styled.div`
  flex: 1;
`;

const WidgetName = styled.div`
  color: #f8fafc;
  font-weight: 500;
  margin-bottom: 0.25rem;
`;

const WidgetSize = styled.div`
  color: #94a3b8;
  font-size: 0.875rem;
`;

const WidgetPreview = styled.div`
  font-size: 1.25rem;
  margin-left: 0.5rem;
`;

const ModalActions = styled.div`
  padding: 1.5rem;
  border-top: 1px solid #334155;
  display: flex;
  justify-content: flex-end;
`;

const Button = styled.button`
  background: #667eea;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  
  &:hover {
    background: #5a67d8;
  }
`;

export default WidgetsConfigModal;
