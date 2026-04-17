const fs = require('fs');
const http = require('http');
const path = require('path');
const { URL } = require('url');

const LOCAL_APP_API_PORT = 4210;

function loadLocalJson(fileName) {
  const filePath = path.join(__dirname, fileName);
  if (!fs.existsSync(filePath)) {
    return null;
  }

  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function readDistributedLatestMainFile(filePath) {
  if (!filePath) {
    throw new Error('Missing distributed latest main path');
  }

  return fs.readFileSync(filePath, 'utf8');
}

function ensureLocalAppApiServer() {
  if (global.__cgtLocalAppApiServerStarted) {
    return;
  }

  const server = http.createServer((req, res) => {
    const parsedUrl = new URL(req.url, `http://${req.headers.host || '127.0.0.1'}`);

    if (parsedUrl.pathname !== '/distributed-latest-main') {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not found' }));
      return;
    }

    try {
      const contents = readDistributedLatestMainFile(parsedUrl.searchParams.get('path'));
      res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(contents);
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          error: 'Failed to read distributed latest main file',
          message: error.message,
        }),
      );
    }
  });

  server.listen(LOCAL_APP_API_PORT, '127.0.0.1');
  global.__cgtLocalAppApiServerStarted = true;
}

ensureLocalAppApiServer();

const jiraAuth = loadLocalJson('jira-auth.json');
const teamCityAuth = loadLocalJson('teamcity-auth.json');

const jiraBase = jiraAuth?.jiraBase ?? process.env.JIRA_BASE ?? 'https://fatshark.atlassian.net';
const jiraEmail = jiraAuth?.jiraEmail ?? process.env.JIRA_EMAIL;
const jiraToken = jiraAuth?.jiraToken ?? process.env.JIRA_TOKEN;
const jiraAuthorization =
  jiraEmail && jiraToken ? Buffer.from(`${jiraEmail}:${jiraToken}`).toString('base64') : null;

module.exports = {
  '/app-api': {
    target: `http://127.0.0.1:${LOCAL_APP_API_PORT}`,
    secure: false,
    changeOrigin: true,
    pathRewrite: {
      '^/app-api': '',
    },
  },
  '/jira-api': {
    target: `${jiraBase}/rest/api/3`,
    secure: true,
    changeOrigin: true,
    pathRewrite: {
      '^/jira-api': '',
    },
    headers: jiraAuthorization
      ? {
          Authorization: `Basic ${jiraAuthorization}`,
        }
      : {},
  },
  '/teamcity-api': {
    target:
      teamCityAuth?.teamCityBase ??
      process.env.TEAMCITY_BASE ??
      'http://teamcity.i.fatshark.se:8111',
    secure: false,
    changeOrigin: true,
    pathRewrite: {
      '^/teamcity-api': '',
    },
    headers:
      (teamCityAuth?.teamCityBearerToken ?? process.env.TEAMCITY_BEARER_TOKEN)
        ? {
            Authorization: `Bearer ${teamCityAuth?.teamCityBearerToken ?? process.env.TEAMCITY_BEARER_TOKEN}`,
          }
        : {},
  },
};
