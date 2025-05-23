"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import anime from "animejs";
import { motion } from "framer-motion";

import {
	saveMetrics,
	getMetrics,
	clearImages,
	clearCollectedArtifacts,
	clearVisitedExhibits,
	clearGridSettings,
	clearStickers,
	getTutorialCompleted,
	clearIntroAnimations,
	clearTutorialCompletion,
	saveImage,
	cleanupTestImage,
} from "../context/IndexedDB";

export default function WelcomePage() {
	const [showFirstContent, setShowFirstContent] = useState(false);
	const [showSecondContent, setShowSecondContent] = useState(false);
	const [showIntroSlides, setShowIntroSlides] = useState(false);
	const [introIndex, setIntroIndex] = useState(0);
	const [hasMetrics, setHasMetrics] = useState(false);
	const [showPrivateModeWarning, setShowPrivateModeWarning] = useState(false);

	const router = useRouter();

	// Add global error handler to catch BlobURL errors
	useEffect(() => {
		const globalErrorHandler = (event) => {
			if (event.message && event.message.includes("BlobURLs are not yet supported")) {
				event.preventDefault(); // Prevent further handling
				setShowPrivateModeWarning(true);
				return true;
			}
		};

		window.addEventListener("error", globalErrorHandler, true);

		return () => window.removeEventListener("error", globalErrorHandler, true);
	}, []);

	// Test IndexedDB Blob storage on component mount
	useEffect(() => {
		const testPrivateBrowsing = async () => {
				try {
					const response = await fetch('/sites/blue/test_img.txt');
				if (!response.ok) {
					throw new Error(`Failed to fetch test file: ${response.status}`);
				}
				
				// Get the text content
				const textContent = await response.text();

				await saveImage(textContent, "test-private-mode", "test");

				await cleanupTestImage();
			} catch (error) {
				console.log("Storage test failed:", error);
				// If the error occurs but doesn't trigger the global handler
				if (error.message && error.message.includes("BlobURLs are not yet supported")) {
					setShowPrivateModeWarning(true);
				}

				try {
					await cleanupTestImage();
				  } catch (cleanupError) {
					console.log("Cleanup after failed test also failed:", cleanupError);
				  }
			}
		};

		// Run the test
		testPrivateBrowsing();
	}, []);

	// Set CSS variable for viewport height
	useEffect(() => {
		const setVh = () => {
			const vh = window.innerHeight * 0.01;
			document.documentElement.style.setProperty("--vh", `${vh}px`);
		};
		setVh();
		window.addEventListener("resize", setVh);
		return () => window.removeEventListener("resize", setVh);
	}, []);

	// Check if IndexedDB already has stored metrics
	useEffect(() => {
		async function checkMetrics() {
			const stored = await getMetrics();
			if (stored) {
				setHasMetrics(true);
			}
		}

		checkMetrics();
	}, []);

	useEffect(() => {
		// Fade in first content immediately
		setTimeout(() => {
			setShowFirstContent(true);
		}, 100);

		// Fade out first content after 3 seconds
		const fadeOutTimer = setTimeout(() => {
			setShowFirstContent(false);
		}, 2000);

		// Fade in second content after first fades out
		const fadeInTimer = setTimeout(() => {
			setShowSecondContent(true);
		}, 2700);

		return () => {
			clearTimeout(fadeOutTimer);
			clearTimeout(fadeInTimer);
		};
	}, []);

	useEffect(() => {
		if (!showSecondContent) return;

		const tl = anime.timeline({
			easing: "easeOutQuad",
			duration: 600,
		});

		tl.add({ targets: ".intro-seq", translateY: [0, -45], duration: 100 }, 0)
			.add({ targets: ".text", opacity: [0, 1], duration: 410 }, 0)
			.add({ targets: ".journey", opacity: [0, 1], duration: 500 }, 180)

			.add({ targets: ".obj1", opacity: [0, 1], duration: 450 }, 450)
			.add({ targets: ".star1", opacity: [0, 1], duration: 450 }, 450)
			.add({ targets: ".obj1", scale: [0, 1], duration: 720 }, 560)
			.add({ targets: ".star1", scale: [0, 1], duration: 720 }, 560)

			.add({ targets: ".obj2", opacity: [0, 1], duration: 450 }, 860)
			.add({ targets: ".star2", opacity: [0, 1], duration: 450 }, 860)
			.add({ targets: ".triangle", opacity: [0, 1], duration: 450 }, 860)
			.add({ targets: ".obj2", scale: [0, 1], duration: 720 }, 970)
			.add({ targets: ".star2", scale: [0, 1], duration: 720 }, 970)
			.add({ targets: ".triangle", scale: [0, 1], duration: 720 }, 970)

			.add({ targets: ".obj3", opacity: [0, 1], duration: 450 }, 1200)
			.add({ targets: ".star3", opacity: [0, 1], duration: 450 }, 1200)
			.add({ targets: ".star4", opacity: [0, 1], duration: 450 }, 1200)
			.add({ targets: ".obj3", scale: [0, 1], duration: 720 }, 1310)
			.add({ targets: ".star3", scale: [0, 1], duration: 720 }, 1310)
			.add({ targets: ".star4", scale: [0, 1], duration: 720 }, 1310)

			.add({ targets: ".obj4", opacity: [0, 1], duration: 450 }, 1540)
			.add({ targets: ".star5", opacity: [0, 1], duration: 450 }, 1540)
			.add({ targets: ".colors", opacity: [0, 1], duration: 450 }, 1540)
			.add({ targets: ".obj4", scale: [0, 1], duration: 720 }, 1650)
			.add({ targets: ".star5", scale: [0, 1], duration: 720 }, 1650)
			.add({ targets: ".colors", scale: [0, 1], duration: 720 }, 1650)

			.add({ targets: ".buttons", opacity: [0, 1], duration: 390 }, 2410)
			.add({ targets: ".buttons", translateY: [-7, 0], duration: 400 }, 2490);
	}, [showSecondContent]);

	useEffect(() => {
		const detectPrivateMode = () => {
			try {
				// Safari private mode throws QUOTA_EXCEEDED_ERR here
				localStorage.setItem("privateModeTest", "1");
				localStorage.removeItem("privateModeTest");
				// In normal mode, nothing else needed
			} catch (err) {
				console.warn("Private browsing detected:", err);
			}
		};

		detectPrivateMode();
	}, []);

	// Resets images, collected artifacts, and visited exhibits before resetting metrics.
	const handleStartOver = async () => {
		localStorage.clear();
		sessionStorage.clear();
		await clearImages();
		await clearCollectedArtifacts();
		await clearVisitedExhibits();
		await clearGridSettings();
		await clearStickers();
		await clearIntroAnimations();
		await clearTutorialCompletion();
		await saveMetrics({
			totalObjectsFound: 0,
			totalExhibitsVisited: 0,
			startTime: Date.now(),
			stickerbookViewTime: 0,
		});
	};

	const handleStartClick = async () => {
		const completed = await getTutorialCompleted();
		if (!completed) {
			setShowSecondContent(false);
			setTimeout(() => {
				setShowIntroSlides(true);
			}, 1000);
		} else {
			if (!hasMetrics) {
				await saveMetrics({
					totalObjectsFound: 0,
					totalExhibitsVisited: 0,
					startTime: Date.now(),
					stickerbookViewTime: 0,
				});
			}
			router.push("/");
		}
	};

	const handleIntroComplete = async () => {
		if (!hasMetrics) {
			await saveMetrics({
				totalObjectsFound: 0,
				totalExhibitsVisited: 0,
				startTime: Date.now(),
				stickerbookViewTime: 0,
			});
		}
		router.push("/");
	};

	return (
		<main
			className="bg-warm-white w-full relative overflow-hidden"
			style={{ height: "calc(var(--vh, 1vh) * 100)" }}
		>
			{/* Private Browsing Warning Modal */}
			{showPrivateModeWarning && (
				<div className="fixed inset-0 z-[3000] bg-black bg-opacity-80 flex items-center justify-center p-4">
					<div className="bg-white rounded-lg p-6 max-w-sm">
						<h2 className="text-xl font-bold text-black mb-3">
							Private Browsing Not Supported
						</h2>
						<p className="mb-4">
							This app requires temporary storage access to save your scavenger
							hunt progress. Please use regular browsing mode instead of
							private/incognito mode.
						</p>
						<p className="font-medium text-blue-500">
							Please exit private browsing and re-scan the QR code to continue.
						</p>
					</div>
				</div>
			)}

			<img
				src="/sites/blue/images/paper.webp"
				className="w-full h-full absolute z-0 object-cover"
				alt="Paper"
			/>
			{/* First content */}
			<div
				className={`absolute inset-0 transition-opacity duration-1000 ${
					showFirstContent ? "opacity-100" : "opacity-0 pointer-events-none"
				}`}
			>
				<div className="h-full flex flex-col items-center justify-center gap-[30px] z-10">
					<p className="text-blue-black leading-none font-FibraOneSemi font-FibraOneSemi">
						Presented by
					</p>
					<div className="flex items-center justify-center gap-[16px]">
						<Image
							className="w-[30vw] h-auto"
							src="/sites/blue/icons/PennSparkLogo.webp"
							alt="Spark"
							width={500}
							height={500}
						/>
						<Image
							className="w-[16px] h-[16px]"
							src="/sites/blue/welcome-assets/cross.svg"
							alt="Spark"
							width={50}
							height={50}
						/>
						<Image
							className="w-[40vw] h-auto"
							src="/sites/blue/icons/PennMuseumLogo.webp"
							alt="Spark"
							width={500}
							height={500}
						/>
					</div>
				</div>
			</div>

			{/* Second content */}
			<div
				className={`min-h-screen w-full overflow-y-auto transition-opacity duration-1000 ${
					showSecondContent ? "opacity-100" : "opacity-0 pointer-events-none"
				}`}
			>
				<div className="intro-seq relative min-h-screen">
					<div className="text absolute left-[33px] top-[290px]">
						<Image
							src="/sites/blue/welcome-assets/text.svg"
							alt="Welcome"
							width={100}
							height={100}
							className="object-contain w-[208px] h-auto"
						/>
					</div>
					<div className="journey absolute left-0 right-0 top-[60px]">
						<Image
							src="/sites/blue/welcome-assets/journey.webp"
							alt="Journey"
							width={100}
							height={100}
							className="object-contain w-full h-full"
						/>
					</div>
					<div className="obj1 absolute left-[37px] top-[71px]">
						<Image
							src="/sites/blue/welcome-assets/object-1.webp"
							alt="obj1"
							width={100}
							height={100}
							className="object-contain w-[112px] h-[137.26px]"
						/>
					</div>
					<div className="obj2 absolute left-[259.86px] top-[233.42px]">
						<Image
							src="/sites/blue/welcome-assets/object-2.webp"
							alt="obj2"
							width={100}
							height={100}
							priority
							className="object-contain w-[117.81px] h-[140.23px]"
						/>
					</div>
					<div className="obj3 absolute left-[28.09px] top-[433px]">
						<Image
							src="/sites/blue/welcome-assets/object-3.webp"
							alt="obj3"
							width={100}
							height={100}
							className="object-contain w-[142.02px] h-[151.25px]"
						/>
					</div>
					<div className="obj4 absolute left-[220px] top-[563px]">
						<Image
							src="/sites/blue/welcome-assets/object-4.webp"
							alt="obj4"
							width={100}
							height={100}
							className="object-contain w-[123.69px] h-[138.75px]"
						/>
					</div>
					<div className="star1 absolute left-[4px] top-[52px]">
						<Image
							src="/sites/blue/welcome-assets/star1.webp"
							alt="star"
							width={100}
							height={100}
							className="object-contain w-[67px] h-[67px]"
						/>
					</div>
					<div className="star2 absolute left-[267px] top-[153px]">
						<Image
							src="/sites/blue/welcome-assets/star2.webp"
							alt="star"
							width={100}
							height={100}
							className="object-contain w-[87px] h-[87px]"
						/>
					</div>
					<div className="triangle absolute left-[283.94px] top-[345px] -rotate-[9.59]">
						<Image
							src="/sites/blue/welcome-assets/triangle-sticker.webp"
							alt="triangle"
							width={100}
							height={100}
							className="object-contain w-[107.65px] h-auto"
						/>
					</div>
					<div className="star3 absolute left-[61px] top-[411px]">
						<Image
							src="/sites/blue/welcome-assets/star3.webp"
							alt="star"
							width={100}
							height={100}
							className="object-contain w-[62px] h-[62px]"
						/>
					</div>
					<div className="star4 absolute left-[8px] top-[533px]">
						<Image
							src="/sites/blue/welcome-assets/star4.webp"
							alt="star"
							width={100}
							height={100}
							className="object-contain w-[86px] h-[86px]"
						/>
					</div>
					<div className="star5 absolute left-[220px] top-[562px]">
						<Image
							src="/sites/blue/welcome-assets/star5.webp"
							alt="star"
							width={100}
							height={100}
							className="object-contain w-[49px] h-[49px]"
						/>
					</div>
					<div className="colors absolute left-[214.69px] top-[647px]">
						<Image
							src="/sites/blue/welcome-assets/colors-of-blue.webp"
							alt="star"
							width={100}
							height={100}
							className="object-contain w-[121px] h-auto"
						/>
					</div>
					<div className="absolute top-[680px] w-full h-[200px]" />
				</div>
				{hasMetrics ? (
					<div className="buttons fixed bottom-0 w-full px-5 py-3 flex z-40 font-FibraOneSemi">
						<div className="flex gap-3 w-full justify-between">
							<Link href="/" onClick={handleStartOver}>
								<div className="flex items-center border-2 border-blue-1 text-blue-1 font-semibold bg-white w-fit h-[44px] gap-[8px] px-[20px] rounded-full">
									<p className="font-medium text-base">Start Over</p>
								</div>
							</Link>
							<button onClick={handleStartClick}>
								<div className="flex items-center bg-blue-1 text-warm-white font-semibold w-fit h-[44px] gap-[6px] px-[20px] rounded-full">
									<p className="font-medium text-base">Continue Hunt</p>
									<img
										src="/sites/blue/icons/Footprints.svg"
										alt="Continue"
										className="w-[22px] h-[22px]"
									/>
								</div>
							</button>
						</div>
					</div>
				) : (
					<div className="buttons fixed bottom-0 w-full px-5 py-3 flex justify-end z-40 font-FibraOneSemi tracking-heading">
						<button onClick={handleStartClick}>
							<div className="flex items-center bg-blue-1 text-warm-white w-fit h-[44px] gap-[6px] px-[20px] rounded-full">
								<p className="font-medium text-base">Let&apos;s Begin!</p>
								<img
									src="/sites/blue/icons/Footprints.svg"
									alt="Sticker Book"
									className="w-[22px] h-[22px]"
								/>
							</div>
						</button>
					</div>
				)}
			</div>

			{/* Intro slides */}
			<div
				key={introIndex}
				className={`absolute w-full h-full inset-0 p-6 z-50 text-center transition-opacity duration-500 ${
					showIntroSlides ? "opacity-100" : "opacity-0 pointer-events-none"
				} text-black text-[24px] tracking-heading font-semibold`}
			>
				{introIndex === 0 && (
					<div className="flex flex-col justify-center items-center gap-4 h-full w-full">
						<p>
							Welcome to the <i>Into the Blue</i> scavenger hunt!
						</p>
						<Image
							className="w-[50vw] h-auto"
							src="/sites/blue/tutorial-assets/char1.webp"
							alt="Char1"
							width={500}
							height={500}
							onLoad={(e) => {
								e.currentTarget.classList.remove("opacity-0");
							}}
						/>
					</div>
				)}
				{introIndex === 1 && (
					<motion.div
						className="flex flex-col justify-center items-center gap-4 h-full w-full"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 1, ease: "easeOut" }}
					>
						<p className="pb-[18px]">
							<i>Into the Blue</i> is an exhibit all about the color blue.
						</p>
						<p>It&apos;s located on the upper level of the Museum.</p>
						<Image
							className="w-[60vw] h-auto"
							src="/sites/blue/tutorial-assets/char2.webp"
							alt="Char1"
							width={500}
							height={500}
							onLoad={(e) => {
								e.currentTarget.classList.remove("opacity-0");
							}}
						/>
					</motion.div>
				)}
				{introIndex === 2 && (
					<motion.div
						className="flex flex-col justify-center items-center gap-4 h-full w-full"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 1, ease: "easeOut" }}
					>
						<p>
							Your goal is to find
							<span className="text-blue-4 font-black"> blue objects </span>
							across the Museum.
						</p>
						<Image
							className="w-[40vw] h-auto"
							src="/sites/blue/tutorial-assets/char3.webp"
							alt="Char1"
							width={500}
							height={500}
							onLoad={(e) => {
								e.currentTarget.classList.remove("opacity-0");
							}}
						/>
					</motion.div>
				)}
				{introIndex === 3 && (
					<motion.div
						className="flex flex-col justify-center items-center gap-4 h-full w-full"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 1, ease: "easeOut" }}
					>
						<p>
							Then you can create a stickerbook to share your finds with
							friends and family!
						</p>
						<Image
							className="w-[50vw] h-auto"
							src="/sites/blue/tutorial-assets/char4.webp"
							alt="Char1"
							width={500}
							height={500}
							onLoad={(e) => {
								e.currentTarget.classList.remove("opacity-0");
							}}
						/>
					</motion.div>
				)}

				{introIndex < 3 ? (
					<div className="fixed bottom-0 left-0 right-0 w-full px-5 py-3 flex justify-end z-40">
						<button
							className="bg-blue-1 text-white text-body font-body1 px-6 py-2 rounded-[50px]"
							onClick={() => setIntroIndex((i) => i + 1)}
						>
							Next
						</button>
					</div>
				) : (
					<div className="fixed bottom-0 left-0 right-0 w-full px-5 py-3 flex justify-end z-40">
						<button
							className="bg-blue-1 text-white text-body font-body1 px-6 py-2 rounded-[50px]"
							onClick={handleIntroComplete}
						>
							Let’s Get Started!
						</button>
					</div>
				)}
			</div>
		</main>
	);
}
