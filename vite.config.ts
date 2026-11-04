import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { viteSingleFile } from "vite-plugin-singlefile";
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path'
import basicSsl from '@vitejs/plugin-basic-ssl'
import http from 'node:http'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    viteSingleFile(),
    basicSsl(),
  ],
  server: {
    host: '0.0.0.0',
    allowedHosts: ['unoq.local'],
    proxy: {
      '/stream': {
        target: 'http://127.0.0.1:58081',
        changeOrigin: true,
        agent: new http.Agent({
          keepAlive: false,
        }),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, _req, res) => {
            res.on('close', () => {
              if (!res.writableEnded) {
                console.log('[Stream] Browser disconnected')
                proxyReq.destroy()
              }
            })
          })

          proxy.on('error', (err) => {
            console.error('[Stream] Proxy error:', err.message)
          })
        },
      },
      '/api/vision': {
        target: 'http://127.0.0.1:18081',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/vision/, ''),
      },
      '/api/mcu': {
        target: 'http://127.0.0.1:53003',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/mcu(?=\/|$)/, '') || '/',
      },
    },
  },
  base: "./",
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
