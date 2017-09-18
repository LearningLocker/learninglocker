import React from 'react';
import logger from 'lib/logger';
import Html from 'ui/components/Html';
import PrettyError from 'pretty-error';
import { renderToString } from 'react-dom/server';

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

    data.state = {};
    const html = renderToString(<Html {...data} />);
    global.navigator = { userAgent: req.headers['user-agent'] };
    res.status(200);
    res.send(`<!doctype html>${html}`);
  } catch (err) {
    logger.error('ROUTER ERROR:', pretty.render(err));
    next(err);
  }
};
