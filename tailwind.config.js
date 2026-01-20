/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        gray01: "#4b5563",
        blue01: "#03294b",
        blue02: "#3B82F6",
        red01: " #F80000",
        sbr: "#111827",
        sbr1: "#0F141A",
        lime: "#84CC16",
        violet: "#8B5CF6",
      },
    },
  },
  plugins: [],
};
