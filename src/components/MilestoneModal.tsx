'use client';

import React, { useEffect, useState } from 'react';

interface MilestoneModalProps {
  objectsFound: number;
  totalObjects: number;
  activeTab: 'list' | 'map';
  fullScreenImagePath?: string;
}

const MilestoneModal: React.FC<MilestoneModalProps> = ({ 
  objectsFound, 
  totalObjects,
  activeTab,
  fullScreenImagePath = '/sites/blue/images/FullCompletion.png'
}) => {
  const [showFirstModal, setShowFirstModal] = useState(false);
  const [showSecondModal, setShowSecondModal] = useState(false);
  const [showThirdModal, setShowThirdModal] = useState(false);
  const [showFullScreenImage, setShowFullScreenImage] = useState(false);
  const [imageOpacity, setImageOpacity] = useState(0);
  const [previousObjectsFound, setPreviousObjectsFound] = useState(objectsFound);

  // Milestone thresholds
  const FIRST_MILESTONE = 3;
  const SECOND_MILESTONE = 18;
  const THIRD_MILESTONE = 37;
  const FINAL_MILESTONE = totalObjects;

  // Handle the fullscreen image display and fade effect - only for third milestone
  const displayFullScreenImage = () => {
    setShowFullScreenImage(true);
    setImageOpacity(1);
    
    setTimeout(() => {
      setImageOpacity(0);
    }, 4500);
    
    setTimeout(() => {
      setShowFullScreenImage(false);
      
      // Show the third milestone modal after the image disappears
      setShowThirdModal(true);
      
      // Auto-dismiss after 3 seconds for the third milestone
      const timer = setTimeout(() => {
        setShowThirdModal(false);
        localStorage.setItem('thirdMilestoneDismissed', 'true');
      }, 3000);
      
      return () => clearTimeout(timer);
    }, 5000);
  };

  useEffect(() => {
    // Check if milestones have been previously dismissed
    const firstMilestoneDismissed = localStorage.getItem('firstMilestoneDismissed') === 'true';
    const secondMilestoneDismissed = localStorage.getItem('secondMilestoneDismissed') === 'true';
    const thirdMilestoneDismissed = localStorage.getItem('thirdMilestoneDismissed') === 'true';

    // Only trigger modal when objectsFound increases (not on initial load or decreases)
    if (objectsFound > previousObjectsFound) {
      // Check if we've hit a milestone and it hasn't been dismissed yet
      if (objectsFound >= FIRST_MILESTONE && previousObjectsFound < FIRST_MILESTONE && !firstMilestoneDismissed) {
        setShowFirstModal(true);
      } else if (objectsFound >= SECOND_MILESTONE && previousObjectsFound < SECOND_MILESTONE && !secondMilestoneDismissed) {
        // Show second milestone modal immediately
        setShowSecondModal(true);
        
        // Auto-dismiss after 3 seconds
        const timer = setTimeout(() => {
          setShowSecondModal(false);
          localStorage.setItem('secondMilestoneDismissed', 'true');
        }, 3000);
        
        return () => clearTimeout(timer);
      } else if (objectsFound >= THIRD_MILESTONE && previousObjectsFound < THIRD_MILESTONE && !thirdMilestoneDismissed) {
        // For the third milestone (37 objects), show fullscreen image first
        displayFullScreenImage();
      }
    }
    
    setPreviousObjectsFound(objectsFound);
  }, [objectsFound, previousObjectsFound, totalObjects]);

  // Also check on initial mount if we should show a milestone modal
  useEffect(() => {
    // Check if milestones have been previously dismissed
    const firstMilestoneDismissed = localStorage.getItem('firstMilestoneDismissed') === 'true';
    const secondMilestoneDismissed = localStorage.getItem('secondMilestoneDismissed') === 'true';
    const thirdMilestoneDismissed = localStorage.getItem('thirdMilestoneDismissed') === 'true';
    
    // Only show milestone modal on initial load if it hasn't been dismissed
    if (objectsFound >= FIRST_MILESTONE && objectsFound < SECOND_MILESTONE && !firstMilestoneDismissed) {
      setShowFirstModal(true);
    } else if (objectsFound >= SECOND_MILESTONE && objectsFound < THIRD_MILESTONE && !secondMilestoneDismissed) {
      setShowSecondModal(true);
      
      // Auto-dismiss after 3 seconds
      const timer = setTimeout(() => {
        setShowSecondModal(false);
        localStorage.setItem('secondMilestoneDismissed', 'true');
      }, 3000);
      
      return () => clearTimeout(timer);
    } else if (objectsFound >= THIRD_MILESTONE && !thirdMilestoneDismissed && objectsFound === FINAL_MILESTONE) {
      // Only for the third milestone (37/37 objects), show fullscreen image first
      displayFullScreenImage();
    } else if (objectsFound >= THIRD_MILESTONE && !thirdMilestoneDismissed && objectsFound < FINAL_MILESTONE) {
      // If they've reached 37 but not all objects, just show the modal
      setShowThirdModal(true);
      
      // Auto-dismiss after 3 seconds
      const timer = setTimeout(() => {
        setShowThirdModal(false);
        localStorage.setItem('thirdMilestoneDismissed', 'true');
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismissFirst = () => {
    setShowFirstModal(false);
    localStorage.setItem('firstMilestoneDismissed', 'true');
  };

  // First milestone modal (3 objects) - with OK button
  const renderFirstMilestoneModal = () => {
    if (!showFirstModal) return null;
    
    return (
      <div 
        className="fixed inset-0 flex items-center justify-center z-50"
        style={{ pointerEvents: 'none' }}
      >
        <div 
          className="relative"
          style={{ 
            pointerEvents: 'auto',
            position: 'absolute',
            bottom: 75,
            right: 20,
          }}
        >
          <div className="bg-[#333D37] text-warm-white p-4 rounded-lg max-w-[14rem] shadow-lg">
            <div className="flex flex-col space-y-2.5 text-center">
              <p className="text-base font-semibold leading-tight mx-2">
                When you're ready, click here to finalize your stickerbook and finish the hunt.
              </p>
              <button 
                onClick={handleDismissFirst}
                className="bg-white text-[#3D4F40] font-normal py-1 px-4 rounded-full mt-2 w-full"
              >
                Ok
              </button>
            </div>
          </div>
          
          {/* Speech bubble pointer */}
          <div 
            className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent"
            style={{ 
              borderTopColor: '#3D4F40',
              right: 16,
              bottom: -8,
              position: 'absolute'
            }}
          ></div>
        </div>
      </div>
    );
  };

  // Second milestone modal (18 objects) - no OK button
  const renderSecondMilestoneModal = () => {
    if (!showSecondModal) return null;
    
    return (
      <div 
        className="fixed inset-0 flex items-center justify-center z-50"
        style={{ pointerEvents: 'none' }}
      >
        <div 
          className="relative"
          style={{ 
            pointerEvents: 'auto',
            position: 'absolute',
            bottom: 75,
            right: 20,
          }}
        >
          <div className="bg-[#333D37] text-warm-white p-4 rounded-lg max-w-[14rem] shadow-lg">
            <div className="flex flex-col space-y-2.5 text-center">
              <p className="text-base font-semibold leading-tight mx-2">
                Almost there! Click here to finalize your stickerbook and finish the hunt.
              </p>
              {/* No OK button for the second milestone */}
            </div>
          </div>
          
          {/* Speech bubble pointer */}
          <div 
            className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent"
            style={{ 
              borderTopColor: '#3D4F40',
              right: 16,
              bottom: -8,
              position: 'absolute'
            }}
          ></div>
        </div>
      </div>
    );
  };

  // Third milestone modal (37 objects) - no OK button
  const renderThirdMilestoneModal = () => {
    if (!showThirdModal) return null;
    
    return (
      <div 
        className="fixed inset-0 flex items-center justify-center z-50"
        style={{ pointerEvents: 'none' }}
      >
        <div 
          className="relative"
          style={{ 
            pointerEvents: 'auto',
            position: 'absolute',
            bottom: 75,
            right: 20,
          }}
        >
          <div className="bg-[#333D37] text-warm-white p-4 rounded-lg max-w-[14rem] shadow-lg">
            <div className="flex flex-col space-y-2.5 text-center">
              <p className="text-base font-semibold leading-tight mx-2">
                Congratulations! You've found all objects. Click here to finalize your stickerbook and complete the hunt.
              </p>
              {/* No OK button for the third milestone */}
            </div>
          </div>
          
          {/* Speech bubble pointer */}
          <div 
            className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent"
            style={{ 
              borderTopColor: '#3D4F40',
              right: 16,
              bottom: -8,
              position: 'absolute'
            }}
          ></div>
        </div>
      </div>
    );
  };

const renderFullScreenImage = () => {
  if (!showFullScreenImage) return null;
  
  return (
    <div 
      className="fixed inset-0 z-50"
      style={{ 
        opacity: imageOpacity,
        transition: 'opacity 0.5s ease-in-out'
      }}
    >
      <div className="w-screen h-screen flex items-center justify-center">
        <img 
          src={fullScreenImagePath} 
          alt="Milestone achievement" 
          className="w-full h-full object-cover" 
        />
      </div>
    </div>
  );
};

  return (
    <>
      {renderFirstMilestoneModal()}
      {renderSecondMilestoneModal()}
      {renderThirdMilestoneModal()}
      {renderFullScreenImage()}
    </>
  );
};

export default MilestoneModal;