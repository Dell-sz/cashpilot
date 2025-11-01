import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

const Toast = ({
  message,
  type = 'info',
  onClose,
  duration = 4000,
  className = ''
}) => {
  const typeStyles = {
    success: {
      bg: 'bg-green-500/10',
      border: 'border-green-500/30',
      text: 'text-green-400',
      icon: '✅'
    },
    error: {
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      text: 'text-red-400',
      icon: '❌'
    },
    warning: {
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/30',
      text: 'text-yellow-400',
      icon: '⚠️'
    },
    info: {
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/30',
      text: 'text-blue-400',
      icon: 'ℹ️'
    }
  };

  const style = typeStyles[type] || typeStyles.info;

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [onClose, duration]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.8 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`fixed top-4 right-4 z-50 max-w-sm ${style.bg} border ${style.border} rounded-lg p-4 shadow-lg backdrop-blur-sm ${className}`}
    >
      <div className="flex items-start space-x-3">
        <span className="text-lg">{style.icon}</span>
        <div className="flex-1">
          <p className={`${style.text} text-sm font-medium`}>{message}</p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-200 transition-colors"
        >
          ✕
        </button>
      </div>
    </motion.div>
  );
};

export default Toast;
