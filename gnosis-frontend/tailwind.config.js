/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        gnosis: {
          green: {
            50:  '#E1F5EE',
            100: '#9FE1CB',
            500: '#1D9E75',
            600: '#0F6E56',
            900: '#085041',
          },
          blue: '#378ADD',
          amber: '#BA7517',
        },
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};
