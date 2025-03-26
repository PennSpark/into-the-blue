import React, { useState } from 'react';
import Link from 'next/link';

interface FinishHuntButtonProps {
  objectsFound: number;
}

const FinishHuntButton: React.FC<FinishHuntButtonProps> = ({ objectsFound = 0 }) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const noObjectsFound = objectsFound === 0;
  
  // Style conditionally based on objects found
  const buttonStyles = noObjectsFound 
    ? 'bg-gray-200 text-gray-400' // Light gray and disabled look
    : 'text-green border-2 border-green'; // Normal active state
  
  const handleButtonClick = () => {
    if (!noObjectsFound) {
      setShowConfirmation(true);
    }
  };
  
  const handleClose = () => {
    setShowConfirmation(false);
  };
  
  return (
    <>
      <div 
        onClick={handleButtonClick}
        className={`flex items-center ${buttonStyles} w-fit h-[44px] gap-[6px] px-[20px] rounded-full cursor-${noObjectsFound ? 'default' : 'pointer'}`}
      >
        <p className="font-medium text-base">Finish Hunt</p>
        <svg 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="ml-1"
        >
          <path 
            d="M13.5 4.5L21 12M21 12L13.5 19.5M21 12H3" 
            stroke={noObjectsFound ? "#9CA3AF" : "#12664F"} 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        </svg>
      </div>
      
      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-xl p-6 w-[296px] flex flex-col items-center">
          <h2 className="font-dm-sans text-[20px] tracking-[-0.02em] leading-[1] mb-4 text-green font-semibold">
            Are you sure?
          </h2>
          <p className="text-center text-[16px] tracking-[-0.02em] leading-[1] text-green mb-6 font-medium">
            Your game will end after <br /> finishing the hunt.
          </p>
            <div className="flex space-x-4">
              <button
                onClick={handleClose}
                className="bg-green text-white py-2 px-6 rounded-full font-dm-sans font-button1 text-button1"
              >
                Go Back
              </button>
              <Link href="/finish">
                <button className="bg-green text-white py-2 px-6 rounded-full font-dm-sans font-button1 text-button1">
                  Finish
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FinishHuntButton;