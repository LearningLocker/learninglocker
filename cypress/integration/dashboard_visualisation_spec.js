

describe('dashboard visulaisation', () => {
  it('should go to the visulaisation from the dashboard', () => {
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
      cy.contains('Dashboards').click();

      // create a dashboard
      cy.get('.ion-plus-circled').click();
      cy.contains('Add widget').click();
      cy.get('.ion-navicon-round').click();
      cy.get('.ion-gear-b').click();

      cy.get('input[placeholder="Choose an option"]').click();

      cy.contains('test 1').should('be.visible');
      cy.wait(500); // Some reason it still may no be visible, dispite the above line :(.

      cy.contains('test 1').click();

      cy.get('button.close').click();

      // Go to visualisation from dashboard
      cy.get('.ion-navicon-round').click();
      cy.contains('Go to visualisation').click();

      // Test we've landed in the right place.
      cy.get('input[placeholder="What does this visualisation show?"]').should('have.value', 'test 1');
    });
  });
});
