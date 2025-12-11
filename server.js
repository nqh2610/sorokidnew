const { createServer } = require('https');
const { createServer: createHttpServer } = require('http');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');
const path = require('path');

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || '0.0.0.0';
const port = parseInt(process.env.PORT, 10) || 3000;
const httpsPort = parseInt(process.env.HTTPS_PORT, 10) || 443;

// Cross-platform path handling
const isWindows = process.platform === 'win32';
const defaultSslBasePath = isWindows 
  ? path.join(process.cwd(), 'ssl') 
  : '/home/nhsortag/ssl/sorokids';

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

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

    createServer(httpsOptions, async (req, res) => {
      try {
        const parsedUrl = parse(req.url, true);
        await handle(req, res, parsedUrl);
      } catch (err) {
        console.error('Error handling request:', err);
        res.statusCode = 500;
        res.end('Internal Server Error');
      }
    }).listen(httpsPort, hostname, (err) => {
      if (err) throw err;
      console.log(`> HTTPS Server ready on https://${hostname}:${httpsPort}`);
    });

    // HTTP redirect to HTTPS
    createHttpServer((req, res) => {
      const host = req.headers.host?.replace(/:\d+$/, '') || hostname;
      res.writeHead(301, { Location: `https://${host}${httpsPort !== 443 ? ':' + httpsPort : ''}${req.url}` });
      res.end();
    }).listen(port, hostname, () => {
      console.log(`> HTTP Server redirecting to HTTPS on port ${port}`);
    });

  } else {
    // HTTP only (for development or when behind reverse proxy like cPanel/Nginx)
    console.log('> SSL certificates not found, starting HTTP server only');
    console.log(`> Looked for: ${sslKeyPath}`);
    
    createHttpServer(async (req, res) => {
      try {
        const parsedUrl = parse(req.url, true);
        await handle(req, res, parsedUrl);
      } catch (err) {
        console.error('Error handling request:', err);
        res.statusCode = 500;
        res.end('Internal Server Error');
      }
    }).listen(port, hostname, (err) => {
      if (err) throw err;
      console.log(`> HTTP Server ready on http://${hostname}:${port}`);
    });
  }
});
