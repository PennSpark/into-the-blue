'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function WelcomePage() {
    const [showFirstContent, setShowFirstContent] = useState(false);
    const [showSecondContent, setShowSecondContent] = useState(false);

    // Set CSS variable for actual viewport height
    useEffect(() => {
        const setVh = () => {
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
        };
        setVh();
        window.addEventListener('resize', setVh);
        return () => window.removeEventListener('resize', setVh);
    }, []);

    useEffect(() => {
        // Fade in first content immediately
        setTimeout(() => {
            setShowFirstContent(true);
        }, 100);

        // Start fade out of first content after 3 seconds
        const fadeOutTimer = setTimeout(() => {
            setShowFirstContent(false);
        }, 3000);

        // Start fade in of second content after first content fades out
        const fadeInTimer = setTimeout(() => {
            setShowSecondContent(true);
        }, 4000);

        return () => {
            clearTimeout(fadeOutTimer);
            clearTimeout(fadeInTimer);
        };
    }, []);

    return (
        <main
            className="bg-warm-white w-full relative overflow-hidden"
            style={{ height: 'calc(var(--vh, 1vh) * 100)' }}
        >
            {/* Background traces */}
            <div className="absolute inset-0 flex items-center justify-center">
                <Image src="/welcome-assets/traces.svg" alt="Welcome" width={500} height={500} />
            </div>

            {/* First content */}
            <div className={`absolute inset-0 transition-opacity duration-1000 ${showFirstContent ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <div className="h-full flex flex-col items-center justify-center gap-[30px] z-10">
                    <p className="text-blue-black leading-none">Presented by</p>
                    <div className="flex items-center justify-center gap-[6px]">
                        <Image className="w-[31px] h-[31px]"
                            src="/welcome-assets/spark.png" alt="Spark" width={100} height={100} 
                        />
                        <p className="text-black font-FibraOneSemi text-base">PENN SPARK</p>
                        <Image className="w-[16px] h-[16px]"
                            src="/welcome-assets/cross.svg" alt="Spark" width={50} height={50} 
                        />
                        <Image className="w-[31px] h-[31px] padding-l-[1px]"
                            src="/welcome-assets/penn-museum.png" alt="Spark" width={100} height={100} 
                        />
                        <p className="text-black font-FibraOneSemi text-base">PENN MUSEUM</p>
                    </div>
                </div>
            </div>

            {/* Second content */}
            <div className={`absolute inset-0 transition-opacity duration-1000 ${showSecondContent ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <div className="flex h-[84%] items-center justify-center translate-y-[40px]">
                    <Image 
                        src="/welcome-assets/scav-prev.png" 
                        alt="Welcome" 
                        width={1000} 
                        height={1000}
                        className="object-contain w-[85%] max-w-[500px] h-auto"
                    />
                </div>
                <div className="fixed bottom-0 w-full px-5 py-3 flex justify-end z-40">
                    <Link href="/">
                        <div className="flex items-center bg-blue-1 text-warm-white w-fit h-[44px] gap-[6px] px-[20px] rounded-full">
                            <p className="font-medium text-base">Let's Begin!</p>
                            <img src="/icons/Footprints.svg" alt="Sticker Book" className="w-[22px] h-[22px]" />
                        </div>
                    </Link>
                </div>
            </div>
        </main>
    );
}