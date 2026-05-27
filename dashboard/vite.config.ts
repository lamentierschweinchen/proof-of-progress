import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import fs from 'fs'

export default defineConfig({
  base: '/proof-of-progress/',
  plugins: [
    react(),
    tailwindcss(),
    // Dev-server: serve ../digests/ at /digests/ and ../data/ at /data/
    {
      name: 'serve-local-assets',
      configureServer(server) {
        server.middlewares.use('/digests', (req, res, next) => {
          const filePath = path.resolve(__dirname, '..', 'digests', req.url!.replace(/^\//, ''))
          if (fs.existsSync(filePath)) {
            res.setHeader('Content-Type', 'text/markdown; charset=utf-8')
            fs.createReadStream(filePath).pipe(res)
          } else {
            next()
          }
        })
        server.middlewares.use('/data', (req, res, next) => {
          const filePath = path.resolve(__dirname, '..', 'data', req.url!.replace(/^\//, ''))
          if (fs.existsSync(filePath)) {
            res.setHeader('Content-Type', 'application/json')
            fs.createReadStream(filePath).pipe(res)
          } else {
            next()
          }
        })
        server.middlewares.use('/digest-manifest.json', (_req, res) => {
          const digestsDir = path.resolve(__dirname, '..', 'digests')
          const files = fs.readdirSync(digestsDir).filter(f => /^\d{4}-\d{2}-\d{2}\.md$/.test(f)).sort().reverse()
          const manifest = files.map(f => ({ date: f.replace('.md', ''), file: f }))
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(manifest))
        })
      },
    },
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
