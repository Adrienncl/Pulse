const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 5173;
const DIST_DIR = path.join(__dirname, 'frontend', 'dist');
const DELIVERABLES_DIR = path.join(__dirname, 'frontend', 'public', 'deliverables');
const API_HOST = 'localhost';
const API_PORT = 8000;

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url);
  const pathname = parsedUrl.pathname;

  // Proxy API requests to FastAPI backend
  if (pathname.startsWith('/api')) {
    const options = {
      hostname: API_HOST,
      port: API_PORT,
      path: req.url,
      method: req.method,
      headers: req.headers,
    };

    const proxyReq = http.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res, { end: true });
    });

    proxyReq.on('error', (err) => {
      console.error('Proxy error:', err);
      res.writeHead(500);
      res.end('Proxy error');
    });

    req.pipe(proxyReq, { end: true });
    return;
  }

  // Serve deliverables
  if (pathname.startsWith('/deliverables/')) {
    const deliverablePath = path.join(DELIVERABLES_DIR, pathname.replace('/deliverables/', ''));
    
    // Security: prevent directory traversal
    if (!deliverablePath.startsWith(DELIVERABLES_DIR)) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }
    
    const ext = path.extname(deliverablePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    
    fs.readFile(deliverablePath, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end('Not found');
        return;
      }
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    });
    return;
  }

  // Serve generated projects (composer, delivery, invoice output)
  if (pathname.startsWith('/projects/')) {
    const projectPath = path.join(__dirname, 'frontend', 'public', pathname);
    // Security: prevent directory traversal
    const publicDir = path.resolve(__dirname, 'frontend', 'public');
    if (!projectPath.startsWith(publicDir)) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }
    const ext = path.extname(projectPath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    fs.readFile(projectPath, (err, data) => {
      if (err) {
        // Fall back to SPA for project paths that don't exist
        fs.readFile(path.join(DIST_DIR, 'index.html'), (err2, data2) => {
          if (err2) { res.writeHead(500); res.end('Server error'); return; }
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(data2);
        });
        return;
      }
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    });
    return;
  }

  // Serve static files
  let filePath = path.join(DIST_DIR, pathname === '/' ? 'index.html' : pathname);
  
  // Security: prevent directory traversal
  if (!filePath.startsWith(DIST_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      // If file not found, serve index.html (SPA fallback)
      if (err.code === 'ENOENT') {
        fs.readFile(path.join(DIST_DIR, 'index.html'), (err2, data2) => {
          if (err2) {
            res.writeHead(500);
            res.end('Server error');
            return;
          }
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(data2);
        });
        return;
      }
      res.writeHead(500);
      res.end('Server error');
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
  console.log(`API proxy: /api -> http://${API_HOST}:${API_PORT}`);
});