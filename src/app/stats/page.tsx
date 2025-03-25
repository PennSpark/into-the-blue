'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function StatsPage() {
    const [showContent, setShowContent] = useState(false);
    
    useEffect(() => {
        // Fade in first content immediately
        setTimeout(() => {
            setShowContent(true);
        }, 100);
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

    return (
        <main
            className="relative w-full overflow-hidden bg-gradient-to-b from-[#d8e3f7] to-[#aec6f0]"
            style={{ height: 'calc(var(--vh, 1vh) * 100)' }}
        >
            {/* First content */}
            <div className={`absolute inset-0 transition-opacity duration-1000 ${showContent ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <div className="h-full flex flex-col items-center justify-start gap-[30px] z-10">
                    <div className="h-[84%] w- flex flex-col items-center justify-start gap-[36px] m-[20px] p-[32px] px-[20px] bg-warm-white rounded-xl">
                        <div className='flex flex-col items-center gap-[21px]'>
                            <div className='flex flex-col items-center gap-[10px]'>
                                <p className="text-[18px] font-semibold text-blue-black">Visit Statistics</p>
                                <hr className="w-[55vw] border-t border-gray-3" />
                            </div>
                            <div className="flex flex-col items-center gap-[16px] leading-none">
                                <div className="flex flex-start justify-start gap-[18px]">
                                    <p className="text-[14px] w-[106px] text-gray-2">Objects Found</p>
                                    <p className="text-[14px] text-blue-4 font-semibold">???</p>
                                </div>
                                <div className="flex flex-start justify-start gap-[18px]">
                                    <p className="text-[14px] w-[106px] text-gray-2">Exhibits Visited</p>
                                    <p className="text-[14px] text-blue-4 font-semibold">???</p>
                                </div>
                                <div className="flex flex-start justify-start gap-[18px]">
                                    <p className="text-[14px] w-[106px] text-gray-2">Time Elapsed</p>
                                    <p className="text-[14px] text-blue-4 font-semibold">???</p>
                                </div>
                            </div>
                        </div>
                        <div className='flex flex-col items-center gap-[21px]'>
                            <div className='flex flex-col items-center gap-[10px]'>
                                <p className="text-[18px] font-semibold text-blue-black">Rarest Finds</p>
                                <hr className="w-[55vw] border-t border-gray-3" />
                            </div>
                            <div className="flex items-center gap-[26px]">
                                <Image className="h-[44px] w-auto"
                                    src="/images/artifacts/rome-1-Urn.png" alt="Urn" width={100} height={100} 
                                />
                            </div>
                        </div>
                        <div className='flex flex-col items-center gap-[24px]'>
                            <div className='flex flex-col items-center gap-[10px]'>
                                <p className="text-[18px] font-semibold text-blue-black">Collector Personality</p>
                                <hr className="w-[55vw] border-t border-gray-3" />
                            </div>
                            <div className="flex flex-col items-center gap-[20px] p-[32px] rounded-[8px] bg-gradient-to-r from-[#ebf2ff] to-[#b9e6ff]">
                                <p className="font-FibraOneBold text-[24px] leading-none bg-gradient-to-r from-blue-1 to-[#004972] text-transparent bg-clip-text">COMPLETIONIST</p>
                                <p className="text-gray-2 text-[14px] w-[55vw] text-center font-semibold">You found all 36 objects and completed the scavenger hunt!</p>
                            </div>
                        </div>
                    </div>
                    {/* Floating buttons */}
                    <div className="fixed bottom-0 w-full px-5 py-3 flex justify-center gap-[12px] z-40">
                        <Link href="/">
                            <div className="flex items-center bg-warm-white w-fit h-[44px] gap-[6px] px-[16px] rounded-full">
                                <img src="/icons/left-arrow.svg" alt="Back" className="w-[16px] h-[14px]" />
                            </div>
                        </Link>
                        <button onClick={openSms} className="flex items-center bg-green w-fit h-[44px] gap-[6px] px-[16px] rounded-full">
                            <img src="/icons/export.svg" alt="Share" className="w-[16px] h-[18px]" />
                        </button>
                        <Link href="/stickerbook">
                            <div className="flex items-center bg-green text-warm-white w-fit h-[44px] gap-[6px] pl-[20px] pr-[16px] rounded-full">
                                <p className="font-medium text-base">Share Sticker Book</p>
                                <img src="/icons/arrow-white.svg" alt="View Stickerbook" className="w-[26px] h-[25px]" />
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}