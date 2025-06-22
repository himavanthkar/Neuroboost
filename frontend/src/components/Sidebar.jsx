import React from 'react';
import { LayoutDashboard, ListTodo, Calendar, BrainCircuit, BarChart2, Gem, FileText } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Sidebar = ({ activeTab, onTabChange }) => {
  const { darkMode } = useTheme();
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'notes', label: 'Transcribed Notes', icon: FileText },
    { id: 'tasks', label: 'Tasks', icon: ListTodo },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'cbt', label: 'CBT (Therapy)', icon: BrainCircuit },
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
    { id: 'gamification', label: 'Level Up', icon: Gem },
  ];

  return (
    <aside className={`w-64 h-screen p-4 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
      <nav className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                activeTab === item.id
                  ? darkMode ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700'
                  : darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;