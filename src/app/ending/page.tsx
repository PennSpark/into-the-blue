'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getMetrics, saveMetrics } from "../context/IndexedDB";

export default function WelcomePage() {
    const [showContent, setShowContent] = useState(false);
    

    useEffect(() => {
        // Fade in first content immediately
        setTimeout(() => {
            setShowContent(true);
        }, 100);
    }, []);

    async function updateStickerbookViewTime() {
        const current = await getMetrics();
        const stickerbookViewTime = Date.now();
        await saveMetrics({
            totalObjectsFound: current?.totalObjectsFound || 0,
            totalExhibitsVisited: current?.totalExhibitsVisited || 0,
            startTime: current?.startTime || Date.now(),
            stickerbookViewTime,
        });
    }

    return (
        <main
            className="relative h-screen bg-gradient-to-b from-[#f4f8ff] to-[#cbdeff]"
        >
            {/* Background traces */}
            <div className="absolute inset-0 flex items-center justify-center">
                {/* <Image src="/welcome-assets/traces.svg" alt="Welcome" width={500} height={500} /> */}
            </div>

            {/* First content */}
            <div className={`absolute inset-0 transition-opacity duration-1000 ${showContent ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <div className="h-full flex flex-col items-center justify-center gap-[48px] z-10">
                    <p className="w-full text-center text-blue-black text-2xl px-[20px]">Thanks for playing our scavenger hunt! Let’s take a peek at what you found...</p>
                    <Link href="/stats">
                        <div className="flex items-center bg-green text-warm-white w-fit h-[44px] gap-[6px] px-[20px] rounded-full" onClick={updateStickerbookViewTime}>
                            <p className="font-medium text-base">View Stats</p>
                            <img src="/icons/arrow-white.svg" alt="Right Arrow" className="w-[26px] h-[25px]" />
                        </div>
                    </Link>
                </div>
            </div>
        </main>
    );
}