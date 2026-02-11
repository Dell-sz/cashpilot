import styled from 'styled-components';
import { devices } from '../styles/breakpoints';

const ResponsiveGrid = styled.div`
  display: grid;
  gap: ${props => props.$gap || '1.5rem'};
  
  /* Mobile: 1 coluna */
  grid-template-columns: 1fr;
  
  /* Tablet: 2 colunas */
  ${devices.minTablet} {
    grid-template-columns: repeat(2, 1fr);
  }
  
  /* Desktop: 3+ colunas */
  ${devices.minLaptop} {
    grid-template-columns: repeat(${props => props.$columns || 3}, 1fr);
  }
`;

export default ResponsiveGrid;

