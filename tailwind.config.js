/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        gray01: "#4b5563",
        blue01: "#03294b",
        red01: " #F80000",
      },
    },
  },
  plugins: [],
};
