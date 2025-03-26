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
				blue4: "#355DC3",
				blue5: "#D7E3FF",
				"warm-white": "#FFFEFD",
				"warm-gray": "#EFECE4",
				gray1: "#414549",
				gray2: "#686E78",

        "blue-1": "var(--Blue-1)",
        "blue-3": "var(--Blue-3)",
        "blue-5": "var(--Blue-5)",
        "gray-1": "var(--Gray-1)",
			},
			fontSize: {
				body: "1rem",
				heading1: "1.75rem",
				button1: ["16px", {
					lineHeight: "1",
					letterSpacing: "-0.02em",
				  }],
			},
			fontWeight: {
				body1: "600",
				heading1: "700",
				button1: "500",
			},
			fontFamily: {
				'dm-sans': ['"DM Sans"', 'sans-serif'],
			},
		},
	},
	plugins: [],
} satisfies Config;
