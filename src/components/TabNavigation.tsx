'use client';

import React from 'react';

interface TabNavigationProps {
  activeTab: 'list' | 'map';
  onTabChange: (tab: 'list' | 'map') => void;
}

const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="w-full max-w-md bg-stone-200 rounded-full overflow-hidden flex">
      <button
        className={`flex-1 py-2 text-center font-medium transition-colors ${
          activeTab === 'list' 
            ? 'bg-stone-800 text-white' 
            : 'bg-transparent text-stone-800'
        }`}
        onClick={() => onTabChange('list')}
      >
        LIST
      </button>
      <button
        className={`flex-1 py-2 text-center font-medium transition-colors ${
          activeTab === 'map' 
            ? 'bg-stone-800 text-white' 
            : 'bg-transparent text-stone-800'
        }`}
        onClick={() => onTabChange('map')}
      >
        MAP
      </button>
    </div>
  );
};

export default TabNavigation;