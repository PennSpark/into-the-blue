import React from 'react';

interface ProgressStarsProps {
  objectsFound: number;
  totalObjects: number;
}

const ProgressStars: React.FC<ProgressStarsProps> = ({ objectsFound, totalObjects }) => {
  const isOneStar = objectsFound >= 3;
  const isTwoStars = objectsFound >= 12;
  const isThreeStars = objectsFound >= 20;

  return (
    <div className="flex flex-col items-center w-full">
      {/* Stars section */}
      <div className="w-full relative px-4 pt-0">
        {/* Container with relative positioning to establish positioning context */}
        <div className="relative flex justify-between items-center">
          {/* First star group (left) - 3+ objects */}
          <div className="flex items-center">
            <img 
              src={`/icons/${isOneStar ? 'yellow' : 'grey'}-star.svg`} 
              alt="1 star" 
              className="w-6 h-6"
            />
          </div>
          
          {/* Third star group (right) - 20+ objects */}
          <div className="flex items-center">
            <img 
              src={`/icons/${isThreeStars ? 'yellow' : 'grey'}-star.svg`} 
              alt="3 stars" 
              className="w-6 h-6"
            />
            <img 
              src={`/icons/${isThreeStars ? 'yellow' : 'grey'}-star.svg`} 
              alt="" 
              className="w-6 h-6"
            />
            <img 
              src={`/icons/${isThreeStars ? 'yellow' : 'grey'}-star.svg`} 
              alt="" 
              className="w-6 h-6"
            />
          </div>
        </div>
        
        {/* Second star group (middle) - 12+ objects - absolutely positioned to center */}
        <div className="absolute left-1/2 transform -translate-x-1/2 top-0 flex items-center">
          <img 
            src={`/icons/${isTwoStars ? 'yellow' : 'grey'}-star.svg`} 
            alt="2 stars" 
            className="w-6 h-6"
          />
          <img 
            src={`/icons/${isTwoStars ? 'yellow' : 'grey'}-star.svg`} 
            alt="" 
            className="w-6 h-6"
          />
        </div>
      </div>
      
      {/* Objects found text */}
      <div className="text-center text-gray2 mt-4" style={{
        fontFamily: 'DM Sans',
        fontSize: '16px',
        fontWeight: 600,
        lineHeight: '1'
      }}>
        {objectsFound}/{totalObjects} objects found
      </div>
    </div>
  );
};

export default ProgressStars;