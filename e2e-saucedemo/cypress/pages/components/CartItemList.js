/**
 * Componente compartido: la lista de productos que muestran tanto el carrito
 * (/cart.html) como el resumen del checkout (/checkout-step-two.html).
 *
 * Decisión: ambas pantallas renderizan exactamente el mismo markup para cada
 * ítem, así que en vez de duplicar los mismos getters en CartPage y en
 * CheckoutStepTwoPage, las dos clases extienden este componente. Un cambio
 * en esa lista se corrige en un solo lugar.
 */
export default class CartItemList {
  items() {
    return cy.get("[data-test='inventory-item']");
  }

  itemNames() {
    return cy.get("[data-test='inventory-item'] [data-test='inventory-item-name']");
  }

  itemPrices() {
    return cy.get("[data-test='inventory-item'] [data-test='inventory-item-price']");
  }

  itemDescriptions() {
    return cy.get("[data-test='inventory-item'] [data-test='inventory-item-desc']");
  }

  itemQuantities() {
    return cy.get("[data-test='inventory-item'] [data-test='item-quantity']");
  }

  /**
   * Devuelve (como chainable) la lista de ítems mostrados, con el formato
   * [{ name, price, quantity }], para compararla en una sola assertion
   * contra los productos seleccionados en el catálogo.
   */
  getDisplayedItems() {
    return this.items().then(($items) =>
      [...$items].map((item) => {
        const $item = Cypress.$(item);
        return {
          name: $item.find("[data-test='inventory-item-name']").text().trim(),
          price: $item.find("[data-test='inventory-item-price']").text().trim(),
          quantity: $item.find("[data-test='item-quantity']").text().trim(),
        };
      })
    );
  }
}
