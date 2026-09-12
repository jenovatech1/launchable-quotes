import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Set VITE_BASE=/launchable-quotes/ for GitHub Pages project sites.
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE || '/',
})
