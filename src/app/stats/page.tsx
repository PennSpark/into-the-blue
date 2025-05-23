'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getMetrics, loadCollectedArtifacts } from "../context/IndexedDB";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import StaticStickerBoard from "@/components/StaticStickerBoard";
import { motion, AnimatePresence } from "framer-motion";

export default function StatsPage() {
    const [showContent, setShowContent] = useState(false);
    const [activeSlide, setActiveSlide] = useState(0);
    const sliderRef = useRef<Slider | null>(null);
    const statsContainerRef = useRef<HTMLDivElement>(null);
    const [statsHeight, setStatsHeight] = useState<number | null>(null);
    const [statsContainerWidth, setStatsContainerWidth] = useState<number | null>(null);
    const [metrics, setMetrics] = useState({
        totalObjectsFound: 0,
        totalExhibitsVisited: 0,
        startTime: Date.now(),
        stickerbookViewTime: 0,
    });
    const [collectedImages, setCollectedImages] = useState<string[]>([]);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [showShareModal, setShowShareModal] = useState(false);

    useEffect(() => {
        setTimeout(() => {
            setShowContent(true);
        }, 100);
    }, []);

    useEffect(() => {
        async function fetchMetrics() {
            const m = await getMetrics();
            if (m) {
                setMetrics(m);

                const calculatedSeconds = Math.floor((Date.now() - m.startTime) / 1000);
                setElapsedSeconds(calculatedSeconds);
            }
        }
        fetchMetrics();
    }, []);

    useEffect(() => {
        async function loadImages() {
            try {
                const artifactIds = await loadCollectedArtifacts();
                if (artifactIds.length === 0) {
                    setCollectedImages([]);
                    return;
                }
                const shuffled = artifactIds.sort(() => 0.5 - Math.random());
                const selected = shuffled.slice(0, 4);
                const images = selected.map(id => `/sites/blue/images/artifacts/${id}.webp`);
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

    useEffect(() => {
        if (showContent && activeSlide === 0 && statsContainerRef.current) {
            const height = statsContainerRef.current.offsetHeight;
            setStatsHeight(height);
            const width = (height * 42.75) / 76;
            setStatsContainerWidth(width);
        }
    }, [showContent, activeSlide]);

    const shareStats = () => {
        setShowShareModal(true);
        setTimeout(() => {
            setShowShareModal(false);
        }, 3000);
    };

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

    const personality = metrics.totalObjectsFound === 36 ? 'COMPLETIONIST' :
        metrics.totalObjectsFound >= 24 ? 'EXPLORER' :
        metrics.totalObjectsFound >= 12 ? 'INVESTIGATOR' :
        'ADVENTURER';

    const personalityDescription = metrics.totalObjectsFound === 37 ? 'You found all 37 objects and completed the scavenger hunt!' :
        metrics.totalObjectsFound >= 24 ? `You found ${metrics.totalObjectsFound} objects and are a true explorer!` :
        metrics.totalObjectsFound >= 12 ? `You found ${metrics.totalObjectsFound} objects and are quite the investigator!` :
        `You found ${metrics.totalObjectsFound} objects and are a curious adventurer!`;

    const settings = {
        dots: false,
        infinite: false,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        swipeToSlide: true,
        beforeChange: (_: number, next: number) => setActiveSlide(next),
        arrows: false,
        centerMode: true,
        centerPadding: '50px',
        focusOnSelect: true,
    };

    return (
        <main
            className="relative w-full overflow-hidden bg-gradient-to-b from-[#d8e3f7] to-[#aec6f0]"
            style={{ height: 'calc(var(--vh, 1vh) * 100)' }}
        >
            <div className={`absolute inset-0 transition-opacity duration-1000 ${showContent ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <div className="h-full flex flex-col items-center justify-start gap-1 z-10">
                    <div className="w-full mt-6">
                        <Slider {...settings} ref={sliderRef}>
                            <div className="flex justify-center px-2">
                                <div 
                                    id="stats-container" 
                                    ref={statsContainerRef} 
                                    className="h-auto flex flex-col items-center justify-start gap-6 py-6 px-5 bg-warm-white rounded-xl"
                                    style={{
                                        width: statsContainerWidth ? `${statsContainerWidth}px` : 'auto',
                                        maxWidth: '85vw',
                                        margin: '0 auto'
                                    }}
                                >
                                    <div className='flex flex-col items-center gap-4'>
                                        <div className='flex flex-col items-center gap-2'>
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
                                    <div className='flex flex-col items-center gap-4'>
                                        <div className='flex flex-col items-center gap-2'>
                                            <p className="text-[18px] font-semibold text-blue-black">Rarest Finds</p>
                                            <hr className="w-[55vw] border-t border-gray-3" />
                                        </div>
                                        <div className="w-full flex flex-row justify-between">
                                            {collectedImages.length > 0 ? (
                                                collectedImages.map((url, index) => (
                                                    <Image key={index} className="h-[44px] w-auto" src={url} alt="Collected artifact" width={100} height={100} />
                                                ))
                                            ) : (
                                                <p className="text-gray-2 text-[14px]">No artifacts collected yet</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className='flex flex-col items-center gap-4'>
                                        <div className='flex flex-col items-center gap-2'>
                                            <p className="text-[18px] font-semibold text-blue-black">Collector Personality</p>
                                            <hr className="w-[55vw] border-t border-gray-3" />
                                        </div>
                                        <div className="flex flex-col items-center gap-4 px-3 py-6 rounded-[8px] bg-gradient-to-r from-[#ebf2ff] to-[#b9e6ff]">
                                            <p className="font-FibraOneBold text-[24px] leading-none bg-gradient-to-r from-blue-1 to-[#004972] text-transparent bg-clip-text">{personality}</p>
                                            <p className="text-gray-2 text-[14px] w-[55vw] text-center font-semibold">{personalityDescription}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div className="mx-5 rounded-xl overflow-hidden"
                                    style={{ height: statsHeight ? `${statsHeight}px` : 'auto' }}>
                                    <StaticStickerBoard />
                                </div>
                            </div>
                        </Slider>
                    </div>
                    <div className="flex justify-center gap-2 mt-4">
                        <button 
                            onClick={() => sliderRef.current?.slickGoTo(0)}
                            className={`w-2 h-2 rounded-full transition-opacity duration-300 ${activeSlide === 0 ? 'opacity-100 bg-blue-4' : 'opacity-40 bg-blue-4'}`}
                            aria-label="Go to slide 1"
                        />
                        <button 
                            onClick={() => sliderRef.current?.slickGoTo(1)}
                            className={`w-2 h-2 rounded-full transition-opacity duration-300 ${activeSlide === 1 ? 'opacity-100 bg-blue-4' : 'opacity-40 bg-blue-4'}`}
                            aria-label="Go to slide 2"
                        />
                    </div>
                    <div className="fixed bottom-0 left-0 right-0 w-full px-10 py-3 flex justify-between z-40 bg-gradient-to-b from-transparent to-[#aec6f0]">
                        <Link href="/ending">
                            <div className="flex items-center bg-warm-white w-fit h-[44px] gap-[6px] px-[16px] rounded-full">
                                <img src="/sites/blue/icons/left-arrow-black.svg" alt="Back" className="w-[16px] h-[14px]" />
                            </div>
                        </Link>
                        <div className="relative flex justify-center items-center">
                            <button
                                onClick={shareStats}
                                className="flex items-center bg-green text-warm-white w-fit h-[44px] gap-0 px-[16px] rounded-full overflow-hidden"
                            >
                                <img
                                    src="/sites/blue/icons/export.svg"
                                    alt="Share"
                                    className="w-[16px] h-[18px] flex-shrink-0"
                                />
                                <div className="relative ml-2 w-[90px] h-[20px]">
                                    <span
                                        className={`absolute inset-0 flex items-center justify-center text-base font-medium transition-opacity duration-300 ${
                                            activeSlide === 0 ? "opacity-100" : "opacity-0"
                                        }`}
                                    >
                                        Share Stats
                                    </span>
                                    <span
                                        className={`absolute inset-0 flex items-center justify-center text-base font-medium transition-opacity duration-300 ${
                                            activeSlide === 1 ? "opacity-100" : "opacity-0"
                                        }`}
                                    >
                                        Share Board
                                    </span>
                                </div>
                            </button>
                            <AnimatePresence>
                                {showShareModal && (
                                    <motion.div 
                                        className="absolute bottom-[52px] left-0 right-0 mx-auto z-50 pointer-events-none"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10, transition: { duration: 0.5 } }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <div className="bg-green text-warm-white p-3 rounded-lg text-center shadow-lg w-[120px] mx-auto">
                                            <p className="text-sm font-medium">
                                                To share, take a screenshot!
                                            </p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        <Link href="/ending-splash">
                            <div className="flex items-center bg-warm-white text-green w-fit h-[44px] gap-[6px] pl-[20px] pr-[16px] rounded-full">
                                <p className="font-medium text-base">Exit App</p>                            
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}