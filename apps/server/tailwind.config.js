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
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'reelist-gradient':
          'radial-gradient(50% 50% at 50% 50%, rgba(21, 30, 1, 0.25) 0%, rgba(0, 0, 0, 0.45) 100%',
      },
      colors: {
        'text-red-400': 'rgb(254, 83, 101)',
        'reelist-red': '#FE5365',
        'transparent-dark': 'rgba(0, 0, 0, 0.49)',
        'reelist-gray': 'rgb(19, 19, 19)',
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
