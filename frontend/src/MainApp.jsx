import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
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
import SettingsPage from './components/SettingsPage';
import AdminDashboard from './components/AdminDashboard';
import TranscribedNotes from './components/TranscribedNotes';
import { useTheme } from './context/ThemeContext';
import { useAuth } from './context/AuthContext';
import SimpleVoiceWidget from './components/SimpleVoiceWidget';
import { supabase } from './services/supabase';

const notificationSound = new Audio('https://orangefreesounds.com/wp-content/uploads/2020/04/Alert-notification.mp3');
const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3000';

function MainApp() {
  const { darkMode } = useTheme();
  const { currentUser } = useAuth();

  // Redirect to login if not authenticated
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  const [activeTab, setActiveTab] = useState('dashboard');
  const [mood, setMood] = useState('focused');
  const [profilePic, setProfilePic] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [totalCompletedTasks, setTotalCompletedTasks] = useState(0);
  const [loading, setLoading] = useState(true);

  // Load tasks from Supabase
  const loadTasks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading tasks:', error);
        return;
      }

      // Transform Supabase data to match frontend format
      const transformedTasks = data.map(task => ({
        id: task.id,
        text: task.text,
        done: task.done,
        date: task.date,
        completedAt: task.completed_at,
        type: task.type,
        energy_required: task.energy_required,
        difficulty: task.difficulty,
        source: task.source
      }));

      setTasks(transformedTasks);
      setTotalCompletedTasks(transformedTasks.filter(t => t.done).length);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load tasks on component mount and when user changes
  useEffect(() => {
    if (currentUser) {
      loadTasks();
    }
  }, [currentUser]);

  // Check if user is admin
  useEffect(() => {
    if (currentUser) {
      setIsAdmin(currentUser.email === 'admin@neuroboost.com');
    }
  }, [currentUser]);

  // WebSocket connection for real-time updates
  useEffect(() => {
    const ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      console.log('WebSocket connection established');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('Received WebSocket message:', data);

      if (data.event === 'tasks_updated' && data.tasks) {
        const newTasks = data.tasks.tasks.map(task => ({
          id: task.id || Date.now() + Math.random(),
          text: task.title,
          done: false,
          date: task.due_date || new Date().toISOString().slice(0, 10),
          completedAt: null
        }));
        
        setTasks(prevTasks => [...prevTasks, ...newTasks]);
        notificationSound.play();
      }
      
      if (data.event === 'mood_updated' && data.mood) {
          setMood(data.mood.mood);
          notificationSound.play();
      }
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed');
      // Optional: implement reconnection logic here
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      ws.close();
    };
  }, []);

  // CBT Timer state
  const [cbtMode, setCbtMode] = useState(true);
  const [cbtTimeLeft, setCbtTimeLeft] = useState(15 * 60);
  const [cbtTimerActive, setCbtTimerActive] = useState(false);

  const handleProfilePicChange = (newPic) => {
    setProfilePic(newPic);
  };

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

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleToggleTask = async (id) => {
    try {
      const task = tasks.find(t => t.id === id);
      if (!task) return;

      const isNowDone = !task.done;
      
      // Update in Supabase
      const { error } = await supabase
        .from('tasks')
        .update({ 
          done: isNowDone, 
          completed_at: isNowDone ? new Date().toISOString() : null 
        })
        .eq('id', id);

      if (error) {
        console.error('Error updating task:', error);
        return;
      }

      // Update local state
      setTasks(tasks.map(task => {
        if (task.id === id) {
          return { 
            ...task, 
            done: isNowDone, 
            completedAt: isNowDone ? new Date().toISOString() : null 
          };
        }
        return task;
      }));

      // Update completed count
      if (isNowDone) {
        setTotalCompletedTasks(prevCount => prevCount + 1);
      } else {
        setTotalCompletedTasks(prevCount => Math.max(0, prevCount - 1));
      }
    } catch (error) {
      console.error('Error toggling task:', error);
    }
  };

  const handleAddTask = async (text, date) => {
    if (text.trim() === '') return;
    
    try {
      // Add to Supabase
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          user_id: currentUser.id,
          text: text.trim(),
          done: false,
          date: date,
          type: 'personal',
          energy_required: 'medium',
          difficulty: 'medium',
          source: 'manual'
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding task:', error);
        return;
      }

      // Add to local state
      const newTask = {
        id: data.id,
        text: data.text,
        done: data.done,
        date: data.date,
        completedAt: data.completed_at,
        type: data.type,
        energy_required: data.energy_required,
        difficulty: data.difficulty,
        source: data.source
      };

      setTasks([newTask, ...tasks]);
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      // Delete from Supabase
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting task:', error);
        return;
      }

      // Remove from local state
      const taskToDelete = tasks.find(t => t.id === id);
      setTasks(tasks.filter(task => task.id !== id));
      
      // Update completed count if task was done
      if (taskToDelete?.done) {
        setTotalCompletedTasks(prevCount => Math.max(0, prevCount - 1));
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
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

  // Global function for voice integration
  useEffect(() => {
    window.addTaskToMainApp = (text, date) => {
      handleAddTask(text, date);
    };
    
    return () => {
      delete window.addTaskToMainApp;
    };
  }, []);

  const renderDashboard = () => (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <DailyPKGSummary />
        <LevelUpStatus xp={totalCompletedTasks} />
        <TodoList
          tasks={tasks.filter(t => t.date === new Date().toISOString().slice(0, 10))}
          onToggle={handleToggleTask}
          onDelete={handleDeleteTask}
          onAdd={(text) => handleAddTask(text, new Date().toISOString().slice(0, 10))}
          onClear={handleClearTodaysTasks}
          className="lg:col-span-2"
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SmartSchedule />
        <MotivationCard mood={mood} />
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'tasks':
        return <WeeklyTasksView
          tasks={tasks}
          onToggle={handleToggleTask}
          onDelete={handleDeleteTask}
          onAdd={handleAddTask}
          onClearAll={handleClearAllTasks}
        />;
      case 'gamification':
        return <LevelUpStatus
          xp={totalCompletedTasks}
          isFullPage={true}
        />;
      case 'notes':
        return <TranscribedNotes />;
      case 'calendar':
        return <CalendarView tasks={tasks} />;
      case 'cbt':
        return <CBTPomodoroFlow
          cbtMode={cbtMode}
          cbtTimeLeft={cbtTimeLeft}
          cbtTimerActive={cbtTimerActive}
          startCbtTimer={startCbtTimer}
          stopCbtTimer={stopCbtTimer}
          resetCbtTimer={resetCbtTimer}
          skipToPlayZone={skipToPlayZone}
        />;
      case 'analytics':
        return <AnalyticsView tasks={tasks} />;
      case 'settings':
        return <SettingsPage onProfilePicChange={handleProfilePicChange} profilePic={profilePic}/>;
      case 'admin':
        return <AdminDashboard />;
      case 'voice':
        return <SimpleVoiceWidget />;
      default:
        return renderDashboard();
    }
  };

  return (
    <div className={`flex h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <Sidebar activeTab={activeTab} onTabChange={handleTabChange} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNavBar
          mood={mood}
          onTabChange={handleTabChange}
          profilePic={profilePic}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          {renderContent()}
        </main>
      </div>
      
      {/* Always visible voice assistant */}
      <SimpleVoiceWidget />
    </div>
  );
}

export default MainApp;
