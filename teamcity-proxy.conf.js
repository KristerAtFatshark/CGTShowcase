const fs = require('fs');
const path = require('path');

function loadLocalJson(fileName) {
  const filePath = path.join(__dirname, fileName);
  if (!fs.existsSync(filePath)) {
    return null;
  }

  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

const teamCityAuth = loadLocalJson('teamcity-auth.json');

module.exports = {
  '/teamcity-api': {
    target: teamCityAuth?.teamCityBase ?? 'http://teamcity.i.fatshark.se:8111',
    secure: false,
    changeOrigin: true,
    pathRewrite: {
      '^/teamcity-api': '',
    },
    headers: teamCityAuth?.teamCityBearerToken
      ? {
          Authorization: `Bearer ${teamCityAuth.teamCityBearerToken}`,
        }
      : {},
  },
};
