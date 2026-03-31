/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#16A34A',
          hover: '#15803D',
          light: '#DCFCE7',
        },
        secondary: {
          DEFAULT: '#22C55E',
          hover: '#16A34A',
        },
        surface: {
          background: '#F8FAFC',
          card: '#FFFFFF',
          sidebar: '#0F172A',
        },
        content: {
          primary: '#0F172A',
          secondary: '#64748B',
          muted: '#94A3B8',
        },
        status: {
          success: '#22C55E',
          warning: '#F59E0B',
          danger: '#EF4444',
          info: '#3B82F6',
        },
        divider: {
          DEFAULT: '#E2E8F0',
          light: '#F1F5F9',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    }
  },
  plugins: []
};