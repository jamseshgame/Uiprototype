import { defineConfig, type Plugin } from 'vite'
import path from 'path'
import fs from 'fs'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

function figmaAssetResolver(): Plugin {
  return {
    name: 'figma-asset-resolver',
    resolveId(source) {
      if (source.startsWith('figma:asset/')) {
        const filename = source.replace('figma:asset/', '')
        // Support WebP converted assets: try .webp first, then original
        const webpFilename = filename.replace(/\.png$/, '.webp')
        const webpPath = path.resolve(__dirname, 'src/assets', webpFilename)
        const originalPath = path.resolve(__dirname, 'src/assets', filename)
        if (fs.existsSync(webpPath)) {
          return webpPath
        }
        return originalPath
      }
    },
  }
}

export default defineConfig({
  plugins: [
    figmaAssetResolver(),
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'es2020',
    cssMinify: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          motion: ['motion'],
        }
      }
    }
  }
})
