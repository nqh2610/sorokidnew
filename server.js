const { createServer } = require('https');
const { createServer: createHttpServer } = require('http');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');
const path = require('path');

// 🚀 STARTUP TIME TRACKING
const startTime = Date.now();

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || '0.0.0.0';
const port = parseInt(process.env.PORT, 10) || 3000;
const httpsPort = parseInt(process.env.HTTPS_PORT, 10) || 443;

// 🔧 SHARED HOST OPTIMIZATION - ƯU TIÊN ỔN ĐỊNH
const REQUEST_TIMEOUT = 60000; // 60s timeout (đủ cho các API nặng)
const KEEP_ALIVE_TIMEOUT = 65000; // 65s (longer than ALB's 60s)
const HEADERS_TIMEOUT = 66000; // Slightly longer than keepAliveTimeout
const MAX_HEADER_SIZE = 16384; // 16KB (đủ cho JWT tokens)

// 🏷️ Process title for easier identification in top/htop
process.title = 'sorokid-server';

// Cross-platform path handling
const isWindows = process.platform === 'win32';
const defaultSslBasePath = isWindows 
  ? path.join(process.cwd(), 'ssl') 
  : '/home/nhsortag/ssl/sorokids';

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// 🔧 Graceful shutdown handler
let isShuttingDown = false;
const connections = new Set();

function gracefulShutdown(signal) {
  if (isShuttingDown) return;
  isShuttingDown = true;
  
  console.log(`\n> [${new Date().toISOString()}] Received ${signal}. Graceful shutdown...`);
  
  // Stop accepting new connections
  if (global.httpServer) {
    global.httpServer.close(() => {
      console.log('> HTTP server closed');
    });
  }
  if (global.httpsServer) {
    global.httpsServer.close(() => {
      console.log('> HTTPS server closed');
    });
  }
  
  // Close existing connections gracefully
  let closedCount = 0;
  connections.forEach(conn => {
    conn.end();
    closedCount++;
    setTimeout(() => conn.destroy(), 5000);
  });
  console.log(`> Closing ${closedCount} active connections...`);
  
  // Force exit after 10s
  setTimeout(() => {
    console.log('> Force exit after timeout');
    process.exit(0);
  }, 10000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// 🛡️ Prevent crashes from uncaught errors - CHỈ LOG, KHÔNG CRASH
process.on('uncaughtException', (err) => {
  console.error(`> [${new Date().toISOString()}] Uncaught Exception:`, err.message);
  console.error(err.stack);
  // KHÔNG shutdown - để server tiếp tục chạy
  // Chỉ crash nếu lỗi quá nghiêm trọng
});

process.on('unhandledRejection', (reason, promise) => {
  console.error(`> [${new Date().toISOString()}] Unhandled Rejection:`, reason);
  // KHÔNG crash - chỉ log để debug sau
});

// 🔧 Memory monitoring for shared host (3GB RAM)
function logMemoryUsage() {
  const used = process.memoryUsage();
  const heapUsedMB = Math.round(used.heapUsed / 1024 / 1024);
  const rssMB = Math.round(used.rss / 1024 / 1024);
  const uptimeMin = Math.round(process.uptime() / 60);
  
  // Log in production for monitoring
  if (!dev) {
    console.log(`> [Memory] RSS=${rssMB}MB, Heap=${heapUsedMB}MB, Uptime=${uptimeMin}min, Connections=${connections.size}`);
  }
  
  // Chỉ cảnh báo, KHÔNG tự động restart
  if (rssMB > 600) { 
    console.warn(`> ⚠️ HIGH MEMORY: RSS=${rssMB}MB - Xem xét restart khi rảnh`);
  }
}

// Log memory every 5 minutes in production
if (!dev) {
  setInterval(logMemoryUsage, 5 * 60 * 1000);
}

// 🔧 Configure server with optimizations
function configureServer(server) {
  server.keepAliveTimeout = KEEP_ALIVE_TIMEOUT;
  server.headersTimeout = HEADERS_TIMEOUT;
  server.maxHeaderSize = MAX_HEADER_SIZE;
  server.timeout = REQUEST_TIMEOUT;
  
  // Track connections for graceful shutdown
  server.on('connection', (conn) => {
    connections.add(conn);
    conn.on('close', () => connections.delete(conn));
  });
  
  return server;
}

// 🔧 MIME types for static files
const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
};

// 🔧 Serve static files from public folder (hot update without rebuild)
function serveStaticFile(req, res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';
  
  fs.readFile(filePath, (err, data) => {
    if (err) {
      return false; // File not found, let Next.js handle it
    }
    
    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
    });
    res.end(data);
    return true;
  });
  
  return true; // Async, we're handling it
}

// 🔧 Request handler with timeout
async function handleRequest(req, res) {
  // Skip if shutting down
  if (isShuttingDown) {
    res.writeHead(503, { 
      'Retry-After': '5',
      'Content-Type': 'text/plain'
    });
    res.end('Service Unavailable - Server restarting');
    return;
  }
  
  // 🏥 Health check endpoint (for monitoring)
  if (req.url === '/api/health' || req.url === '/_health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      status: 'ok', 
      uptime: Math.round(process.uptime()),
      memory: Math.round(process.memoryUsage().rss / 1024 / 1024),
      connections: connections.size
    }));
    return;
  }
  
  // 🖼️ Serve OG images and other static files directly (hot update without rebuild)
  const staticFiles = ['/og-image.png', '/og-image.svg', '/fb-avatar.svg', '/fb-banner.svg', '/fb-banner-v2.svg'];
  const parsedUrl = parse(req.url, true);
  
  if (staticFiles.includes(parsedUrl.pathname)) {
    const publicDir = path.join(process.cwd(), 'public');
    const filePath = path.join(publicDir, parsedUrl.pathname);
    
    if (fs.existsSync(filePath)) {
      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      
      try {
        const data = fs.readFileSync(filePath);
        res.writeHead(200, {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=3600', // 1 hour cache for OG images
        });
        res.end(data);
        return;
      } catch (err) {
        // Fall through to Next.js handler
      }
    }
  }
  
  try {
    await handle(req, res, parsedUrl);
  } catch (err) {
    console.error(`> [${new Date().toISOString()}] Request error:`, err.message);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  }
}

app.prepare().then(() => {
  // Check if SSL certificates exist (cross-platform)
  const sslKeyPath = process.env.SSL_KEY_PATH || path.join(defaultSslBasePath, 'private.key');
  const sslCertPath = process.env.SSL_CERT_PATH || path.join(defaultSslBasePath, 'certificate.crt');
  const sslCaPath = process.env.SSL_CA_PATH || path.join(defaultSslBasePath, 'ca_bundle.crt');

  const hasSSL = fs.existsSync(sslKeyPath) && fs.existsSync(sslCertPath);

  if (hasSSL) {
    // HTTPS Server
    const httpsOptions = {
      key: fs.readFileSync(sslKeyPath),
      cert: fs.readFileSync(sslCertPath),
    };

    // Add CA bundle if exists
    if (fs.existsSync(sslCaPath)) {
      httpsOptions.ca = fs.readFileSync(sslCaPath);
    }

    global.httpsServer = configureServer(
      createServer(httpsOptions, handleRequest)
    );
    
    global.httpsServer.listen(httpsPort, hostname, (err) => {
      if (err) throw err;
      const bootTime = Date.now() - startTime;
      console.log(`> HTTPS Server ready on https://${hostname}:${httpsPort}`);
      console.log(`> Boot time: ${bootTime}ms`);
      logMemoryUsage();
    });

    // HTTP redirect to HTTPS
    global.httpServer = configureServer(
      createHttpServer((req, res) => {
        const host = req.headers.host?.replace(/:\d+$/, '') || hostname;
        res.writeHead(301, { Location: `https://${host}${httpsPort !== 443 ? ':' + httpsPort : ''}${req.url}` });
        res.end();
      })
    );
    
    global.httpServer.listen(port, hostname, () => {
      console.log(`> HTTP Server redirecting to HTTPS on port ${port}`);
    });

  } else {
    // HTTP only (for development or when behind reverse proxy like cPanel/Nginx)
    console.log('> SSL certificates not found, starting HTTP server only');
    console.log(`> Looked for: ${sslKeyPath}`);
    
    global.httpServer = configureServer(
      createHttpServer(handleRequest)
    );
    
    global.httpServer.listen(port, hostname, (err) => {
      if (err) throw err;
      const bootTime = Date.now() - startTime;
      console.log(`> HTTP Server ready on http://${hostname}:${port}`);
      console.log(`> Environment: ${dev ? 'development' : 'production'}`);
      console.log(`> Boot time: ${bootTime}ms`);
      console.log(`> Process: ${process.title} (PID: ${process.pid})`);
      logMemoryUsage();
    });
  }
});
