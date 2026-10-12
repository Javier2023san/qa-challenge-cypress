/**
 * Precondición del flujo: usuario logueado.
 *
 * El login está fuera del alcance de la consigna, pero es precondición de la
 * prueba. cy.login() solo deja al usuario logueado en el catálogo; los specs
 * no hacen assertions sobre el login en sí. Es un custom command porque es
 * setup reutilizable para cualquier spec que parta de un usuario logueado.
 *
 * Las credenciales se leen de variables de entorno de Cypress
 * (cypress.env.json / CYPRESS_standardUser / CYPRESS_standardPassword),
 * nunca se escriben acá ni en los specs.
 */
Cypress.Commands.add("login", (username, password) => {
  const user = username ?? Cypress.env("standardUser");
  const pass = password ?? Cypress.env("standardPassword");

  if (!user || !pass) {
    throw new Error(
      "Faltan credenciales. Definí standardUser/standardPassword en cypress.env.json " +
        "(ver cypress.env.json.example) o como CYPRESS_standardUser / CYPRESS_standardPassword."
    );
  }

  cy.visit("/");
  cy.get("[data-test='username']").type(user);
  cy.get("[data-test='password']").type(pass, { log: false });
  cy.get("[data-test='login-button']").click();
  cy.get("[data-test='inventory-list']").should("be.visible");
});
