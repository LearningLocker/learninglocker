import React from 'react';
import logger from 'lib/logger';
import { omit, find, assign } from 'lodash';
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

  console.log('000 renderDashboard', req.params);
  Dashboard.findById(dashboardId).then((dashboard) => {
    console.log('001');
    if (dashboard === null) throw new Error('Dashboard not found');

    const shareableDashboard = find(dashboard.shareable, share =>
      share._id.toString() === shareableId
    );

    // const dashboardWithShareable = {
    //   ...dashboard,
      // ...omit(shareableDashboard, '_id')
    // };

    console.log('001.0', dashboard);
    console.log('001.0.1', JSON.stringify(dashboard, null, 2));
    console.log('001.0.2', shareableDashboard);
    // const dashboardWithShareable = assign(
    //   dashboard,
    //   // omit(shareableDashboard, ['_id', 'prototype'])
    //   { a: 'b' }
    // );

    const dashboardWithShareable = dashboard;

    // spreading doesn't work as it's a mongoose object
    dashboardWithShareable.filter = shareableDashboard.filter;
    dashboardWithShareable.title = shareableDashboard.title;
    dashboardWithShareable.visibility = shareableDashboard.visibility;

    // return dashboard;
    console.log('001.1', dashboardWithShareable);
    return dashboardWithShareable;
    // return dashboard;
  })
  .then(dashboard => createDashboardJWT(dashboard, 'native')
    .then((token) => {
      console.log('002.1', dashboard);
      store.dispatch(decodeLoginTokenAction(token));
      store.dispatch(setActiveTokenAction('dashboard', String(dashboard._id)));

      switch (dashboard.visibility) {
        case sharingScopes.VALID_DOMAINS: {
          const parsedUrl = parseUrl(req.get('Referer'));
          const invalidReferer = !isMatch(parsedUrl.hostname, dashboard.validDomains);
          if (invalidReferer) return res.status(404).send();
          res.set('X-Frame-Options', `ALLOW-FROM ${parsedUrl.origin}`);
          return res.send(`<!doctype html>\n${renderHtmlWithReq(store)}`);
        }
        case sharingScopes.ANYWHERE:
          res.set('X-Frame-Options', null);
          console.log('002.4', renderHtmlWithReq(store));
          return res.send(`<!doctype html>\n${renderHtmlWithReq(store)}`);
        case sharingScopes.NOWHERE:
        default:
          return res.status(403).send('Not authorized');
      }
    })
  )
  .catch((err) => {
    logger.error(err);
    res.status(404).send(err.message);
  });
};
