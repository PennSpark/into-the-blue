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
}) => {
  const [showFirstModal, setShowFirstModal] = useState(false);
  const [showSecondModal, setShowSecondModal] = useState(false);
  const [showThirdModal, setShowThirdModal] = useState(false);
  const [showFullScreenImage, setShowFullScreenImage] = useState(false);
  const [imageOpacity, setImageOpacity] = useState(0);
  const [previousObjectsFound, setPreviousObjectsFound] = useState(objectsFound);

  // Add a state to track the opacity of each modal
  const [firstModalOpacity, setFirstModalOpacity] = useState(1);
  const [secondModalOpacity, setSecondModalOpacity] = useState(1);
  const [thirdModalOpacity, setThirdModalOpacity] = useState(1);

  // Milestone thresholds
  const FIRST_MILESTONE = 3;
  const SECOND_MILESTONE = 18;
  const THIRD_MILESTONE = 37;
  const FINAL_MILESTONE = totalObjects;

  // Modify the displayFullScreenImage function to include fade-in for the third modal
  const displayFullScreenImage = () => {
    setShowFullScreenImage(true);
    setImageOpacity(1);
    
    setTimeout(() => {
      setImageOpacity(0);
    }, 4500);
    
    setTimeout(() => {
      setShowFullScreenImage(false);
      
      // Start with opacity 0 for fade-in
      setThirdModalOpacity(0);
      setShowThirdModal(true);
      
      // Fade in the third modal
      setTimeout(() => {
        setThirdModalOpacity(1);
      }, 50); // Short delay to ensure state updates properly
      
      // Auto-dismiss after 5 seconds for the third milestone
      const fadeOutTimer = setTimeout(() => {
        setThirdModalOpacity(0);
      }, 4500); // Start fade out 0.5s before hiding
      
      const hideTimer = setTimeout(() => {
        setShowThirdModal(false);
        setThirdModalOpacity(1); // Reset for next time
        localStorage.setItem('thirdMilestoneDismissed', 'true');
      }, 5000);
      
      return () => {
        clearTimeout(fadeOutTimer);
        clearTimeout(hideTimer);
      };
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
        setShowSecondModal(true);
        
        // Auto-dismiss with fade-out after 3 seconds
        const fadeTimer = setTimeout(() => {
          setSecondModalOpacity(0);
        }, 2500); // Start fade 0.5s before hiding
        
        const hideTimer = setTimeout(() => {
          setShowSecondModal(false);
          setSecondModalOpacity(1); // Reset for next time
          localStorage.setItem('secondMilestoneDismissed', 'true');
        }, 3000);
        
        return () => {
          clearTimeout(fadeTimer);
          clearTimeout(hideTimer);
        };
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
      
      // Auto-dismiss with fade-out after 3 seconds
      const fadeTimer = setTimeout(() => {
        setSecondModalOpacity(0);
      }, 2500); // Start fade 0.5s before hiding
      
      const hideTimer = setTimeout(() => {
        setShowSecondModal(false);
        setSecondModalOpacity(1); // Reset for next time
        localStorage.setItem('secondMilestoneDismissed', 'true');
      }, 3000);
      
      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(hideTimer);
      };
    } else if (objectsFound >= THIRD_MILESTONE && !thirdMilestoneDismissed && objectsFound === FINAL_MILESTONE) {
      // Only for the third milestone (37/37 objects), show fullscreen image first
      displayFullScreenImage();
    } else if (objectsFound >= THIRD_MILESTONE && !thirdMilestoneDismissed && objectsFound < FINAL_MILESTONE) {
      // If they've reached 37 but not all objects, just show the modal with fade-in
      setThirdModalOpacity(0); // Start with opacity 0
      setShowThirdModal(true);
      
      // Fade in
      setTimeout(() => {
        setThirdModalOpacity(1);
      }, 50);
      
      // Auto-dismiss after 5 seconds
      const fadeOutTimer = setTimeout(() => {
        setThirdModalOpacity(0);
      }, 4500); // Start fade 0.5s before hiding
      
      const hideTimer = setTimeout(() => {
        setShowThirdModal(false);
        setThirdModalOpacity(1); // Reset for next time
        localStorage.setItem('thirdMilestoneDismissed', 'true');
      }, 5000);
      
      return () => {
        clearTimeout(fadeOutTimer);
        clearTimeout(hideTimer);
      };
    }
  }, [FINAL_MILESTONE, objectsFound]);

  // For the first modal (OK button)
  const handleDismissFirst = () => {
    // Start fade out
    setFirstModalOpacity(0);
    
    // Actually remove the modal after animation completes
    setTimeout(() => {
      setShowFirstModal(false);
      // Reset opacity for next time
      setFirstModalOpacity(1);
      localStorage.setItem('firstMilestoneDismissed', 'true');
    }, 500); // Match this to the transition duration
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
            opacity: firstModalOpacity,
            transition: 'opacity 0.5s ease-out'
          }}
        >
          <div className="bg-[#333D37] text-warm-white p-4 rounded-lg max-w-[14rem] shadow-lg">
            <div className="flex flex-col space-y-2.5 text-center">
              <p className="text-base font-semibold leading-tight mx-2">
                When you&apos;re ready to leave the museum, click here to finalize your stickerbook and finish the hunt.
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
            opacity: secondModalOpacity,
            transition: 'opacity 0.5s ease-out'
          }}
        >
          <div className="bg-[#333D37] text-warm-white p-4 rounded-lg max-w-[14rem] shadow-lg">
            <div className="flex flex-col space-y-2.5 text-center">
              <p className="text-base font-semibold leading-tight mx-2">
                Remember, you can tap here to finish your hunt anytime!
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
            opacity: thirdModalOpacity,
            transition: 'opacity 0.5s ease-out'
          }}
        >
          <div className="bg-[#333D37] text-warm-white p-4 rounded-lg max-w-[14rem] shadow-lg">
            <div className="flex flex-col space-y-2.5 text-center">
              <p className="text-base font-semibold leading-tight mx-2">
                Congratulations! You&apos;ve found every artifact. Click here to finalize your stickerbook and complete the hunt.
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
        {/* First content */}
        <div 
          className={`absolute inset-0 transition-opacity duration-1000`}
          style={{ 
            background: 'linear-gradient(to bottom, #F4F8FF, #CBDEFF)' 
          }}
        >
            <div className="h-full flex flex-col items-center justify-center gap-16 z-10" style={{ height: "-webkit-fill-available"}}>
                <img src="/sites/blue/character/ending.png" alt="Character" className="w-[208px] " />
                <div className="flex flex-col items-center justify-center gap-4 z-10">
                    <p className="w-full text-center text-blue-black font-medium text-2xl leading-[1.75] px-[20px]">Congrats! <br></br> You found all 37 artifacts!</p>
                </div>
            </div>
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