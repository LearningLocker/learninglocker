import 'dotenv/config';
import path from 'path';
import run from '../lib/tools/run';
import bundle from '../lib/tools/bundle';
import getWebpackConfig from '../lib/tools/getWebpackConfig';
import config from './src/config';
import boolean from 'boolean';

const isDebug = !process.argv.includes('--release');
const isVerbose = !!process.argv.includes('--verbose');
const stats = !!process.argv.includes('--stats');

const sourceDir = path.resolve(__dirname, 'src');
const outputDir = path.resolve(__dirname, 'dist', 'public');

const webpackConfig = getWebpackConfig({
  isDebug,
  isVerbose,
  isClient: true,
  sourceDir,
  outputDir,
  stats,
  entry: {
    client: 'client.js',
  },
  copyPaths: [{
    from: path.resolve(sourceDir, 'static'),
    to: path.resolve(outputDir, 'static')
  }],
  clientFreeVariables: {
    __GOOGLE_ENABLED__: boolean(process.env.GOOGLE_ENABLED)
  }
});

/**
 * Uses webpack to compile the API server
 * into a single file executable by node
 */
async function build() {
  await run(bundle, { webpackConfig, devPort: isDebug ? config.devPort : null });
}

export default build();
