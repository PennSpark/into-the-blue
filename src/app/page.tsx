'use client';

import { useState } from 'react';
import GlobeWrapper from '@/components/GlobeWrapper';
import TabNavigation from '@/components/TabNavigation';
import RegionList from '@/components/RegionList';

// Define all regions based on the provided image
const regions = [
  { 
    name: 'into-the-blue', 
    displayName: 'Into the Blue', 
    path: '/exhibit/into-the-blue',
    objectsFound: 0,
    totalObjects: 1
  },
  { 
    name: 'etruscan', 
    displayName: 'Etruscan', 
    path: '/exhibit/etruscan',
    objectsFound: 1,
    totalObjects: 1
  },
  { 
    name: 'greece', 
    displayName: 'Greece', 
    path: '/exhibit/greece',
    objectsFound: 1,
    totalObjects: 2
  },
  { 
    name: 'rome', 
    displayName: 'Rome', 
    path: '/exhibit/rome',
    objectsFound: 2,
    totalObjects: 5
  },
  { 
    name: 'eastern-mediterranean', 
    displayName: 'Eastern Mediterranean', 
    path: '/exhibit/eastern-mediterranean',
    objectsFound: 3,
    totalObjects: 4
  },
  { 
    name: 'asia', 
    displayName: 'Asia', 
    path: '/exhibit/asia',
    objectsFound: 0,
    totalObjects: 2
  },
  { 
    name: 'special-exhibition-egypt', 
    displayName: 'Special Exhibition: Egypt', 
    path: '/exhibit/egypt',
    objectsFound: 0,
    totalObjects: 3
  },
  { 
    name: 'middle-east', 
    displayName: 'Middle East', 
    path: '/exhibit/middle-east',
    objectsFound: 0,
    totalObjects: 9
  },
  { 
    name: 'north-america', 
    displayName: 'North America', 
    path: '/exhibit/north-america',
    objectsFound: 0,
    totalObjects: 4
  },
  { 
    name: 'mexico-central-america', 
    displayName: 'Mexico & Central America', 
    path: '/exhibit/mexico-central-america',
    objectsFound: 0,
    totalObjects: 1
  },
  { 
    name: 'africa', 
    displayName: 'Africa', 
    path: '/exhibit/africa',
    objectsFound: 0,
    totalObjects: 4
  },
];

export default function Home() {
  // State for active tab
  const [activeTab, setActiveTab] = useState<'list' | 'map'>('list');
  
  return (
    <div className="min-h-screen p-8 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col items-center gap-8">
        <h1 className="text-3xl font-bold text-center">
          choose a region to begin
        </h1>
        
        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
        
        {activeTab === 'list' ? (
          <RegionList regions={regions} />
        ) : (
          <div className="w-full max-w-4xl">
            <GlobeWrapper />
            <div className="text-center text-sm opacity-70 mt-4">
              swipe to see all galleries
            </div>
          </div>
        )}
      </main>
    </div>
  );
}