import styled from 'styled-components';

/**
 * PageContainer - Container com Padding Responsivo
 * ===============================================
 * Fornece padding automático baseado no tamanho da tela
 * 
 * Props:
 * - $size: 'small' | 'medium' | 'large' (default: 'medium')
 * - $maxWidth: largura máxima do container (default: '1400px')
 * - $noPaddingTop: remove padding-top para uso com header fixo
 */

const getPadding = (size, isMobile) => {
  const mobilePadding = {
    small: 'var(--space-sm)',
    medium: 'var(--space-md)',
    large: 'var(--space-lg)',
  };

  const desktopPadding = {
    small: 'var(--space-md)',
    medium: 'var(--space-lg)',
    large: 'var(--space-xl)',
  };

  return isMobile ? mobilePadding[size] : desktopPadding[size];
};

const PageContainer = styled.div`
  padding: ${props => getPadding(props.$size || 'medium', false)};
  
  max-width: ${props => props.$maxWidth || '1400px'};
  margin: 0 auto;
  width: 100%;
  
  /* Responsive padding for tablets */
  @media (max-width: 1024px) {
    padding: ${props => getPadding(props.$size || 'medium', true)};
  }
  
  /* Mobile */
  @media (max-width: 768px) {
    padding: ${props => {
    const size = props.$size || 'medium';
    switch (size) {
      case 'small': return 'var(--space-sm)';
      case 'large': return 'var(--space-md)';
      default: return 'var(--space-md)';
    }
  }};
  }
  
  /* Mobile pequeno */
  @media (max-width: 480px) {
    padding: ${props => {
    const size = props.$size || 'medium';
    switch (size) {
      case 'small': return 'var(--space-xs)';
      case 'large': return 'var(--space-sm)';
      default: return 'var(--space-sm)';
    }
  }};
  }
  
  /* Desktop large */
  @media (min-width: 1280px) {
    max-width: ${props => props.$maxWidth || '1400px'};
  }
  
  /* Desktop extra large */
  @media (min-width: 1536px) {
    max-width: ${props => props.$maxWidth || '1400px'};
  }
  
  /* Safe area for iPhone notch */
  @supports (padding: env(safe-area-inset-bottom)) {
    padding-bottom: calc(${props => getPadding(props.$size || 'medium', false)} + env(safe-area-inset-bottom));
    padding-left: calc(${props => getPadding(props.$size || 'medium', false)} + env(safe-area-inset-left));
    padding-right: calc(${props => getPadding(props.$size || 'medium', false)} + env(safe-area-inset-right));
  }
`;

/**
 * PageHeader - Header da página com título e ações
 * ===============================================
 * Usar para agrupar título, subtítulo e botões de ação
 */
export const PageHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  margin-bottom: var(--space-lg);
  
  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    gap: var(--space-md);
  }
`;

/**
 * PageTitle - Título da página
 * ===============================================
 * Usa fluid typography para ajustar automaticamente
 */
export const PageTitle = styled.h1`
  font-size: clamp(1.5rem, 5vw, 2.5rem);
  font-weight: var(--fw-bold);
  color: #38bdf8;
  margin: 0;
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  line-height: var(--lh-tight);
  
  @media (max-width: 768px) {
    font-size: clamp(1.25rem, 4vw, 1.75rem);
  }
  
  @media (max-width: 480px) {
    font-size: clamp(1.125rem, 4vw, 1.5rem);
  }
`;

/**
 * PageSubtitle - Subtítulo da página
 * ===============================================
 */
export const PageSubtitle = styled.p`
  font-size: var(--fs-sm);
  color: #94a3b8;
  margin: 0;
  line-height: var(--lh-normal);
  
  @media (min-width: 768px) {
    font-size: var(--fs-base);
  }
`;

/**
 * PageActions - Container para botões de ação
 * ===============================================
 * Alinha botões à direita em desktop, empilha em mobile
 */
export const PageActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  
  @media (min-width: 768px) {
    flex-direction: row;
    align-items: center;
  }
`;

/**
 * PageContent - Área de conteúdo principal
 * ===============================================
 */
export const PageContent = styled.div`
  width: 100%;
`;

export default PageContainer;

