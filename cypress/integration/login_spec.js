var _ = require('lodash');

describe('log in', () => {
  it('should log in', () => {
    // For some reason we need to call this first otherwise the seed command times out ???
    cy.exec('node --version', {
      log: true
    }).then((result) => {
      cy.log('node version', result.stdout);
    });

    cy.resetState();

    cy.visit('http://localhost:3000');

    cy.get('#containersLoginEmail')
      .invoke('val', 'chris.bishop@ht2labs.com');

    cy.get('#containersLoginPassword')
      .invoke('val', 'password0');

    cy.get('form button')
      .click();

    cy.location('pathname').should('include', 'home');

    cy.contains('Test organisation').click();

    cy.location('pathname').should('include', 'organisation');
  });

  it.only('should allready be loged in', () => {

    cy.exec('node --version', {
      log: true
    }).then((result) => {
      cy.log('node version', result.stdout);
    });

    cy.resetState();

    cy.exec('node cli/dist/server seed getToken', {
      env: {
        RUNTIME_NODE_ENV: 'test'
      }
    }).then((result) => {
      const data = JSON.parse(result.stdout);
      var organisationId = data.organisationId;
      var userId = data.userId;

      // cy.log('000', userId);

      return {
        cookies: data.cookies,
        organisationId,
        userId
      };
    }).then(function ({
      cookies,
      organisationId
    }) {
      // cy.log(cy.setCookie('key', 'value'));

      return (Cypress.Promise.all(_.map(cookies, function (value, key) {
        cy.log('001', key, value);
        return cy.setCookie(key, value);
      })).then((res) => {
        cy.log('000', res);
        return { organisationId };
      }));

      // return cy.setCookie('test6', 'test7').then(function () {
      //   return { organisationId };
      // });
    }).then((args, b, c) => {
      cy.log('args', args);
      cy.log('b', b);
      cy.log('c', c);
      // cy.visit(`http://localhost:3000/organisation/${userId}`);
    });
  });
});
