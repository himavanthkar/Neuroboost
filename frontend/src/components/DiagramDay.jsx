import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import CatProgress from './CatProgress';
import DashboardCard from './DashboardCard';

const DiagramDay = ({ tasks }) => {
  const { darkMode } = useTheme();
  const [selectedAnimal, setSelectedAnimal] = useState('cat');

  // Calculate task statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.done).length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Animal options (for future expansion)
  const animals = [
    { id: 'cat', name: 'Cat', emoji: '🐱', description: 'Your daily companion' },
    { id: 'dog', name: 'Dog', emoji: '🐕', description: 'Loyal friend' },
    { id: 'rabbit', name: 'Rabbit', emoji: '🐰', description: 'Quick and focused' }
  ];

  const getMotivationalMessage = () => {
    if (totalTasks === 0) {
      return "No tasks today! Your cat is waiting in gray. Create some tasks to get started! 🐱";
    }
    
    if (completionRate === 100) {
      return "🎉 Amazing! You've completed all your tasks! Your cat is fully blue and proud!";
    }
    
    if (completedTasks === 0) {
      return "Tasks created! Start completing them to turn your cat red! 🔥";
    }
    
    if (completionRate >= 80) {
      return "Almost there! Just a few more tasks to make your cat fully blue! 🚀";
    }
    
    if (completionRate >= 60) {
      return "Great progress! Your cat is getting redder! Keep going! 💪";
    }
    
    if (completionRate >= 40) {
      return "Good start! Your cat is turning red! 🌟";
    }
    
    if (completionRate >= 20) {
      return "Getting started! Your cat's tail is red! 🎯";
    }
    
    return "First task completed! Your cat is starting to turn red! ✨";
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className={`text-center p-6 rounded-lg border ${
        darkMode ? 'bg-gray-800 border-gray-600' : 'bg-gradient-to-r from-pink-50 to-purple-50 border-pink-200'
      }`}>
        <div className="flex items-center justify-center space-x-3 mb-4">
          <span className="text-4xl">🎨</span>
          <div>
            <h1 className={`text-3xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
              Diagram Day
            </h1>
            <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Complete tasks to color in your daily companion!
            </p>
          </div>
        </div>
      </div>

      {/* Main Cat Progress Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cat Drawing */}
        <div className="lg:col-span-2">
          <DashboardCard title="🐱 Your Daily Cat">
            <div className="flex flex-col items-center space-y-4">
              <CatProgress totalTasks={totalTasks} completedTasks={completedTasks} />
              
              {/* Progress Stats */}
              <div className="grid grid-cols-3 gap-4 w-full max-w-md">
                <div className={`text-center p-3 rounded-lg ${
                  darkMode ? 'bg-gray-700' : 'bg-blue-50'
                }`}>
                  <div className="text-2xl font-bold text-blue-600">{totalTasks}</div>
                  <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-blue-600'}`}>Total Tasks</div>
                </div>
                <div className={`text-center p-3 rounded-lg ${
                  darkMode ? 'bg-gray-700' : 'bg-green-50'
                }`}>
                  <div className="text-2xl font-bold text-green-600">{completedTasks}</div>
                  <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-green-600'}`}>Completed</div>
                </div>
                <div className={`text-center p-3 rounded-lg ${
                  darkMode ? 'bg-gray-700' : 'bg-purple-50'
                }`}>
                  <div className="text-2xl font-bold text-purple-600">{completionRate}%</div>
                  <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-purple-600'}`}>Progress</div>
                </div>
              </div>
            </div>
          </DashboardCard>
        </div>

        {/* Motivational Panel */}
        <div>
          <DashboardCard title="💝 Daily Motivation">
            <div className="space-y-4">
              <div className={`p-4 rounded-lg ${
                darkMode ? 'bg-gray-700' : 'bg-yellow-50'
              }`}>
                <p className={`text-center font-medium ${darkMode ? 'text-gray-300' : 'text-yellow-800'}`}>
                  {getMotivationalMessage()}
                </p>
              </div>
              
              {/* Cat Parts Legend */}
              <div className="space-y-2">
                <h4 className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Cat Progress:
                </h4>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                    <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>No tasks (Gray)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-200 rounded-full"></div>
                    <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Tasks exist (Light)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Progress (Red)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Complete (Blue)</span>
                  </div>
                </div>
              </div>
            </div>
          </DashboardCard>
        </div>
      </div>

      {/* Fun Facts Section */}
      <DashboardCard title="🐾 Fun Facts">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={`p-4 rounded-lg ${
            darkMode ? 'bg-gray-700' : 'bg-indigo-50'
          }`}>
            <h4 className={`font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-indigo-700'}`}>
              🎯 Why Cats?
            </h4>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-indigo-600'}`}>
              Cats are perfect for ADHD brains - they're focused, independent, and know how to take breaks. Just like you should!
            </p>
          </div>
          <div className={`p-4 rounded-lg ${
            darkMode ? 'bg-gray-700' : 'bg-teal-50'
          }`}>
            <h4 className={`font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-teal-700'}`}>
              🌟 Progress Tip
            </h4>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-teal-600'}`}>
              Every task you complete adds color to your cat. Small wins create big progress!
            </p>
          </div>
        </div>
      </DashboardCard>
    </div>
  );
};

export default DiagramDay; 