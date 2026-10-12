/**
 * Page Object de /inventory.html (catálogo).
 *
 * Todos los selectores usan atributos `[data-test="..."]`, que Sauce Demo
 * expone específicamente para automatización: son estables frente a cambios
 * visuales o de clases CSS.
 */
class InventoryPage {
  itemCards() {
    return cy.get("[data-test='inventory-item']");
  }

  /**
   * Lee del catálogo los primeros `count` productos visibles y devuelve (como
   * chainable) [{ name, price }] con sus datos reales, para usarlos como
   * datos esperados en el resto del flujo.
   */
  getFirstProducts(count) {
    return this.itemCards().then(($cards) => {
      expect($cards.length, "productos disponibles en el catálogo").to.be.at.least(count);
      return [...$cards].slice(0, count).map((card) => {
        const $card = Cypress.$(card);
        return {
          name: $card.find("[data-test='inventory-item-name']").text().trim(),
          price: $card.find("[data-test='inventory-item-price']").text().trim(),
        };
      });
    });
  }

  /**
   * Agrega un producto al carrito a partir de su nombre visible, buscando el
   * botón dentro de la tarjeta de ESE producto. Así no se depende del
   * data-test del botón, que se arma con el nombre "slugificado" del
   * producto y es fácil que quede desactualizado.
   */
  addProductToCartByName(name) {
    cy.contains("[data-test='inventory-item-name']", name)
      .parents("[data-test='inventory-item']")
      .find("[data-test^='add-to-cart']")
      .click();
    return this;
  }

  cartBadge() {
    return cy.get("[data-test='shopping-cart-badge']");
  }

  goToCart() {
    cy.get("[data-test='shopping-cart-link']").click();
    return this;
  }
}

export default new InventoryPage();
