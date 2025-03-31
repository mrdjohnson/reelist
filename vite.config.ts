import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import vercel from 'vite-plugin-vercel'
import vike from 'vike/plugin'
import tsconfigPaths from 'vite-tsconfig-paths'

import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    vike({
      prerender: true,
    }),
    react(),
    vercel(),
    tailwindcss(),
    tsconfigPaths(),
  ],
  resolve: {
    alias: {
      '~/*': './src/*',
      '@reelist/apis/*': './src/libs/apis/src/lib/*',
      '@reelist/interfaces/*': './src/libs/interfaces/src/lib/*',
      '@reelist/models/*': './src/libs/models/src/lib/*',
      '@reelist/utils/*': './src/libs/utils/src/lib/*',
    },
  },
})
