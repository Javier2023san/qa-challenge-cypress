/**
 * Validaciones de estructura y tipos de datos, sin dependencias externas.
 *
 * Una librería de JSON Schema (ajv, chai-json-schema) sería la opción
 * "de manual", pero sumar una dependencia para dos estructuras chicas y
 * estables (product / cart) resultaba excesivo para este alcance. Estos
 * helpers dan la misma garantía - se valida la presencia Y el tipo de cada
 * campo - usando solo las assertions de Chai que ya trae Cypress.
 */

export function assertProductSchema(product) {
  expect(product).to.be.an("object");
  expect(product).to.have.property("id").that.is.a("number");
  expect(product).to.have.property("title").that.is.a("string").and.not.empty;
  expect(product).to.have.property("price").that.is.a("number");
  expect(product).to.have.property("category").that.is.a("string").and.not.empty;
  expect(product).to.have.property("description").that.is.a("string");
  expect(product).to.have.property("image").that.is.a("string");
  if (Object.prototype.hasOwnProperty.call(product, "rating")) {
    expect(product.rating).to.be.an("object");
    expect(product.rating).to.have.property("rate").that.is.a("number");
    expect(product.rating).to.have.property("count").that.is.a("number");
  }
}

export function assertCartSchema(cart) {
  expect(cart).to.be.an("object");
  expect(cart).to.have.property("id").that.is.a("number");
  expect(cart).to.have.property("userId").that.is.a("number");
  // `date` vuelve como "YYYY-MM-DD" (eco de lo enviado en el request) o como
  // timestamp ISO completo (en un carrito pre-cargado de la API); en ambos
  // casos debe ser un string no vacío que represente una fecha válida.
  expect(cart).to.have.property("date").that.is.a("string").and.not.empty;
  expect(Number.isNaN(Date.parse(cart.date)), "date es una fecha válida").to.be.false;
  expect(cart).to.have.property("products").that.is.an("array").with.length.greaterThan(0);
  cart.products.forEach((item) => {
    expect(item).to.have.property("productId").that.is.a("number");
    expect(item).to.have.property("quantity").that.is.a("number");
  });
}
