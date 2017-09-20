require('dotenv/config');
var path = require('path');
var getWebpackConfig = require('../lib/tools/getWebpackConfig');

var isDebug = !process.argv.includes('--release');
var isVerbose = !!process.argv.includes('--verbose');
var stats = !!process.argv.includes('--stats');

var sourceDir = path.resolve(__dirname, 'src');
var outputDir = path.resolve(__dirname, 'dist', 'server');

process.env.MONGODB_PATH = process.env.MONGODB_TEST_PATH;
process.env.API_PORT = process.env.TEST_API_PORT;
process.env.SMTP_PASS = process.env.TEST_SMTP_PASS;
process.env.LOG_MIN_LEVEL = process.env.TEST_LOG_MIN_LEVEL;
process.env.TESTING = true;

var webpackConfig = getWebpackConfig({
  isDebug: isDebug,
  isVerbose: isVerbose,
  isClient: false,
  sourceDir: sourceDir,
  outputDir: outputDir,
  stats: stats,
  publicPath: '/',
  entry: {
    server: 'server.js',
  },
});

module.exports = webpackConfig;
