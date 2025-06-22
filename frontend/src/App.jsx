import React, { useState } from 'react';
import TopNavBar from './components/TopNavBar';
import Sidebar from './components/Sidebar';
import DailyPKGSummary from './components/DailyPKGSummary';
import TodoList from './components/TodoList';
import SmartSchedule from './components/SmartSchedule';
import MotivationCard from './components/MotivationCard';
import WeeklyTasksView from './components/WeeklyTasksView';
import LevelUpStatus from './components/LevelUpStatus';
import CalendarView from './components/CalendarView';

function App() {
  const [theme, setTheme] = useState('light');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mood, setMood] = useState('focused');
  const [tasks, setTasks] = useState([
    { id: 1, text: "Complete math assignment", done: true, date: new Date().toISOString().slice(0, 10) },
    { id: 2, text: "Review chemistry notes", done: false, date: new Date().toISOString().slice(0, 10) },
    { id: 3, text: "Write history essay outline", done: false, date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10) },
  ]);
  const [totalCompletedTasks, setTotalCompletedTasks] = useState(() => tasks.filter(t => t.done).length);

  const handleThemeToggle = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleToggleTask = (id) => {
    const taskToToggle = tasks.find(task => task.id === id);
    if (taskToToggle && !taskToToggle.done) {
      setTotalCompletedTasks(prevCount => prevCount + 1);
    }
    
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

  const handleClearAllTasks = () => {
    if (window.confirm("Are you sure you want to delete all tasks for this week? This action cannot be undone.")) {
      setTasks([]);
    }
  };

  const handleClearTodaysTasks = () => {
    if (window.confirm("Are you sure you want to delete all of today's tasks?")) {
      const today = new Date().toISOString().slice(0, 10);
      setTasks(tasks.filter(task => task.date !== today));
    }
  };

  const renderDashboard = () => (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <DailyPKGSummary theme={theme} />
        <LevelUpStatus theme={theme} xp={totalCompletedTasks} />
        <TodoList 
          theme={theme}
          tasks={tasks.filter(t => t.date === new Date().toISOString().slice(0, 10))}
          onToggle={handleToggleTask}
          onDelete={handleDeleteTask}
          onAdd={(text) => handleAddTask(text, new Date().toISOString().slice(0, 10))}
          onClear={handleClearTodaysTasks}
          className="lg:col-span-2"
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SmartSchedule theme={theme} />
        <MotivationCard mood={mood} theme={theme} />
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
          onClearAll={handleClearAllTasks}
        />;
      case 'gamification':
        return <LevelUpStatus 
          theme={theme}
          xp={totalCompletedTasks}
          isFullPage={true} 
        />;
      case 'notes':
        return <div className="p-6">Transcribed Notes - Coming Soon</div>;
      case 'calendar':
        return <CalendarView theme={theme} tasks={tasks} />;
      case 'cbt':
        return <div className="p-6">CBT Tools - Coming Soon</div>;
      case 'analytics':
        return <div className="p-6">Analytics Dashboard - Coming Soon</div>;
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