import { Artifact } from '../../../../types';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaArrowRight } from 'react-icons/fa';

export default function CapturedInterface({ image, artifact }: { image: string | null, artifact: Artifact }) {
    return (
        <div className="w-full flex flex-col gap-5 items-center relative">
            {/* Dots Layer */}
            <div
                className="fixed top-0 left-0 w-full h-[100vh]"
                style={{
                    background: `radial-gradient(#6D9DF8 2px, transparent 1px)`,
                    backgroundSize: '20px 20px',
                    zIndex: -2, // Ensure it's below all content but above the body background
                }}
            />

            {/* Gradient Layer */}
            <div
                className="fixed top-0 left-0 w-full h-[100vh]"
                style={{
                    background: `linear-gradient(to bottom, white, #CBDEFF)`,
                    backgroundSize: '100% 100%',
                    opacity: 0.85,
                    zIndex: -1, // Behind the content but above the dots layer
                }}
            />

            {/* Content Layer */}
            <div className="relative z-10">
                {/* Animated Blue Banner */}
                <motion.div
                    className="fixed top-0 left-0 w-full h-[100px] bg-[#89AFEF] text-[#222324] shadow-md z-50 rounded-b-[20px] flex flex-col justify-center items-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.4 }}
                >
                    <p className="text-base font-medium text-gray-1">You found a</p>
                    <p className="text-xl font-semibold text-black">{artifact.name.toUpperCase()}</p>
                </motion.div>

                {/* Spacer to ensure content is not hidden behind the fixed banner */}
                <div className="h-[128px]" />

                {/* Animated Artifact Description Box */}
                <div className="w-full flex justify-center">
                    <motion.div
                        className="w-[293px] flex justify-between"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3, delay: 0.4 }}
                    >
                        <div className='flex flex-col gap-1'>
                            <p className="text-base font-medium text-gray-1">Time Period</p>
                            <p className="text-base font-medium text-gray-1">Material</p>
                        </div>

                        <div className='text-end flex flex-col justify-start gap-1'>
                            <p className="text-base font-medium text-black">{artifact.time || "???"}</p>
                            <p className="text-base font-medium text-black">{artifact.material || "???"}</p>
                        </div>
                    </motion.div>
                </div>  

                <div className="flex flex-col items-center">
                    {/* Image with White Outline */}
                    {image && (
                        <motion.div className="relative"
                            initial={{ y: -25 }}
                            animate={{ y: 25 }}
                            transition={{ duration: 0.3, delay: 1 }}
                        >
                            <div
                                className="absolute top-0 left-0 w-full h-full rounded-lg"
                                style={{ zIndex: 1 }}
                            />
                            <Image
                                src={image}
                                alt="Captured"
                                className="w-[340px] h-auto rounded-lg"
                                width={500}
                                height={500}
                            />
                        </motion.div>
                    )}
                </div>

                {/* Animated Button with Reload Icon */}
                <motion.div
                    initial={{ y: 35, opacity: 0 }}
                    animate={{ y: 35, opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.4 }}
                    className="mt-4 flex justify-center"
                >
                    <Link
                        href={`/exhibit/${artifact.exhibitID}`}
                        className="bg-[#333D37] text-white text-[16px] px-6 py-2 rounded-full shadow-md hover:bg-[#444D47] transition flex items-center"
                    >
                        <span className="mr-2">Continue</span>
                        <FaArrowRight style={{ width: "20px", height: "18px" }} />
                    </Link>
                </motion.div>
            </div>
        </div>
    );
}
