export {};

declare global {
  namespace Cypress {
    interface Chainable {
      populateAll(): Chainable<any>;
    }
  }
}

Cypress.Commands.add("populateAll", function () {
  cy.populateUsers().then(() => {
    cy.wait(1000); // wait events
    cy.populateProjects().then(() => {
      cy.wait(1000); // wait events
      cy.populatePayments().then(() => {
        cy.wait(1000); // wait events
      });
    });
  });
});
