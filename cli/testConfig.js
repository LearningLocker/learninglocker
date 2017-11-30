require('dotenv/config');
const path = require('path');
const getWebpackConfig = require('../lib/tools/getWebpackConfig');

const isDebug = !process.argv.includes('--release');
const isVerbose = !!process.argv.includes('--verbose');
const stats = !!process.argv.includes('--stats');

const sourceDir = path.resolve(__dirname, 'src');
const outputDir = path.resolve(__dirname, 'dist', 'server');

process.env.MONGODB_PATH = process.env.MONGODB_TEST_PATH;
process.env.API_PORT = process.env.TEST_API_PORT;
process.env.SMTP_PASS = process.env.TEST_SMTP_PASS;
process.env.LOG_MIN_LEVEL = process.env.TEST_LOG_MIN_LEVEL;
process.env.TESTING = true;

const webpackConfig = getWebpackConfig({
  isDebug,
  isVerbose,
  isClient: false,
  sourceDir,
  outputDir,
  stats,
  publicPath: '/',
  entry: {
    server: 'server.js',
  },
});

module.exports = webpackConfig;
