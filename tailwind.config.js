/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        luxury: {
          50: '#f7f7f8',
          100: '#e9e9ec',
          200: '#d4d4db',
          300: '#b5b5c0',
          400: '#8e8e9d',
          500: '#737382',
          600: '#5f5f6b',
          700: '#4f4f58',
          800: '#43434a',
          900: '#3b3b40',
          950: '#27272a',
        },
        gold: {
          50: '#fbf7ed',
          100: '#f5ecd1',
          200: '#ebd6a0',
          300: '#e0bc68',
          400: '#d6a23d',
          500: '#cb8a24',
          600: '#b8711d',
          700: '#96571b',
          800: '#7c461d',
          900: '#673b1c',
          950: '#391e0e',
        },
        diamond: {
          50: '#f4f6fb',
          100: '#e9edf7',
          200: '#d8e0f1',
          300: '#bbc9e7',
          400: '#9aaddb',
          500: '#7e91d1',
          600: '#6674c4',
          700: '#5861b3',
          800: '#4b5293',
          900: '#404676',
          950: '#292c47',
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
};