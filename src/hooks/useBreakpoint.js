import { useState, useEffect } from 'react';
import { BREAKPOINTS, getCurrentBreakpoint } from '../utils/mediaQueries';

/**
 * Hook para detectar o breakpoint atual da tela
 * @returns {string} Nome do breakpoint atual: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'
 */
const useBreakpoint = () => {
  const [breakpoint, setBreakpoint] = useState('lg');
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
  });

  useEffect(() => {
    // Define the breakpoint based on window width
    const determineBreakpoint = () => {
      const width = window.innerWidth;

      if (width <= BREAKPOINTS.xs) {
        return 'xs';
      } else if (width <= BREAKPOINTS.sm) {
        return 'sm';
      } else if (width <= BREAKPOINTS.md) {
        return 'md';
      } else if (width <= BREAKPOINTS.lg) {
        return 'lg';
      } else if (width <= BREAKPOINTS.xl) {
        return 'xl';
      } else {
        return 'xxl';
      }
    };

    // Handle resize events
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
      setBreakpoint(determineBreakpoint());
    };

    // Initial check
    setBreakpoint(determineBreakpoint());

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Also listen for orientation change on mobile
    window.addEventListener('orientationchange', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  return {
    breakpoint,
    width: windowSize.width,
    height: windowSize.height,
    // Helper booleans
    isXs: breakpoint === 'xs',
    isSm: breakpoint === 'sm',
    isMd: breakpoint === 'md',
    isLg: breakpoint === 'lg',
    isXl: breakpoint === 'xl',
    isXxl: breakpoint === 'xxl',
    // Device type helpers
    isMobile: breakpoint === 'xs' || breakpoint === 'sm',
    isTablet: breakpoint === 'md' || breakpoint === 'lg',
    isDesktop: breakpoint === 'xl' || breakpoint === 'xxl',
  };
};

/**
 * Hook para detectar se está em modo mobile
 * @returns {boolean} true se for mobile (width <= 640px)
 */
export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= BREAKPOINTS.sm);
    };

    // Initial check
    checkMobile();

    // Add event listener
    window.addEventListener('resize', checkMobile);
    window.addEventListener('orientationchange', checkMobile);

    // Cleanup
    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('orientationchange', checkMobile);
    };
  }, []);

  return isMobile;
};

/**
 * Hook para detectar se está em modo tablet
 * @returns {boolean} true se for tablet (641px < width <= 1024px)
 */
export const useIsTablet = () => {
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const checkTablet = () => {
      const width = window.innerWidth;
      setIsTablet(width > BREAKPOINTS.sm && width <= BREAKPOINTS.lg);
    };

    // Initial check
    checkTablet();

    // Add event listener
    window.addEventListener('resize', checkTablet);
    window.addEventListener('orientationchange', checkTablet);

    // Cleanup
    return () => {
      window.removeEventListener('resize', checkTablet);
      window.removeEventListener('orientationchange', checkTablet);
    };
  }, []);

  return isTablet;
};

/**
 * Hook para detectar se está em modo desktop
 * @returns {boolean} true se for desktop (width > 1024px)
 */
export const useIsDesktop = () => {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth > BREAKPOINTS.lg);
    };

    // Initial check
    checkDesktop();

    // Add event listener
    window.addEventListener('resize', checkDesktop);
    window.addEventListener('orientationchange', checkDesktop);

    // Cleanup
    return () => {
      window.removeEventListener('resize', checkDesktop);
      window.removeEventListener('orientationchange', checkDesktop);
    };
  }, []);

  return isDesktop;
};

/**
 * Hook para detectar orientação da tela
 * @returns {string} 'portrait' | 'landscape'
 */
export const useOrientation = () => {
  const [orientation, setOrientation] = useState('landscape');

  useEffect(() => {
    const checkOrientation = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
    };

    // Initial check
    checkOrientation();

    // Add event listener
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    // Cleanup
    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  return orientation;
};

/**
 * Hook paradebounced window size
 * Útil para evitar múltiplas renderizações durante resize
 * @param {number} delay - Delay em ms para debounce
 * @returns {object} { width, height }
 */
export const useDebouncedWindowSize = (delay = 150) => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
  });

  useEffect(() => {
    let timeoutId = null;

    const handleResize = () => {
      // Clear previous timeout
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      // Set new timeout (debounce)
      timeoutId = setTimeout(() => {
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }, delay);
    };

    // Add event listener
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    // Initial check
    handleResize();

    // Cleanup
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [delay]);

  return windowSize;
};

export default useBreakpoint;

