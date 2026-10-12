import CartItemList from "./components/CartItemList";

/**
 * Page Object de /cart.html. Los getters de la lista de productos se heredan
 * de CartItemList (compartido con el resumen del checkout).
 */
class CartPage extends CartItemList {
  title() {
    return cy.get("[data-test='title']");
  }

  checkout() {
    cy.get("[data-test='checkout']").click();
    return this;
  }
}

export default new CartPage();
