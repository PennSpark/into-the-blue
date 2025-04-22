"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { FaLightbulb, FaRegLightbulb } from "react-icons/fa"; // Importing icons from react-icons
import { saveImage } from "../../../../context/IndexedDB";
import Webcam from "react-webcam";
import Image from "next/image";
import "./camera.css";
import { Artifact } from "../../../../types";
import { Dialog } from "@headlessui/react"; // Optional: You can use any modal dialog library
import Link from "next/link";

import ImageCutout from "@/utils/ProcessSticker";
import { set } from "idb-keyval";

export interface CameraProps {
	artifact: Artifact;
	onImageCaptured: () => void;
}

// Add video constraints for using rear camera
const videoConstraints = {
	facingMode: "environment",
};

export default function Camera({ artifact, onImageCaptured }: CameraProps) {
	const [imagePath, setImagePath] = useState(
		`/sites/blue/images/artifacts/${artifact.id}.png`
	);

	console.log(imagePath);

	const webcamRef = useRef<Webcam>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
	//need to store svg paths as path2d for clipping and string for svg (i don't like it but we can fix later)
	const [clipPathData, setClipPathData] = useState<Path2D[] | null>(null);
	const [svgPaths, setSvgPaths] = useState<string[] | null>(null);

	const [, setHintActive] = useState(false); // State to toggle the hint active state
	const [dialogOpen, setDialogOpen] = useState(false); // State to manage dialog visibility

	const [shouldProcess, setShouldProcess] = useState(false);

	// Function to toggle hint state
	const toggleHint = () => {
		setHintActive((prev) => !prev); // Toggle the hint button state
		setDialogOpen(true); // Show dialog when the hint is activated
	};

	// Function to close the dialog
	const closeDialog = () => setDialogOpen(false);

	//all svg outlines must have 100x100 coordinate system for simplicity and design freedom in scaling
	const viewBox = { width: 300, height: 360 };

	const [image, setImage] = useState<string | null>(null);

	const [text, setText] = useState<string>("Line up the image to the outline");

	// Set CSS variable for actual viewport height
	useEffect(() => {
		const setVh = () => {
			const vh = window.innerHeight * 0.01;
			document.documentElement.style.setProperty("--vh", `${vh}px`);
		};
		setVh();
		window.addEventListener("resize", setVh);
		return () => window.removeEventListener("resize", setVh);
	}, []);

	useEffect(() => {
		fetch(artifact.svgURL)
			.then((res) => res.text())
			.then((data) => {
				const parser = new DOMParser();
				const svgDoc = parser.parseFromString(data, "image/svg+xml");
				const pathElements = svgDoc.querySelectorAll("path");

				if (pathElements.length > 0) {
					const dStrings = Array.from(pathElements).map(
						(path) => path.getAttribute("d") || ""
					);
					setSvgPaths(dStrings);

					const pathsArray = Array.from(pathElements).map(
						(path) => new Path2D(path.getAttribute("d") || "")
					);
					setClipPathData(pathsArray);
				}
			})
			.catch(console.error);
	}, [artifact.svgURL]);

	const updateCanvasSize = useCallback(() => {
		const svhToPixels = window.innerHeight / 100;
		setCanvasSize({ width: 40 * svhToPixels, height: 60 * svhToPixels });
	}, []);

	useEffect(() => {
		console.log(artifact.imageURL, artifact.svgURL);
	}, [artifact.imageURL, artifact.svgURL]);

	useEffect(() => {
		updateCanvasSize();
		window.addEventListener("resize", updateCanvasSize);
		return () => window.removeEventListener("resize", updateCanvasSize);
	}, [updateCanvasSize]);

	useEffect(() => {
		const processWebcamFeed = () => {
			if (webcamRef.current && canvasRef.current) {
				const video = webcamRef.current.video as HTMLVideoElement;
				const canvas = canvasRef.current;
				const ctx = canvas.getContext("2d");

				if (ctx && video.readyState === 4 && clipPathData) {
					const videoWidth = video.videoWidth;
					const videoHeight = video.videoHeight;
					canvas.width = canvasSize.width;
					canvas.height = canvasSize.height;

					const aspectRatio = videoWidth / videoHeight;
					const newHeight = canvasSize.height;
					const newWidth = newHeight * aspectRatio;

					const dx = (canvasSize.width - newWidth) / 2;
					const dy = 0;

					ctx.clearRect(0, 0, canvas.width, canvas.height);
					ctx.drawImage(video, dx, dy, newWidth, newHeight);
				}

				requestAnimationFrame(processWebcamFeed);
			}
		};

		requestAnimationFrame(processWebcamFeed);
	}, [canvasSize, clipPathData]);

	const captureImage = async () => {
		if (webcamRef.current && canvasRef.current) {
			const video = webcamRef.current.video as HTMLVideoElement;
			const canvas = canvasRef.current;
			const ctx = canvas.getContext("2d");

			if (ctx && video.readyState === 4) {
				//create new canvas for safety + more freedom
				const clipCanvas = document.createElement("canvas");
				clipCanvas.width = 300;
				clipCanvas.height = 360;
				const clipCtx = clipCanvas.getContext("2d");

				if (clipCtx) {
					//ensure there's nothing on canvas yet
					clipCtx.clearRect(0, 0, clipCanvas.width, clipCanvas.height);
					clipCtx.save();

					//scaling factors to put rectangular input into square picture
					const scaleX = clipCanvas.width / viewBox.width;
					const scaleY = clipCanvas.height / viewBox.height;

					console.log("scale");
					console.log(scaleX, scaleY);
					console.log("clipcanvas");
					console.log(clipCanvas.width, clipCanvas.height);
					console.log("viewbox");
					console.log(viewBox.width, viewBox.height);

					//initially move the canvas to position clippath correctly (nothing drawn yet)
					clipCtx.translate(clipCanvas.width / 2, clipCanvas.height / 2);
					clipCtx.scale(scaleX, scaleY);
					clipCtx.translate(-viewBox.width / 2, -viewBox.height / 2);

					//clip, handle multiple images by grouping everything into same region
					if (clipPathData) {
						const region = new Path2D();
						for (const path of clipPathData) {
							region.addPath(path);
						}
						clipCtx.clip(region, "evenodd");
					} else {
						console.error("no clippath");
					}

					//reset transformations before drawing image onto clipped canvas so image isn't distorted
					clipCtx.translate(viewBox.width / 2, viewBox.height / 2);
					clipCtx.scale(1 / scaleX, 360 / (scaleY * 300));
					clipCtx.translate(-clipCanvas.width / 2, -clipCanvas.height / 2);

					//draw the image
					clipCtx.drawImage(canvas, 0, 0, clipCanvas.width, clipCanvas.height);

					clipCtx.restore();
					setImage(clipCanvas.toDataURL("image/png"));
					setText("");
					setImagePath(`/sites/blue/images/artifacts/${artifact.id}.png`);
				} else {
					console.error("canvas not initialized properly");
				}
			}
		}
	};

	const saveClippedImage = () => {
		if (image && image.length > 50) {
			setShouldProcess(true);
		} else {
			console.error("empty captured image");
		}
	};

	const rejectClippedImage = async () => {
		setImage(null);
		setText("Line up the image to the outline");
		setImagePath(`/sites/blue/images/artifacts/${artifact.id}.png`);
	};

	return (
		<div
			className="relative flex flex-col items-center justify-center w-screen h-screen bg-blue-black"
			style={{ height: "calc(var(--vh, 1vh) * 100)" }}
		>
			{/* back*/}

			<div className="absolute top-5 flex flex-row w-[40svh] h-[10svh] justify-between items-center">
				<Link href={`/exhibit/${artifact.exhibitID}`}>
					<img
						src="/sites/blue/icons/left-arrow-blue.svg"
						alt="Back"
						className="cursor-pointer"
					/>
				</Link>

				{/* hint button */}
				<button
					onClick={toggleHint}
					className={`rounded-full p-3 z-10 flex items-center gap-2 border-none ${
						dialogOpen
							? "bg-white text-blue-500"
							: "bg-transparent text-blue-500"
					}`}
					aria-label="Hint"
				>
					{dialogOpen ? (
						<FaLightbulb className="text-[#89aFEF]" />
					) : (
						<FaRegLightbulb className="text-[#89aFEF]" />
					)}
					<span className={dialogOpen ? "text-[#89aFEF]" : "text-[#89aFEF]"}>
						Hint
					</span>
				</button>
			</div>

			{/* Hintbox */}
			{dialogOpen && (
				<Dialog
					open={dialogOpen}
					onClose={closeDialog}
					className="fixed inset-0 z-20 flex justify-center items-center"
				>
					<div className="bg-white rounded-lg p-6 w-80 max-w-xs flex flex-col justify-center items-center">
						<h2 className="text-[#3e65c8] text-lg mb-4 text-center">
							{artifact.hint || "This artifact doesn't have a hint."}
						</h2>
						<button
							onClick={closeDialog}
							className="bg-[#3e65c8] text-white rounded-md px-4 py-2 w-full"
						>
							OK
						</button>
					</div>
				</Dialog>
			)}

			{/* Webcam container with relative positioning */}
			<div className="relative w-[40svh] h-[60svh]">
				<Webcam
					ref={webcamRef}
					videoConstraints={videoConstraints} // <-- Added prop
					className="absolute opacity-0 pointer-events-none"
				/>

				<canvas
					ref={canvasRef}
					style={{ width: "40svh", height: "60svh" }}
					className="absolute rounded-lg shadow-lg"
				/>

				<div className="absolute inset-0 flex justify-center items-center pointer-events-none">
					<svg
						className="w-[40svh] h-auto rounded-md z-[10]"
						width="300"
						height="360"
						viewBox="0 0 300 360"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
						overflow="visible"
					>
						{svgPaths && svgPaths.length > 0 ? (
							svgPaths.map((d, index) => (
								<path
									key={index}
									d={d}
									pathLength={100}
									stroke="white"
									strokeDasharray="0.5 1"
									strokeWidth="0.5svh"
									strokeLinejoin="round"
								/>
							))
						) : (
							<text x="10" y="50" fill="white">
								Loading...
							</text>
						)}
					</svg>
				</div>

				{/* instructions */}
				{!image && (
					<div className="absolute bottom-[4px] left-1/2 transform -translate-x-1/2 w-[95%] z-[10] text-center text-warm-white text-[14px] overflow-hidden px-3 py-2 rounded-[60px] bg-[#393939]/70 backdrop-blur-[7px]">
						<p>{text}</p>
					</div>
				)}
			</div>

			{/* visible before taking picture: white circular button to take picture */}
			{!image && (
				<>
					<div className="absolute bottom-12 flex flex-col gap-4">
						<button
							onClick={captureImage}
							className="bg-gray-2 text-black rounded-full w-[72px] h-[72px] flex items-center justify-center shadow-lg border-none z-[9]"
							aria-label="Take Picture"
						>
							<div className="bg-white text-black rounded-full w-[56px] h-[56px] flex items-center justify-center shadow-lg border-none z-[10]"></div>
						</button>
					</div>

					<div className="absolute inset-0 flex justify-center items-center z-[10] pointer-events-none">
						<Image
							src={"/sites/blue/camera-overlay/" + artifact.id + ".png"}
							alt="Captured"
							className="w-[40svh] h-auto"
							width={500}
							height={500}
						/>
					</div>
				</>
			)}

			{/* visible after taking picture: button to take picture */}
			{image && (
				<>
					{/* Retake Button (Black with white text and outline) */}
					{image && (
						<div className="fixed bottom-0 w-full px-5 py-3 flex justify-between z-40">
							<button
								onClick={rejectClippedImage}
								className="bg-black text-white border-2 border-white px-4 py-2 rounded-full z-[10]"
							>
								Retake
							</button>
							<button
								onClick={saveClippedImage}
								className="bg-[#89aFEF] text-black px-6 py-2 rounded-full z-[10] flex items-center gap-2"
							>
								Confirm
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="w-4 h-4 text-black"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M5 12h14M12 5l7 7-7 7"
									/>
								</svg>
							</button>
						</div>
					)}

					<div
						style={{
							width: `${canvasSize.width}px`,
							height: `${canvasSize.height}px`,
						}}
						className="bg-blue-500 opacity-50 absolute rounded-lg shadow-lg z-[5]"
					/>

					<div className="absolute inset-0 flex justify-center items-center pointer-events-none z-[6]">
						<svg
							className="w-[40svh] h-auto rounded-md stroke-animation"
							width="300"
							height="360"
							viewBox="0 0 300 360"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
							overflow="visible"
						>
							{svgPaths && svgPaths.length > 0 ? (
								svgPaths.map((d, index) => (
									<path
										key={index}
										d={d}
										pathLength={100}
										stroke="white"
										strokeWidth="1.8svh"
										strokeLinejoin="round"
									/>
								))
							) : (
								<text x="10" y="50" fill="white">
									Loading...
								</text>
							)}
						</svg>
					</div>

					<div className="absolute inset-0 flex justify-center items-center z-[10] pointer-events-none">
						<Image
							src={image}
							alt="Captured"
							className="w-[40svh] h-auto"
							width={500}
							height={500}
						/>
					</div>
				</>
			)}

			{shouldProcess && image && (
				<ImageCutout
					imageUrl={image}
					svgUrl={artifact.svgURL}
					onReady={async (processedImage) => {
						await saveImage(processedImage, artifact.id, artifact.exhibitID);
						await set("justFoundArtifactId", artifact.id);
						console.log("processed image saved");
						onImageCaptured();
					}}
				/>
			)}
		</div>
	);
}
