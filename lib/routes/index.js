import {
  requireLogin,
  requireNoLogin,
  requireSiteAdmin,
  requireOrgLogin,
  requireModelViewScope,
} from 'lib/routes/auth';
import { createRouter } from 'router5';

const indexRedirectMiddleware = () => (toState) => {
  if (toState.name === 'organisation') {
    return Promise.reject({ redirect: { name: 'organisation.data', params: toState.params } });
  }
  if (toState.name === 'organisation.data') {
    return Promise.reject({ redirect: { name: 'organisation.data.dashboards', params: toState.params } });
  }
  return true;
};

const routes = [
  // No login
  { name: 'login', path: '/login', canActivate: requireNoLogin },
  { name: 'reset', path: '/reset?email&token' },
  { name: 'forgot', path: '/forgot' },

  // Super Admin
  { name: 'admin', path: '/admin', canActivate: requireSiteAdmin },
  { name: 'admin.users', path: '/users' },
  { name: 'admin.users.id', path: '/:userId' },
  { name: 'admin.organisations', path: '/organisations' },
  { name: 'admin.organisations.id', path: '/:organisationId' },

  // User login
  { name: 'home', path: '/home', canActivate: requireLogin },

  // Organisation login
  { name: 'organisation', path: '/organisation/:organisationId', canActivate: requireOrgLogin },

  { name: 'organisation.data', path: '/data' },
  { name: 'organisation.data.dashboards', path: '/dashboards' },
  { name: 'organisation.data.dashboards.id', path: '/:dashboardId' },
  { name: 'organisation.data.visualise', path: '/visualise' },
  { name: 'organisation.data.source', path: '/source' },
  { name: 'organisation.data.statementForwarding', path: '/statementforwarding' },

  { name: 'organisation.people', path: '/people' },
  { name: 'organisation.people.manage', path: '/manage' },
  { name: 'organisation.people.reconcile', path: '/reconcile' },

  { name: 'organisation.settings', path: '/settings' },
  { name: 'organisation.settings.clients', path: '/clients', canActivate: requireModelViewScope('client') },
  // { name: 'organisation.settings.organisation', path: '/organisation' },
  { name: 'organisation.settings.suborgs', path: '/organisations', canActivate: requireModelViewScope('organisation') },
  { name: 'organisation.settings.stores', path: '/stores', canActivate: requireModelViewScope('store') },
  { name: 'organisation.settings.users', path: '/users', canActivate: requireModelViewScope('user') },
  { name: 'organisation.settings.roles', path: '/roles', canActivate: requireModelViewScope('role') },

  // Embedded dashboards
  { name: 'embedded-dashboard', path: '/dashboards/:dashboardId' }
];

const router = createRouter(
  routes,
  {
    defaultRoute: 'login',
    trailingSlash: true
  }
);
router.useMiddleware(indexRedirectMiddleware);

export default router;
