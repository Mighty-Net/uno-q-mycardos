import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    proxy: {
      '/stream': {
        target: 'http://127.0.0.1:58081',
        changeOrigin: true,
      },
      '/api/vision': {
        target: 'http://127.0.0.1:18081',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/vision/, ''),
      },
    },
  }
})
