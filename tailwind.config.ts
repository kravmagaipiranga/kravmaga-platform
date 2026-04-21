import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        crimson: {
          DEFAULT: '#C41E3A',
          dark:    '#9B1530',
          light:   '#E02247',
        },
        steel: {
          900: '#0B0B0C',
          800: '#111113',
          700: '#18181B',
          600: '#222226',
          500: '#2E2E34',
          400: '#3F3F47',
          300: '#71717A',
          200: '#A1A1AA',
          100: '#D4D4D8',
        },
      },
      fontFamily: {
        display: ['var(--font-oswald)', 'sans-serif'],
        body:    ['var(--font-barlow)', 'sans-serif'],
      },
      animation: {
        'fade-up':   'fadeUp 0.5s ease forwards',
        'fade-in':   'fadeIn 0.4s ease forwards',
        'pulse-red': 'pulseRed 2s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        pulseRed: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(196,30,58,0)' },
          '50%':      { boxShadow: '0 0 0 6px rgba(196,30,58,0.15)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
