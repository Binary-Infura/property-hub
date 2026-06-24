/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2563EB",
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563EB",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
        },
        secondary: "#FDFDFF",
        accent: "#a855f7",
        background: "#FAFAFB",
        surface: "#FFFFFF",
        dark: "#0A0C10",
      },
      borderRadius: {
        "3xl": "24px",
        "4xl": "32px",
        "5xl": "40px",
      },
    },
  },
  plugins: [],
};
