/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        maha: {
          navy: '#0A2540',
          darkBlue: '#0d3257',
          kesari: '#D84315',
          saffron: '#E65100',
          lightBg: '#F8F9FA',
          border: '#E2E8F0',
          gold: '#C59B27',
          verified: '#2E7D32',
          warning: '#ED6C02',
          danger: '#D32F2F',
        }
      }
    },
  },
  plugins: [],
}


