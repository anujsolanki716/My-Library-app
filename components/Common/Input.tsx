import React from 'react';
import { InputProps } from '../../types';

const Input: React.FC<InputProps> = ({ label, id, error, className = '', ...props }) => {
  const baseInputClasses = "mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm";
  const errorInputClasses = "border-red-500 focus:ring-red-500 focus:border-red-500";

  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`${baseInputClasses} ${error ? errorInputClasses : ''} ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
};

export default Input;
