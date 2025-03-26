'use client';

import { useState, useMemo } from 'react';
import TabNavigation from '@/components/TabNavigation';
import RegionList from '@/components/RegionList';
import ProgressStars from '@/components/ProgressStars';
import ProgressBar from '@/components/ProgressBar';
import FinishHuntButton from '@/components/FinishHuntButton';
import Link from 'next/link';
import MuseumMap from '@/components/MuseumMap'; // Import the new component

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
    objectsFound: 0,
    totalObjects: 1
  },
  { 
    name: 'greece', 
    displayName: 'Greece', 
    path: '/exhibit/greece',
    objectsFound: 0,
    totalObjects: 2
  },
  { 
    name: 'rome', 
    displayName: 'Rome', 
    path: '/exhibit/rome',
    objectsFound: 0,
    totalObjects: 5
  },
  { 
    name: 'eastern-mediterranean', 
    displayName: 'Eastern Mediterranean', 
    path: '/exhibit/eastern-mediterranean',
    objectsFound: 0,
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
    displayName: 'Egypt', 
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
  { 
    name: 'assyria', 
    displayName: 'Assyria', 
    path: '/exhibit/assyria',
    objectsFound: 0,
    totalObjects: 1
  },
];

export default function Home() {
  // State for active tab
  const [activeTab, setActiveTab] = useState<'list' | 'map'>('list');
  
  // Calculate the total objects found and total objects
  const { totalObjectsFound, totalObjects } = useMemo(() => {
    const found = regions.reduce((sum, region) => sum + region.objectsFound, 0);
    const total = regions.reduce((sum, region) => sum + region.totalObjects, 0);
    return { totalObjectsFound: found, totalObjects: total };
  }, [regions]);
  
  return (
    <div className="min-h-screen font-[family-name:var(--font-geist-sans)] bg-warm-white">
      <ProgressBar objectsFound={totalObjectsFound} totalObjects={totalObjects} />
      
      <main className="flex flex-col items-center gap-6 pt-6 px-8 pb-20">
        <ProgressStars objectsFound={totalObjectsFound} totalObjects={totalObjects} />
        
        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
        
        {activeTab === 'list' ? (
          <RegionList regions={regions} />
        ) : (
          <MuseumMap regions={regions} />
        )}

        {/* Floating buttons */}
        <div className="fixed bottom-0 w-full px-5 py-3 flex justify-between z-40"
          style={{
            background:
              "linear-gradient(to bottom, rgba(254,252,247,0) 0%, rgba(255,254,253,0.85) 40.5%, #FFFEFD 100%)",
          }}
        >
          <Link href="/stickerboard">
            <div className="flex items-center bg-green text-warm-white w-fit h-[44px] gap-[6px] px-[20px] rounded-full">
              <img src="/icons/stickerbook.svg" alt="Sticker Book" className="w-[26px] h-[25px]" />
              <p className="font-medium text-base">Sticker Book</p>
            </div>
          </Link>
          <FinishHuntButton objectsFound={totalObjectsFound} />
        </div>
      </main>
    </div>
  );
}