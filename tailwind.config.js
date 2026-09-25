/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        iso: {
          navy: {
            DEFAULT: '#0A1E3F',
            50: '#E8ECF3',
            100: '#C9D2E0',
            200: '#9BA9C2',
            300: '#6D80A4',
            400: '#3F5786',
            500: '#233A6B',
            600: '#162954',
            700: '#0D2A5C',
            800: '#0A1E3F',
            900: '#06142B',
          },
          gold: {
            DEFAULT: '#C8A24B',
            50: '#FBF7EC',
            100: '#F5ECD0',
            200: '#EBD9A0',
            300: '#E0C670',
            400: '#D4AF37',
            500: '#C8A24B',
            600: '#A8853D',
            700: '#876830',
            800: '#654B23',
            900: '#443216',
          },
        },
      },
    },
  },
  plugins: [],
};
