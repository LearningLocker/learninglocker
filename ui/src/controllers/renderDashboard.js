import React from 'react';
import logger from 'lib/logger';
import { find } from 'lodash';
import Html from 'ui/components/Html';
import { renderToString } from 'react-dom/server';
import { createDashboardJWT } from 'api/auth/jwt';
import * as sharingScopes from 'lib/constants/sharingScopes';
import { isMatch } from 'micromatch';
import parseUrl from 'url-parse';
import { decodeLoginTokenAction, setActiveTokenAction } from 'ui/redux/modules/auth';
import LLApiClient from 'ui/utils/LLApiClient';
import createStore from 'ui/redux/create';
import router from 'lib/routes';
import Dashboard from 'lib/models/dashboard';
import clientAssets from '../public/assets.json';

const renderHtml = req => (store) => {
  const data = {};
  data.protocol = req.protocol;
  data.scripts = [
    clientAssets.vendor.js,
    clientAssets.client.js,
  ];
  data.state = store.getState();
  return renderToString(<Html {...data} />);
};

export default (req, res) => {
  const llClient = new LLApiClient(req);
  const store = createStore(llClient, router);
  const renderHtmlWithReq = renderHtml(req);

  global.navigator = { userAgent: req.headers['user-agent'] };
  const dashboardId = req.params.dashboardId;
  const shareableId = req.params.shareableId;

  Dashboard.findById(dashboardId).then((dashboard) => {
    if (dashboard === null) throw new Error('Dashboard not found');

    let shareableDashboard;
    if (shareableId) {
      shareableDashboard = find(dashboard.shareable, share =>
        share._id.toString() === shareableId
      );
    } else if (dashboard.shareable.length > 0) {
      shareableDashboard = dashboard.shareable[0];
    } else {
      throw new Error('This dashboard has not been shared');
    }

    const dashboardWithShareable = dashboard;

    // spreading doesn't work as it's a mongoose object
    dashboardWithShareable.filter = shareableDashboard.filter;
    dashboardWithShareable.title = shareableDashboard.title;
    dashboardWithShareable.visibility = shareableDashboard.visibility;
    dashboardWithShareable.validDomains = shareableDashboard.validDomains;

    return dashboardWithShareable;
  })
  .then(dashboard => createDashboardJWT(dashboard, shareableId, 'native')
    .then((token) => {
      store.dispatch(decodeLoginTokenAction(token));
      store.dispatch(setActiveTokenAction('dashboard', String(dashboard._id)));

      switch (dashboard.visibility) {
        case sharingScopes.VALID_DOMAINS: {
          const parsedUrl = parseUrl(req.get('Referer'));
          const invalidReferer = !isMatch(parsedUrl.hostname, dashboard.validDomains);
          if (invalidReferer) {
            const parsedSiteUrl = parseUrl(process.env.SITE_URL);
            const siteIsntReferer = !isMatch(parsedUrl.hostname, parsedSiteUrl.hostname);
            if (siteIsntReferer) {
              return res.status(404).send('Dashboard can only be embedded within valid domains, or opened directly from Learning Locker');
            }
          }
          res.set('X-Frame-Options', `ALLOW-FROM ${parsedUrl.origin}`);
          return res.send(`<!doctype html>\n${renderHtmlWithReq(store)}`);
        }
        case sharingScopes.ANYWHERE:
          res.set('X-Frame-Options', null);
          return res.send(`<!doctype html>\n${renderHtmlWithReq(store)}`);
        case sharingScopes.NOWHERE:
        default:
          return res.status(403).send('Not authorized');
      }
    })
  )
  .catch((err) => {
    logger.error('Error in request', JSON.stringify(err));
    res.status(404).send('Dashboard not found');
  });
};
