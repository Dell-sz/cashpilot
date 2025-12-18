import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaTimes, FaExpandAlt, FaCompressAlt } from 'react-icons/fa';

const Widget = ({
  title,
  children,
  size = 'medium',
  onRemove,
  onToggleSize,
  isExpanded = false
}) => {
  return (
    <WidgetContainer
      size={size}
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <WidgetHeader>
        <WidgetTitle>{title}</WidgetTitle>
        <WidgetActions>
          {onToggleSize && (
            <IconButton onClick={onToggleSize} title={isExpanded ? "Recolher" : "Expandir"}>
              {isExpanded ? <FaCompressAlt /> : <FaExpandAlt />}
            </IconButton>
          )}
          {onRemove && (
            <IconButton onClick={onRemove} title="Remover">
              <FaTimes />
            </IconButton>
          )}
        </WidgetActions>
      </WidgetHeader>
      <WidgetContent>
        {children}
      </WidgetContent>
    </WidgetContainer>
  );
};

// Tamanhos pré-definidos
const sizeMap = {
  small: { gridColumn: 'span 1', minHeight: '200px' },
  medium: { gridColumn: 'span 2', minHeight: '250px' },
  large: { gridColumn: 'span 3', minHeight: '300px' },
  full: { gridColumn: '1 / -1', minHeight: '350px' }
};

const WidgetContainer = styled(motion.div)`
  background: rgba(30, 41, 59, 0.7);
  border-radius: 12px;
  border: 1px solid rgba(148, 163, 184, 0.1);
  backdrop-filter: blur(10px);
  overflow: hidden;
  grid-column: ${props => sizeMap[props.size].gridColumn};
  min-height: ${props => sizeMap[props.size].minHeight};
  display: flex;
  flex-direction: column;
`;

const WidgetHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
  background: rgba(15, 23, 42, 0.5);
`;

const WidgetTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #f8fafc;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
`;

const WidgetActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const IconButton = styled.button`
  background: transparent;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  font-size: 0.875rem;
  
  &:hover {
    color: #f8fafc;
    background: rgba(148, 163, 184, 0.1);
  }
`;

const WidgetContent = styled.div`
  padding: 1.25rem;
  flex: 1;
  overflow: auto;
`;

export default Widget;
