import React from 'react';

const DashboardCard = ({ title, children, theme, className = "", headerContent = null }) => (
  <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6 shadow-sm ${className}`}>
    <div className="flex justify-between items-start mb-4">
      <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
      {headerContent}
    </div>
    {children}
  </div>
);

export default DashboardCard; 