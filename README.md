# GithubInsightsDashboard

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 18.2.12.

## Prerequisites

Before running the app locally, make sure you have the following installed:

- [Node.js](https://nodejs.org/) (LTS version recommended)
- [Angular CLI](https://angular.io/cli) (version 18.2.12 or above)
- Cypress (version 12.15.2 for end-to-end testing)
- Mocha (for test report generation)

## Install dependencies

Make sure you are using the correct version of Node.js (LTS version). Then, install the required dependencies using npm:

npm install

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `npx cypress open` to execute the end-to-end tests. 


## Features and Frameworks Used

# Frontend Development

- Angular 18: Used for building the frontend of the application, providing a modular and scalable architecture.
- Scania Tegel Framework: This framework is used for creating consistent UI elements across the app. It ensures a cohesive and professional design.
- Angular Material: For additional UI components like datepicker, card etc., that are not provided by the Tegel framework.

# Testing

- Unit Testing: The project uses Jasmine as the testing framework for writing unit tests. Jasmine helps ensure the correctness of individual components, services, and pipes.
- End-to-End Testing: For E2E testing, Cypress is used. It allows for easy testing of the entire application, ensuring that all workflows function as expected.
- Test Report Generation: Mocha is integrated for generating detailed test reports. It helps to summarize unit and E2E test results in a readable format.

