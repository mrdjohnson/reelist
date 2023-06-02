/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './apps/server/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './apps/server/components/**/*.{js,ts,jsx,tsx,mdx}',
    './apps/server/app/**/*.{js,ts,jsx,tsx,mdx}',
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
      },
      colors: {
        'text-red-400': 'rgb(254, 83, 101)',
      },
    },
  },
  plugins: [],
}
