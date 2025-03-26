import React from 'react';

interface ProgressBarProps {
  objectsFound: number;
  totalObjects: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ objectsFound, totalObjects }) => {
  // Calculate the progress percentage
  const progressPercentage = (objectsFound / totalObjects) * 100;
  
  return (
    <div className="w-full bg-gray-200 h-4 fixed top-0 left-0 z-50">
      <div 
        className="h-4 transition-width duration-300 ease-in-out rounded-r-md" 
        style={{ 
          width: `${progressPercentage}%`,
          backgroundColor: '#4066E3',
        }}
      />
    </div>
  );
};

export default ProgressBar;