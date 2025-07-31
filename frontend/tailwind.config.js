/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', 
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0E577F',
          light: '#1A9CDA',   
          dark: '#0B4B6B'   
        },
      }
    },
  },
  plugins: [],
}