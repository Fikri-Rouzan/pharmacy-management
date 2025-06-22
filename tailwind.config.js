/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4a86c5',
        secondary: '#8ab8f3',
      },
      fontFamily: {
        outfit: ['"Outfit"', 'sans-serif'],
      }
    },
  },
  plugins: [],
}