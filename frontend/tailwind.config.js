/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontSize: {
        'elder-sm': '1.125rem',
        'elder-base': '1.375rem',
        'elder-lg': '1.625rem',
        'elder-xl': '2rem',
        'elder-2xl': '2.5rem',
        'elder-3xl': '3rem',
      },
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        elder: {
          bg: '#FFF8F0',
          card: '#FFFFFF',
          accent: '#E8740C',
          success: '#16A34A',
          danger: '#DC2626',
          warning: '#F59E0B',
          text: '#1A1A1A',
          muted: '#6B7280',
        }
      }
    },
  },
  plugins: [],
}
