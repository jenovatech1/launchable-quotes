import { copyFileSync } from 'node:fs'
import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

/** GitHub Pages serves 404.html for unknown paths — copy index for SPA deep links. */
function spaFallback404(): Plugin {
  return {
    name: 'spa-fallback-404',
    closeBundle() {
      const outDir = resolve(import.meta.dirname, 'dist')
      copyFileSync(resolve(outDir, 'index.html'), resolve(outDir, '404.html'))
    },
  }
}

// Set VITE_BASE=/launchable-quotes/ for GitHub Pages project sites.
export default defineConfig({
  plugins: [react(), spaFallback404()],
  base: process.env.VITE_BASE || '/',
  preview: {
    // Allow Cloudflare quick tunnels / reverse proxies during demos
    allowedHosts: true,
  },
  server: {
    allowedHosts: true,
  },
})
