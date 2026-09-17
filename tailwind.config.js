// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FF6A00',
        black: '#000000',
        white: '#FFFFFF',
        offWhite: '#F5F5F5',
      },
      fontFamily: {
        sans: ['Space Grotesk', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        sharp: '2px',
        subtle: '4px',
      },
    },
  },
  plugins: [],
};
