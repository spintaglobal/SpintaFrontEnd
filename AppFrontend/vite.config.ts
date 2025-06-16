import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx']
  },
  build: {
    sourcemap: true,
    // Optimize for production
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
        }
      }
    },
    // Ensure CSS is properly processed
    cssCodeSplit: true,
    target: 'es2015'
  },
  css: {
    postcss: './postcss.config.cjs' // Explicitly point to postcss.config.cjs
  },
  server: {
    port: 3000,
    host: true, // Allow external connections
    hmr: {
      overlay: true,
      port: 3000
    },
    // Use default file watching behavior
    watch: {
      usePolling: false,
    },
    headers: {
      // Less aggressive caching - still fresh but doesn't break Vite
      'Cache-Control': 'no-store',
    }
  },
  // Moderate optimizations that don't break development
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'] // Pre-bundle these for faster startup
  },
  // Clear cache on restart
  cacheDir: 'node_modules/.vite-fresh-cache',
  // Force module replacement
  define: {
    __DEV_SESSION_ID__: `"${Date.now()}"` // Unique session identifier
  }
}) 