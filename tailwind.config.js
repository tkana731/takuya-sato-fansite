/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#0078d4',
        'primary-dark': '#005a9e',
        'primary-light': '#e6f2ff',
        'secondary': '#f0f3f7',
        'accent': '#e4157e',
        'dark': '#333333',
        'light': '#ffffff',
        'gray': '#e2e8f0',
        'gray-dark': '#64748b',
        'stu48-footer': '#0a2e55',
        'stu48-background': '#aed4f3',
        'event': '#ff8a00',
        'stage': '#8a2be2',
        'broadcast': '#00b050',
      },
    },
  },
  plugins: [],
}