/**
 * las verificaciones de que los datos tengan la forma y los tipos correctos.
 * Validaciones de estructura y tipos de datos, según los schemas de la
 * documentación oficial (https://fakestoreapi.com/docs):
 *
 *   Product = { id: integer, title: string, price: number, description: string,
 *               category: string, image: string (uri) }
 *   Cart    = { id: integer, userId: integer, products: Product[] }
 *
 * Una librería de JSON Schema (ajv, chai-json-schema) sería la opción
 * "de manual", pero sumar una dependencia para dos estructuras chicas y
 * estables resultaba excesivo para este alcance. Estos helpers validan la
 * presencia Y el tipo de cada campo con las assertions de Chai de Cypress.
 */

export function assertProductSchema(product) {
  expect(product).to.be.an("object");
  expect(product).to.have.property("id").that.is.a("number");
  expect(Number.isInteger(product.id), "id es entero").to.be.true;
  expect(product).to.have.property("title").that.is.a("string").and.not.empty;
  expect(product).to.have.property("price").that.is.a("number");
  expect(product).to.have.property("description").that.is.a("string");
  expect(product).to.have.property("category").that.is.a("string").and.not.empty;
  expect(product).to.have.property("image").that.is.a("string").and.match(/^https?:\/\//);
}

export function assertCartSchema(cart) {
  expect(cart).to.be.an("object");
  expect(cart).to.have.property("id").that.is.a("number");
  expect(Number.isInteger(cart.id), "id es entero").to.be.true;
  expect(cart).to.have.property("userId").that.is.a("number");
  expect(Number.isInteger(cart.userId), "userId es entero").to.be.true;
  expect(cart).to.have.property("products").that.is.an("array").and.not.empty;
  cart.products.forEach(assertProductSchema);
}
