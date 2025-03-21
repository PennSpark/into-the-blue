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
    
    sliderRef.current.style.width = `${targetRef.offsetWidth}px`;
    sliderRef.current.style.transform = `translateX(${activeTab === 'list' ? 0 : targetRef.offsetLeft}px)`;
  }, [activeTab]);

  return (
    <div className="w-full max-w-md p-1 bg-gray-300 rounded-[28px] flex relative" style={{ background: '#e2e3e7' }}>
      {/* Animated slider */}
      <div 
        ref={sliderRef}
        className="absolute top-1 left-1 h-[calc(100%-8px)] bg-gray-600 rounded-[24px] z-0 transition-transform duration-300 ease-in-out"
        style={{ backgroundColor: '#3b3f47' }}
      ></div>

      {/* List tab button */}
      <button
        ref={listBtnRef}
        className={`flex-1 py-2.5 px-4 text-center font-medium text-sm flex items-center justify-center gap-2 rounded-[24px] z-10 relative ${
          activeTab === 'list' ? 'text-white' : 'text-gray-700'
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
          activeTab === 'map' ? 'text-white' : 'text-gray-700'
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
