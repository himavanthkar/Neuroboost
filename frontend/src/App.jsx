import React, { useState } from 'react';
import TopNavBar from './components/TopNavBar';
import Sidebar from './components/Sidebar';
import DailyPKGSummary from './components/DailyPKGSummary';
import TodoList from './components/TodoList';
import SmartSchedule from './components/SmartSchedule';
import MotivationCard from './components/MotivationCard';

function App() {
  const [theme, setTheme] = useState('light');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mood, setMood] = useState('focused');

  const handleThemeToggle = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const renderDashboard = () => (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DailyPKGSummary theme={theme} />
        <MotivationCard mood={mood} theme={theme} />
        <TodoList theme={theme} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SmartSchedule theme={theme} />
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'notes':
        return <div className="p-6">Transcribed Notes - Coming Soon</div>;
      case 'tasks':
        return <div className="p-6">Tasks Management - Coming Soon</div>;
      case 'calendar':
        return <div className="p-6">Calendar View - Coming Soon</div>;
      case 'cbt':
        return <div className="p-6">CBT Tools - Coming Soon</div>;
      case 'analytics':
        return <div className="p-6">Analytics Dashboard - Coming Soon</div>;
      case 'gamification':
        return <div className="p-6">Gamification - Coming Soon</div>;
      default:
        return renderDashboard();
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <TopNavBar 
        mood={mood} 
        theme={theme} 
        onThemeToggle={handleThemeToggle} 
        onTabChange={handleTabChange}
      />
      <div className="flex">
        <Sidebar 
          activeTab={activeTab} 
          onTabChange={handleTabChange} 
          theme={theme} 
        />
        <main className="flex-1">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default App; 