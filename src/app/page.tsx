'use client';

import { useState } from 'react';
import GlobeWrapper from '@/components/GlobeWrapper';
import TabNavigation from '@/components/TabNavigation';
import RegionList from '@/components/RegionList';

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
         <RegionList />
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