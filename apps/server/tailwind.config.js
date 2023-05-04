/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./libs/**/*.{js,ts,jsx,tsx,mdx}', './apps/server/**/*.{js,ts,jsx,tsx,mdx}'],
  corePlugins: {
    preflight: false,
  },
  important: '#__next',
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      colors: {
        'text-red-400': 'rgb(254, 83, 101)',
        'reelist-red': '#FE5365',
      },
    },
    screens: {
      'discover-md': '673px',
      // => @media (min-width: 673px) { ... }

      'discover-lg': '1000px',
      // => @media (min-width: 1000px) { ... }
    },
  },
  plugins: [],
}
