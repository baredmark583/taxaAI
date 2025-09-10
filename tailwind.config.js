/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./App.tsx",
    "./index.tsx",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./contexts/**/*.{js,ts,jsx,tsx}",
    "./hooks/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'background-dark': 'var(--background-dark)',
        'background-light': 'var(--background-light)',
        'surface': 'var(--surface-color)',
        'brand-border': 'var(--border-color)',
        'primary-accent': 'var(--primary-accent)',
        'gold-accent': 'var(--gold-accent)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'danger': 'var(--danger-color)',
        'warning': 'var(--warning-color)',
        'success': 'var(--success-color)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      gridTemplateColumns: {
        '13': 'repeat(13, minmax(0, 1fr))',
      },
      boxShadow: {
        'glow-primary': '0 0 15px 0px var(--primary-accent)',
        'glow-gold': '0 0 15px 0px var(--gold-accent)',
        'glow-danger': '0 0 15px 0px var(--danger-color)',
        'glow-success': '0 0 15px 0px var(--success-color)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'progress-bar': {
            '0%': { width: '100%' },
            '100%': { width: '0%' },
        },
        'firework': {
          '0%': { transform: 'scale(0.5)', opacity: '1' },
          '100%': { transform: 'scale(1.5)', opacity: '0' },
        },
        'prize-up': {
          '0%': { transform: 'translateY(0) scale(1)', opacity: '1' },
          '100%': { transform: 'translateY(-30px) scale(1.2)', opacity: '0' },
        },
        'fade-in-up': {
            '0%': { opacity: '0', transform: 'translateY(10px)' },
            '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'roulette-wheel-spin': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(var(--final-rotation, 1440deg))' },
        },
        'roulette-ball-spin': {
          '0%': { transform: 'rotate(0deg)', offsetDistance: '0%', offsetPath: 'circle(45%)' },
          '60%': { transform: 'rotate(-1080deg)', offsetDistance: '100%', offsetPath: 'circle(45%)' },
          '100%': { transform: 'rotate(calc(var(--final-rotation, -1440deg) * -1))', offsetDistance: '100%', offsetPath: 'circle(45%)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out forwards',
        'slide-up': 'slide-up 0.5s ease-out forwards',
        'progress-bar': 'progress-bar 5s linear forwards',
        'firework': 'firework 0.7s ease-out forwards',
        'prize-up': 'prize-up 1.5s ease-out forwards',
        'fade-in-up': 'fade-in-up 0.5s ease-out forwards',
        'roulette-wheel-spin': 'roulette-wheel-spin 5s cubic-bezier(0.2, 0.8, 0.7, 1) forwards',
        'roulette-ball-spin': 'roulette-ball-spin 4.5s cubic-bezier(0.5, 0, 0.4, 1) forwards',
      }
    },
  },
  plugins: [],
}