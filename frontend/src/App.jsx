import React, { useState } from 'react';
import TopNavBar from './components/TopNavBar';
import Sidebar from './components/Sidebar';
import DailyPKGSummary from './components/DailyPKGSummary';
import TodoList from './components/TodoList';
import SmartSchedule from './components/SmartSchedule';
import MotivationCard from './components/MotivationCard';
import WeeklyTasksView from './components/WeeklyTasksView';

function App() {
  const [theme, setTheme] = useState('light');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mood, setMood] = useState('focused');
  const [tasks, setTasks] = useState([
    { id: 1, text: "Complete math assignment", done: true, date: new Date().toISOString().slice(0, 10) },
    { id: 2, text: "Review chemistry notes", done: true, date: new Date().toISOString().slice(0, 10) },
    { id: 3, text: "Write history essay outline", done: false, date: new Date().toISOString().slice(0, 10) },
  ]);

  const handleThemeToggle = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleToggleTask = (id) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, done: !task.done } : task
    ));
  };

  const handleAddTask = (text, date) => {
    if (text.trim() === '') return;
    const newTask = {
        id: Date.now(),
        text,
        done: false,
        date
    };
    setTasks([...tasks, newTask]);
  };

  const handleDeleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const renderDashboard = () => (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DailyPKGSummary theme={theme} />
        <MotivationCard mood={mood} theme={theme} />
        <TodoList 
          theme={theme}
          tasks={tasks.filter(t => t.date === new Date().toISOString().slice(0, 10))}
          onToggle={handleToggleTask}
          onDelete={handleDeleteTask}
          onAdd={(text) => handleAddTask(text, new Date().toISOString().slice(0, 10))}
        />
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
      case 'tasks':
        return <WeeklyTasksView 
          theme={theme}
          tasks={tasks}
          onToggle={handleToggleTask}
          onDelete={handleDeleteTask}
          onAdd={handleAddTask}
        />;
      case 'notes':
        return <div className="p-6">Transcribed Notes - Coming Soon</div>;
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