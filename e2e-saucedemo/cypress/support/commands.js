/**
 * El login queda explícitamente fuera del alcance del ejercicio ("Queda fuera
 * del alcance el login"): el flujo bajo prueba arranca con la sesión ya
 * iniciada. cy.login() existe solo como SETUP para llegar a ese estado
 * inicial, no es algo sobre lo que los specs hagan assertions. Es un command
 * (y no un Page Object) porque es infraestructura que necesita el beforeEach,
 * con el mismo criterio que cy.apiLogin() en el proyecto de API.
 *
 * Las credenciales se leen de variables de entorno de Cypress
 * (cypress.env.json / CYPRESS_standardUser / CYPRESS_standardPassword),
 * nunca se escriben acá ni en los specs.
 *
 * cy.session() cachea la sesión (cookies + localStorage) por usuario: el
 * login por UI se hace una sola vez y las siguientes ejecuciones solo
 * restauran la sesión, lo que acelera la suite a medida que crece.
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

  cy.session(
    user,
    () => {
      cy.visit("/");
      cy.get("[data-test='username']").type(user);
      cy.get("[data-test='password']").type(pass, { log: false });
      cy.get("[data-test='login-button']").click();
      cy.url().should("include", "/inventory.html");
    },
    {
      // Si la cookie de sesión de Sauce Demo ya no está, se vuelve a loguear
      validate() {
        cy.getCookie("session-username").should("exist");
      },
    }
  );
});

/**
 * Abre el catálogo con la sesión ya iniciada.
 *
 * Sauce Demo está publicado como SPA en GitHub Pages: el servidor responde
 * 404 en /inventory.html y esa página redirige a la app, que resuelve la ruta
 * del lado del cliente. Por eso se desactiva failOnStatusCode y se valida que
 * la ruta y el catálogo efectivamente carguen.
 */
Cypress.Commands.add("openInventory", () => {
  cy.visit("/inventory.html", { failOnStatusCode: false });
  cy.url().should("include", "/inventory.html");
  cy.get("[data-test='inventory-list']").should("be.visible");
});
