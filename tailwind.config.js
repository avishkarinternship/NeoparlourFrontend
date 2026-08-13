/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Outfit"', 'sans-serif'],
        outfit: ['"Outfit"', 'sans-serif'],
        poppins: ['"Outfit"', 'sans-serif'],
      },
      fontWeight: {
        normal: '300',
        medium: '400',
        semibold: '500',
        bold: '600',
        extrabold: '700',
        black: '800',
      },
    },
  },
  plugins: [],
}