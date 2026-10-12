const { defineConfig } = require("cypress");

module.exports = defineConfig({
  // Reintentos solo en `cypress run`; en modo interactivo no se reintenta
  retries: { runMode: 2, openMode: 0 },
  e2e: {
    baseUrl: "https://www.saucedemo.com",
    specPattern: "cypress/e2e/**/*.cy.js",
    supportFile: "cypress/support/e2e.js",
    viewportWidth: 1280,
    viewportHeight: 800,
    setupNodeEvents(on, config) {
      return config;
    },
  },
});
