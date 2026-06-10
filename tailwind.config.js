/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#1f2933',
        mist: '#f5f1e8',
        sand: '#e6dcc8',
        olive: '#66734d',
        copper: '#9c5b3d',
      },
      boxShadow: {
        card: '0 10px 30px rgba(31, 41, 51, 0.08)',
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', 'Times New Roman', 'serif'],
        sans: ['Segoe UI', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
