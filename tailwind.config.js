/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#1F2422",
        graphite: "#3A4038",
        parchment: "#F7F4EE",
        card: "#FFFFFF",
        ochre: "#C98A2C",
        ochreDark: "#A66F1E",
        moss: "#5C7A5C",
        clay: "#B4573F",
        line: "#E4DFD3",
        muted: "#8B8578",
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
      },
      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "16px",
      },
    },
  },
  plugins: [],
};
