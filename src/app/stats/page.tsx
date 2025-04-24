'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getMetrics, loadCollectedArtifacts } from "../context/IndexedDB";

export default function StatsPage() {
    const [showContent, setShowContent] = useState(false);
    const [metrics, setMetrics] = useState({
        totalObjectsFound: 0,
        totalExhibitsVisited: 0,
        startTime: Date.now(),
        stickerbookViewTime: 0,
    });
    const [collectedImages, setCollectedImages] = useState<string[]>([]);

    useEffect(() => {
// Fade in first content immediately
        setTimeout(() => {
            setShowContent(true);
        }, 100);
    }, []);

    useEffect(() => {
        async function fetchMetrics() {
            const m = await getMetrics();
            if (m) {
                setMetrics(m);
            }
        }
        fetchMetrics();
    }, []);

    // Load collected artifacts and randomly pick 3 images.
    useEffect(() => {
        async function loadImages() {
            try {
                const artifactIds = await loadCollectedArtifacts();
                if (artifactIds.length === 0) {
                    setCollectedImages([]);
                    return;
                }
                // Shuffle array randomly
                const shuffled = artifactIds.sort(() => 0.5 - Math.random());
                // Pick up to 3
                const selected = shuffled.slice(0, 3);
                // Instead of loading images from IndexedDB, form static paths.
                const images = selected.map(id => `/sites/blue/images/artifacts/${id}.png`);
                setCollectedImages(images);
            } catch (err) {
                console.error(err);
            }
        }
        loadImages();
    }, []);

    useEffect(() => {
        const setVh = () => {
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
        };
        setVh();
        window.addEventListener('resize', setVh);
        return () => window.removeEventListener('resize', setVh);
    }, []);

    const openSms = () => {
// On iOS and Android, this URL scheme should open the native messaging app
        window.location.href = `sms:&body=I finished the scavenger hunt at the Penn Museum! Plan your visit now at https://penn.museum/`;
    };

// Calculate elapsed time in seconds
    const elapsedSeconds = Math.floor((Date.now() - metrics.startTime) / 1000);

    // Helper function to format elapsed time.
    const formatElapsedTime = (seconds: number): string => {
        if (seconds < 60) {
            return `${seconds} sec`;
        }
        if (seconds < 3600) {
            const minutes = Math.floor(seconds / 60);
            return `${minutes} min`;
        }
        const hours = Math.floor(seconds / 3600);
        const remainderSeconds = seconds % 3600;
        if (remainderSeconds === 0) {
            return `${hours} hr`;
        }
        const minutes = Math.floor(remainderSeconds / 60);
        return `${hours} hr ${minutes} min`;
    };

    const formattedTime = formatElapsedTime(elapsedSeconds);

    // Select the personality based on the number of objects found
    // Compeletionist: 36 objects found
    // Collector: 24-35 objects found
    // Investigator: 12-23 objects found

    const personality = metrics.totalObjectsFound === 36 ? 'COMPLETIONIST' :
        metrics.totalObjectsFound >= 24 ? 'COLLECTOR' :
        metrics.totalObjectsFound >= 12 ? 'INVESTIGATOR' :
        'CURIOUS';

    const personalityDescription = metrics.totalObjectsFound === 37 ? 'You found all 37 objects and completed the scavenger hunt!' :
        metrics.totalObjectsFound >= 24 ? `You found ${metrics.totalObjectsFound} objects and are a true collector!` :
        metrics.totalObjectsFound >= 12 ? `You found ${metrics.totalObjectsFound} objects and are quite the investigator!` :
        `You found ${metrics.totalObjectsFound} objects and are a curious explorer!`;

    return (
        <main
            className="relative w-full overflow-hidden bg-gradient-to-b from-[#d8e3f7] to-[#aec6f0]"
            style={{ height: 'calc(var(--vh, 1vh) * 100)' }}
        >
{/* First content */}
            <div className={`absolute inset-0 transition-opacity duration-1000 ${showContent ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <div className="h-full flex flex-col items-center justify-start gap-[30px] z-10">
                    <div className="h-auto w- flex flex-col items-center justify-start gap-[36px] m-[20px] p-[32px] px-[20px] bg-warm-white rounded-xl">
                        <div className='flex flex-col items-center gap-[21px]'>
                            <div className='flex flex-col items-center gap-[10px]'>
                                <p className="text-[18px] font-semibold text-blue-black">Visit Statistics</p>
                                <hr className="w-[55vw] border-t border-gray-3" />
                            </div>
                            <div className="flex flex-col items-center gap-[16px] leading-none">
                                <div className="flex flex-start justify-start gap-[18px]">
                                    <p className="text-[14px] w-[106px] text-gray-2">Objects Found</p>
                                    <p className="text-[14px] text-blue-4 font-semibold">{metrics.totalObjectsFound}</p>
                                </div>
                                <div className="flex flex-start justify-start gap-[18px]">
                                    <p className="text-[14px] w-[106px] text-gray-2">Exhibits Visited</p>
                                    <p className="text-[14px] text-blue-4 font-semibold">{metrics.totalExhibitsVisited}</p>
                                </div>
                                <div className="flex flex-start justify-start gap-[18px]">
                                    <p className="text-[14px] w-[106px] text-gray-2">Time Elapsed</p>
                                    <p className="text-[14px] text-blue-4 font-semibold">{formattedTime}</p>
                                </div>
                            </div>
                        </div>
                        <div className='flex flex-col items-center gap-[21px]'>
                            <div className='flex flex-col items-center gap-[10px]'>
                                <p className="text-[18px] font-semibold text-blue-black">Rarest Finds</p>
                                <hr className="w-[55vw] border-t border-gray-3" />
                            </div>
                            <div className="flex items-center gap-[26px]">
                                {collectedImages.length > 0 ? (
                                    collectedImages.map((url, index) => (
                                        <Image key={index} className="h-[44px] w-auto" src={url} alt="Collected artifact" width={100} height={100} />
                                    ))
                                ) : (
                                    <p className="text-gray-2 text-[14px]">No artifacts collected yet</p>
                                )}
                            </div>
                        </div>
                        <div className='flex flex-col items-center gap-[24px]'>
                            <div className='flex flex-col items-center gap-[10px]'>
                                <p className="text-[18px] font-semibold text-blue-black">Collector Personality</p>
                                <hr className="w-[55vw] border-t border-gray-3" />
                            </div>
                            <div className="flex flex-col items-center gap-[20px] p-[32px] rounded-[8px] bg-gradient-to-r from-[#ebf2ff] to-[#b9e6ff]">
                                <p className="font-FibraOneBold text-[24px] leading-none bg-gradient-to-r from-blue-1 to-[#004972] text-transparent bg-clip-text">{personality}</p>
                                <p className="text-gray-2 text-[14px] w-[55vw] text-center font-semibold">{personalityDescription}</p>
                            </div>
                        </div>
                    </div>
                    {/* Floating buttons */}
                    <div className="fixed bottom-0 w-full px-5 py-3 flex justify-center gap-[12px] z-40">
                        <Link href="/">
                            <div className="flex items-center bg-warm-white w-fit h-[44px] gap-[6px] px-[16px] rounded-full">
                                <img src="/sites/blue/icons/left-arrow-black.svg" alt="Back" className="w-[16px] h-[14px]" />
                            </div>
                        </Link>
                        <button onClick={openSms} className="flex items-center bg-green w-fit h-[44px] gap-[6px] px-[16px] rounded-full">
                            <img src="/sites/blue/icons/export.svg" alt="Share" className="w-[16px] h-[18px]" />
                        </button>
                        <Link href="/stickerbook">
                            <div className="flex items-center bg-green text-warm-white w-fit h-[44px] gap-[6px] pl-[20px] pr-[16px] rounded-full">
                                <p className="font-medium text-base">Share Sticker Book</p>
                                <img src="/sites/blue/icons/arrow-white.svg" alt="View Stickerbook" className="w-[26px] h-[25px]" />
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}