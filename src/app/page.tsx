'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import TabNavigation from '@/components/TabNavigation';
import RegionList from '@/components/RegionList';
import ProgressStars from '@/components/ProgressStars';
import ProgressBar from '@/components/ProgressBar';
import FinishHuntButton from '@/components/FinishHuntButton';
import MuseumMap from '@/components/MuseumMap';
import { getMetrics, loadCollectedArtifacts } from './context/IndexedDB';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'list' | 'map'>('list');
  const [metrics, setMetrics] = useState<{ totalObjectsFound: number }>({ totalObjectsFound: 0 });
  const [regions, setRegions] = useState([]);

  useEffect(() => {
    async function fetchMetrics() {
      const m = await getMetrics();
      if (m) setMetrics(m);
    }
    fetchMetrics();
  }, []);

  useEffect(() => {
    async function fetchRegionsData() {
      try {
        const resExhibits = await fetch("/data/exhibits.json");
        const exhibitsData = await resExhibits.json();
        const exhibitsArray = Array.isArray(exhibitsData)
          ? exhibitsData
          : exhibitsData.exhibits || Object.values(exhibitsData);

        if (!exhibitsArray || exhibitsArray.length === 0) {
          throw new Error("Exhibits data is not in the expected format.");
        }

        const collectedArtifacts = await loadCollectedArtifacts();

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

  const { totalObjectsFound, totalObjects } = useMemo(() => {
    const found = regions.reduce((sum, r) => sum + r.objectsFound, 0);
    const total = regions.reduce((sum, r) => sum + r.totalObjects, 0);
    return { totalObjectsFound: found, totalObjects: total };
  }, [regions]);

  return (
    <div
      className="min-h-screen p-8 font-[family-name:var(--font-geist-sans)]"
      style={{
        backgroundColor: 'rgba(255,254,253,0.85)',
        backgroundImage: "url('/images/paper.png')",
        backgroundRepeat: 'repeat',
      }}
    >
      <ProgressBar objectsFound={totalObjectsFound} totalObjects={totalObjects} />

      <main className="flex flex-col items-center gap-8 pt-6 pb-20">
        <ProgressStars objectsFound={totalObjectsFound} totalObjects={totalObjects} />

        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === 'list' ? (
          <RegionList regions={regions} />
        ) : (
          <MuseumMap regions={regions} />
        )}

        {/* Floating buttons */}
        <div
          className="fixed bottom-0 w-full px-5 py-3 flex justify-between z-40"
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
