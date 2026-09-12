/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary accent — vivid electric violet, used for active states, focus rings,
        // primary buttons and glow highlights. Gradients (defined as utility classes in
        // globals.css) are reserved for headings and hero-level accents.
        accent: {
          DEFAULT: '#8B5CF6',
          dim: '#7C3AED',
          muted: '#2E1F5E',
          soft: '#A78BFA',
        },
        // Status colors only — never decorative
        signal: {
          red: '#FF5D5D',
          amber: '#FFB454',
          green: '#4ADE80',
        },
        // Near-black neutral scale for backgrounds and surfaces
        ink: {
          950: '#000000',
          900: '#09090B',
          850: '#0F0F12',
          800: '#151518',
          700: '#1C1C21',
          600: '#26262C',
          500: '#38383F',
        },
        // Near-white neutral scale for text
        paper: {
          100: '#FFFFFF',
          300: '#D4D4D8',
          400: '#A1A1AA',
          500: '#71717A',
        },
        // Translucent white borders — the previous build referenced these classes
        // without a definition, so borders were silently invisible; fixed here.
        line: {
          900: 'rgba(255,255,255,0.06)',
          800: 'rgba(255,255,255,0.10)',
          700: 'rgba(255,255,255,0.16)',
          600: 'rgba(255,255,255,0.24)',
        },
        // Legacy aliases kept so any un-migrated class names still resolve sanely
        brand: {
          50: '#f5f3ff', 100: '#ede9fe', 200: '#ddd6fe', 300: '#c4b5fd',
          400: '#a78bfa', 500: '#8b5cf6', 600: '#7c3aed', 700: '#6d28d9',
          800: '#5b21b6', 900: '#4c1d95', 950: '#2e1065',
        },
        cyan: { 400: '#8B5CF6', 500: '#7C3AED', 600: '#6D28D9' },
        dark: {
          950: '#000000', 900: '#09090B', 800: '#151518', 700: '#1C1C21', 600: '#26262C',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      letterSpacing: {
        tightest: '-0.04em',
      },
      boxShadow: {
        'glow-sm': '0 0 16px 0 rgba(139, 92, 246, 0.25)',
        'glow': '0 0 32px 0 rgba(139, 92, 246, 0.30)',
        'glow-lg': '0 0 60px 0 rgba(139, 92, 246, 0.35)',
        'glow-white': '0 0 24px 0 rgba(255, 255, 255, 0.08)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in': 'fade-in 0.5s ease-out forwards',
      },
    },
  },
  plugins: [],
};
