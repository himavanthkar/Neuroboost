import React from 'react';

const DashboardCard = ({ title, children, theme, className = "" }) => (
  <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6 shadow-sm ${className}`}>
    <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
    {children}
  </div>
);

export default DashboardCard; 