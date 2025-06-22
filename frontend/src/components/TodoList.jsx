import React from 'react';
import DashboardCard from './DashboardCard';

const TodoList = ({ theme }) => {
  const tasks = [
    { id: 1, text: "Complete math assignment", done: true },
    { id: 2, text: "Review chemistry notes", done: true },
    { id: 3, text: "Write history essay outline", done: false },
    { id: 4, text: "Prepare for physics quiz", done: false },
    { id: 5, text: "Read chapter 5 literature", done: false }
  ];

  const completedCount = tasks.filter(task => task.done).length;
  const progressPercent = (completedCount / tasks.length) * 100;

  return (
    <DashboardCard title="Today's Tasks" theme={theme}>
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            {completedCount} of {tasks.length} completed
          </span>
          <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            {Math.round(progressPercent)}%
          </span>
        </div>
        <div className={`w-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-2`}>
          <div className="bg-blue-500 h-2 rounded-full transition-all duration-300" style={{ width: `${progressPercent}%` }}></div>
        </div>
      </div>
      
      <div className="space-y-3">
        {tasks.map((task) => (
          <div key={task.id} className="flex items-center space-x-3">
            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
              task.done ? 'bg-green-500 border-green-500' : theme === 'dark' ? 'border-gray-600' : 'border-gray-300'
            }`}>
              {task.done && <div className="w-2 h-2 bg-white rounded-full"></div>}
            </div>
            <span className={`flex-1 ${task.done ? 'line-through opacity-60' : ''} ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {task.text}
            </span>
          </div>
        ))}
      </div>
    </DashboardCard>
  );
};

export default TodoList; 