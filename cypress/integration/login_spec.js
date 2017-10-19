describe.only('log in', () => {
  it('should log in', () => {
    cy.log('001.1');

    // For some reason we need to call this first otherwise the seed command times out ???
    cy.exec('node --version', {
      log: true
    }).then((result) => {
      cy.log('node version', result.stdout);
    });


    cy.exec('node cli/dist/server seed reset', {
      env: {
        RUNTIME_NODE_ENV: 'test'
      },
      log: true
    }).then(() => {
      cy.log('seed added succesfully');
    });

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
});
