import React from 'react';
import { FileText, CheckSquare, Calendar, Brain, BarChart3, Trophy } from 'lucide-react';

const Sidebar = ({ activeTab, onTabChange, theme }) => {
  const navItems = [
    { id: 'notes', label: 'Transcribed Notes', icon: FileText },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'cbt', label: 'CBT (Therapy)', icon: Brain },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'gamification', label: 'Gamification', icon: Trophy }
  ];

  return (
    <aside className={`w-64 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-r min-h-screen p-4`}>
      <nav className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                activeTab === item.id
                  ? theme === 'dark' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700'
                  : theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'
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