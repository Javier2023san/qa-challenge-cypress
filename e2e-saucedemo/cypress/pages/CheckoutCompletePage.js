/**
 * Page Object de /checkout-complete.html (confirmación de la compra).
 */
class CheckoutCompletePage {
  header() {
    return cy.get("[data-test='complete-header']");
  }

  text() {
    return cy.get("[data-test='complete-text']");
  }
}

export default new CheckoutCompletePage();
