import React, { useState, useEffect } from 'react';
import TopNavBar from './components/TopNavBar';
import Sidebar from './components/Sidebar';
import DailyPKGSummary from './components/DailyPKGSummary';
import TodoList from './components/TodoList';
import SmartSchedule from './components/SmartSchedule';
import MotivationCard from './components/MotivationCard';
import WeeklyTasksView from './components/WeeklyTasksView';
import LevelUpStatus from './components/LevelUpStatus';
import CalendarView from './components/CalendarView';
import CBTPomodoroFlow from './components/CBTPomodoroFlow';
import AnalyticsView from './components/AnalyticsView';

const notificationSound = new Audio('https://orangefreesounds.com/wp-content/uploads/2020/04/Alert-notification.mp3');

function App() {
  const [theme, setTheme] = useState('light');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mood, setMood] = useState('focused');
  const [tasks, setTasks] = useState([
    { id: 1, text: "Complete math assignment", done: true, date: new Date().toISOString().slice(0, 10), completedAt: new Date().toISOString() },
    { id: 2, text: "Review chemistry notes", done: false, date: new Date().toISOString().slice(0, 10), completedAt: null },
    { id: 3, text: "Write history essay outline", done: false, date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10), completedAt: null },
  ]);
  const [totalCompletedTasks, setTotalCompletedTasks] = useState(() => tasks.filter(t => t.done).length);

  // CBT Timer state
  const [cbtMode, setCbtMode] = useState(true);
  const [cbtTimeLeft, setCbtTimeLeft] = useState(15 * 60);
  const [cbtTimerActive, setCbtTimerActive] = useState(false);

  // CBT Timer effect
  useEffect(() => {
    if (!cbtTimerActive) return;

    const timer = setInterval(() => {
      setCbtTimeLeft(prevTime => {
        if (prevTime <= 1) {
          notificationSound.play();
          // Switch mode and set time for the next phase
          if (cbtMode) {
            setCbtMode(false);
            return 10 * 60; // Play Zone duration
          } else {
            setCbtMode(true);
            return 15 * 60; // CBT duration
          }
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [cbtMode, cbtTimerActive]);

  const handleThemeToggle = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleToggleTask = (id) => {
    let taskCompleted = false;
    setTasks(tasks.map(task => {
      if (task.id === id) {
        const isNowDone = !task.done;
        if (isNowDone) {
          taskCompleted = true;
        }
        return { ...task, done: isNowDone, completedAt: isNowDone ? new Date().toISOString() : null };
      }
      return task;
    }));

    if (taskCompleted) {
      setTotalCompletedTasks(prevCount => prevCount + 1);
    } else {
      // If a task is unchecked, we might need to decrease the total count
      // This logic assumes unchecking a completed task reduces the count.
      const taskWasDone = tasks.find(t => t.id === id)?.done;
      if (taskWasDone) {
        setTotalCompletedTasks(prevCount => Math.max(0, prevCount - 1));
      }
    }
  };

  const handleAddTask = (text, date) => {
    if (text.trim() === '') return;
    const newTask = {
        id: Date.now(),
        text,
        done: false,
        date,
        completedAt: null
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

  const startCbtTimer = () => {
    setCbtTimerActive(true);
  };

  const stopCbtTimer = () => {
    setCbtTimerActive(false);
  };

  const resetCbtTimer = () => {
    setCbtTimerActive(false);
    setCbtMode(true);
    setCbtTimeLeft(15 * 60);
  };

  const skipToPlayZone = () => {
    setCbtMode(false);
    setCbtTimeLeft(10 * 60);
    setCbtTimerActive(true);
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
        return <CBTPomodoroFlow 
          theme={theme}
          cbtMode={cbtMode}
          cbtTimeLeft={cbtTimeLeft}
          cbtTimerActive={cbtTimerActive}
          startCbtTimer={startCbtTimer}
          stopCbtTimer={stopCbtTimer}
          resetCbtTimer={resetCbtTimer}
          skipToPlayZone={skipToPlayZone}
        />;
      case 'analytics':
        return <AnalyticsView theme={theme} tasks={tasks} />;
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