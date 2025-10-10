import React from 'react';

interface CardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ title, icon, children, className = '' }) => {
  return (
    <div className={`bg-surface-light dark:bg-surface-dark p-6 rounded-xl border border-gray-200 shadow-lg dark:border-gray-700 ${className}`}>
      <div className="flex items-center mb-4">
        {icon}
        <h3 className="ml-3 text-xl font-bold text-text-main-light dark:text-text-main-dark">{title}</h3>
      </div>
      <div className="text-text-main-light dark:text-text-main-dark space-y-4">
        {children}
      </div>
    </div>
  );
};

export default Card;
