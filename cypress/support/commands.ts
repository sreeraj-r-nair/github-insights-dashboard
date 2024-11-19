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
  // Visit the login page
  cy.visit('/sign-in');
  
  // Type the username and password, then click the login button
  cy.get('[data-cy=username]').type(username);
  cy.get('[data-cy=password]').type(password);
  cy.get('[data-cy=login-button]').click();
});

// Implement the custom command to wait for Angular
Cypress.Commands.add('waitForAngular', () => {
  cy.window().should('have.property', 'angular');
});
