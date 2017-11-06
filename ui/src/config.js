import boolean from 'boolean';
import defaultTo from 'lodash/defaultTo';

const title = 'Learning Locker';
const description = 'The open source learning record store';

const isProduction = process.env.NODE_ENV === 'production';
const host = process.env.UI_HOST || '127.0.0.1';
const enableFrameguard = boolean(defaultTo(process.env.ENABLE_FRAMEGUARD, true));
const port = parseInt(process.env.UI_PORT, 10);
const devPort = 3131;
const assetPort = isProduction ? port : devPort;

let assetPath = '';
if (!isProduction) {
  assetPath += `//${host}:${assetPort}`;
}
assetPath += '/';

export default {
  host,
  port,
  devPort,
  assetPath,
  apiHost: process.env.API_HOST || '127.0.0.1',
  apiPort: parseInt(process.env.API_PORT, 10),
  enableFrameguard,
  app: {
    title,
    description,
    head: {
      titleTemplate: `${title} %s`,
      meta: [
        { name: 'description', content: description },
        { charset: 'utf-8' },
        { property: 'og:site_name', content: title },
        { property: 'og:locale', content: 'en_GB' },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        { property: 'og:card', content: 'summary' },
        { property: 'og:site', content: '@andrewhickey' },
        { property: 'og:creator', content: '@andrewhickey' },
        { property: 'og:image', content: '' },
        { property: 'og:image:width', content: '200' },
        { property: 'og:image:height', content: '200' }
      ]
    }
  },
  isProduction
};
