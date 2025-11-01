import React from 'react';
import { motion } from 'framer-motion';
import { COLORS } from '../../constants/colors';

const SkeletonLoader = ({
  width = '100%',
  height = '1rem',
  className = '',
  rounded = true,
  lines = 1
}) => {
  const skeletonVariants = {
    animate: {
      backgroundColor: [
        COLORS.backgroundAccent,
        COLORS.backgroundSecondary,
        COLORS.backgroundAccent
      ],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  };

  const renderSkeleton = (key) => (
    <motion.div
      key={key}
      className={`bg-gray-700 ${rounded ? 'rounded' : ''} ${className}`}
      style={{ width, height }}
      variants={skeletonVariants}
      animate="animate"
    />
  );

  if (lines === 1) {
    return renderSkeleton(0);
  }

  return (
    <div className="space-y-2">
      {Array.from({ length: lines }, (_, index) => renderSkeleton(index))}
    </div>
  );
};

// Componentes específicos para diferentes tipos de conteúdo
export const CardSkeleton = ({ className = '' }) => (
  <div className={`bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl shadow-lg border border-gray-700/50 ${className}`}>
    <SkeletonLoader height="1.5rem" width="60%" className="mb-4" />
    <SkeletonLoader height="1rem" width="80%" className="mb-2" />
    <SkeletonLoader height="1rem" width="70%" className="mb-2" />
    <SkeletonLoader height="1rem" width="50%" />
  </div>
);

export const TableSkeleton = ({ rows = 5, columns = 4, className = '' }) => (
  <div className={`space-y-3 ${className}`}>
    {Array.from({ length: rows }, (_, rowIndex) => (
      <div key={rowIndex} className="flex space-x-4">
        {Array.from({ length: columns }, (_, colIndex) => (
          <SkeletonLoader
            key={colIndex}
            height="2rem"
            width={`${100 / columns}%`}
            className="flex-1"
          />
        ))}
      </div>
    ))}
  </div>
);

export default SkeletonLoader;
