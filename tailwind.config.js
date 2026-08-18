/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: '#0b0a14',
        primary: {
          from: '#8b5cf6',
          to: '#e879f9',
        },
        success: '#34d399',
        warning: '#fbbf24',
        danger: '#fb7185',
      },
      fontFamily: {
        display: ['Unbounded', 'sans-serif'],
        sans: ['Plus Jakarta Sans', 'sans-serif'],
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
      boxShadow: {
        // Elevation for cards/panels — replaces flat borders with real depth
        elevated: '0 8px 30px -8px rgba(0,0,0,0.5)',
        'elevated-lg': '0 20px 45px -12px rgba(0,0,0,0.55)',
        // Colored glows for icon badges — one per functional area of the app
        'glow-violet': '0 0 22px -4px rgba(139,92,246,0.55)',
        'glow-fuchsia': '0 0 22px -4px rgba(232,121,249,0.5)',
        'glow-emerald': '0 0 22px -4px rgba(52,211,153,0.5)',
        'glow-amber': '0 0 22px -4px rgba(251,191,36,0.5)',
        'glow-sky': '0 0 22px -4px rgba(56,189,248,0.5)',
        'glow-pink': '0 0 22px -4px rgba(244,114,182,0.5)',
        'glow-rose': '0 0 22px -4px rgba(251,113,133,0.5)',
      },
    },
  },
  plugins: [],
}
