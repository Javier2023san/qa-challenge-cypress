/**
 * 1. Login y manejo de token
 *
 * Las credenciales nunca se escriben en este archivo: se leen de variables de
 * entorno de Cypress (cypress.env.json / CYPRESS_apiUsername /
 * CYPRESS_apiPassword - ver README "Configuración de variables de entorno").
 * El token devuelto por un login exitoso se guarda con cy.apiLogin()
 * (cypress/support/commands.js) para que cart.cy.js lo reutilice.
 */

describe("API - Autenticación (/auth/login)", () => {
  it("permite iniciar sesión con credenciales válidas y devuelve un token reutilizable", () => {
    cy.apiLogin().then((response) => {
      // Validación de status + respuesta completa, como pide el enunciado.
      // Fake Store API responde 201 Created (verificado contra la API real),
      // no el 200 que uno podría suponer para un login.
      expect(response.status).to.eq(201);
      expect(response.headers["content-type"]).to.include("application/json");
      expect(response.body).to.be.an("object");
      expect(response.body).to.have.all.keys("token");
      expect(response.body.token).to.be.a("string").and.not.empty;

      // El token debe quedar disponible para los requests posteriores: eso es
      // "reutilizar el token" en la práctica. Esta API mock no tiene un
      // endpoint que lo exija, así que se valida que quedó guardado.
      expect(Cypress.env("authToken")).to.eq(response.body.token);
    });
  });

  it("[negativo] rechaza el login con una contraseña inválida", () => {
    const invalidUser = Cypress.env("apiUsernameInvalid") ?? Cypress.env("apiUsername");
    const invalidPass = Cypress.env("apiPasswordInvalid");

    if (!invalidUser || !invalidPass) {
      throw new Error(
        "Faltan las variables apiUsernameInvalid/apiPasswordInvalid - ver cypress.env.json.example."
      );
    }

    cy.request({
      method: "POST",
      url: "/auth/login",
      body: { username: invalidUser, password: invalidPass },
      failOnStatusCode: false, // esperamos que falle; lo validamos nosotros
    }).then((response) => {
      expect(response.status).to.eq(401);
      // Ante un login fallido Fake Store API responde texto plano (no JSON),
      // así que se valida el texto en lugar de una estructura JSON.
      expect(response.headers["content-type"]).to.include("text/html");
      expect(response.body).to.be.a("string");
      expect(response.body.toLowerCase()).to.include("incorrect");
    });
  });

  it("[negativo] rechaza el login con un usuario inexistente", () => {
    cy.request({
      method: "POST",
      url: "/auth/login",
      body: { username: "usuario_que_no_existe_xyz", password: "cualquier-cosa" },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(401);
      expect(response.body).to.be.a("string");
      expect(response.body.toLowerCase()).to.include("incorrect");
    });
  });
});
