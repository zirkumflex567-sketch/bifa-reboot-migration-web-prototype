#!/usr/bin/env node
/**
 * Production static file server for BIFA Web Prototype
 * Serves the built files from the dist/ directory
 */

import { createServer as createHttpServer } from 'http'
import { readFile, stat } from 'fs/promises'
import { join, extname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

const PORT = process.env.PORT || 80
const DIST_DIR = join(__dirname, 'dist')

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'font/otf'
}

const server = createHttpServer(async (req, res) => {
  try {
    // Normalize URL path
    let urlPath = req.url?.split('?')[0] || '/'

    // Prevent directory traversal
    if (urlPath.includes('..')) {
      res.writeHead(400)
      res.end('Bad request')
      return
    }

    // Resolve file path
    const filePath = join(DIST_DIR, urlPath === '/' ? 'index.html' : urlPath)

    // Try to read file
    const stats = await stat(filePath)

    if (stats.isFile()) {
      const ext = extname(filePath)
      const contentType = MIME_TYPES[ext] || 'application/octet-stream'

      const content = await readFile(filePath)
      res.writeHead(200, {
        'Content-Type': contentType,
        'Content-Length': content.length,
        'Cache-Control': 'public, max-age=31536000, immutable'
      })
      res.end(content)
    } else if (stats.isDirectory()) {
      // If it's a directory, try index.html inside it
      const indexPath = join(filePath, 'index.html')
      try {
        const content = await readFile(indexPath)
        res.writeHead(200, {
          'Content-Type': 'text/html; charset=utf-8',
          'Content-Length': content.length
        })
        res.end(content)
      } catch {
        res.writeHead(404)
        res.end('Not found')
      }
    } else {
      // SPA fallback: serve index.html for client-side routing
      // Only fallback for HTML requests (not assets)
      if (extname(urlPath) === '' || extname(urlPath) === '.html') {
        const indexContent = await readFile(join(DIST_DIR, 'index.html'))
        res.writeHead(200, {
          'Content-Type': 'text/html; charset=utf-8',
          'Content-Length': indexContent.length
        })
        res.end(indexContent)
      } else {
        res.writeHead(404)
        res.end('Not found')
      }
    }
  } catch (err) {
    if (err.code === 'ENOENT') {
      // File not found - try SPA fallback for HTML routes
      if (extname(req.url || '') === '' || extname(req.url || '') === '.html') {
        try {
          const indexContent = await readFile(join(DIST_DIR, 'index.html'))
          res.writeHead(200, {
            'Content-Type': 'text/html; charset=utf-8',
            'Content-Length': indexContent.length
          })
          res.end(indexContent)
        } catch {
          res.writeHead(404)
          res.end('Not found')
        }
      } else {
        res.writeHead(404)
        res.end('Not found')
      }
    } else {
      console.error('Server error:', err)
      res.writeHead(500)
      res.end('Internal server error')
    }
  }
})

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 BIFA Web Prototype server running at http://0.0.0.0:${PORT}/`)
  console.log(`   Serving files from: ${DIST_DIR}`)
})
