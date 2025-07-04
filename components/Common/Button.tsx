import React from 'react';
import { ButtonProps } from '../../types';

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', size = 'md', className = '', ...props }) => {
  const baseStyles = 'font-semibold rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed';
  
  let variantStyles = '';
  switch (variant) {
    case 'primary':
      variantStyles = 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500';
      break;
    case 'secondary':
      variantStyles = 'bg-gray-200 hover:bg-gray-300 text-gray-800 focus:ring-gray-400';
      break;
    case 'danger':
      variantStyles = 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500';
      break;
    case 'ghost':
      variantStyles = 'bg-transparent hover:bg-gray-100 text-gray-700 focus:ring-gray-400 border border-gray-300';
      break;
  }

  let sizeStyles = '';
  switch (size) {
    case 'sm':
      sizeStyles = 'px-3 py-1.5 text-sm';
      break;
    case 'md':
      sizeStyles = 'px-4 py-2 text-base';
      break;
    case 'lg':
      sizeStyles = 'px-6 py-3 text-lg';
      break;
  }

  return (
    <button
      className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
