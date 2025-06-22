import React from 'react';
import DashboardCard from './DashboardCard';
import { useTheme } from '../context/ThemeContext';

const SmartSchedule = () => {
  const { darkMode } = useTheme();
  const scheduleItems = [
    { time: "9:00 AM", task: "Math Study Session", type: "focus", duration: "90 min" },
    { time: "10:30 AM", task: "Break & Movement", type: "break", duration: "15 min" },
    { time: "11:00 AM", task: "Chemistry Review", type: "review", duration: "60 min" },
    { time: "12:00 PM", task: "Lunch Break", type: "break", duration: "45 min" },
    { time: "1:00 PM", task: "History Essay Writing", type: "creative", duration: "90 min" }
  ];

  const getTypeColor = (type) => {
    const colors = {
      focus: 'bg-blue-100 text-blue-700 border-blue-200',
      break: 'bg-green-100 text-green-700 border-green-200',
      review: 'bg-purple-100 text-purple-700 border-purple-200',
      creative: 'bg-orange-100 text-orange-700 border-orange-200'
    };
    return darkMode ? 'bg-gray-700 text-gray-300 border-gray-600' : colors[type];
  };

  return (
    <DashboardCard title="Smart Schedule Timeline">
      <div className="space-y-3">
        {scheduleItems.map((item, index) => (
          <div key={index} className="flex items-center space-x-4">
            <div className={`text-sm font-medium w-20 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {item.time}
            </div>
            <div className={`flex-1 px-3 py-2 rounded-lg border ${getTypeColor(item.type)}`}>
              <div className="font-medium">{item.task}</div>
              <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{item.duration}</div>
            </div>
          </div>
        ))}
      </div>
    </DashboardCard>
  );
};

export default SmartSchedule; 