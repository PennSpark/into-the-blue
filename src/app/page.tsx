"use client";

import { useState, useEffect, useMemo } from "react";
import TabNavigation from "@/components/TabNavigation";
import RegionList from "@/components/RegionList";
import Link from "next/link";
import MuseumMap from "@/components/MuseumMap";
import ProgressStars from "@/components/ProgressStars";
import ProgressBar from "@/components/ProgressBar";
import {
	getMetrics,
	loadCollectedArtifacts,
	getTutorialCompleted,
	setTutorialCompleted,
} from "./context/IndexedDB";
import { Exhibit } from "@/app/types"; // Import the Exhibit type
import { useRouter } from "next/navigation";
import { FaArrowRight } from "react-icons/fa";
import { motion } from "framer-motion";

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
	const [activeTab, setActiveTab] = useState<"list" | "map">("list");
	const [, setMetrics] = useState<{ totalObjectsFound: number }>({
		totalObjectsFound: 0,
	});
	// Update this line with the proper type
	const [regions, setRegions] = useState<Region[]>([]);
	const [showTutOverlay, setShowTutOverlay] = useState(false);

	const router = useRouter();

	const handleRegionClick = (path: string) => {
		document.body.style.overflow = "auto";
		router.push(path);
	};

	const handleSkipClick = async () => {
		await setTutorialCompleted();
		setShowTutOverlay(false);
	};

	// Fetch app metrics from IndexedDB.
	useEffect(() => {
		async function fetchMetrics() {
			const m = await getMetrics();
			if (m) {
				setMetrics(m);
			}
		}

		async function getTutorialStatus() {
			const t = await getTutorialCompleted();
			setShowTutOverlay(!t);
		}

		fetchMetrics();
		getTutorialStatus();
	}, []);

	useEffect(() => {
		if (showTutOverlay) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "auto";
		}
	}, [showTutOverlay]);

	// Dynamically build regions data from exhibits.json, artifacts.json and IndexedDB.
	useEffect(() => {
		async function fetchRegionsData() {
			try {
				const resExhibits = await fetch("/sites/blue/data/exhibits.json");
				const exhibitsData = (await resExhibits.json()) as Record<
					string,
					Exhibit
				>;

				// Get collected artifact IDs from IndexedDB
				const collectedArtifacts = await loadCollectedArtifacts();

				// Map each exhibit to a region
				const computedRegions = Object.entries(exhibitsData).map(
					([key, exhibit]) => {
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
					}
				);

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
				backgroundImage: "url('/sites/blue/images/paper.png')",
				backgroundRepeat: "repeat",
			}}
		>
			<ProgressBar
				objectsFound={totalObjectsFound}
				totalObjects={totalObjects}
			/>

			<main className="flex flex-col items-center gap-6 pt-6 px-8 pb-20">
				<ProgressStars
					objectsFound={totalObjectsFound}
					totalObjects={totalObjects}
				/>

				<TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

				{!showTutOverlay ? (
					activeTab === "list" ? (
						<RegionList regions={regions} />
					) : (
						<div className="w-full">
							<MuseumMap regions={regions} />
						</div>
					)
				) : null}

				{showTutOverlay && (
					<motion.div
						className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-75 z-50"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 0.3, ease: "easeOut" }}
					>
						<div className="relative z-60 px-8 pt-[150px] pb-[56px] flex flex-col w-full h-full mx-auto">
							<div className="fixed top-0 left-0 right-0 w-full pr-[23px] pt-[23px] flex justify-end z-40">
								<button
									className="bg-blue-1 text-black text-body font-body1 px-6 py-2 rounded-[50px] flex items-center gap-2"
									onClick={handleSkipClick}
								>
									Skip Tutorial
									<FaArrowRight style={{ width: "20px", height: "18px" }} />
								</button>
							</div>

							<div className="relative text-body font-body1 mx-[40px] text-center ">
								<div className="bg-blue-5 text-green rounded-[8px] border-0 py-1">
									Select the gallery you’re in
								</div>
								<div className="mx-auto transform mt-[-1px] pb-4 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-blue-5" />
							</div>

							<div className="bg-white rounded-[12px] shadow-lg overflow-y-auto max-w-md max-h-full">
								<div className="w-full max-w-md flex flex-col gap-[16px] pb-[16px] overflow-y-auto">
									{regions.map((region, index) => {
										return (
											<div
												key={index}
												className="rounded-xl flex items-center justify-between cursor-pointer relative h-[100px] overflow-hidden bg-blue-3 hover:bg-[#bdcaf0] transition-colors"
												onClick={() => handleRegionClick(region.path)}
											>
												<div className="flex flex-col p-6 z-10">
													<div
														className="text-black mb-1 text-body"
														style={{
															fontWeight: 600,
															letterSpacing: "-1%",
															lineHeight: "1",
														}}
													>
														{region.displayName}
													</div>
													<div
														className="text-gray1 text-body"
														style={{
															fontWeight: 400, // Regular
															letterSpacing: "-2%",
															lineHeight: "1",
														}}
													>
														{`${region.objectsFound}/${region.totalObjects} Objects`}
													</div>
												</div>

												<div className="absolute right-0 h-full opacity-70 z-0">
													<img
														src={`/sites/blue/icons/regions/${region.name
															.toLowerCase()
															.replace(/\s+/g, "-")}.png`}
														alt={`${region.displayName} icon`}
														className="h-full object-cover object-left"
														style={{ maxWidth: "none" }}
														onError={(e) => {
															(e.target as HTMLImageElement).style.display =
																"none";
														}}
													/>
												</div>
											</div>
										);
									})}
								</div>
							</div>
						</div>
					</motion.div>
				)}

        {/* Floating buttons */}
        <div className="fixed bottom-0 w-full px-5 py-3 flex justify-end z-40"
          style={{
            background:
              "linear-gradient(to bottom, rgba(254,252,247,0) 0%, rgba(255,254,253,0.85) 40.5%, #FFFEFD 100%)",
          }}
        >
          <Link href="/stickerbook">
            <div className="flex items-center bg-green text-warm-white w-fit h-[44px] gap-[6px] px-[20px] rounded-full">
              <img src="/sites/blue/icons/stickerbook.svg" alt="Sticker Book" className="w-[26px] h-[25px]" />
              <p className="font-medium text-base">Sticker Book</p>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}
