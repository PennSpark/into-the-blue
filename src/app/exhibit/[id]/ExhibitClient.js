"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import anime from "animejs";
import Image from "next/image";
import { get, set } from "idb-keyval";

// The main exhibit page component.
export default function ExhibitClient({ exhibit, id }) {
	/**
	 * State to handle whether we are showing the "intro sequence"
	 * or the actual artifact list. Initially `false` = show intro.
	 */
	const [isLoading, setIsLoading] = useState(true);
	const [showArtifacts, setShowArtifacts] = useState(false);

	const introRef = useRef(null);

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

	useEffect(() => {
		const checkIntro = async () => {
			const seen = await get(`seenIntro-${id}`);
			setShowArtifacts(seen === true);
			setIsLoading(false);
		};
		checkIntro();
	}, [id]);

	// Run intro animation AFTER isLoading is false AND intro is showing
	useEffect(() => {
		if (isLoading || showArtifacts) return;

		const tl = anime.timeline({
			easing: "easeOutQuad",
			duration: 600,
		});

		tl.add({
			targets: ".intro-symbol",
			opacity: [0, 1],
			translateY: [-20, 0],
		})
			.add({ targets: ".up-arrow", opacity: [0, 1] }, "-=600")
			.add({ targets: ".up-arrow", translateY: [0, 130] }, "+=100")
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
	}, [isLoading, showArtifacts]);

	// Render the intro screen or the artifact list
	if (isLoading) return null;
	return (
		<main className="min-h-screen w-full relative overflow-y-auto">
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
							<img src="/exhibit-intro-assets/ornament.svg" alt="Ornament" />
							<img src="/exhibit-intro-assets/down-arrow.svg" alt="Down" />
							<img
								className="up-arrow"
								src="/exhibit-intro-assets/up-arrow.svg"
								alt="Up"
							/>
						</div>

						{/* Heading */}
						<div className="intro-heading font-FibraOneSemi opacity-0">
							<h1 className="text-[40px] text-green text-center">
								{exhibit.name.toUpperCase()}
							</h1>
							<h2 className="font-bold text-[#333d374D] text-2xl text-center">
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
								onClick={handleEnterClick}
							>
								Enter &rarr;
							</button>
						</div>
					</div>
				</div>
			) : (
				<main className="min-h-screen w-full relative bg-warm-white">
					<img src="/images/paper.png" className="w-full h-full absolute z-0" />
					{/* Top bar */}
					<div className="sticky top-0 z-10 shadow-md bg-warm-white left-0 right-0 top-0 flex items-center justify-between py-2 px-2 mb-4">
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
							<p className="text-heading1 font-heading1 font-FibraOneBold text-Black p-0">
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
										{/* <img
									src={artifact.imageURL}
									alt={artifact.name}
									className={
										artifact.userFound
											? "max-h-[220px] max-w-[120px] object-contain"
											: "filter grayscale max-h-[220px] max-w-[120px] object-contain"
									}
								/> */}
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
											blurDataURL="/images/placeholder.png"
											onLoad={(e) =>
												e.currentTarget.classList.remove("opacity-0")
											}
										/>

										<p className="mt-2 text-body font-body1 text-black text-center">
											{artifact.name}
										</p>

										{/* "Found" sticker overlay if artifact is found */}
										{artifact.userFound && (
											<img
												src="/icons/found.svg"
												alt="Found"
												className="absolute m-auto top-0 bottom-0 left-0 right-0 w-21"
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
										{/* <img
									src={artifact.imageURL}
									alt={artifact.name}
									className={
										artifact.userFound
											? "max-h-[220px] max-w-[120px] object-contain opacity-0 transition-opacity duration-300"
											: "filter grayscale max-h-[220px] max-w-[120px] object-contain opacity-0 transition-opacity duration-300"
									}
									onLoad={(e) => e.currentTarget.classList.remove("opacity-0")}
								/> */}
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
											blurDataURL="/images/placeholder.png"
											onLoad={(e) =>
												e.currentTarget.classList.remove("opacity-0")
											}
										/>

										<p className="mt-2 text-body font-body1 text-black text-center">
											{artifact.name}
										</p>

										{/* "Found" sticker overlay if artifact is found */}
										{artifact.userFound && (
											<img
												src="/icons/found.svg"
												alt="Found"
												className="absolute m-auto top-0 bottom-0 left-0 right-0 w-21"
											/>
										)}
									</Link>
								))}
						</div>
					</div>

					{/* Bottom "Stickerbook" button */}
					<div
						className="fixed bottom-0 left-0 right-0 p-4"
						href="/stickerbook"
					>
						<div className="w-full flex justify-start">
							<Link href="/stickerbook">
								<img
									src="/icons/stickerbook-button.svg"
									alt="Stickerbook"
									className="cursor-pointer hover:opacity-75 focus:saturate-150 transition-all ease-in duration-300"
								/>
							</Link>
						</div>
					</div>
				</main>
			)}
		</main>
	);
}
