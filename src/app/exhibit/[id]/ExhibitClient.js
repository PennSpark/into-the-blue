"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import anime from "animejs";
import Image from "next/image";
import { get, set, del } from "idb-keyval";
import { loadCollectedArtifacts } from "../../context/IndexedDB"; // adjust path as necessary
import { motion } from "framer-motion";
import { FaArrowLeft } from "react-icons/fa";

export default function ExhibitClient({ exhibit, id }) {
	// Local state for controlling the intro sequence
	const [isLoading, setIsLoading] = useState(true);
	const [showArtifacts, setShowArtifacts] = useState(false);
	// New state to hold the updated artifact list and found count
	const [artifacts, setArtifacts] = useState(exhibit.items);
	const [foundCount, setFoundCount] = useState(0);

	const introRef = useRef(null);
	const headingRef = useRef(null);

	const handleEnterClick = () => {
		anime({
			targets: introRef.current,
			opacity: [1, 0],
			duration: 800,
			easing: "easeInOutQuad",
			complete: async () => {
				await set(`seenIntro-${id}`, true);
				setShowArtifacts(true);
			},
		});
	};

	// When component mounts, check if the intro has been seen.
	useEffect(() => {
		const checkIntro = async () => {
			const seen = await get(`seenIntro-${id}`);
			setShowArtifacts(seen === true);
			setIsLoading(false);
		};
		checkIntro();
	}, [id]);

	// After exhibit prop is available, load collected artifact IDs from IndexedDB.
	useEffect(() => {
		async function checkCollected() {
			try {
				// loadCollectedArtifacts returns an array of artifact IDs that have been collected.
				const collected = await loadCollectedArtifacts();
				const justFoundId = await get("justFoundArtifactId");

				const updatedArtifacts = exhibit.items.map((item) => {
					return {
						...item,
						userFound: collected.includes(item.id),
						justFound: collected.includes(item.id) && item.id === justFoundId,
					};
				});
				setArtifacts(updatedArtifacts);
				setFoundCount(updatedArtifacts.filter((a) => a.userFound).length);
				await del("justFoundArtifactId");
			} catch (error) {
				console.error("Error checking collected artifacts:", error);
			}
		}
		if (exhibit && exhibit.items) {
			checkCollected();
		}
	}, [exhibit]);

	useEffect(() => {
		async function checkCollected() {
			try {
				const collected = await loadCollectedArtifacts();
				const updatedArtifacts = exhibit.items.map((item) => ({
					...item,
					userFound: collected.includes(item.id),
				}));
				setArtifacts(updatedArtifacts);
				setFoundCount(updatedArtifacts.filter((a) => a.userFound).length);
			} catch (error) {
				console.error("Error checking collected artifacts:", error);
			}
		}
		// Re-run checkCollected when the window gains focus.
		function handleFocus() {
			checkCollected();
		}
		window.addEventListener("focus", handleFocus);

		// Clean up on unmount.
		return () => {
			window.removeEventListener("focus", handleFocus);
		};
	}, [exhibit]);

	// Run intro animation AFTER isLoading is false AND intro is showing
	useEffect(() => {
		if (isLoading || showArtifacts) return;

		const tl = anime.timeline({
			easing: "easeOutQuad",
			duration: 600,
		});

		const headingHeight = headingRef.current?.offsetHeight || 0;

		const arrowY = headingHeight > 80 ? 170 : 120;
		tl.add({
			targets: ".intro-symbol",
			opacity: [0, 1],
			translateY: [-20, 0],
		})
			.add({ targets: ".up-arrow", opacity: [0, 1] }, "-=600")
			.add({ targets: ".up-arrow", translateY: [0, arrowY] }, "+=100")
			.add({ targets: ".intro-heading", opacity: [0, 1] })
			.add(
				{
					targets: ".intro-description",
					opacity: [0, 1],
					translateY: [20, 0],
				},
				"+=200"
			)
			.add({ targets: ".intro-symbol", translateY: [0, -60] }, "-=600")
			.add({ targets: ".intro-heading", translateY: [0, -60] }, "-=600")
			.add({ targets: ".intro-enter", opacity: [0, 1] });
	}, [isLoading, showArtifacts, id]);

	// Render the intro screen or the artifact list
	if (isLoading) return null;
	return (
		<main className="min-h-screen w-full relative">
			{!showArtifacts ? (
				// Intro Sequence View
				<div
					ref={introRef}
					className="w-screen h-screen relative bg-white [background:linear-gradient(180deg,#FFF5DD_0%,#3E65C8_100%)]"
				>
					{/* Centered Content */}
					<div className="h-full flex flex-col items-center justify-center">
						{/* Ornament / Symbol */}
						<div className="intro-symbol opacity-0 flex flex-col items-center justify-center gap-4">
							<img
								src="/sites/blue/exhibit-intro-assets/ornament.svg"
								alt="Ornament"
							/>
							<img
								src="/sites/blue/exhibit-intro-assets/down-arrow.svg"
								alt="Down"
							/>
							<img
								className="up-arrow"
								src="/sites/blue/exhibit-intro-assets/up-arrow.svg"
								alt="Up"
							/>
						</div>

						{/* Heading */}
						<div
							ref={headingRef}
							className="intro-heading font-FibraOneSemi tracking-heading opacity-0"
						>
							<h1 className="px-[5px] text-[32px] sm:text-[32px] md:text-[45px] lg:text-[50px] text-green text-center">
								{exhibit.displayName.toUpperCase()}
							</h1>
							<h2 className="font-bold text-[#333d374D] text-2xl text-center">
								{id == "egypt" ? "Special Exhibition" : "Gallery"}
							</h2>
						</div>

						{/* Description */}
						<div className="intro-description mt-4 max-w-[80%] opacity-0">
							<p className="text-body text-green font-body1 text-base text-center leading-relaxed">
								{exhibit.description}
							</p>
						</div>

						{/* Enter Button */}
						<div className="intro-enter mt-10 opacity-0">
							<button
								className="py-3 px-6 text-base rounded-full bg-gray-800 text-white cursor-pointer"
								onClick={handleEnterClick}
							>
								Enter &rarr;
							</button>
						</div>
					</div>
				</div>
			) : (
				<main className="min-h-screen w-full relative bg-warm-white">
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 0.6, ease: "easeOut" }}
					>
						<img
							src="/sites/blue/images/paper.png"
							className="w-full h-full absolute z-0"
							alt="Paper"
						/>
						{/* Top bar */}
						<div className="sticky-header fixed top-0 left-0 right-0 w-full shadow-md bg-warm-white flex flex-col justify-center items-center py-2 px-2 mb-4">
							{/* Home button */}
							<Link href={`/`} className="absolute left-4 top-4">
								<button className="rounded-[20px] h-[34px] w-[96px] px-[14px] py-[10px] flex flex-row items-center bg-warm-gray">
									<FaArrowLeft
										style={{
											width: "18px",
											height: "16px",
											marginRight: "8px",
										}}
									/>
									Home
								</button>
							</Link>

							{/* top placeholder to balance layout */}
							<div className="w-[45px] h-[45px]" />

							{/* Exhibit Title & Found Count */}
							<div className="artifacts-header text-center">
								<p className="text-heading1 font-heading1 font-FibraOneBold tracking-heading leading-none mt-4 text-blue-black p-0">
									{exhibit.displayName}
								</p>
								<p className="text-body font-body1 my-2 text-gray-2">
									{foundCount}/{exhibit.totalObjects} Objects Found
								</p>
							</div>
						</div>

						{/* Artifact Tiles */}
						<div className="w-[90%] mx-auto flex flex-row gap-4 justify-center pb-[60px]">
							<div className="w-full mx-auto flex flex-col gap-4 items-center">
								{artifacts
									.filter((artifact, index) => index % 2 === 0)
									.map((artifact) => (
										<Link
											key={artifact.id}
											className={`relative flex flex-col items-center w-full p-4 rounded-md cursor-pointer ${
												artifact.userFound ? "bg-blue-2" : "bg-blue-3"
											}`}
											href={`/exhibit/${id}/${artifact.id}`}
										>
											<Image
												src={artifact.imageURL}
												alt={artifact.name}
												className={
													artifact.userFound
														? "max-h-[220px] max-w-[120px] object-contain opacity-0 transition-opacity duration-300"
														: "filter grayscale max-h-[220px] max-w-[120px] object-contain opacity-0 transition-opacity duration-300"
												}
												width={120}
												height={220}
												placeholder="blur"
												blurDataURL="/sites/blue/images/placeholder.png"
												onLoad={(e) =>
													e.currentTarget.classList.remove("opacity-0")
												}
											/>

											<p className="mt-2 text-body font-body1 text-gray-1 text-center">
												{artifact.name}
											</p>

											{/* "Found" sticker overlay if artifact is found */}
											{artifact.userFound && (
												<motion.img
													src="/sites/blue/icons/found.svg"
													alt="Found"
													initial={
														artifact.justFound
															? { scale: 0, rotate: -45, opacity: 0 }
															: false
													}
													animate={
														artifact.justFound
															? { scale: 1, rotate: 0, opacity: 1 }
															: false
													}
													transition={
														artifact.justFound
															? {
																	duration: 2,
																	delay: 0.5,
																	ease: "easeOut",
																	type: "spring",
																	bounce: 0.4,
															  }
															: {}
													}
													className="absolute m-auto top-0 bottom-0 left-0 right-0 w-21"
												/>
											)}
										</Link>
									))}
							</div>
							<div className="w-full mx-auto flex flex-col gap-4 items-center">
								{artifacts
									.filter((artifact, index) => index % 2 === 1)
									.map((artifact) => (
										<Link
											key={artifact.id}
											className={`relative flex flex-col items-center w-full p-4 rounded-md cursor-pointer ${
												artifact.userFound ? "bg-blue-2" : "bg-blue-3"
											}`}
											href={`/exhibit/${id}/${artifact.id}`}
										>
											<Image
												src={artifact.imageURL}
												alt={artifact.name}
												className={
													artifact.userFound
														? "max-h-[220px] max-w-[120px] object-contain opacity-0 transition-opacity duration-300"
														: "filter grayscale max-h-[220px] max-w-[120px] object-contain opacity-0 transition-opacity duration-300"
												}
												width={120}
												height={220}
												placeholder="blur"
												blurDataURL="/sites/blue/images/placeholder.png"
												onLoad={(e) =>
													e.currentTarget.classList.remove("opacity-0")
												}
											/>

											<p className="mt-2 text-body font-body1 text-gray-1 text-center">
												{artifact.name}
											</p>

											{/* "Found" sticker overlay if artifact is found */}
											{artifact.userFound && (
												<motion.img
													src="/sites/blue/icons/found.svg"
													alt="Found"
													initial={
														artifact.justFound
															? { scale: 0, rotate: -45, opacity: 0 }
															: false
													}
													animate={
														artifact.justFound
															? { scale: 1, rotate: 0, opacity: 1 }
															: false
													}
													transition={
														artifact.justFound
															? {
																	duration: 2,
																	delay: 0.5,
																	ease: "easeOut",
																	type: "spring",
																	bounce: 0.4,
															  }
															: {}
													}
													className="absolute m-auto top-0 bottom-0 left-0 right-0 w-21"
												/>
											)}
										</Link>
									))}
							</div>
						</div>

						{/* Bottom "Stickerbook" button */}
						<div
							className="fixed bottom-0 w-full px-5 py-3 flex justify-between z-40"
							style={{
								background:
									"linear-gradient(to bottom, rgba(254,252,247,0) 0%, rgba(255,254,253,0.85) 40.5%, #FFFEFD 100%)",
							}}
						>
							<Link href="/stickerbook">
								<div className="flex items-center bg-green text-warm-white w-fit h-[44px] gap-[6px] px-[20px] rounded-full">
									<img
										src="/sites/blue/icons/stickerbook.svg"
										alt="Sticker Book"
										className="w-[26px] h-[25px]"
									/>
									<p className="font-medium text-base">Sticker Book</p>
								</div>
							</Link>
						</div>
					</motion.div>
				</main>
			)}

			{/* Inline CSS for Sticky Header */}
			<style jsx>{`
				.sticky-header {
					position: -webkit-sticky; /* For Safari */
					position: sticky;
					top: 0;
					z-index: 1000; /* Ensure the header is above other content */
					background-color: #ffffff; /* Optional, to prevent content from showing behind */
					box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); /* Optional, to add shadow */
				}
				}
			`}</style>
		</main>
	);
}
