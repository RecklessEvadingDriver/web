/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        dark: {
          DEFAULT: '#0d0d0f',
          100: '#141418',
          200: '#1a1a20',
          300: '#222229',
        },
        accent: {
          DEFAULT: '#e50914',
          blue: '#1e90ff',
          purple: '#7c3aed',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
