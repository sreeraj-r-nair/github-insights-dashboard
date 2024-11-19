import { UsersFixture } from '../support/types';

describe('End-to-End Authentication and Dashboard Workflow', () => {
  let users: UsersFixture;

  beforeEach(function () {
    // Load the fixture and assign to the users object
    cy.fixture('users').then((loadedUsers) => {
      users = loadedUsers;
    });
    cy.visit('/sign-in');
  });

  // 1. Test Major User Flows
  it('should successfully log in the user', function () {
    cy.login(users.validUser.username, users.validUser.password);
    cy.url().should('include', '/dashboard');  // Ensure we are on the dashboard after login
  });

  it('should show an error for invalid credentials', function () {
    cy.login(users.invalidUser.username, users.invalidUser.password);
    cy.on('window:alert', (text) => {
      expect(text).to.contains('Invalid PAT or Authentication Failed');
    });
  });

  it('should show validation errors for empty fields', function () {
    cy.get('[data-cy=login-button]').should('be.disabled');  // Ensure button is disabled
    cy.get('[data-cy=username]').focus().blur();  // Trigger validation
    cy.get('[data-cy=password]').focus().blur();
    cy.contains('Username is required').should('be.visible');
    cy.contains('Personal Access Token is required').should('be.visible');
  });

  it('should validate token format and show error for invalid token', function () {
    cy.get('[data-cy=username]').type(users.invalidUser.username);
    cy.get('[data-cy=password]').type('invalid_token_format');
    cy.get('[data-cy=login-button]').click();
    cy.on('window:alert', (text) => {
      expect(text).to.contains('Invalid PAT or Authentication Failed');
    });
  });

  it('should keep the user logged in after refreshing the page', function () {
    cy.login(users.validUser.username, users.validUser.password);
    cy.url().should('include', '/dashboard');
    cy.reload();
    cy.url().should('include', '/dashboard');  // Check that the dashboard is still visible after refresh
  });

  // 2. Form Validation
  it('should validate the input fields for missing or invalid tokens', () => {
    // Ensure the login button is disabled initially when the fields are empty
    cy.get('[data-cy=login-button]').should('be.disabled');
  
    // Check for empty field validation for the username
    cy.get('[data-cy=username]').focus().blur();
    cy.contains('Username is required').should('be.visible');
  
    // Check for empty field validation for the password
    cy.get('[data-cy=password]').focus().blur();
    cy.contains('Personal Access Token is required').should('be.visible');
  
    // Ensure the login button is still disabled after empty field validation
    cy.get('[data-cy=login-button]').should('be.disabled');
  
    // Check for invalid token format (enter username, invalid token, and submit)
    cy.get('[data-cy=username]').type(users.validUser.username);
    cy.get('[data-cy=password]').type('invalid_token'); // Invalid token format
    cy.get('[data-cy=login-button]').click();
  
    // Check for the alert showing the invalid token message
    cy.on('window:alert', (str) => {
      expect(str).to.equal('Invalid PAT or Authentication Failed');
    });
  });
  
  // 3. Component Validation
  it('should ensure required components are visible on the dashboard', function () {
    cy.login(users.validUser.username, users.validUser.password);
    cy.url().should('include', '/dashboard');

    // Check if header and footer are visible
    cy.get('app-header').should('be.visible');
    cy.get('app-footer').should('be.visible');

    // Ensure that the summary tile is displayed
    cy.get('app-summary-tile').should('be.visible');
    cy.get('app-summary-tile').within(() => {
      cy.contains('Projects').should('be.visible');
      cy.contains('Total Commits this year').should('be.visible');
      cy.contains('Followers').should('be.visible');
      cy.contains('Following').should('be.visible');
    });

    // Ensure that the commit frequency chart is displayed
    cy.get('app-commit-frequency-chart').should('be.visible');
    cy.get('app-commit-frequency-chart').within(() => {
      cy.contains('Commit count').should('be.visible');
    });

    // Ensure that the languages used chart is displayed
    cy.get('app-languages-used-chart').should('be.visible');
    cy.get('app-languages-used-chart').within(() => {
      cy.contains('Programming languages').should('be.visible');
    });
  });

// 4. Commit Navigation Test
it('should navigate to GitHub commit page when clicking on a commit', function () {
  // Intercept the commits API request to mock the response
  cy.fixture('commitsResponse.json').then((commitsResponse) => {
    // Remove any circular references in the fixture data before mocking
    const cleanedResponse = removeCircularReferences(commitsResponse);

    cy.intercept('GET', 'https://api.github.com/repos/sreeraj-r-nair/solution-frontend-task/commits', {
      statusCode: 200,
      body: cleanedResponse
    }).as('getCommits'); // Intercept and alias the request
  });
  
  // Login and visit the dashboard page
  cy.login(users.validUser.username, users.validUser.password);
  cy.url().should('include', '/dashboard');
  
  // Navigate to the commit list page
  cy.visit('/commit-list');
    
  // Wait for the intercepted API request to complete
  cy.wait('@getCommits');
  
  // Ensure the commit cards are visible
  cy.get('[data-cy="commit-message-0"]').should('be.visible');
  cy.get('[data-cy="commit-message-1"]').should('be.visible');
  cy.get('[data-cy="commit-message-2"]').should('be.visible');  // Ensure third commit is visible
  
  // Click on the third commit (index 2)
  cy.get('[data-cy="commit-message-2"]').click();
  
  // Verify that the new tab with the commit details URL is opened
  cy.window().then((win) => {
    cy.stub(win, 'open').as('windowOpen');
  });
  cy.get('[data-cy="commit-message-2"]').click();
  cy.get('@windowOpen').should('be.calledWith', 'https://github.com/sreeraj-r-nair/solution-frontend-task/commit/403029c08accb948d8de298cbfbf114417e38505');
});

// 5. Commit Filtering and Search Test
it('should filter commits based on search query', function () {
  // Intercept the commits API request to mock the response
  cy.fixture('commitsResponse.json').then((commitsResponse) => {
    // Remove any circular references in the fixture data before mocking
    const cleanedResponse = removeCircularReferences(commitsResponse);

    cy.intercept('GET', 'https://api.github.com/repos/sreeraj-r-nair/solution-frontend-task/commits', {
      statusCode: 200,
      body: cleanedResponse
    }).as('getCommits'); // Intercept and alias the request
  });

  // Login and visit the dashboard page
  cy.login(users.validUser.username, users.validUser.password);
  cy.url().should('include', '/dashboard');
  
  // Navigate to the commit list page
  cy.visit('/commit-list');
  
  // Wait for the intercepted API request to complete
  cy.wait('@getCommits');
  
  // Ensure the commit cards are visible
  cy.get('[data-cy="commit-message-0"]').should('be.visible');
  cy.get('[data-cy="commit-message-1"]').should('be.visible');
  cy.get('[data-cy="commit-message-2"]').should('be.visible');  // Ensure third commit is visible
  
  // Test search functionality

  // Type a search query in the search bar
  cy.get('[data-cy="commit-search-bar"]').type('rollback');

  // Ensure the filtered commits are visible after typing the search query
  cy.get('[data-cy="commit-message-0"]').should('contain', 'rollback');

  // You can add more assertions to ensure that the list is filtered properly
  cy.get('[data-cy="commit-message-3"]').should('not.exist');
  
  // Optionally, clear the search input and ensure that all commits are visible again
  cy.get('[data-cy="commit-search-bar"]').clear();
  cy.get('[data-cy="commit-message-0"]').should('be.visible');
  cy.get('[data-cy="commit-message-1"]').should('be.visible');
  cy.get('[data-cy="commit-message-2"]').should('be.visible');
});

  
});

// Helper function to remove circular references from an object
function removeCircularReferences(obj) {
  const seen = new WeakSet();

  function cleanCircular(obj) {
    if (obj && typeof obj === 'object') {
      if (seen.has(obj)) {
        return;
      }
      seen.add(obj);

      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          const value = obj[key];
          if (typeof value === 'object') {
            cleanCircular(value);
          }
        }
      }
    }
    return obj;
  }

  return cleanCircular(obj);
}
