/**
 * Tailwind CSS Configuration — Lumina Hospitality
 * Warm Luxury Design System
 */

module.exports = {
  content: [
    './pages/**/*.{html,js}',
    './css/**/*.css',
    './js/**/*.js',
    './index.html',
  ],
  theme: {
    extend: {
      colors: {
        // ── Primary: Deep Teal ──
        primary: {
          DEFAULT: '#004d61',
          50:  '#e6f2f5',
          100: '#cce5eb',
          200: '#99cbd6',
          300: '#66b0c1',
          400: '#3396ac',
          500: '#007a8a',
          600: '#00626e',
          700: '#004d61',
          800: '#003a4a',
          900: '#002734',
          950: '#001520',
        },
        // ── Accent: Champagne Gold ──
        accent: {
          DEFAULT: '#c5a059',
          50:  '#faf6ee',
          100: '#f5edd6',
          200: '#ebdbad',
          300: '#e1c984',
          400: '#d4b475',
          500: '#c5a059',
          600: '#a8843f',
          700: '#8a6a2e',
          800: '#6d5422',
          900: '#4f3c17',
          950: '#35250e',
        },
        // ── Background & Surfaces ──
        background: '#fcfbf7',
        surface: {
          DEFAULT: '#ffffff',
          warm:    '#faf8f3',
          cream:   '#f5f0e6',
          muted:   '#eee9de',
        },
        // ── Text ──
        charcoal: {
          DEFAULT: '#1a1a1a',
          light:  '#3d3d3d',
          muted:  '#6b6b6b',
          faint:  '#999999',
        },
        // ── Footer dark ──
        footer: {
          DEFAULT: '#1a1d24',
          light:  '#252930',
          muted:  '#2f343c',
        },
        // ── Semantic ──
        success: '#2d8a56',
        warning: '#c5a059',
        error:   '#c0463a',
        info:    '#006683',
      },
      borderRadius: {
        'sm':  '0.25rem',
        DEFAULT: '0.375rem',
        'lg':  '0.5rem',
        'xl':  '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        'full':'9999px',
      },
      spacing: {
        'gutter': '1.5rem',
        'container-margin': '2rem',
        'xs': '0.25rem',
        'sm': '0.5rem',
        'md': '1rem',
        'lg': '1.5rem',
        'xl': '2rem',
        '2xl': '3rem',
        '3xl': '4rem',
        '4xl': '6rem',
        '5xl': '8rem',
      },
      fontFamily: {
        sans:  ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
        body:  ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['Playfair Display', 'Georgia', 'serif'],
      },
      fontSize: {
        'display': ['4.5rem',   { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
        'h1':      ['3rem',     { lineHeight: '1.15', letterSpacing: '-0.01em', fontWeight: '700' }],
        'h2':      ['2.25rem',  { lineHeight: '1.25', letterSpacing: '0',       fontWeight: '600' }],
        'h3':      ['1.5rem',   { lineHeight: '1.35', letterSpacing: '0',       fontWeight: '600' }],
        'h4':      ['1.25rem',  { lineHeight: '1.4',  letterSpacing: '0',       fontWeight: '500' }],
        'body-lg': ['1.125rem', { lineHeight: '1.65' }],
        'body':    ['1rem',     { lineHeight: '1.7' }],
        'body-sm': ['0.875rem', { lineHeight: '1.6' }],
        'label':   ['0.75rem',  { lineHeight: '1.5', letterSpacing: '0.08em', fontWeight: '600', textTransform: 'uppercase' }],
        'button':  ['0.875rem', { lineHeight: '1',   letterSpacing: '0.04em', fontWeight: '600' }],
        'caption': ['0.75rem',  { lineHeight: '1.5', letterSpacing: '0.02em' }],
      },
      boxShadow: {
        'warm':    '0 2px 16px rgba(0, 77, 97, 0.06)',
        'warm-md': '0 4px 24px rgba(0, 77, 97, 0.08)',
        'warm-lg': '0 8px 40px rgba(0, 77, 97, 0.10)',
        'warm-xl': '0 16px 64px rgba(0, 77, 97, 0.12)',
        'gold':    '0 4px 20px rgba(197, 160, 89, 0.15)',
        'soft':    '0 1px 3px rgba(0, 0, 0, 0.06)',
        'card':    '0 2px 12px rgba(0, 0, 0, 0.04)',
        'card-hover': '0 8px 30px rgba(0, 77, 97, 0.10)',
        'nav':     '0 1px 8px rgba(0, 0, 0, 0.04)',
        'nav-scrolled': '0 2px 20px rgba(0, 0, 0, 0.08)',
      },
      maxWidth: {
        '7xl': '80rem',
        '6xl': '72rem',
      },
      height: {
        '707': '707px',
        '500': '500px',
      },
      backgroundImage: {
        'gradient-warm': 'linear-gradient(135deg, rgba(0,77,97,0.03) 0%, rgba(197,160,89,0.05) 100%)',
        'gradient-gold-fade': 'linear-gradient(to right, rgba(197,160,89,0.3) 0%, transparent 100%)',
        'hero-gradient': 'linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0) 35%, rgba(0,0,0,0) 55%, rgba(0,77,97,0.6) 100%)',
      },
      transitionTimingFunction: {
        'luxury': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      transitionDuration: {
        '400': '400ms',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
  darkMode: 'class',
};
