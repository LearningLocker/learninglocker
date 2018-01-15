

describe('visualisation source', () => {
  it('should should source on dashboard', () => {
    cy.exec('node --version').then((result) => {
      cy.log('node version', result.stdout);
    });

    cy.resetState();

    cy.beLoggedIn().then((args) => {
      const { organisationId } = args;

      // Create a visualisation
      cy.visit(`/organisation/${organisationId}/data/visualise`);
      cy.contains('Add new').click();
      cy.contains('Bar').click();
      cy.get('.ion-checkmark').click();
      cy.get('input[placeholder="What does this visualisation show?"]').type('test 1');

      cy.get('.panel-body').contains('Source').click();

      cy.contains('Dashboards').click();

      // create a dashboard
      cy.get('.ion-plus-circled').click();
      cy.contains('Add widget').click();
      cy.get('.ion-navicon-round').click();
      cy.get('.ion-gear-b').click();
      cy.get('input[placeholder="Choose an option"]').click();
      cy.contains('test 1').click();
      cy.get('button.close').click();

      // Test that it's a table.
      cy.get('th[colspan=1]').contains('s0');
    });
  });
});
