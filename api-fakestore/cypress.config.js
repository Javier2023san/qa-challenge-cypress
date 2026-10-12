const { defineConfig } = require("cypress");

module.exports = defineConfig({
  // La suite no usa interfaz de usuario, pero se declara baseUrl para que los
  // cy.request() de los specs puedan usar rutas relativas (/products, /carts...).
  e2e: {
    baseUrl: "https://fakestoreapi.com",
    specPattern: "cypress/e2e/**/*.cy.js",
    supportFile: "cypress/support/e2e.js",
    setupNodeEvents(on, config) {
      // Las credenciales vienen de cypress.env.json / variables CYPRESS_* /
      // flag --env, nunca de los specs (ver README > "Configuración de
      // variables de entorno").
      return config;
    },
  },
});
