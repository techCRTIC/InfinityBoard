/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'tech-bg': '#18181b',
        'tech-panel': '#000000',
        'tech-orange': '#ff4613',
        'tech-orange-dark': '#c53811',
        'tech-teal': '#3bd4ae',
        'tech-text-primary': '#FFFFFF',
        'tech-text-secondary': '#A3A3A3',
      },
      fontFamily: {
        sans: ['Manrope', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '0px',
        'none': '0px',
      },
      boxShadow: {
        'neon-orange': '0 0 5px rgba(255, 70, 19, 0.5), 0 0 20px rgba(255, 70, 19, 0.3)',
      }
    },
  },
  plugins: [],
}
