import React from 'react';
import logger from 'lib/logger';
import Html from 'ui/components/Html';
import PrettyError from 'pretty-error';
import { renderToString } from 'react-dom/server';
import boolean from 'boolean';
import defaultTo from 'lodash/defaultTo';

// this is the assets manifest for the client build
// it describes the location of all the compiled assets (js, css)
import clientAssets from '../public/assets.json';

const pretty = new PrettyError();

export default async (req, res, next) => {
  try {
    const data = {};
    data.protocol = req.protocol;
    data.scripts = [
      clientAssets.vendor.js,
      clientAssets.client.js,
    ];

    data.state = {
      app: {
        RESTRICT_CREATE_ORGANISATION: boolean(defaultTo(process.env.RESTRICT_CREATE_ORGANISATION, true)),
        ENABLE_STATEMENT_DELETION: boolean(defaultTo(process.env.ENABLE_STATEMENT_DELETION, true))
      }
    };

    const html = renderToString(<Html {...data} />);
    global.navigator = { userAgent: req.headers['user-agent'] };
    res.set('X-XSS-Protection', '1; mode=block');
    res.set('X-Content-Type-Options', 'nosniff');
    res.status(200);
    res.send(`<!doctype html>${html}`);
  } catch (err) {
    logger.error('ROUTER ERROR:', pretty.render(err));
    next(err);
  }
};
