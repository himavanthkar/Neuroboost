import React from 'react';
import DailyPKGSummary from './DailyPKGSummary';
import TodoList from './TodoList';
import SmartSchedule from './SmartSchedule';
import MotivationCard from './MotivationCard';

const Dashboard = ({ mood, theme }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
    <DailyPKGSummary theme={theme} />
    <TodoList theme={theme} />
    <SmartSchedule theme={theme} />
    <MotivationCard mood={mood} theme={theme} />
  </div>
);

export default Dashboard; 