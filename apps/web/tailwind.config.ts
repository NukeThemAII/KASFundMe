import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        kaspa: {
          50: "#eafffc",
          100: "#c9fff8",
          200: "#92fff0",
          300: "#5dfbe4",
          400: "#2ff0d6",
          500: "#14d8c0",
          600: "#0aa89a",
          700: "#0c867d",
          800: "#106963",
          900: "#0f524f",
          950: "#073832",
        },
        "kaspa-blue": {
          50: "#eaf6ff",
          100: "#cde9ff",
          200: "#9ed3ff",
          300: "#6fbaff",
          400: "#3a98ff",
          500: "#147aff",
          600: "#045de0",
          700: "#0247b0",
          800: "#043b8c",
          900: "#0b316e",
          950: "#071f45",
        },
        "kaspa-night": "#0a1324",
      },
      backgroundImage: {
        "kaspa-grid":
          "radial-gradient(circle at 25px 25px, rgba(20, 241, 217, 0.15) 0, rgba(20, 241, 217, 0.15) 2px, transparent 3px)",
      },
      boxShadow: {
        glow: "0 0 25px 0 rgba(20, 241, 217, 0.45)",
      },
    },
  },
  plugins: [],
};

export default config;
