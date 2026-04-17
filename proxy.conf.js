const fs = require('fs');
const path = require('path');

function loadLocalJson(fileName) {
  const filePath = path.join(__dirname, fileName);
  if (!fs.existsSync(filePath)) {
    return null;
  }

  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

const jiraAuth = loadLocalJson('jira-auth.json');
const teamCityAuth = loadLocalJson('teamcity-auth.json');

const jiraBase = jiraAuth?.jiraBase ?? process.env.JIRA_BASE ?? 'https://fatshark.atlassian.net';
const jiraEmail = jiraAuth?.jiraEmail ?? process.env.JIRA_EMAIL;
const jiraToken = jiraAuth?.jiraToken ?? process.env.JIRA_TOKEN;
const jiraAuthorization =
  jiraEmail && jiraToken ? Buffer.from(`${jiraEmail}:${jiraToken}`).toString('base64') : null;

module.exports = {
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
