import React from 'react';

const CBTView = ({ theme, timeLeft }) => {
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`p-8 rounded-lg shadow-md ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
      <h3 className={`text-2xl font-bold mb-4 text-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
        CBT Focus Zone
      </h3>
      <p className={`text-center mb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
        Engage in a 15-minute focused work session to concentrate without distractions.
      </p>
      <div className="text-center my-8">
        <p className={`text-7xl font-mono font-bold ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
          {formatTime(timeLeft)}
        </p>
        <p className={`mt-2 text-sm uppercase tracking-wider ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
          Time Remaining
        </p>
      </div>
      <p className={`text-center text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
        When the timer ends, you'll transition to the Play Zone for a short break.
      </p>
    </div>
  );
};

export default CBTView; 