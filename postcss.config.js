/**
 * PostCSS Configuration
 * Processes CSS with autoprefixer and other optimizations
 */

module.exports = {
  plugins: {
    autoprefixer: {
      overrideBrowserslist: [
        '> 1%',
        'last 2 versions',
        'not dead',
        'not ie <= 11'
      ]
    },
    cssnano: {
      preset: [
        'default',
        {
          discardComments: {
            removeAll: true,
          },
          normalizeWhitespace: false,
        },
      ],
    },
  },
};