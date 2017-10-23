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

  it('should allready be loged in', () => {
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

  it('should create admin which creates organisation', () => {
    cy.exec('node --version').then((result) => {
      cy.log('node version', result.stdout);
    });

    cy.resetState();

    cy.beLoggedIn().then((args) => {
      const { organisationId } = args;
      cy.visit(`/organisation/${organisationId}/settings/users`);

      // CREATE USER
      cy.contains('Invite').click();
      cy.get('.modal-dialog input').first().invoke('val', 'test@test.com');

      cy.contains('Send invite').click();

      cy.get('input[placeholder=Password]').type('password1');
      cy.get('input[placeholder="Confirm Password"]').type('password1');

      cy.contains('Set Password').first().click();

      cy.contains('Admin').click();

      cy.contains('.save-bar', 'SAVING').should('be.visible');
      cy.contains('.save-bar', 'SAVED').should('be.visible');

      // LOGOUT

      cy.get('.ion-log-out').click();

      cy.location('pathname').should('include', 'login');

      // LOGIN as new user

      cy.get('#containersLoginEmail')
        .invoke('val', 'test@test.com');

      cy.get('#containersLoginPassword')
        .invoke('val', 'password1');

      cy.get('form button')
        .click();

      cy.location('pathname').should('include', 'home');

      cy.contains('Test organisation').click();

      cy.location('pathname').should('include', 'organisation');

      // GOTO organisation
      cy.contains('.nav a', 'Settings').click();

      cy.contains('.nav', 'Organisations').click();

      // Create new organisation.

      cy.contains('.btn', 'Add new');

      cy.get('.panel.panel-default > div').eq(1).should('be.visible');
    });
  });
});
