// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

var _ = require('lodash');

Cypress.Commands.add('resetState', () => {
  return cy.exec('node cli/dist/server seed reset', {
    env: {
      RUNTIME_NODE_ENV: 'test'
    },
    log: true
  });
});

Cypress.Commands.add('beLoggedIn', () => {
  return cy.exec('node cli/dist/server seed getToken', {
    env: {
      RUNTIME_NODE_ENV: 'test'
    }
  }).then(function (result) {
    const data = JSON.parse(result.stdout);
    var organisationId = data.organisationId;
    var userId = data.userId;

    return {
      cookies: data.cookies,
      organisationId,
      userId
    };
  }).then(function (args) {

    const {
      cookies
    } = args;

    return cy.wrap(
      _.map(cookies, function (value, key) {
        return [key, value];
      })
    ).each(function ([key, value]) {
      return cy.setCookie(key, value);
    }).then(function () {
      return args;
    });
  });
});
