describe('Authentication flow', () => {
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

  it('should already be logged in', () => {
    cy.exec('node --version', {
      log: true
    }).then((result) => {
      cy.log('node version', result.stdout);
    });
    cy.resetState();
    cy.beLoggedIn().then((args) => {
      const { organisationId } = args;
      cy.visit(`http://localhost:3000/organisation/${organisationId}`);
      cy.location('pathname').should('include', 'organisation');
    });
  });

  it('should logout', () => {
    cy.exec('node --version', {

    }).then((result) => {
      cy.log('node version', result.stdout);
    });

    cy.resetState();

    cy.beLoggedIn().then((args) => {
      const { organisationId } = args;

      cy.visit(`/organisation/${organisationId}`);

      cy.location('pathname').should('include', 'organisation');

      cy.get('.ion-log-out').click();

      cy.location('pathname').should('include', 'login');
    });
  });

  it('should log in with google');
});
