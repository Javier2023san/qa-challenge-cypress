import { authHeaders, pickRandomProducts, toCartProduct } from "../../support/helpers";
import { assertCartSchema } from "../../support/schemas";

/**
 * 2, 3 y 4. Creación / Actualización / Eliminación de carrito
 *
 * Los payloads respetan el schema `Cart` de la documentación oficial
 * (https://fakestoreapi.com/docs): { userId, products: Product[] }, donde
 * cada producto es el objeto Product completo. No se envían campos que no
 * estén documentados.
 *
 * Decisión: estos tres requerimientos describen UN flujo continuo ("utilizar
 * el carrito creado previamente"), por eso se implementan en un único
 * describe ordenado que comparte el carrito obtenido en la creación, en vez
 * de tres specs independientes que tendrían que crear su propio carrito.
 * Cada `it` es un escenario con sus propias assertions, pero dependen del
 * orden: si la creación falla, la actualización y la eliminación también.
 */
describe("API - Carrito de compras (/carts)", () => {
  const USER_ID = 1;
  const PRODUCTS_IN_CART = 3;

  let catalog = []; // catálogo real, pedido una sola vez y reutilizado
  let cart; // carrito creado (se actualiza en cada paso)

  before(() => {
    // Token obtenido una sola vez para todo el flujo y reutilizado en cada
    // request vía authHeaders(), como pide el punto 1.
    cy.apiLogin();

    // Los productos salen del catálogo real (GET /products), nunca de ids
    // fijos, como pide el enunciado.
    cy.getProducts().then((products) => {
      catalog = products;
    });
  });

  it("crea un carrito nuevo con al menos 3 productos existentes", () => {
    const payload = {
      userId: USER_ID,
      products: pickRandomProducts(catalog, PRODUCTS_IN_CART).map(toCartProduct),
    };
    cy.log(`Productos elegidos: ${payload.products.map((p) => p.id).join(", ")}`);

    cy.request({
      method: "POST",
      url: "/carts",
      headers: authHeaders(),
      body: payload,
    }).then((response) => {
      expect(response.status).to.eq(201);
      expect(response.headers["content-type"]).to.include("application/json");

      assertCartSchema(response.body);
      expect(response.body.userId).to.eq(USER_ID);
      expect(response.body.products).to.have.length(PRODUCTS_IN_CART);
      // La respuesta contiene exactamente los productos enviados
      expect(response.body.products).to.deep.equal(payload.products);

      cart = response.body;
    });
  });

  it("actualiza el carrito creado agregando un producto adicional", () => {
    expect(cart, "carrito creado en el test anterior").to.be.an("object");

    // Producto adicional tomado del mismo catálogo (sin volver a pedirlo),
    // distinto de los que ya están en el carrito.
    const existingIds = cart.products.map((p) => p.id);
    const [extraProduct] = pickRandomProducts(catalog, 1, existingIds).map(toCartProduct);
    const payload = { userId: USER_ID, products: [...cart.products, extraProduct] };

    cy.request({
      method: "PUT",
      url: `/carts/${cart.id}`,
      headers: authHeaders(),
      body: payload,
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.headers["content-type"]).to.include("application/json");

      assertCartSchema(response.body);
      expect(response.body.id).to.eq(cart.id);
      expect(response.body.userId).to.eq(USER_ID);
      expect(response.body.products).to.have.length(cart.products.length + 1);
      expect(response.body.products).to.deep.include(extraProduct);
      // Los productos originales se mantienen
      cart.products.forEach((product) => expect(response.body.products).to.deep.include(product));

      cart = response.body;
    });
  });

  it("elimina el carrito creado", () => {
    expect(cart, "carrito de los tests anteriores").to.be.an("object");

    cy.request({
      method: "DELETE",
      url: `/carts/${cart.id}`,
      headers: authHeaders(),
    }).then((response) => {
      // La documentación define para DELETE /carts/{id} solo la respuesta
      // 200 "Cart deleted successfully", sin body. Se valida exactamente el
      // comportamiento real y constante de la API: 200, JSON y body null.
      // Sin condicionales: si la respuesta cambia, el test falla.
      expect(response.status).to.eq(200);
      expect(response.headers["content-type"]).to.include("application/json");
      expect(response.body).to.be.null;
    });
  });
});
