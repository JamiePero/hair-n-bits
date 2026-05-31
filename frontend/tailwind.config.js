/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        sans: ['"DM Sans"', 'sans-serif'],
      },
      colors: {
        brand: {
          black: '#000000',
          'red-dark': '#490101',
          'red-mid': '#7D0909',
          'red-primary': '#B40808',
          'red-bright': '#E62525',
          grey: '#595757',
          white: '#FFFFFF',
          'gold-deep': '#C89116',
          'gold-light': '#F4CD59',
        },
      },
      animation: {
        shimmer: 'shimmer 2s infinite',
        'fade-in': 'fadeIn 0.5s ease forwards',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        fadeIn: {
          from: { opacity: 0, transform: 'translateY(20px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
