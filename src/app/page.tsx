"use client";

import { useState } from 'react';
import GlobeWrapper from '@/components/GlobeWrapper';
import TabNavigation from '@/components/TabNavigation';
import RegionList from '@/components/RegionList';
import Link from 'next/link';

// Define all regions based on the provided image
const regions = [
	{
		name: "into-the-blue",
		displayName: "Into the Blue",
		path: "/exhibit/into-the-blue",
		objectsFound: 0,
		totalObjects: 1,
	},
	{
		name: "etruscan",
		displayName: "Etruscan",
		path: "/exhibit/etruscan",
		objectsFound: 1,
		totalObjects: 1,
	},
	{
		name: "greece",
		displayName: "Greece",
		path: "/exhibit/greece",
		objectsFound: 1,
		totalObjects: 2,
	},
	{
		name: "rome",
		displayName: "Rome",
		path: "/exhibit/rome",
		objectsFound: 2,
		totalObjects: 5,
	},
	{
		name: "eastern-mediterranean",
		displayName: "Eastern Mediterranean",
		path: "/exhibit/eastern-mediterranean",
		objectsFound: 3,
		totalObjects: 4,
	},
	{
		name: "asia",
		displayName: "Asia",
		path: "/exhibit/asia",
		objectsFound: 0,
		totalObjects: 2,
	},
	{
		name: "special-exhibition-egypt",
		displayName: "Special Exhibition: Egypt",
		path: "/exhibit/egypt",
		objectsFound: 0,
		totalObjects: 3,
	},
	{
		name: "middle-east",
		displayName: "Middle East",
		path: "/exhibit/middle-east",
		objectsFound: 0,
		totalObjects: 9,
	},
	{
		name: "north-america",
		displayName: "North America",
		path: "/exhibit/north-america",
		objectsFound: 0,
		totalObjects: 4,
	},
	{
		name: "mexico-central-america",
		displayName: "Mexico & Central America",
		path: "/exhibit/mexico-central-america",
		objectsFound: 0,
		totalObjects: 1,
	},
	{
		name: "africa",
		displayName: "Africa",
		path: "/exhibit/africa",
		objectsFound: 0,
		totalObjects: 4,
	},
];

export default function Home() {
  // State for active tab
  const [activeTab, setActiveTab] = useState<'list' | 'map'>('list');
  
  return (
    <div className="min-h-screen p-8 font-[family-name:var(--font-geist-sans)] bg-warm-white">
      <main className="flex flex-col items-center gap-8">
        
        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
        
        {activeTab === 'list' ? (
          <RegionList regions={regions} />
        ) : (
          <div className="w-full max-w-4xl">
            {/* <GlobeWrapper /> */}
            <div className="text-center text-sm opacity-70 mt-4">
              map view coming soon
            </div>
          </div>
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
          <Link href="/finish">
            <div className="flex items-center text-green border-2 border-green w-fit h-[44px] gap-[6px] px-[20px] rounded-full">
            <p className="font-medium text-base">Finish</p>
            <img src="/icons/arrow.svg" alt="Finish Hunt" className="w-[26px] h-[25px]" />
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}
