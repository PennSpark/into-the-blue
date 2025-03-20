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
        "blue-1": "var(--Blue-1)",
        "blue-3": "var(--Blue-3)",
        "blue-5": "var(--Blue-5)",
        "warm-white": "var(--Warm-White)",
        "gray-1": "var(--Gray-1)",
      },
    },
  },
  plugins: [],
} satisfies Config;
