describe('Dashboard Workflow', () => {
  beforeEach(() => {
    // Perform login before each test
    cy.fixture('users').then((users) => {
      cy.login(users.validUser.username, users.validUser.password);
    });
  });

  it('should display the header and footer', () => {
    // Check if the header and footer are visible
    cy.get('app-header').should('be.visible');
    cy.get('app-footer').should('be.visible');
  });

  it('should display the summary tile with user data', () => {

    // Mock the API response for user summary
    cy.intercept('GET', '**/users/sreeraj-r-nair', {
      statusCode: 200,
      body: {
        public_repos: 10,
        followers: 5,
        following: 3,
      }
    }).as('getUserSummary');  

    cy.visit('/dashboard');

      // Set the `totalCommits` directly in the component
  // cy.window().then((win) => {
  //   const appComponent = win.angularApp.injector.get(AppComponent); // Replace with your actual component
  //   appComponent.totalCommits = 42; // Set mocked total commits
  //   appComponent.changeDetection.detectChanges(); // Trigger change detection to reflect the changes in the view
  // });

    cy.wait('@getUserSummary', { timeout: 10000 });

    // Ensure the summary tile is visible before making assertions
    cy.get('app-summary-tile', { timeout: 10000 }).should('be.visible');

    // Check if the summary tile displays the correct data
    cy.get('app-summary-tile').within(() => {
      cy.contains('10', { timeout: 10000 }).should('be.visible');
      cy.contains('5', { timeout: 10000 }).should('be.visible');
      cy.contains('3', { timeout: 10000 }).should('be.visible');
      cy.contains('42', { timeout: 10000 }).should('be.visible');
    });
  });

  it('should display the commit frequency chart', () => {
    // Mock the API response for commit activity
    cy.intercept('GET', '**/repos/sreeraj-r-nair/*/stats/commit_activity', {
      statusCode: 200,
      body: [
        {
          days: [0, 0, 0, 0, 0, 0, 0],
          total: 0,
          week: 1705795200
        },
        {
          days: [0, 2, 0, 0, 0, 0, 0],
          total: 2,
          week: 1731801600
        }
      ]
    }).as('getRepoCommitActivity');
  
    cy.visit('/dashboard');
  
    cy.wait('@getRepoCommitActivity', { timeout: 10000 });
  
    // Ensure the commit frequency chart is visible before making assertions
    cy.get('app-commit-frequency-chart', { timeout: 10000 }).should('be.visible');
  
    // Check if the commit frequency chart displays the correct data
    cy.get('app-commit-frequency-chart').within(() => {
      cy.get('.bar-chart', { timeout: 10000 }).should('be.visible');
    });
  });
  

  it('should display the languages used chart', () => {
    // Mock the API response for languages used
    cy.intercept('GET', '**/repos/sreeraj-r-nair/*/languages', {
      statusCode: 200,
      body: {
        HTML: 7261,
        CSS: 3920,
        JavaScript: 346
      }
    }).as('getRepoLanguages');
  
    cy.visit('/dashboard');
  
    cy.wait('@getRepoLanguages', { timeout: 10000 });
  
    // Ensure the languages used chart is visible
    cy.get('app-languages-used-chart', { timeout: 10000 }).should('be.visible');
  
    // Check if the chart container renders correctly
    cy.get('app-languages-used-chart').within(() => {
      cy.get('svg').should('be.visible');
    });
  });
  
});
