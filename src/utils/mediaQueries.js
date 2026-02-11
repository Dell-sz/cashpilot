/**
 * CashPilot - Media Queries Utility
 * =================================
 * Sistema de breakpoints e helpers para responsividade mobile-first
 */

// Breakpoints padronizados (mobile-first approach)
export const BREAKPOINTS = {
  xs: 375,      // Mobile pequeno
  sm: 640,     // Mobile grande / Phablet
  md: 768,     // Tablet pequeno
  lg: 1024,    // Tablet grande / Laptop
  xl: 1280,    // Desktop
  xxl: 1536,   // Desktop grande
};

// Media queries para max-width (mobile-first: começa pequeno e vai subindo)
export const mediaQueries = {
  // Mobile pequeno (até 375px)
  xs: `@media (max-width: ${BREAKPOINTS.xs}px)`,

  // Mobile grande / Phablet (até 640px)
  sm: `@media (max-width: ${BREAKPOINTS.sm}px)`,

  // Tablet pequeno (até 768px)
  md: `@media (max-width: ${BREAKPOINTS.md}px)`,

  // Tablet grande / Laptop (até 1024px)
  lg: `@media (max-width: ${BREAKPOINTS.lg}px)`,

  // Desktop (até 1280px)
  xl: `@media (max-width: ${BREAKPOINTS.xl}px)`,

  // Desktop grande (até 1536px)
  xxl: `@media (max-width: ${BREAKPOINTS.xxl}px)`,
};

// Media queries para min-width (desktop-first: começa grande e vai descendo)
export const mediaQueriesMin = {
  // Mobile pequeno (a partir de 376px)
  smMin: `@media (min-width: ${BREAKPOINTS.xs + 1}px)`,

  // Mobile grande / Phablet (a partir de 641px)
  mdMin: `@media (min-width: ${BREAKPOINTS.sm + 1}px)`,

  // Tablet pequeno (a partir de 769px)
  lgMin: `@media (min-width: ${BREAKPOINTS.md + 1}px)`,

  // Tablet grande / Laptop (a partir de 1025px)
  xlMin: `@media (min-width: ${BREAKPOINTS.lg + 1}px)`,

  // Desktop (a partir de 1281px)
  xxlMin: `@media (min-width: ${BREAKPOINTS.xl + 1}px)`,

  // Large desktop (a partir de 1537px)
  xxxlMin: `@media (min-width: ${BREAKPOINTS.xxl + 1}px)`,
};

// Ranges específicos para dispositivos
export const deviceRanges = {
  mobile: `@media (max-width: ${BREAKPOINTS.sm}px)`,
  tablet: `@media (min-width: ${BREAKPOINTS.sm + 1}px) and (max-width: ${BREAKPOINTS.lg}px)`,
  desktop: `@media (min-width: ${BREAKPOINTS.lg + 1}px)`,
  mobileOnly: `@media (max-width: ${BREAKPOINTS.md}px)`,
  tabletOnly: `@media (min-width: ${BREAKPOINTS.md + 1}px) and (max-width: ${BREAKPOINTS.lg}px)`,
  desktopOnly: `@media (min-width: ${BREAKPOINTS.lg + 1}px)`,
};

// Helper functions para facilitar uso
export const isMobile = () => typeof window !== 'undefined' && window.innerWidth <= BREAKPOINTS.sm;
export const isTablet = () => typeof window !== 'undefined' && window.innerWidth > BREAKPOINTS.sm && window.innerWidth <= BREAKPOINTS.lg;
export const isDesktop = () => typeof window !== 'undefined' && window.innerWidth > BREAKPOINTS.lg;

// Get current breakpoint name
export const getCurrentBreakpoint = () => {
  if (typeof window === 'undefined') return 'lg';

  const width = window.innerWidth;
  if (width <= BREAKPOINTS.xs) return 'xs';
  if (width <= BREAKPOINTS.sm) return 'sm';
  if (width <= BREAKPOINTS.md) return 'md';
  if (width <= BREAKPOINTS.lg) return 'lg';
  if (width <= BREAKPOINTS.xl) return 'xl';
  return 'xxl';
};

// Breakpoints configuration object para styled-components
export const breakpoints = {
  xs: `${BREAKPOINTS.xs}px`,
  sm: `${BREAKPOINTS.sm}px`,
  md: `${BREAKPOINTS.md}px`,
  lg: `${BREAKPOINTS.lg}px`,
  xl: `${BREAKPOINTS.xl}px`,
  xxl: `${BREAKPOINTS.xxl}px`,
};

export default {
  BREAKPOINTS,
  mediaQueries,
  mediaQueriesMin,
  deviceRanges,
  breakpoints,
  isMobile,
  isTablet,
  isDesktop,
  getCurrentBreakpoint,
};

