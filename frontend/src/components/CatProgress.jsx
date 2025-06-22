import React from 'react';

// Each part of the cat is a separate SVG path. We'll color them as progress increases.
const CAT_PARTS = [
  { name: 'tail', color: '#ef4444', lightColor: '#fecaca', progress: 0.2 }, // red
  { name: 'body', color: '#3b82f6', lightColor: '#bfdbfe', progress: 0.4 }, // blue
  { name: 'head', color: '#ef4444', lightColor: '#fecaca', progress: 0.6 }, // red
  { name: 'ears', color: '#ef4444', lightColor: '#fecaca', progress: 0.8 }, // red
  { name: 'eyes', color: '#ef4444', lightColor: '#fecaca', progress: 1.0 }, // red
];

const CatProgress = ({ totalTasks, completedTasks }) => {
  let progress = 0;
  if (totalTasks > 0) progress = completedTasks / totalTasks;

  // If no tasks, show light gray cat
  const noTasks = totalTasks === 0;
  // If all tasks completed, show fully blue cat
  const allCompleted = totalTasks > 0 && completedTasks === totalTasks;

  // Helper to determine if a part should be colored
  const isColored = (part) => {
    if (noTasks) return false; // no color if no tasks
    if (allCompleted) return true; // all blue if all completed
    return progress >= part.progress;
  };

  // Helper to get color for each part
  const getColor = (part) => {
    if (noTasks) return '#d1d5db'; // light gray if no tasks
    if (allCompleted) return '#3b82f6'; // blue if all completed
    return isColored(part) ? part.color : part.lightColor; // red if colored, light color if not
  };

  return (
    <div className="flex flex-col items-center">
      <svg width="160" height="120" viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Tail */}
        <path d="M30 100 Q10 90 30 80 Q50 70 40 100" stroke={getColor(CAT_PARTS[0])} strokeWidth="6" fill="none" />
        {/* Body */}
        <ellipse cx="80" cy="90" rx="40" ry="25" fill={getColor(CAT_PARTS[1])} stroke="#64748b" strokeWidth="2" />
        {/* Head */}
        <ellipse cx="80" cy="55" rx="22" ry="18" fill={getColor(CAT_PARTS[2])} stroke="#64748b" strokeWidth="2" />
        {/* Left Ear */}
        <polygon points="62,50 70,30 78,50" fill={getColor(CAT_PARTS[3])} stroke="#64748b" strokeWidth="2" />
        {/* Right Ear */}
        <polygon points="98,50 90,30 82,50" fill={getColor(CAT_PARTS[3])} stroke="#64748b" strokeWidth="2" />
        {/* Left Eye */}
        <ellipse cx="73" cy="58" rx="3" ry="5" fill={getColor(CAT_PARTS[4])} />
        {/* Right Eye */}
        <ellipse cx="87" cy="58" rx="3" ry="5" fill={getColor(CAT_PARTS[4])} />
        {/* Nose */}
        <ellipse cx="80" cy="65" rx="2" ry="1.5" fill="#f87171" />
        {/* Mouth */}
        <path d="M78 68 Q80 70 82 68" stroke="#f87171" strokeWidth="1.5" fill="none" />
      </svg>
      <div className="mt-2 text-center">
        {noTasks ? (
          <span className="text-gray-500 font-medium">No tasks today! Your cat is waiting in gray 🐱</span>
        ) : allCompleted ? (
          <span className="text-blue-600 font-medium">All tasks done! Your cat is fully blue! 🎉</span>
        ) : completedTasks === 0 ? (
          <span className="text-gray-700 dark:text-gray-200">Tasks created! Complete them to color your cat red!</span>
        ) : (
          <span className="text-red-600 font-medium">Great progress! Your cat is getting redder! 🔥</span>
        )}
      </div>
    </div>
  );
};

export default CatProgress; 