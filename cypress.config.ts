import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:4200', // Set the base URL for your application
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
        // Configure Cypress to use Mochawesome as a reporter
        reporter: 'mochawesome',
        reporterOptions: {
          // Path where the reports will be stored
          reportDir: 'cypress/results',
          overwrite: false,
          html: true, // Generate HTML report
          json: true, // Generate JSON report
          timestamp: 'yyyy-mm-dd_HH-MM-ss', // Add timestamp to report name
        },
  },
});
