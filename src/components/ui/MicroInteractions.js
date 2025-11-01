import React from 'react';
import { motion } from 'framer-motion';
import { MOTION_VARIANTS } from '../../constants/motionVariants';

// Ripple effect for buttons
export const RippleButton = ({
  children,
  onClick,
  className = '',
  disabled = false,
  ...props
}) => {
  const [ripples, setRipples] = React.useState([]);

  const handleClick = (event) => {
    if (disabled) return;

    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    const newRipple = {
      id: Date.now(),
      x,
      y,
      size
    };

    setRipples(prev => [...prev, newRipple]);

    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 600);

    if (onClick) onClick(event);
  };

  return (
    <motion.button
      className={`relative overflow-hidden ${className}`}
      onClick={handleClick}
      disabled={disabled}
      whileHover={MOTION_VARIANTS.button.hover}
      whileTap={MOTION_VARIANTS.button.tap}
      {...props}
    >
      {children}
      {ripples.map(ripple => (
        <motion.span
          key={ripple.id}
          className="absolute rounded-full bg-white/30"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: ripple.size,
            height: ripple.size
          }}
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: 2, opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      ))}
    </motion.button>
  );
};

// Floating action button with pulse
export const FloatingActionButton = ({
  children,
  onClick,
  className = '',
  pulse = true,
  ...props
}) => {
  return (
    <motion.button
      className={`fixed bottom-6 right-6 w-14 h-14 rounded-full bg-cyan-500 text-white shadow-lg hover:shadow-xl z-40 ${className}`}
      onClick={onClick}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      animate={pulse ? MOTION_VARIANTS.loading.pulse : {}}
      {...props}
    >
      {children}
    </motion.button>
  );
};

// Hover glow effect
export const GlowCard = ({
  children,
  className = '',
  glowColor = '#38bdf8',
  ...props
}) => {
  return (
    <motion.div
      className={`relative ${className}`}
      whileHover={{
        boxShadow: `0 0 20px ${glowColor}30`,
        transition: { duration: 0.3 }
      }}
      {...props}
    >
      {children}
      <motion.div
        className="absolute inset-0 rounded-lg opacity-0"
        style={{ background: `linear-gradient(45deg, ${glowColor}10, transparent)` }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
};

// Shake animation for errors
export const ShakeWrapper = ({
  children,
  shake = false,
  className = '',
  ...props
}) => {
  return (
    <motion.div
      className={className}
      animate={shake ? {
        x: [0, -10, 10, -10, 10, 0],
        transition: { duration: 0.5 }
      } : {}}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// Progressive loading dots
export const LoadingDots = ({
  size = 'medium',
  color = '#38bdf8',
  className = ''
}) => {
  const sizes = {
    small: 'w-1 h-1',
    medium: 'w-2 h-2',
    large: 'w-3 h-3'
  };

  const dotVariants = {
    animate: (index) => ({
      y: [0, -10, 0],
      opacity: [0.4, 1, 0.4],
      transition: {
        duration: 1.2,
        repeat: Infinity,
        delay: index * 0.2,
        ease: 'easeInOut'
      }
    })
  };

  return (
    <div className={`flex space-x-1 items-center ${className}`}>
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className={`rounded-full ${sizes[size]}`}
          style={{ backgroundColor: color }}
          variants={dotVariants}
          animate="animate"
          custom={index}
        />
      ))}
    </div>
  );
};

// Typing indicator
export const TypingIndicator = ({
  className = '',
  color = '#38bdf8'
}) => {
  return (
    <div className={`flex space-x-1 items-center ${className}`}>
      <motion.div
        className="w-2 h-2 rounded-full"
        style={{ backgroundColor: color }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 1, 0.5]
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          delay: 0
        }}
      />
      <motion.div
        className="w-2 h-2 rounded-full"
        style={{ backgroundColor: color }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 1, 0.5]
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          delay: 0.2
        }}
      />
      <motion.div
        className="w-2 h-2 rounded-full"
        style={{ backgroundColor: color }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 1, 0.5]
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          delay: 0.4
        }}
      />
    </div>
  );
};

// Success checkmark animation
export const SuccessCheckmark = ({
  size = 24,
  color = '#10b981',
  className = '',
  autoPlay = true
}) => {
  const pathVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { duration: 0.6, ease: 'easeInOut' },
        opacity: { duration: 0.2 }
      }
    }
  };

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      initial="hidden"
      animate={autoPlay ? "visible" : "hidden"}
    >
      <motion.path
        d="M20 6L9 17L4 12"
        variants={pathVariants}
      />
    </motion.svg>
  );
};

// Heartbeat pulse
export const HeartbeatPulse = ({
  children,
  className = '',
  intensity = 1.1,
  duration = 2
}) => {
  return (
    <motion.div
      className={className}
      animate={{
        scale: [1, intensity, 1],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
    >
      {children}
    </motion.div>
  );
};
