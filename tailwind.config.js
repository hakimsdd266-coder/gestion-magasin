/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: '#0a0a0a',
        // Theme B — Monochrome Graphite. We override Tailwind's built-in
        // "violet" scale (used everywhere for text/borders/badges) so the
        // whole app repaints without touching every page: 50-300 become a
        // neutral graphite text scale, 400 becomes the single emerald accent.
        violet: {
          50: '#f5f5f4',
          100: '#e7e7e5',
          200: '#d4d4d1',
          300: '#9c9c99',
          400: '#34d399',
          500: '#10b981',
        },
        primary: {
          from: '#10b981',
          to: '#059669',
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
        // Restrained glows — same one-per-category system as before, just
        // toned down (lower opacity/spread) to fit a calmer, minimal mood
        'glow-violet': '0 0 16px -6px rgba(16,185,129,0.35)',
        'glow-fuchsia': '0 0 16px -6px rgba(16,185,129,0.3)',
        'glow-emerald': '0 0 16px -6px rgba(52,211,153,0.35)',
        'glow-amber': '0 0 16px -6px rgba(251,191,36,0.3)',
        'glow-sky': '0 0 16px -6px rgba(56,189,248,0.3)',
        'glow-pink': '0 0 16px -6px rgba(244,114,182,0.3)',
        'glow-rose': '0 0 16px -6px rgba(251,113,133,0.3)',
      },
    },
  },
  plugins: [],
}
