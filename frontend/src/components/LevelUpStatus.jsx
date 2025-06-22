import React from 'react';
import DashboardCard from './DashboardCard';

// Import the evolution images
import slumberbloomImg from '../assets/Slumberbloom.png';
import arborealmImg from '../assets/Arborealm.png';
import silvangaurdImg from '../assets/Silvangaurd.png';

const evolutions = [
  { name: 'Slumberbloom', xpThreshold: 0, image: slumberbloomImg, level: 1 },
  { name: 'Arborealm', xpThreshold: 10, image: arborealmImg, level: 2 },
  { name: 'Silvangaurd', xpThreshold: 25, image: silvangaurdImg, level: 3 },
];

const LevelUpStatus = ({ theme, xp, isFullPage = false }) => {
  const currentEvolution = [...evolutions].reverse().find(evo => xp >= evo.xpThreshold);
  const nextEvolutionIndex = evolutions.findIndex(evo => evo.name === currentEvolution.name) + 1;
  const nextEvolution = evolutions[nextEvolutionIndex];

  let progressPercent = 100;
  let xpForNextLevel = 'Max';
  
  if (nextEvolution) {
    const xpBaseForCurrentLevel = currentEvolution.xpThreshold;
    const xpNeededForNextLevel = nextEvolution.xpThreshold - xpBaseForCurrentLevel;
    const xpEarnedThisLevel = xp - xpBaseForCurrentLevel;
    progressPercent = (xpEarnedThisLevel / xpNeededForNextLevel) * 100;
    xpForNextLevel = nextEvolution.xpThreshold;
  }
  
  const cardContent = (
    <div className="flex flex-col items-center text-center">
      <img 
        src={currentEvolution.image} 
        alt={currentEvolution.name} 
        className="w-32 h-32 object-contain mb-4"
      />
      <h4 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
        {currentEvolution.name}
      </h4>
      <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
        Level {currentEvolution.level}
      </p>
      <div className="w-full">
        <div className="flex justify-between items-center mb-1 text-xs">
          <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>XP</span>
          <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            {xp} / {xpForNextLevel}
          </span>
        </div>
        <div className={`w-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-2.5`}>
          <div 
            className="bg-yellow-400 h-2.5 rounded-full transition-all duration-500" 
            style={{ width: `${progressPercent}%` }}>
          </div>
        </div>
      </div>
    </div>
  );

  if (isFullPage) {
    return (
      <div className="p-6">
        <h2 className={`text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Your Companion's Evolution
        </h2>
        <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
          {cardContent}
        </div>
      </div>
    );
  }

  return (
    <DashboardCard title="Your Companion" theme={theme}>
      {cardContent}
    </DashboardCard>
  );
};

export default LevelUpStatus;