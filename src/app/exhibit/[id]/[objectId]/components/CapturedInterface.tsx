import { Artifact } from '../../../../types';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaArrowRight, FaLightbulb, FaRegLightbulb, FaUndo } from 'react-icons/fa';

export default function CapturedInterface({ image, artifact }: { image: string | null, artifact: Artifact }) {
    return (
        <div
    className="w-[100svw] h-[100svh] flex flex-col gap-5 items-center relative"
    style={{
        background: `linear-gradient(to top, #CBDEFF, white)`,
        backgroundSize: '100% 100%',
    }}
>
    {/* Dots Layer */}
    <div
        className="absolute top-0 left-0 w-full h-full"
        style={{
            background: `radial-gradient(#6D9DF8 2px, transparent 1px)`,
            backgroundSize: '20px 20px',
            zIndex: 0, // Layer below the content
        }}
    />

    {/* Content Layer */}
    <div className="relative z-10">
            {/* Animated Blue Banner */}
            <motion.div
                className="fixed top-0 left-0 w-full bg-[#89AFEF] text-[#222324] text-center py-8 shadow-md z-50"
                initial={{ y: '-100%', opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}
            >
                <p className="text-base font-medium">You found a</p>
                <p className="text-xl font-semibold">{artifact.name.toUpperCase()}</p>
            </motion.div>

            {/* Spacer to ensure content is not hidden behind the fixed banner */}
            <div className="h-[120px]" />

            {/* Animated Artifact Description Box */}
<motion.div
    className="text-gray-700 text-center w-full px-6 max-w-md mx-auto"
    initial={{ y: -50, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ duration: 0.6, delay: 0.2 }}
>
    <p className="text-lg font-medium">{artifact.description || "Artifact Description Here"}</p>
</motion.div>

{/* Image with White Outline */}
{image && (
    <div className="relative">
        <div
            className="absolute top-0 left-0 w-full h-full border-4 border-white rounded-lg"
            style={{ zIndex: 1 }}
        />
        <Image
            src={image}
            alt="Captured"
            className="w-[40svh] h-auto rounded-lg"
            width={500}
            height={500}
        />
    </div>
)}

{/* Animated Button with Reload Icon */}
<motion.div
    initial={{ y: 50, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ duration: 0.6, delay: 0.4 }}
    className="mt-4 flex justify-center"
>
    <Link
        href={`/exhibit/${artifact.exhibit.toLowerCase()}`}
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
