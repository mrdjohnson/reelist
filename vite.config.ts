import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import vike from 'vike/plugin'
import tsconfigPaths from 'vite-tsconfig-paths'
import vercel from 'vite-plugin-vercel'

import tailwindcss from '@tailwindcss/vite'

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000

export default defineConfig({
  plugins: [
    vike({
      prerender: true,
    }),
    react(),
    tailwindcss(),
    tsconfigPaths(),
    vercel()
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
    allowedHosts: true,
    host: true,
  },
  preview: {
    port: PORT,
    allowedHosts: true,
    host: true,
  },
})
