import React, { useState } from 'react';
import TopNavBar from './components/TopNavBar';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';

const ADHDProductivityDashboard = () => {
  const [activeTab, setActiveTab] = useState('tasks');
  const [mood, setMood] = useState('focused');
  const [theme, setTheme] = useState('light');

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <TopNavBar mood={mood} theme={theme} onThemeToggle={toggleTheme} />
      
      <div className="flex">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} theme={theme} />
        
        <main className="flex-1 p-6">
          <div className="mb-6">
            <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Welcome back! Ready to focus? 🚀
            </h2>
            <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
              Here's your personalized dashboard for today
            </p>
          </div>
          
          <Dashboard mood={mood} theme={theme} />
        </main>
      </div>
    </div>
  );
};

export default ADHDProductivityDashboard;