import { requireEnv } from "../../support/helpers";

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
      // La documentación indica 200, pero la API real responde siempre
      // 201 Created: se valida el valor real y la diferencia queda
      // registrada en el README como observación sobre la documentación.
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
    // Usuario válido + password incorrecta, ambos desde variables de entorno
    const invalidUser = requireEnv("apiUsernameInvalid");
    const invalidPass = requireEnv("apiPasswordInvalid");

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
    // El usuario inexistente viene de un fixture: ningún usuario ni password
    // queda escrito dentro del test.
    cy.fixture("unknown-user").then((credentials) => {
      cy.request({
        method: "POST",
        url: "/auth/login",
        body: credentials,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(401);
        expect(response.headers["content-type"]).to.include("text/html");
        expect(response.body).to.be.a("string");
        expect(response.body.toLowerCase()).to.include("incorrect");
      });
    });
  });
});
