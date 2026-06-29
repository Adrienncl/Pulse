import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'pulse-headers',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          // ── Static pages (robots.txt, sitemap, security, manifest, well-known) ──
          if (req.url === '/robots.txt') {
            res.setHeader('Content-Type', 'text/plain')
            res.end(`User-agent: *\nAllow: /\nSitemap: https://pulse.ai/sitemap.xml\n`)
            return
          }
          if (req.url === '/sitemap.xml') {
            res.setHeader('Content-Type', 'application/xml')
            res.end(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://pulse.ai/</loc><changefreq>weekly</changefreq><priority>1.0</priority></url>
  <url><loc>https://pulse.ai/#scan</loc><changefreq>daily</changefreq><priority>0.8</priority></url>
  <url><loc>https://pulse.ai/#results</loc><changefreq>daily</changefreq><priority>0.6</priority></url>
</urlset>`)
            return
          }
          if (req.url === '/.well-known/security.txt') {
            res.setHeader('Content-Type', 'text/plain')
            res.end(`Contact: mailto:security@pulse.ai\nPreferred-Languages: en\n`)
            return
          }
          if (req.url === '/security') {
            res.setHeader('Content-Type', 'text/html')
            res.end(`<!DOCTYPE html><html><head><title>Security — Pulse</title></head><body>
<h1>Security</h1><p>Pulse takes security seriously. Report vulnerabilities to security@pulse.ai</p>
<p>We use HTTPS, CSP, HSTS, and regular security audits.</p></body></html>`)
            return
          }
          if (req.url === '/privacy') {
            res.setHeader('Content-Type', 'text/html')
            res.end(`<!DOCTYPE html><html lang="en"><head>
<title>Privacy Policy — Pulse</title>
<meta name="robots" content="index, follow" />
</head><body style="font-family:sans-serif;max-width:700px;margin:40px auto;padding:20px;color:#333;line-height:1.6">
<h1>Privacy Policy</h1>
<p><em>Last updated: June 2026</em></p>
<h2>Data We Collect</h2>
<p>When you scan a website, Pulse collects the URL and publicly available page data (meta tags, headers, content) for analysis. We do <strong>not</strong> store personal information unless you voluntarily provide it (e.g., email for report delivery).</p>
<h2>Cookies</h2>
<p>We use minimal cookies: a session cookie to maintain your scan state, and a preference cookie for UI settings. No third-party tracking cookies are used.</p>
<h2>Data Sharing</h2>
<p>We do not sell or share your data with third parties. Scan results are processed by Nemotron 3 AI models via Nous Research and are not used for training.</p>
<h2>Contact</h2>
<p>Email: privacy@pulse.ai</p>
</body></html>`)
            return
          }
          if (req.url === '/contact') {
            res.setHeader('Content-Type', 'text/html')
            res.end(`<!DOCTYPE html><html lang="en"><head>
<title>Contact — Pulse</title>
<meta name="robots" content="index, follow" />
</head><body style="font-family:sans-serif;max-width:600px;margin:40px auto;padding:20px;color:#333">
<h1>Contact</h1>
<p>Email: <a href="mailto:hello@pulse.ai">hello@pulse.ai</a></p>
<p>X / Twitter: @pulse_ai</p>
<p>Nous Research — Hermes Agent</p>
</body></html>`)
            return
          }

          // ── Security headers for every response ──
          const headers = {
            'X-Frame-Options': 'DENY',
            'X-Content-Type-Options': 'nosniff',
            'X-XSS-Protection': '1; mode=block',
            'Referrer-Policy': 'strict-origin-when-cross-origin',
            'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
            'Cross-Origin-Embedder-Policy': 'require-corp',
            'Cross-Origin-Opener-Policy': 'same-origin',
            'Cross-Origin-Resource-Policy': 'same-origin',
          }

          // Only add HSTS and CSP to HTML pages (not to JS/CSS/fonts)
          if (req.url === '/' || req.url.startsWith('/?') || req.url.startsWith('/#')) {
            headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains; preload'
            headers['Content-Security-Policy'] = [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: https:",
              "font-src 'self' https://fonts.gstatic.com",
              "connect-src 'self' http://localhost:8000 http://127.0.0.1:8000 ws:",
              "frame-src https://js.stripe.com",
              "frame-ancestors 'none'",
            ].join('; ')
          }

          for (const [key, value] of Object.entries(headers)) {
            res.setHeader(key, value)
          }

          next()
        })
      }
    }
  ],
  server: {
    host: '0.0.0.0',
    port: 5173,
    https: {
      key: fs.readFileSync('./key.pem'),
      cert: fs.readFileSync('./cert.pem'),
    },
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      }
    }
  }
})
