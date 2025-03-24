'use client';

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';

interface TabNavigationProps {
  activeTab: 'list' | 'map';
  onTabChange: (tab: 'list' | 'map') => void;
}

const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabChange }) => {
  const listBtnRef = useRef<HTMLButtonElement>(null);
  const mapBtnRef = useRef<HTMLButtonElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Update slider position when tab changes
  useEffect(() => {
    if (!sliderRef.current) return;
    
    const targetRef = activeTab === 'list' ? listBtnRef.current : mapBtnRef.current;
    if (!targetRef) return;
    
    const buttonWidth = targetRef.offsetWidth;
    // Calculate the position relative to the first button
    const position = activeTab === 'list' ? 0 : buttonWidth;
    
    sliderRef.current.style.width = `${buttonWidth}px`;
    sliderRef.current.style.transform = `translateX(${position}px)`;
  }, [activeTab]);

  return (
    <div className="w-[248px] h-[34px] max-w-md p-1 gray-1 bg-blue-3 rounded-[28px] flex relative">
      {/* Animated slider */}
      <div 
        ref={sliderRef}
        className="absolute top-1 left-1 h-[calc(100%-8px)] warm-white bg-gray-1 rounded-[24px] z-0 transition-transform duration-300 ease-in-out"
      ></div>

      {/* List tab button */}
      <button
        ref={listBtnRef}
        className={`flex-1 py-2.5 px-4 text-center font-medium text-sm flex items-center justify-center gap-2 rounded-[24px] z-10 relative ${
          activeTab === 'list' ? 'text-warm-white' : 'text-gray-1'
        }`}
        onClick={() => onTabChange('list')}
      >
        <Image 
          src="/icons/List.svg" 
          alt="List view" 
          width={20} 
          height={20} 
          className={activeTab === 'list' ? 'brightness-0 invert' : ''}
        /> 
        LIST
      </button>

      {/* Map tab button */}
      <button
        ref={mapBtnRef}
        className={`flex-1 py-2.5 px-4 text-center font-medium text-sm flex items-center justify-center gap-2 rounded-[24px] z-10 relative ${
          activeTab === 'map' ? 'text-warm-white' : 'text-gray-1'
        }`}
        onClick={() => onTabChange('map')}
      >
        <Image 
          src="/icons/Map.svg" 
          alt="Map view" 
          width={20} 
          height={20} 
          className={activeTab === 'map' ? 'brightness-0 invert' : ''}
        /> 
        MAP
      </button>
    </div>
  );
};

export default TabNavigation;
