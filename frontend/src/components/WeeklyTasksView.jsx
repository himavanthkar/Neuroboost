import React, { useState, useEffect } from 'react';
import { addDays, format, startOfWeek } from 'date-fns';
import { Trash2 } from 'lucide-react';
import slothImage from '../assets/sloth.jpg';

const DayColumn = ({ theme, day, tasks, onToggle, onDelete, onAdd }) => {
  const [newTaskText, setNewTaskText] = useState('');

  const handleAddTask = (e) => {
    e.preventDefault();
    onAdd(newTaskText, format(day, 'yyyy-MM-dd'));
    setNewTaskText('');
  };

  return (
    <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
      <h3 className={`font-bold text-center mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
        {format(day, 'EEE')}
      </h3>
      <div className="space-y-2 min-h-[150px]">
        {tasks.map(task => (
          <div key={task.id} className="flex items-center space-x-2 p-2 rounded-md group transition-colors hover:bg-gray-200 dark:hover:bg-gray-700">
            <input
              type="checkbox"
              checked={task.done}
              onChange={() => onToggle(task.id)}
              className="form-checkbox h-4 w-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <span className={`flex-1 text-sm ${task.done ? 'line-through opacity-60' : ''} ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {task.text}
            </span>
            <button
              onClick={() => onDelete(task.id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
      <form onSubmit={handleAddTask} className="mt-2 flex space-x-2">
        <input
          type="text"
          value={newTaskText}
          onChange={(e) => setNewTaskText(e.target.value)}
          placeholder="Add task..."
          className={`w-full px-2 py-1 rounded border text-sm ${
            theme === 'dark' 
              ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500' 
              : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500'
          }`}
        />
      </form>
    </div>
  );
};

const WeeklyTasksView = ({ theme, tasks, onToggle, onDelete, onAdd }) => {
  const [showCalendar, setShowCalendar] = useState(false);

  const noTasks = tasks.length === 0;
  const allTasksCompleted = !noTasks && tasks.every(task => task.done);

  useEffect(() => {
    // Automatically hide calendar if all tasks are completed or list is empty
    if (noTasks || allTasksCompleted) {
      setShowCalendar(false);
    } else {
      setShowCalendar(true);
    }
  }, [tasks, noTasks, allTasksCompleted]);

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));

  const renderSlothView = () => (
    <div className={`text-center p-8 rounded-lg mb-4 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
        <img src={slothImage} alt="Sleeping sloth" className="mx-auto mb-4 w-48" />
        <p className={`text-lg mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            {noTasks ? "No tasks for this week. Add one to get started!" : "Assignments are all completed"}
        </p>
        <button
            onClick={() => setShowCalendar(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm font-medium"
        >
            Add Task
        </button>
    </div>
  );

  return (
      <div className="p-6">
          <h2 className={`text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              This Week's Tasks
          </h2>

          {(noTasks || allTasksCompleted) && !showCalendar ? renderSlothView() : (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4">
                {days.map(day => (
                    <DayColumn
                        key={day}
                        theme={theme}
                        day={day}
                        tasks={tasks.filter(t => t.date === format(day, 'yyyy-MM-dd'))}
                        onToggle={onToggle}
                        onDelete={onDelete}
                        onAdd={onAdd}
                    />
                ))}
            </div>
          )}
      </div>
  );
};

export default WeeklyTasksView; 