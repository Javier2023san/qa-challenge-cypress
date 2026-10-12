import { authHeaders, pickRandomProducts } from "../../support/helpers";
import { assertCartSchema } from "../../support/schemas";

/**
 * 2, 3 y 4. Creación / Actualización / Eliminación de carrito
 *
 * Decisión: estos tres requerimientos describen UN flujo continuo ("utilizar
 * el carrito creado previamente"), por eso se implementan en un único
 * describe ordenado que comparte el `cartId` obtenido en la creación, en vez
 * de tres specs independientes que tendrían que crear su propio carrito.
 * Cypress no resetea el estado JS entre los `it()` de un mismo archivo, que
 * es justamente lo que este flujo necesita: cada `it` sigue siendo un
 * escenario con sus propias assertions, pero no se puede correr fuera de orden.
 */
describe("API - Carrito de compras (/carts)", () => {
  const USER_ID = 1;
  const PRODUCTS_IN_CART = 3;

  let catalog = []; // catálogo real, pedido una sola vez y reutilizado
  let cartProducts = []; // ítems del carrito: [{ productId, quantity }]
  let cartId;

  const today = () => new Date().toISOString().slice(0, 10); // YYYY-MM-DD

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
    const selected = pickRandomProducts(catalog, PRODUCTS_IN_CART);
    const payload = {
      userId: USER_ID,
      date: today(),
      products: selected.map((p) => ({ productId: p.id, quantity: 1 })),
    };
    cy.log(`Productos elegidos: ${selected.map((p) => p.id).join(", ")}`);

    cy.request({
      method: "POST",
      url: "/carts",
      headers: authHeaders(),
      body: payload,
    }).then((response) => {
      expect(response.status).to.eq(201); // 201 Created, verificado contra la API real
      expect(response.headers["content-type"]).to.include("application/json");

      assertCartSchema(response.body);
      expect(response.body.userId).to.eq(USER_ID);
      expect(response.body.products).to.have.length.of.at.least(PRODUCTS_IN_CART);
      expect(response.body.products).to.deep.equal(payload.products);

      cartId = response.body.id;
      cartProducts = response.body.products;
    });
  });

  it("actualiza el carrito creado agregando un producto adicional", () => {
    expect(cartId, "cartId del test anterior").to.be.a("number");

    // Producto adicional tomado del mismo catálogo (sin volver a pedirlo),
    // distinto de los que ya están en el carrito.
    const existingIds = cartProducts.map((p) => p.productId);
    const [extraProduct] = pickRandomProducts(catalog, 1, existingIds);
    const newItem = { productId: extraProduct.id, quantity: 1 };
    const updatedProducts = [...cartProducts, newItem];

    cy.request({
      method: "PUT",
      url: `/carts/${cartId}`,
      headers: authHeaders(),
      body: { userId: USER_ID, date: today(), products: updatedProducts },
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.headers["content-type"]).to.include("application/json");

      assertCartSchema(response.body);
      expect(response.body.id).to.eq(cartId);
      expect(response.body.products).to.have.length(cartProducts.length + 1);
      expect(response.body.products).to.deep.include(newItem);
      // Los productos originales se mantienen
      cartProducts.forEach((item) => expect(response.body.products).to.deep.include(item));

      cartProducts = response.body.products;
    });
  });

  it("elimina el carrito creado", () => {
    expect(cartId, "cartId de los tests anteriores").to.be.a("number");

    cy.request({
      method: "DELETE",
      url: `/carts/${cartId}`,
      headers: authHeaders(),
    }).then((response) => {
      expect(response.status).to.eq(200);

      // Fake Store API es un mock: los POST no persisten (verificado contra la
      // API real), así que el DELETE de un id creado en ESTA corrida no tiene
      // nada que devolver y responde `null`. La estructura completa de la
      // respuesta del DELETE se valida en el test siguiente, con un carrito
      // que sí existe. Si algún día la API persistiera, se valida igual.
      if (response.body !== null) {
        assertCartSchema(response.body);
        expect(response.body.id).to.eq(cartId);
      } else {
        expect(response.body).to.be.null;
      }
    });
  });

  it("elimina un carrito pre-cargado y devuelve el carrito eliminado", () => {
    // Complementa el test anterior: con un carrito que existe en la API
    // (no creado por este flujo) se puede validar la estructura completa
    // de la respuesta del DELETE. El id se obtiene dinámicamente de GET /carts.
    cy.request({ method: "GET", url: "/carts", headers: authHeaders() }).then((listResponse) => {
      expect(listResponse.status).to.eq(200);
      expect(listResponse.body).to.be.an("array").and.not.be.empty;
      const existingCart = listResponse.body[0];

      cy.request({
        method: "DELETE",
        url: `/carts/${existingCart.id}`,
        headers: authHeaders(),
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.headers["content-type"]).to.include("application/json");

        assertCartSchema(response.body);
        expect(response.body.id).to.eq(existingCart.id);
        expect(response.body.userId).to.eq(existingCart.userId);
        expect(response.body.products).to.deep.equal(existingCart.products);
      });
    });
  });
});
