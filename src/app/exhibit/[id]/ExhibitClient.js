"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import anime from "animejs";

// The main exhibit page component.
export default function ExhibitClient({ exhibit, id }) {
	/**
	 * State to handle whether we are showing the "intro sequence"
	 * or the actual artifact list. Initially `false` = show intro.
	 */
	const [showArtifacts, setShowArtifacts] = useState(false);

	/**
	 * On mount, run our anime.js timeline to animate
	 * the intro elements in sequence.
	 */
	useEffect(() => {
		if (showArtifacts) return; // If we've already transitioned, skip

		// Create an anime timeline for sequential animations
		const tl = anime.timeline({
			easing: "easeOutQuad",
			duration: 600,
		});

		// Fade/slide in the top ornament
		tl.add({
			targets: ".intro-symbol",
			opacity: [0, 1],
			translateY: [-20, 0],
		})
			.add(
				{
					targets: ".up-arrow",
					opacity: [0, 1],
				},
				"-=600"
			)
			// Slide down the up arrow
			.add(
				{
					targets: ".up-arrow",
					translateY: [0, 130],
				},
				"+=100" // small delay
			)
			// Fade/slide in the heading
			.add(
				{
					targets: ".intro-heading",
					opacity: [0, 1],
					translateY: [20, 0],
				},
				"-=600"
			)
			// Fade/slide in the description text
			.add(
				{
					targets: ".intro-description",
					opacity: [0, 1],
					translateY: [20, 0],
				},
				"+=200"
			)
			// Slide up the ornament & header
			.add(
				{
					targets: ".intro-symbol",
					translateY: [0, -60],
				},
				"-=600"
			)
			.add(
				{
					targets: ".intro-heading",
					translateY: [0, -60],
				},
				"-=600"
			)
			// Fade/slide in the "Enter" button
			.add(
				{
					targets: ".intro-enter",
					opacity: [0, 1],
					translateY: [20, 0],
				},
				"+=200"
			);
	}, [showArtifacts]);

	// Render the intro screen or the artifact list
	return (
		<main className="min-h-screen relative">
			{!showArtifacts ? (
				// Intro Sequence View
				<div className="w-screen h-screen relative bg-white [background:linear-gradient(180deg,#FFF5DD_0%,#3E65C8_100%)]">
					{/* Centered Content */}
					<div className="h-full flex flex-col items-center justify-center">
						{/* Ornament / Symbol */}
						<div className="intro-symbol opacity-0 flex flex-col items-center justify-center gap-4">
							<img src="/exhibit-intro-assets/ornament.svg" alt="Ornament" />
							<img src="/exhibit-intro-assets/down-arrow.svg" alt="Down" />
							<img
								className="up-arrow"
								src="/exhibit-intro-assets/up-arrow.svg"
								alt="Up"
							/>
						</div>

						{/* Heading */}
						<div className="intro-heading opacity-0">
							<h1 className="text-[40px] text-green font-semibold text-center">
								{exhibit.name.toUpperCase()}
							</h1>
							<h2 className="font-bold text-[#333d3780] text-2xl text-center">
								Gallery
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
								onClick={() => setShowArtifacts(true)}
							>
								Enter &rarr;
							</button>
						</div>
					</div>
				</div>
			) : (
				<main className="w-screen h-screen relative bg-warm-white overflow-auto">
					<div className="w-screen h-screen bg-[url(/images/Paper Texture.jpg)]">
						{/* Top bar */}
						<div className="flex items-center justify-between pt-4 px-2 mb-4">
							{/* Home button*/}
							<Link
								className="p-[15px] bg-warm-gray rounded-[8px] transition-all ease-in duration-300 hover:bg-[#f2dbb5]"
								href="/"
							>
								<img
									src="/icons/home.svg"
									alt="Home"
									className="w-[15px] h-[15px] cursor-pointer"
								/>
							</Link>

							{/* Exhibit Title & Found Count */}
							<div className="artifacts-header text-center">
								<p className="text-heading1 font-heading1 text-black p-0">
									{exhibit.name.toUpperCase()}
								</p>
								<p className="text-body font-body1 text-gray-2">
									{exhibit.foundObjects}/{exhibit.totalObjects} Objects Found
								</p>
							</div>

							{/* Right side placeholder to balance layout */}
							<div className="w-[45px] h-[45px]" />
						</div>

						{/* Artifact Tiles*/}
						<div className="w-[90%] mx-auto flex flex-row gap-4 justify-center pb-4">
							<div className="w-full mx-auto flex flex-col gap-4 items-center">
								{exhibit.items
									.filter((artifact, index) => index % 2 == 0)
									.map((artifact) => (
										<Link
											key={artifact.id}
											className={`relative flex flex-col items-center w-full p-4 rounded-md cursor-pointer
              ${artifact.userFound ? "bg-blue-2" : "bg-blue-3"}`}
											href={`/exhibit/${id}/${artifact.id}`}
										>
											<img
												src={
													artifact.userFound
														? `/images/${id}/${artifact.id}-found.png`
														: `/images/${id}/${artifact.id}-unfound.png`
												}
												alt={artifact.name}
												className="w-30 h-auto object-contain"
											/>

											<p className="mt-2 text-body font-body1 text-black text-center">
												{artifact.name}
											</p>

											{/* "Found" sticker overlay if artifact is found */}
											{artifact.userFound && (
												<img
													src="/icons/found.svg"
													alt="Found"
													className="absolute top-[30%] w-21"
												/>
											)}
										</Link>
									))}
							</div>
							<div className="w-full mx-auto flex flex-col gap-4 items-center">
								{exhibit.items
									.filter((artifact, index) => index % 2 == 1)
									.map((artifact) => (
										<Link
											key={artifact.id}
											className={`relative flex flex-col items-center w-full p-4 rounded-md cursor-pointer
              ${artifact.userFound ? "bg-blue-2" : "bg-blue-3"}`}
											href={`/exhibit/${id}/${artifact.id}`}
										>
											<img
												src={
													artifact.userFound
														? `/images/${id}/${artifact.id}-found.png`
														: `/images/${id}/${artifact.id}-unfound.png`
												}
												alt={artifact.name}
												className="w-30 h-auto object-contain"
											/>

											<p className="mt-2 text-body font-body1 text-black text-center">
												{artifact.name}
											</p>

											{/* "Found" sticker overlay if artifact is found */}
											{artifact.userFound && (
												<img
													src="/icons/found.svg"
													alt="Found"
													className="absolute top-[30%] w-21"
												/>
											)}
										</Link>
									))}
							</div>
						</div>

						{/* Bottom "Stickerbook" button */}
						<div className="fixed bottom-0 w-full px-5 py-3 flex justify-between z-40"
							style={{
							background:
								"linear-gradient(to bottom, rgba(254,252,247,0) 0%, rgba(255,254,253,0.85) 40.5%, #FFFEFD 100%)",
							}}
						>
							<Link href="/stickerboard">
							<div className="flex items-center bg-green text-warm-white w-fit h-[44px] gap-[6px] px-[20px] rounded-full">
								<img src="/icons/stickerbook.svg" alt="Sticker Book" className="w-[26px] h-[25px]" />
								<p className="font-medium text-base">Sticker Book</p>
							</div>
							</Link>
						</div>
					</div>
				</main>
			)}
		</main>
	);
}
