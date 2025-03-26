"use client";

import { useState, useEffect, useMemo } from "react";
import TabNavigation from "@/components/TabNavigation";
import RegionList from "@/components/RegionList";
import Link from "next/link";
import MuseumMap from "@/components/MuseumMap";
import ProgressStars from '@/components/ProgressStars';
import ProgressBar from '@/components/ProgressBar';
import FinishHuntButton from '@/components/FinishHuntButton';
import { getMetrics, loadCollectedArtifacts } from "./context/IndexedDB";
import { Exhibit } from "@/app/types"; // Import the Exhibit type

// Add this interface at the top of your file, or import it if defined elsewhere
interface Region {
  name: string;
  displayName: string;
  path: string;
  objectsFound: number;
  totalObjects: number;
}

export default function Home() {
  // State for active tab
  const [activeTab, setActiveTab] = useState<"map" | "list">("map");
  const [, setMetrics] = useState<{ totalObjectsFound: number }>({ totalObjectsFound: 0 });
  // Update this line with the proper type
  const [regions, setRegions] = useState<Region[]>([]);

  // Fetch app metrics from IndexedDB.
  useEffect(() => {
    async function fetchMetrics() {
      const m = await getMetrics();
      if (m) {
        setMetrics(m);
      }
    }
    fetchMetrics();
  }, []);

  // Dynamically build regions data from exhibits.json, artifacts.json and IndexedDB.
  useEffect(() => {
    async function fetchRegionsData() {
      try {
        const resExhibits = await fetch("/data/exhibits.json");
        const exhibitsData = await resExhibits.json() as Record<string, Exhibit>;

        // Get collected artifact IDs from IndexedDB
        const collectedArtifacts = await loadCollectedArtifacts();

        // Map each exhibit to a region
        const computedRegions = Object.entries(exhibitsData).map(([key, exhibit]) => {
          const totalObjects = exhibit.totalObjects;
          const objectsFound = exhibit.items.filter((item) =>
            collectedArtifacts.includes(item.id)
          ).length;

          return {
            name: key,
            displayName: exhibit.displayName,
            path: exhibit.path,
            objectsFound,
            totalObjects,
          };
        });

        setRegions(computedRegions);
      } catch (error) {
        console.error("Error fetching regions data:", error);
      }
    }
    fetchRegionsData();
  }, []);
  
  // Calculate the total objects found and total objects
  const { totalObjectsFound, totalObjects } = useMemo(() => {
    const found = regions.reduce((sum, region) => sum + region.objectsFound, 0);
    const total = regions.reduce((sum, region) => sum + region.totalObjects, 0);
    return { totalObjectsFound: found, totalObjects: total };
  }, [regions]);
  
  return (
    <div 
      className="min-h-screen font-[family-name:var(--font-geist-sans)] bg-warm-white"
      style={{
        backgroundImage: "url('/images/paper.png')",
        backgroundRepeat: "repeat",
      }}
    >
      <ProgressBar objectsFound={totalObjectsFound} totalObjects={totalObjects} />
      
      <main className="flex flex-col items-center gap-6 pt-6 px-8 pb-20">
        <ProgressStars objectsFound={totalObjectsFound} totalObjects={totalObjects} />
        
        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
        
        {activeTab === 'list' ? (
          <RegionList regions={regions} />
        ) : (
          <div className="w-full">
            <MuseumMap regions={regions} />
          </div>
        )}

        {/* Floating buttons */}
        <div className="fixed bottom-0 w-full px-5 py-3 flex justify-between z-40"
          style={{
            background:
              "linear-gradient(to bottom, rgba(254,252,247,0) 0%, rgba(255,254,253,0.85) 40.5%, #FFFEFD 100%)",
          }}
        >
          <Link href="/stickerbook">
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