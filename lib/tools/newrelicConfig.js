export default ({ appType = null }) => {
  let config = `// NEW RELIC CONFIGURATION FOR ${appType} //\n`;
  config += 'if (process.env.NEW_RELIC_LICENSE_KEY) {\n';
  config += '  const logDir = process.env.LOG_DIR || "logs";\n';
  config += '  process.env.NEW_RELIC_NO_CONFIG_FILE=true;\n';
  switch (appType) {
    case 'UI':
      config += '  process.env.NEW_RELIC_APP_NAME=process.env.NEWRELIC_UI_NAME;\n';
      break;
    case 'API':
      config += '  process.env.NEW_RELIC_APP_NAME=process.env.NEWRELIC_API_NAME;\n';
      break;
    default:
      config += '  process.env.NEW_RELIC_APP_NAME="LL";\n';
      break;
  }
  config += '  process.env.NEW_RELIC_LOG=logDir + "/newrelic-agent.log";\n';
  config += '  process.env.NEW_RELIC_LOG_LEVEL="info";\n';
  config += `  console.log("Starting ${appType} with New Relic app name: " + process.env.NEW_RELIC_APP_NAME);\n`;
  config += '  require("newrelic");\n';
  config += '}\n';
  return config;
};
