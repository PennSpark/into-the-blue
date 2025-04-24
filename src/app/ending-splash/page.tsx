'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function WelcomePage() {
    const [showContent, setShowContent] = useState(false);
    

    useEffect(() => {
        // Fade in first content immediately
        setTimeout(() => {
            setShowContent(true);
        }, 100);
    }, []);

    return (
        <main
            className="relative h-screen bg-gradient-to-b from-[#f4f8ff] to-[#cbdeff]" style={{ height: "-webkit-fill-available"}}  
        >
            {/* Background traces */}
            <div className="absolute inset-0 flex items-center justify-center">
                {/* <Image src="/sites/blue/welcome-assets/traces.svg" alt="Welcome" width={500} height={500} /> */}
            </div>

            {/* First content */}
            <div className={`absolute inset-0 transition-opacity duration-1000 ${showContent ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <div className="h-full flex flex-col items-center justify-center gap-16 z-10" style={{ height: "-webkit-fill-available"}}>
                    <img src="/sites/blue/character/ending.webp" alt="Character" className="w-[208px] " />
                    <div className="flex flex-col items-center justify-center gap-4 z-10">
                        <p className="w-full text-center text-blue-black font-medium text-2xl leading-[1.75] px-[20px]">We hope you enjoyed your journey <i>Into the Blue!</i></p>
                        <div className="h-full flex flex-col items-center justify-center gap-[30px] z-10">
                            <div className="flex items-center justify-center gap-[16px]">
                                <Link href="https://pennspark.org/" target="_blank" rel="noopener noreferrer">

                                    <Image
                                        className="w-[30vw] h-auto"
                                        src="/sites/blue/icons/PennSparkLogo.webp"
                                        alt="Spark"
                                        width={500}
                                        height={500}
                                    />
                                </Link>
                                <Image
                                    className="w-[16px] h-[16px]"
                                    src="/sites/blue/welcome-assets/cross.svg"
                                    alt="x"
                                    width={50}
                                    height={50}
                                />
                                <Link href="https://penn.museum/" target="_blank" rel="noopener noreferrer">
                                    <Image
                                        className="w-[40vw] h-auto"
                                        src="/sites/blue/icons/PennMuseumLogo.webp"
                                        alt="Penn Museum"
                                        width={500}
                                        height={500}
                                    />
                                </Link>

                                {/* <Image className="w-[31px] h-[31px] padding-l-[1px]"
                                    src="/sites/blue/welcome-assets/penn-museum.webp" alt="Spark" width={100} height={100} 
                                />
                                <p className="text-blue-black font-FibraOneSemi text-base">PENN MUSEUM</p> */}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}