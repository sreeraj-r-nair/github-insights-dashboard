import { UsersFixture } from '../support/types';

describe('Authentication Flow', () => {
  let users: UsersFixture;

  beforeEach(function () {
    cy.fixture('users').then((loadedUsers) => {
      users = loadedUsers;
    });
    cy.visit('/sign-in');
  });

  it('should successfully log in the user', function () {
    cy.login(users.validUser.username, users.validUser.password);
    cy.url().should('include', '/dashboard');
  });

  it('should show an error for invalid credentials', () => {
    // Input invalid credentials
    if (users && users.invalidUser) {
      cy.login(users.invalidUser.username, users.invalidUser.password);
    }

    // Verify error message
    cy.on('window:alert', (text) => {
      expect(text).to.contains('Invalid PAT or Authentication Failed');
    });
  });

  it('should show validation errors for empty fields', () => {
    // Verify that the button is disabled when the form is empty
    cy.get('[data-cy=login-button]').should('be.disabled');

    // Trigger blur on the fields to mark them as touched
    cy.get('[data-cy=username]').focus().blur(); 
    cy.get('[data-cy=password]').focus().blur();

    // Verify validation error messages are displayed
    cy.contains('Username is required').should('be.visible');
    cy.contains('Personal Access Token is required').should('be.visible');
  });
  it('should keep the user logged in after refreshing the page', () => {
    cy.login(users.validUser.username, users.validUser.password);
    cy.url().should('include', '/dashboard');
    cy.reload();
    cy.url().should('include', '/dashboard');
  });
});
