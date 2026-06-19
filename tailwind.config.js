/**
 * Tailwind CSS Configuration — Lumina Hospitality
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
        // Brand shorthand — matches css/lumina-design-system.css CSS variables
        primary: {
          DEFAULT: '#006683',
          50:  '#e8f4f8',
          100: '#d1e9f4',
          200: '#a8d4e9',
          300: '#7bb8dd',
          400: '#4d9cd1',
          500: '#2980b9',
          600: '#1f6391',
          700: '#164a6a',
          800: '#0f3247',
          900: '#081e2b',
          container: '#bde9ff',
          fixed:    '#bde9ff',
          'fixed-dim': '#6fd2f9',
        },
        secondary: {
          DEFAULT: '#4e6778',
          50:  '#fef9e7',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          container: '#d1e5f5',
        },
        // Material Design surface tokens
        background: '#f5fafd',
        surface: {
          DEFAULT: '#f5fafd',
          dim:     '#d5dbe0',
          container: '#dde3e7',
          'container-low': '#e7edf0',
        },
        'on-surface': '#171c1f',
        'on-surface-variant': '#3f484d',
        'on-primary': '#ffffff',
        'on-secondary': '#ffffff',
        'on-background': '#171c1f',
        outline: {
          DEFAULT: '#6f797e',
          variant: '#bfc8cd',
        },
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
      },
      fontFamily: {
        sans:  ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Roboto Slab', 'Georgia', 'serif'],
        body:  ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px rgba(0, 0, 0, 0.08)',
        'glass': '0 8px 32px rgba(0, 102, 131, 0.12)',
      },
      backdropBlur: {
        '3xl': '32px',
      },
      maxWidth: {
        '7xl': '80rem',
        '6xl': '72rem',
      },
      height: {
        '707': '707px',
        '500': '500px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
  corePlugins: {
    preflight: false,
  },
  darkMode: 'class',
};
