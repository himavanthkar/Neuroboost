import React from 'react';
import { useTheme } from '../context/ThemeContext';
import DashboardCard from './DashboardCard';
import CatProgress from './CatProgress';

const Analytics = ({ tasks }) => {
  const { darkMode } = useTheme();

  // Calculate analytics from tasks
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  // Calculate streak (simplified)
  const today = new Date().toISOString().slice(0, 10);
  const todayTasks = tasks.filter(t => t.date === today);
  const todayCompleted = todayTasks.filter(t => t.completed).length;
  
  // Priority distribution
  const priorityStats = {
    high: tasks.filter(t => t.priority === 'high').length,
    medium: tasks.filter(t => t.priority === 'medium').length,
    low: tasks.filter(t => t.priority === 'low').length
  };

  return (
    <div className="space-y-6">
      {/* Cat Drawing Progress */}
      <DashboardCard title="🐱 Cat Progress">
        <CatProgress totalTasks={totalTasks} completedTasks={completedTasks} />
      </DashboardCard>

      {/* Analytics Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DashboardCard title="📊 Task Analytics">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Total Tasks</span>
              <span className="font-bold text-blue-600">{totalTasks}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Completed</span>
              <span className="font-bold text-green-600">{completedTasks}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Completion Rate</span>
              <span className="font-bold text-purple-600">{completionRate}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Today's Progress</span>
              <span className="font-bold text-orange-600">{todayCompleted} tasks</span>
            </div>
          </div>
        </DashboardCard>

        <DashboardCard title="🎯 Priority Distribution">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>High Priority</span>
              </div>
              <span className="font-bold">{priorityStats.high}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Medium Priority</span>
              </div>
              <span className="font-bold">{priorityStats.medium}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Low Priority</span>
              </div>
              <span className="font-bold">{priorityStats.low}</span>
            </div>
          </div>
        </DashboardCard>
      </div>
    </div>
  );
};

export default Analytics; 