import type { Config } from "tailwindcss";

export default {
	content: [
		"./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/components/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		extend: {
			colors: {
				background: "var(--background)",
				foreground: "var(--foreground)",
				green: "#333D37",
				blue1: "#3E65C8",
				blue2: "#89AFEF",
				blue3: "#D5DAE7",
				"warm-white": "#FFFEFD",
				"warm-gray": "#EFECE4",
				gray1: "#414549",
				gray2: "#686E78",
			},
			fontSize: {
				body: "1rem",
				heading1: "1.75rem",
			},
			fontWeight: {
				body1: "600",
				heading1: "700",
			},
		},
	},
	plugins: [],
} satisfies Config;
