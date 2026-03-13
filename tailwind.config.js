/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'base-bg': '#0D0B09',
        'base-text': '#F0EBE3',
        'secondary-text': '#7A7470',
        'accent-red': '#D42B1E',
        'accent-bright': '#FF3D2E',
        'border': '#2A2018',
        'input-bg': '#0F0F0F',
      },
      fontFamily: {
        'mono': ['IBM Plex Mono', 'monospace'],
        'display': ['Bebas Neue', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-in',
        'slide-up': 'slideUp 0.3s ease-out',
        'type': 'type 0.03s steps(1)',
        'glitch': 'glitch 0.1s',
        'scale-flash': 'scaleFlash 0.3s',
        'stamp-in': 'stampIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        type: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        glitch: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-3px)', textShadow: '2px 0 #D42B1E, -2px 0 #ff0000' },
          '75%': { transform: 'translateX(3px)', textShadow: '-2px 0 #D42B1E, 2px 0 #ff0000' },
        },
        scaleFlash: {
          '0%, 100%': { transform: 'scale(1)', color: 'inherit' },
          '50%': { transform: 'scale(1.1)', color: '#D42B1E' },
        },
        stampIn: {
          '0%': { opacity: '0', transform: 'scale(1.15) rotate(-1deg)' },
          '60%': { opacity: '1', transform: 'scale(0.97) rotate(0.5deg)' },
          '100%': { opacity: '1', transform: 'scale(1) rotate(0deg)' },
        },
      },
    },
  },
  plugins: [],
}
