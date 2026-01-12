/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'luxury-black': '#1a1a1a',
        'luxury-gold': '#d4af37',
        'soft-gray': '#f5f5f5',
      },
      fontFamily: {
        // Add font families here later if needed, e.g. 'lux': ['Cinzel', 'serif']
        sans: ['Inter', 'sans-serif'], 
      }
    },
  },
  plugins: [],
}
