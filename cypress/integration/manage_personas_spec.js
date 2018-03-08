describe('manage personas', () => {
  // This is skipped as no way to edit identifiers currently.
  it.skip('should be able to add a persona', () => {
    cy.exec('node --version', {
      log: true
    }).then((result) => {
      cy.log('node version', result.stdout);
    });

    cy.resetState();

    cy.beLoggedIn().then((args) => {
      const { organisationId } = args;

      cy.visit(`/organisation/${organisationId}/people/manage`);

      cy.contains('Add person').click();

      cy.get('.panel-heading.pointer').click();

      cy.get('input[placeholder="Name"]').type('Test persona');
    }).then(() => {
      cy.contains('Add identity').click();

      cy.get('.persona-identifier-value-form').type('test@test.com');
    });
  });
});
