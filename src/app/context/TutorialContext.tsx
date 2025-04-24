"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { getTutorialCompleted, setTutorialCompleted } from "./IndexedDB";

type TutorialContextType = {
	step: number;
	active: boolean;
	next: () => void;
	start: () => void;
	stop: () => void;
};

const TutorialContext = createContext<TutorialContextType | null>(null);

export const TutorialProvider = ({
	children,
}: {
	children: React.ReactNode;
}) => {
	const [step, setStep] = useState(0);
	const [active, setActive] = useState(false);

	useEffect(() => {
		getTutorialCompleted().then((completed) => {
			if (!completed) {
				start();
			}
		});
	}, []);

	const start = () => {
		setActive(true);
		setStep(0);
	};

	const stop = async () => {
		await setTutorialCompleted();
		setActive(false);
	};

	const next = () => {
		setStep((s) => s + 1);
	};

	return (
		<TutorialContext.Provider value={{ step, active, next, start, stop }}>
			{children}
		</TutorialContext.Provider>
	);
};

export const useTutorial = () => {
	const context = useContext(TutorialContext);
	if (!context) throw new Error("Tutorial context not found");
	return context;
};
