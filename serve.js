/**
 * CGTShowcase Production Server
 *
 * Serves the built Angular app and proxies Jira and TeamCity API requests.
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
const TEAMCITY_AUTH_CONFIG_PATH = path.join(__dirname, 'teamcity-auth.json');

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

function loadTeamCityAuthConfig() {
  if (fs.existsSync(TEAMCITY_AUTH_CONFIG_PATH)) {
    return JSON.parse(fs.readFileSync(TEAMCITY_AUTH_CONFIG_PATH, 'utf8'));
  }

  return {
    teamCityBase: process.env.TEAMCITY_BASE,
    teamCityBearerToken: process.env.TEAMCITY_BEARER_TOKEN,
  };
}

const teamCityAuthConfig = loadTeamCityAuthConfig();
const TEAMCITY_BASE = teamCityAuthConfig.teamCityBase || 'http://teamcity.i.fatshark.se:8111';
const TEAMCITY_BEARER_TOKEN = teamCityAuthConfig.teamCityBearerToken;

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

function proxyTeamCityRequest(req, res) {
  if (!TEAMCITY_BEARER_TOKEN) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Missing TeamCity credentials' }));
    return;
  }

  const parsedUrl = url.parse(req.url);
  const teamCityPath = parsedUrl.path.replace(/^\/teamcity-api/, '');
  const targetUrl = `${TEAMCITY_BASE}${teamCityPath}`;

  const parsed = url.parse(targetUrl);
  const transport = parsed.protocol === 'https:' ? https : http;
  const options = {
    hostname: parsed.hostname,
    port: parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
    path: parsed.path,
    method: req.method,
    headers: {
      Authorization: `Bearer ${TEAMCITY_BEARER_TOKEN}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  };

  const proxyReq = transport.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, {
      'Content-Type': proxyRes.headers['content-type'] || 'application/json',
      'Access-Control-Allow-Origin': '*',
    });
    proxyRes.pipe(res, { end: true });
  });

  proxyReq.on('error', (err) => {
    console.error('TeamCity proxy error:', err.message);
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

  if (parsedUrl.pathname.startsWith('/teamcity-api')) {
    proxyTeamCityRequest(req, res);
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
  console.log(`TeamCity API proxy: /teamcity-api/* -> ${TEAMCITY_BASE}/*`);
});
