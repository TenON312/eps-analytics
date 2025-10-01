/** @type {import('tailwindcss').Types.Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f8fafc',
          500: '#3b82f6', 
          900: '#1e3a8a',
        },
        dark: {
          bg: {
            primary: '#0a0a0a',
            secondary: '#111111',
            card: '#151515',
          },
          text: {
            primary: '#ffffff',
            secondary: '#a0a0a0',
          }
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}