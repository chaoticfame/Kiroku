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
        background: '#0b1120',
        card: '#111827',
        'card-hover': '#1e293b',
        border: '#334155',
        muted: '#94a3b8',
        'accent-blue': '#3b82f6',
        'accent-red': '#ef4444',
        'accent-green': '#22c55e',
        'accent-orange': '#f97316',
        'accent-purple': '#8b5cf6',
        'accent-yellow': '#f59e0b'
      }
    },
  },
  plugins: [],
}
