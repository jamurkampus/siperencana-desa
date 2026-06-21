/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  "#f0f7ff",
          100: "#e0effe",
          200: "#bae0fd",
          300: "#7dc9fb",
          400: "#38aef6",
          500: "#0e93e7",
          600: "#0275c5",
          700: "#035da0",
          800: "#074f84",
          900: "#0c426d",
          950: "#082a48",
        },
        emerald: {
          50:  "#ecfdf5",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
        },
        amber:  { 500: "#f59e0b", 600: "#d97706" },
        rose:   { 500: "#f43f5e", 600: "#e11d48" },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      borderRadius: {
        DEFAULT: "0.5rem",
      },
    },
  },
  plugins: [],
};
