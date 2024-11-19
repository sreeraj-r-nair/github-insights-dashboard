declare namespace Cypress {
  interface Chainable<Subject = any> {
    /**
     * Custom command to log in to the application
     * @param username - The user's username
     * @param password - The user's password
     */
    login(username: string, password: string): Chainable<void>;

    /**
     * Custom command to wait for Angular to load
     */
    waitForAngular(): Chainable<void>;
  }
}

// Implement the custom command to log in
Cypress.Commands.add('login', (username: string, password: string) => {
  cy.visit('/sign-in');
  cy.get('[data-cy=username]').type(username);
  cy.get('[data-cy=password]').type(password);
  cy.get('[data-cy=login-button]').click();
  cy.url().should('include', '/dashboard');
});

// Implement the custom command to wait for Angular
Cypress.Commands.add('waitForAngular', () => {
  cy.window().should('have.property', 'angular');
});
