"use client";

import { useEffect, useState } from "react";
import { useTutorial } from "@/app/context/TutorialContext";
import { tutorialSteps } from "@/app/tutorial/config";

export default function TutorialOverlay() {
	const { step, active, next, stop } = useTutorial();
	const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

	useEffect(() => {
		if (!active) return;
		const stepData = tutorialSteps[step];
		if (!stepData) return stop();

		const el = document.querySelector("#first-artifact");
		if (el) {
			setTargetRect(el.getBoundingClientRect());
			console.log("element found");
		}
	}, [step, active, stop]);

	if (!active || !targetRect) return null;

	return (
		<div
			className="fixed z-50 p-4 bg-blue-700 text-white rounded-lg shadow-xl max-w-xs cursor-pointer"
			style={{ top: targetRect.bottom + 10, left: targetRect.left }}
			onClick={next}
		>
			Click on this artifact
		</div>
	);
}
