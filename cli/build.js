import 'dotenv/config';
import path from 'path';
import { all } from 'bluebird';
import run from '../lib/tools/run';
import bundle from '../lib/tools/bundle';
import getWebpackConfig from '../lib/tools/getWebpackConfig';

const isDebug = !process.argv.includes('--release');
const isVerbose = !!process.argv.includes('--verbose');
const watch = !!process.argv.includes('--watch');
const stats = !!process.argv.includes('--stats');

const sourceDir = path.resolve(__dirname, 'src');
const outputDir = path.resolve(__dirname, 'dist', 'server');

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
  }
});

const schedulerWebpackConfig = getWebpackConfig({
  isDebug,
  isVerbose,
  isClient: false,
  sourceDir,
  outputDir: path.resolve(__dirname, 'dist', 'scheduler'),
  stats,
  publicPath: '/',
  entry: {
    scheduler: 'scheduler.js'
  }
});

/**
 * Uses webpack to compile the API server
 * into a single file executable by node
 */
async function build() {
  await all([
    run(bundle, { webpackConfig, watch }),
    run(bundle, { webpackConfig: schedulerWebpackConfig, watch })
  ]);
}

export default build();
