/**
 * *acciones reutilizables, como hacer el login o traer los productos. /
 * Custom commands de la suite de Fake Store API.
 *
 * Decisión: en vez de repetir en cada spec el mismo boilerplate de
 * cy.request() (y el manejo del token), lo que todos los specs necesitan
 * - un token de autenticación y el catálogo real de productos - se encapsula
 * acá. Así los specs quedan enfocados en el escenario y sus assertions.
 * Las funciones planas (authHeaders, pickRandomProducts) están en helpers.js.
  */

import { assertProductSchema } from "./schemas";
import { authHeaders, requireEnv } from "./helpers";

/**
 * Hace login contra POST /auth/login con las credenciales configuradas como
 * variables de entorno de Cypress (cypress.env.json / CYPRESS_apiUsername /
 * CYPRESS_apiPassword) y guarda el token en Cypress.env('authToken') para
 * reutilizarlo en los requests posteriores mediante authHeaders().
 *
 * Los endpoints /carts de Fake Store API no exigen el token (es una API
 * mock), pero igual se envía, como lo haría cualquier consumidor real de
 * una API con autenticación por token (ver también cart.cy.js).
 */
Cypress.Commands.add("apiLogin", (username, password) => {
  const user = username ?? requireEnv("apiUsername");
  const pass = password ?? requireEnv("apiPassword");

  return cy
    .request({
      method: "POST",
      url: "/auth/login",
      body: { username: user, password: pass },
      log: false, // evita mostrar el password en el Command Log
    })
    .then((response) => {
      // La documentación indica 200, pero la API real responde 201 Created
      // en un login exitoso: se valida el valor real (ver README).
      expect(response.status).to.eq(201);
      expect(response.body).to.have.property("token").that.is.a("string").and.not.empty;
      Cypress.env("authToken", response.body.token);
      return response;
    });
});

/**
 * Obtiene el catálogo real desde GET /products, valida status, content-type
 * y la estructura de cada producto, y lo devuelve. Se pide una sola vez por
 * flujo y se reutiliza (ver cart.cy.js), en lugar de repetir el request.
 */
Cypress.Commands.add("getProducts", () => {
  return cy.request({ method: "GET", url: "/products", headers: authHeaders() }).then((response) => {
    expect(response.status).to.eq(200);
    expect(response.headers["content-type"]).to.include("application/json");
    expect(response.body).to.be.an("array").and.not.be.empty;
    response.body.forEach(assertProductSchema);
    return response.body;
  });
});
