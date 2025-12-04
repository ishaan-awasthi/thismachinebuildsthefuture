/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'base-bg': '#0A0A0A',
        'base-text': '#E8E8E8',
        'secondary-text': '#808080',
        'cyan': '#00F0FF',
        'border': '#1A1A1A',
        'input-bg': '#0F0F0F',
      },
      fontFamily: {
        'mono': ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-in',
        'slide-up': 'slideUp 0.3s ease-out',
        'type': 'type 0.03s steps(1)',
        'glitch': 'glitch 0.1s',
        'scale-flash': 'scaleFlash 0.3s',
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
          '25%': { transform: 'translateX(-3px)', textShadow: '2px 0 #00F0FF, -2px 0 #ff0000' },
          '75%': { transform: 'translateX(3px)', textShadow: '-2px 0 #00F0FF, 2px 0 #ff0000' },
        },
        scaleFlash: {
          '0%, 100%': { transform: 'scale(1)', color: 'inherit' },
          '50%': { transform: 'scale(1.1)', color: '#00F0FF' },
        },
      },
    },
  },
  plugins: [],
}

