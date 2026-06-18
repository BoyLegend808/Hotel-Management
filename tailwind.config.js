/**
 * Tailwind CSS Configuration
 * Optimized configuration for production build
 */

module.exports = {
  content: [
    './pages/**/*.{html,js}',
    './css/**/*.css',
    './js/**/*.js',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#032521',
          dark: '#0d3a20',
          light: '#2d7a4a',
        },
        secondary: {
          DEFAULT: '#735c00',
          container: '#fed65b',
        },
        surface: {
          DEFAULT: '#fbf9f8',
          container: '#efeded',
          containerLow: '#f5f3f3',
          containerLowest: '#ffffff',
        },
        on: {
          primary: '#ffffff',
          secondary: '#221b00',
          secondaryContainer: '#221b00',
          surface: '#1b1c1c',
          surfaceVariant: '#414846',
        },
        outline: {
          DEFAULT: '#717976',
          variant: '#c1c8c5',
        },
      },
      borderRadius: {
        DEFAULT: '0.25rem',
        lg: '0.5rem',
        xl: '0.75rem',
        full: '9999px',
      },
      spacing: {
        'container-padding-desktop': '40px',
        'gutter': '24px',
        'section-gap': '80px',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },
      fontSize: {
        'body-md': ['16px', { lineHeight: '1.5', fontWeight: '400' }],
        'display-lg': ['48px', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '600' }],
        'headline-md': ['32px', { lineHeight: '1.3', fontWeight: '600' }],
        'label-md': ['14px', { lineHeight: '1.2', letterSpacing: '0.05em', fontWeight: '600' }],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
  corePlugins: {
    preflight: false, // Disable preflight to avoid conflicts with existing CSS
  },
  important: false,
  darkMode: 'class', // Enable class-based dark mode
};