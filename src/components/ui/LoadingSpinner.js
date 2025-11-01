import React from 'react';
import { motion } from 'framer-motion';
import { COLORS } from '../../constants/colors';

const LoadingSpinner = ({
  size = 'medium',
  color = COLORS.accent,
  className = '',
  text = null
}) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  const spinnerVariants = {
    animate: {
      rotate: 360,
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: 'linear'
      }
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <motion.div
        className={`${sizeClasses[size]} border-2 border-transparent rounded-full`}
        style={{
          borderTopColor: color,
          borderRightColor: color
        }}
        variants={spinnerVariants}
        animate="animate"
      />
      {text && (
        <p className="mt-2 text-sm text-gray-400">{text}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;
