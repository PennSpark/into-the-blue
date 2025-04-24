import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { TutorialProvider } from "@/app/context/TutorialContext";
import TutorialOverlay from "../components/TutorialOverlay";

const dmSans = DM_Sans({
	display: "swap",
	variable: "--font-dm-sans",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Into the Blue",
	description: "Built by Penn Spark",
	icons: {
		icon: "images/favicon.png",
	},
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body className={`${dmSans.variable} antialiased`}>
				<TutorialProvider>
					{/* <TutorialOverlay /> */}
					{children}
				</TutorialProvider>
			</body>
		</html>
	);
}
