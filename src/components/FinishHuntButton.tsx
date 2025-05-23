import React, { useState } from 'react';
import Link from 'next/link';

interface FinishHuntButtonProps {
  objectsFound: number;
}

const FinishHuntButton: React.FC<FinishHuntButtonProps> = ({ objectsFound = 0 }) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const insufficientObjectsFound = objectsFound < 3;
  
  // Style conditionally based on objects found
  
  const handleButtonClick = () => {
    if (!insufficientObjectsFound) {
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
        className={`cursor-${insufficientObjectsFound ? 'default' : 'pointer'} ${insufficientObjectsFound ? 'opacity-50' : ''}`}
      >
        <div className="flex items-center bg-green text-warm-white w-fit h-fit px-4 py-1 rounded-full">
          <p className="font-medium text-base">Finish Hunt</p>
        </div>
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
              <Link href="/ending">
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
