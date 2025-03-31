import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import vike from 'vike/plugin'
import tsconfigPaths from 'vite-tsconfig-paths'

import tailwindcss from '@tailwindcss/vite'

const PORT = process.env.NODE_ENV === 'production' ? 10000 : 5555

export default defineConfig({
  plugins: [
    vike({
      prerender: true,
    }),
    react(),
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

  server: {
    port: PORT,
  },
  preview: {
    port: PORT,
  },
})
