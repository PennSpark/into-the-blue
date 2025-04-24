"use client";

import React, { useState, useEffect } from "react";
import { Artifact } from "@/app/types";
import Camera from "./components/Camera";
import CapturedInterface from "./components/CapturedInterface";
import {
	loadImageByName,
	loadCollectedArtifacts,
} from "@/app/context/IndexedDB";
import { motion } from "framer-motion";

export default function CameraClient({ artifact }: { artifact: Artifact }) {
	const [capturedImage, setCapturedImage] = useState<string | null>(null);
	const [artifactFound, setArtifactFound] = useState(false);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function init() {
			const collected = await loadCollectedArtifacts();
			setArtifactFound(collected.includes(artifact.id));
			await handleImageCaptured();
			setLoading(false);
		}
		init();
	}, []);

	const handleImageCaptured = async () => {
		const image = await loadImageByName(artifact.id);
		if (image) {
			setCapturedImage(image);
		} else {
			console.log("Image not found in IndexedDB");
		}
	};

	if (loading) return null;

	return (
		<>
			{artifactFound ? (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.6, ease: "easeOut" }}
				>
					<CapturedInterface
						image={capturedImage}
						artifact={artifact}
						returning={true}
					/>
				</motion.div>
			) : capturedImage ? (
				<CapturedInterface
					image={capturedImage}
					artifact={artifact}
					returning={false}
				/>
			) : (
				<Camera artifact={artifact} onImageCaptured={handleImageCaptured} />
			)}
		</>
	);
}
