/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bd: {
          bg: '#060912',
          surface: '#0d1425',
          card: '#101b30',
          border: '#1a2540',
          accent: '#3b82f6',
          'accent-dim': '#1d4ed8',
          muted: '#475569',
          text: '#e2e8f0',
          'text-dim': '#94a3b8',
        },
      },
    },
  },
  plugins: [],
}
