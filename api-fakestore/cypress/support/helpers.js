/**
 * Helpers planos (funciones comunes, no custom commands) compartidos por
 * commands.js y los specs. Se separan de commands.js para que los specs
 * puedan importarlos sin volver a registrar los custom commands.
 */


/**
 * (funciones chicas, como armar el encabezado con el token o elegir productos al azar.)
 */


/**
 * Devuelve el valor de una variable de entorno de Cypress. Si no está
 * definida, corta la ejecución con un error claro (el test FALLA, nunca pasa
 * en falso) indicando qué variable configurar.
 */
export function requireEnv(name) {
  const value = Cypress.env(name);
  if (!value) {
    throw new Error(
      `Falta la variable de entorno "${name}". Definila en cypress.env.json ` +
        `(ver cypress.env.json.example) o como CYPRESS_${name}.`
    );
  }
  return value;
}

/**
 * Devuelve el header Authorization armado con el token guardado por
 * cy.apiLogin(). Es a propósito una función PLANA y no un custom command:
 * solo lee un valor que ya está en memoria (Cypress.env), no hay nada que
 * encolar. Si fuera un command devolvería un chainable de Cypress en vez de
 * un objeto, y no se podría usar dentro de `cy.request({ headers: ... })`.
 */
export function authHeaders() {
  const token = Cypress.env("authToken");
  if (!token) {
    throw new Error("No hay token de autenticación: llamá a cy.apiLogin() antes de authHeaders().");
  }
  return { Authorization: `Bearer ${token}` };
}

/**
 * Elige al azar `count` productos distintos del catálogo, excluyendo los ids
 * indicados. Así los tests usan productos obtenidos dinámicamente de la API y
 * no ids fijos: si el catálogo cambia, los tests siguen funcionando.
 */
export function pickRandomProducts(catalog, count, excludeIds = []) {
  const pool = catalog.filter((p) => !excludeIds.includes(p.id));
  if (pool.length < count) {
    throw new Error(`Se necesitan ${count} productos y solo hay ${pool.length} disponibles.`);
  }

  const picked = [];
  while (picked.length < count) {
    const idx = Math.floor(Math.random() * pool.length);
    picked.push(pool.splice(idx, 1)[0]);
  }
  return picked;
}

/**
 * Convierte un producto de GET /products al schema `Product` que define la
 * documentación oficial (https://fakestoreapi.com/docs) para los ítems del
 * carrito: id, title, price, description, category, image.
 *
 * Decisión: GET /products devuelve además `rating`, que NO forma parte del
 * schema `Product` documentado, así que se descarta para que el payload
 * enviado a /carts contenga solo campos documentados.
 */
export function toCartProduct({ id, title, price, description, category, image }) {
  return { id, title, price, description, category, image };
}
