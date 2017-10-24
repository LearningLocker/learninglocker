describe('upload personas', () => {
  it('should upload a persona', () => {
    // For some reason we need to call this first otherwise the seed command times out ???
    cy.exec('node --version', {
      log: true
    }).then((result) => {
      cy.log('node version', result.stdout);
    });

    cy.resetState();

    cy.beLoggedIn().then((args) => {
      const { organisationId } = args;

      cy.visit(`/organisation/${organisationId}/people/imports`);

      cy.contains('#topbar button', 'Import').click();

      cy.get('input[placeholder="Short title of this import"]').invoke('val', 'Test import');

      cy.get('input[placeholder="Upload the csv"]').then(el =>
        cy.uploadFixture('personas.csv', el)
      );
    }).then(() => {
      cy.get('.ion-upload').last().click();
    }).then(() => {
      cy.get('select[id$="Email-columnType"]').select('COLUMN_MBOX');

      cy.get('select[id$="Name-columnType"]').select('COLUMN_NAME');

      cy.get('select[id$="Age-columnType"]').select('COLUMN_ATTRIBUTE_DATA');

      cy.contains('Import Personas').click();
    })
    .then(() => {
      cy.contains('Imported on').should('be.visible');
      cy.get('input[id$="Email-order"]').should('have.value', '1');
      cy.contains('~ personas.csv').click(); // minimise
    })
    .then(() => {
      // re upload should have the same structure
      cy.contains('#topbar button', 'Import').click();

      cy.get('input[placeholder="Upload the csv"]').then(el =>
        cy.uploadFixture('personas.csv', el)
      );
    })
    .then(() => {
      cy.get('.ion-upload').last().click();
      cy.contains('Import Personas').click();
    })
    .then(() => {
      cy.contains('Imported on').should('be.visible');
      cy.get('input[id$="Email-order"]').should('have.value', '1');
      cy.get('select[id$="Email-columnType"]').should('have.value', 'COLUMN_MBOX');
      cy.get('select[id$="Name-columnType"]').should('have.value', 'COLUMN_NAME');
      cy.get('select[id$="Age-columnType"]').should('have.value', 'COLUMN_ATTRIBUTE_DATA');
    });
  });
});
