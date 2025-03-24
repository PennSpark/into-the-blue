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
				"warm-white": "#FFFEFD",
				"warm-gray": "#EFECE4",
				"blue-1": "var(--Blue-1)",
				"blue-2": "var(--Blue-2)",
				"blue-3": "var(--Blue-3)",
				"blue-4": "var(--Blue-4)",
				"blue-5": "var(--Blue-5)",
				"gray-1": "var(--Gray-1)",
				"gray-2": "var(--Gray-2)",
				"gray-3": "var(--Gray-3)",
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
