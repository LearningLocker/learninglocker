describe.only('log in', () => {
  it('should log in', () => {
    cy.log('001.1');

    // cy.exec('node --version');

    cy.log('001.2');

    cy.exec('RUNTIME_NODE_ENV=test node cli/dist/server seed reset', {
      // env: {
      //   RUNTIME_NODE_ENV: 'test'
      // },
      log: true
    });

    cy.log('002');
    cy.visit('http://localhost:3000');

    cy.get('#containersLoginEmail')
      .invoke('val', 'chris.bishop@ht2labs.com');

    cy.get('#containersLoginPassword')
      .invoke('val', 'password0');

    cy.get('form button')
      .click();

    cy.location('pathname').should('include', 'home');

  });
});
