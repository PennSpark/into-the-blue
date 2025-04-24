import React from 'react';

interface ProgressStarsProps {
  objectsFound: number;
  totalObjects: number;
}

const ProgressStars: React.FC<ProgressStarsProps> = ({ objectsFound, totalObjects }) => {
  // Commented out star logic
  // const isOneStar = objectsFound >= 3;
  // const isTwoStars = objectsFound >= 12;
  // const isThreeStars = objectsFound >= 20;

  return (
    <div className="flex flex-col items-center w-full pt-3">
      {/* Stars section - commented out
      <div className="w-full relative px-4 pt-0">
        <div className="relative flex justify-between items-center">
          <div className="flex items-center">
            <img 
              src={`/sites/blue/icons/${isOneStar ? 'yellow' : 'grey'}-star.svg`} 
              alt="1 star" 
              className="w-6 h-6"
            />
          </div>
          
          <div className="flex items-center">
            <img 
              src={`/sites/blue/icons/${isThreeStars ? 'yellow' : 'grey'}-star.svg`} 
              alt="3 stars" 
              className="w-6 h-6"
            />
            <img 
              src={`/sites/blue/icons/${isThreeStars ? 'yellow' : 'grey'}-star.svg`} 
              alt="" 
              className="w-6 h-6"
            />
            <img 
              src={`/sites/blue/icons/${isThreeStars ? 'yellow' : 'grey'}-star.svg`} 
              alt="" 
              className="w-6 h-6"
            />
          </div>
        </div>
        
        <div className="absolute left-1/2 transform -translate-x-1/2 top-0 flex items-center">
          <img 
            src={`/sites/blue/icons/${isTwoStars ? 'yellow' : 'grey'}-star.svg`} 
            alt="2 stars" 
            className="w-6 h-6"
          />
          <img 
            src={`/sites/blue/icons/${isTwoStars ? 'yellow' : 'grey'}-star.svg`} 
            alt="" 
            className="w-6 h-6"
          />
        </div>
      </div>
      */}
      
      {/* Objects found text - kept as requested */}
      <div className="text-center text-gray2" style={{
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