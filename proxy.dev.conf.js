const jiraProxy = require('./proxy.conf.json');
const teamCityProxy = require('./teamcity-proxy.conf.js');

module.exports = {
  ...jiraProxy,
  ...teamCityProxy,
};
