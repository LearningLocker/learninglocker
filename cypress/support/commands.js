// ***********************************************
// Commands.js allows you to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

const _ = require('lodash');

Cypress.Commands.add('resetState', () =>
  cy.exec('node cli/dist/server seed reset', {
    env: {
      RUNTIME_NODE_ENV: 'test'
    },
    log: true
  })
);

Cypress.Commands.add('beLoggedIn', () =>
  cy.exec('node cli/dist/server seed getToken', {
    env: {
      RUNTIME_NODE_ENV: 'test'
    }
  }).then((result) => {
    const data = JSON.parse(result.stdout);
    const organisationId = data.organisationId;
    const userId = data.userId;

    return {
      cookies: data.cookies,
      organisationId,
      userId
    };
  }).then((args) => {
    const {
      cookies
    } = args;

    return cy.wrap(
      _.map(cookies, (value, key) =>
        [key, value]
      )
    ).each(([key, value]) =>
      cy.setCookie(key, value)
    ).then(() => args);
  })
);
