import React from 'react';
import CBTView from './CBTView';
import PlayZoneView from './PlayZoneView';

const CBTPomodoroFlow = ({ 
  theme, 
  cbtMode, 
  cbtTimeLeft, 
  cbtTimerActive, 
  startCbtTimer, 
  stopCbtTimer, 
  resetCbtTimer,
  skipToPlayZone
}) => {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Focus & Reward Cycle
        </h2>
        <div className="flex gap-2">
          {!cbtTimerActive && cbtMode && (
            <button
              onClick={skipToPlayZone}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                theme === 'dark'
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              Demo Skip
            </button>
          )}
          {!cbtTimerActive ? (
            <button
              onClick={startCbtTimer}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                theme === 'dark'
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              Start Timer
            </button>
          ) : (
            <button
              onClick={stopCbtTimer}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                theme === 'dark'
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
            >
              Pause Timer
            </button>
          )}
          <button
            onClick={resetCbtTimer}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              theme === 'dark'
                ? 'bg-gray-600 hover:bg-gray-700 text-white'
                : 'bg-gray-500 hover:bg-gray-600 text-white'
            }`}
          >
            Reset
          </button>
        </div>
      </div>
      {cbtMode ? (
        <CBTView theme={theme} timeLeft={cbtTimeLeft} />
      ) : (
        <PlayZoneView theme={theme} timeLeft={cbtTimeLeft} />
      )}
    </div>
  );
};

export default CBTPomodoroFlow; 