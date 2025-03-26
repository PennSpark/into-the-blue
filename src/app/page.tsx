"use client";

import { useState, useEffect } from "react";
import GlobeWrapper from "@/components/GlobeWrapper";
import TabNavigation from "@/components/TabNavigation";
import RegionList from "@/components/RegionList";
import Link from "next/link";
import { getMetrics, loadCollectedArtifacts } from "./context/IndexedDB";

export default function Home() {
  // State for active tab
  const [activeTab, setActiveTab] = useState<"list" | "map">("list");
  const [metrics, setMetrics] = useState<{ totalObjectsFound: number }>({ totalObjectsFound: 0 });
  const [regions, setRegions] = useState([]);

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
        const exhibitsData = await resExhibits.json();
        const exhibitsArray = Array.isArray(exhibitsData)
          ? exhibitsData
          : exhibitsData.exhibits || Object.values(exhibitsData);

        if (!exhibitsArray || exhibitsArray.length === 0) {
          throw new Error("Exhibits data is not in the expected format.");
        }

        // Get collected artifact IDs from IndexedDB
        const collectedArtifacts = await loadCollectedArtifacts();

        // Map each exhibit to a region
        const computedRegions = Object.entries(exhibitsData).map(([key, exhibit]) => {
          const totalObjects = exhibit.totalObjects; // Use the value from exhibits.json
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

  return (
    <>
      <div
        className="min-h-screen p-8 font-[family-name:var(--font-geist-sans)]"
        style={{
          backgroundColor: "rgba(255,254,253,0.85)",  // fallback bg color
          backgroundImage: "url('/images/paper.png')",
          backgroundRepeat: "repeat",
        }}
      >
        <main className="flex flex-col items-center gap-8">
          <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
          {activeTab === "list" ? (
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
            {metrics.totalObjectsFound < 3 ? (
              <div className="flex items-center w-fit h-[44px] gap-[6px] pl-[20px] pr-[16px] rounded-full text-green border-2 border-green opacity-[30%]">
                <p className="font-medium text-base">Finish</p>
                <img src="/icons/arrow.svg" alt="Finish Hunt" className="w-[26px] h-[25px]" />
              </div>
            ) : (
              <Link href="/ending">
                <div className="flex items-center w-fit h-[44px] gap-[6px] pl-[20px] pr-[16px] rounded-full text-green border-2 border-green">
                  <p className="font-medium text-base">Finish</p>
                  <img src="/icons/arrow.svg" alt="Finish Hunt" className="w-[26px] h-[25px]" />
                </div>
              </Link>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
