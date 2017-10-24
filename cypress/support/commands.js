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

const _ = require('lodash');
const path = require('path');

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

Cypress.Commands.add('uploadFixture', (
  fixturePath,
  input, // Cypress promise
  {
    type = 'text/csv',
    name
  } = {}
) => {
  input.then(el =>
    cy.fixture(fixturePath).then((content) => {
      name = name || path.basename(fixturePath);

      const contentBlob = new Blob([content], {
        type
      });

      const file = new File([contentBlob], name);

      el[0] = Object.defineProperty(el[0], 'files', {
        configurable: true,
        value: [file]
      });

      return el[0].dispatchEvent(new Event('change', {
        bubbles: true,
        target: {
          files: [file]
        }
      }));
    })
  );
});
