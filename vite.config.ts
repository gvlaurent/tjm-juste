import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Relative asset paths: the built page works at any address, including
  // a sub-path such as https://gvlaurent.github.io/tjm-juste/ (GitHub Pages).
  base: './',
})
