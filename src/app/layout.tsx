import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { TutorialProvider } from "@/app/context/TutorialContext";

const dmSans = DM_Sans({
	display: "swap",
	variable: "--font-dm-sans",
	subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Into the Blue",
  description: "Built by Penn Spark",
  icons: {
    icon: "/sites/blue/images/favicon.webp"
  }
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
