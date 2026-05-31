/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#121212',
          surface: '#1E1E1E',
          surfaceHover: '#2A2A2A',
          border: '#333333',
          text: '#F5F5F5',
          muted: '#A3A3A3',
          pill: '#181818', // Very dark for pills/badges
        },
        brand: {
          primary: '#F8F5F2',   // Ivory White
          secondary: '#E7C6D1', // Soft Nude Pink
          text: '#1F1F1F',      // Deep Charcoal
          accent: '#C9A86A',    // Champagne Gold
          pale: '#FBF9F8',      // Very pale primary for softer backgrounds
        },
        primary: '#F8F5F2',
        secondary: '#E7C6D1',
        charcoal: '#1F1F1F',
        accent: '#C9A86A',
        success: '#2B5B3C',
        error: '#8C3131',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
      boxShadow: {
        'soft': '0 10px 40px -10px rgba(0,0,0,0.05)',
        'soft-hover': '0 20px 40px -10px rgba(0,0,0,0.08)',
        'float': '0 30px 60px -15px rgba(0,0,0,0.1)',
      },
      transitionTimingFunction: {
        'luxury': 'cubic-bezier(0.22, 1, 0.36, 1)',
      }
    },
  },
  plugins: [],
}
