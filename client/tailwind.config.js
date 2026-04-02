/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-orange': '#f97316',
        'brand-yellow': '#fde047',
        'brand-light': '#f9fafb',
        'brand-gray': '#f3f4f6',
        'brand-dark': '#111827',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        'premium': '0 10px 30px -5px rgba(0, 0, 0, 0.05), 0 4px 15px -5px rgba(0, 0, 0, 0.03)',
        'premium-hover': '0 20px 40px -5px rgba(0, 0, 0, 0.08), 0 8px 20px -5px rgba(0, 0, 0, 0.04)',
      }
    },
  },
  plugins: [],
}
