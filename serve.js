/**
 * CGTShowcase Production Server
 *
 * Serves the built Angular app and proxies Jira API requests.
 * Usage: node serve.js [port]
 * Default port: 4200
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = parseInt(process.argv[2] || '4200', 10);
const DIST_DIR = path.join(__dirname, 'dist', 'CGTShowcase', 'browser');
const AUTH_CONFIG_PATH = path.join(__dirname, 'jira-auth.json');

function loadJiraAuthConfig() {
  if (fs.existsSync(AUTH_CONFIG_PATH)) {
    return JSON.parse(fs.readFileSync(AUTH_CONFIG_PATH, 'utf8'));
  }

  return {
    jiraBase: process.env.JIRA_BASE,
    jiraEmail: process.env.JIRA_EMAIL,
    jiraToken: process.env.JIRA_TOKEN,
  };
}

const authConfig = loadJiraAuthConfig();
const JIRA_BASE = authConfig.jiraBase || 'https://fatshark.atlassian.net';
const JIRA_EMAIL = authConfig.jiraEmail;
const JIRA_TOKEN = authConfig.jiraToken;
const JIRA_AUTH =
  JIRA_EMAIL && JIRA_TOKEN ? Buffer.from(`${JIRA_EMAIL}:${JIRA_TOKEN}`).toString('base64') : null;

if (!JIRA_AUTH) {
  console.error(
    'Missing Jira credentials. Provide jira-auth.json or set JIRA_EMAIL and JIRA_TOKEN environment variables.',
  );
  process.exit(1);
}

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
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
};

function serveStaticFile(filePath, res) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      // Fallback to index.html for SPA routing
      const indexPath = path.join(DIST_DIR, 'index.html');
      fs.readFile(indexPath, (err2, indexData) => {
        if (err2) {
          res.writeHead(404);
          res.end('Not found');
          return;
        }
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(indexData);
      });
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
}

function proxyJiraRequest(req, res) {
  const parsedUrl = url.parse(req.url);
  const jiraPath = parsedUrl.path.replace(/^\/jira-api/, '');
  const targetUrl = `${JIRA_BASE}/rest/api/3${jiraPath}`;

  const parsed = url.parse(targetUrl);
  const options = {
    hostname: parsed.hostname,
    port: 443,
    path: parsed.path,
    method: req.method,
    headers: {
      Authorization: `Basic ${JIRA_AUTH}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  };

  const proxyReq = https.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, {
      'Content-Type': proxyRes.headers['content-type'] || 'application/json',
      'Access-Control-Allow-Origin': '*',
    });
    proxyRes.pipe(res, { end: true });
  });

  proxyReq.on('error', (err) => {
    console.error('Proxy error:', err.message);
    res.writeHead(502);
    res.end(JSON.stringify({ error: 'Proxy error', message: err.message }));
  });

  req.pipe(proxyReq, { end: true });
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url);

  // Proxy Jira API requests
  if (parsedUrl.pathname.startsWith('/jira-api')) {
    proxyJiraRequest(req, res);
    return;
  }

  // Serve static files
  let filePath = path.join(
    DIST_DIR,
    parsedUrl.pathname === '/' ? 'index.html' : parsedUrl.pathname,
  );
  serveStaticFile(filePath, res);
});

server.listen(PORT, () => {
  console.log(`CGTShowcase server running at http://localhost:${PORT}`);
  console.log(`Serving files from: ${DIST_DIR}`);
  console.log(`Jira API proxy: /jira-api/* -> ${JIRA_BASE}/rest/api/3/*`);
});
