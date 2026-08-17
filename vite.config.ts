import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Base is absolute-root because the app lives at ane.davidjivan.net (not a subpath).
export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})
