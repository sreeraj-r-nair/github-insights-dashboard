import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:4200', // Set the base URL for your application
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
