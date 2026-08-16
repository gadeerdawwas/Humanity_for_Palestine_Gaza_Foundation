/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#146C43',
        deep: '#0C4A2E',
        palestine: '#C31F2B',
        gold: '#C69A46',
        paper: '#FAF6EE',
        sand: '#F1E9D8',
        ink: '#221E19',
        footer: '#1B1712',
      },
      fontFamily: {
        arabic: ['Tajawal', 'sans-serif'],
        naskh: ['Noto Naskh Arabic', 'Aref Ruqaa', 'serif'],
        display: ['Fraunces', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
