const { createGlobPatternsForDependencies } = require('@nx/react/tailwind')
const { join } = require('path')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    join(__dirname, '{src,pages,components,app}/**/*!(*.stories|*.spec).{ts,tsx,html}'),
    ...createGlobPatternsForDependencies(__dirname),
  ],
  corePlugins: {
    preflight: false,
  },
  important: '#__next',
  theme: {
    extend: {
      animation: {
        'slow-scroll': 'swipe 500000ms linear infinite backwards',
      },
      aspectRatio: {
        poster: '2 / 3',
        backdrop: '16 / 9',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'reelist-gradient-green': 'radial-gradient(50% 50% at 50% 50%, #1A200F 0%, #131313 100%)',
        'entity-image-overlay':
          'linear-gradient(180deg, rgba(0, 0, 0, 0.54) 0%, rgba(0, 0, 0, 0) 0.01%, rgba(0, 0, 0, 0.54) 33.85%)',
      },
      colors: {
        'text-red-400': 'rgb(254, 83, 101)',
        'reelist-red': '#FE5365',
        'transparent-dark': 'rgba(0, 0, 0, 0.59)',
        'reelist-gray': 'rgb(19, 19, 19)',
        'reelist-light-gray': '#2C2C2C',
        'reelist-dark': '#141414',
      },
      fontFamily: {
        sans: ['Inter', ...require('tailwindcss/defaultTheme').fontFamily.sans],
      },
      spacing: {
        500: '500px',
        600: '600px',
      },
    },
    screens: {
      'discover-md': '674px',
      // => @media (min-width: 673px) { ... }

      'discover-lg': '1000px',
      // => @media (min-width: 1000px) { ... }
    },
  },
  plugins: [],
}
