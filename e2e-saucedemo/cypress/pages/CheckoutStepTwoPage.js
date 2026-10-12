import CartItemList from "./components/CartItemList";
import { parsePrice } from "../support/helpers";

/**
 * Page Object de /checkout-step-two.html (resumen de la compra). Los getters
 * de la lista de productos se heredan de CartItemList.
 */
class CheckoutStepTwoPage extends CartItemList {
  subtotal() {
    return cy.get("[data-test='subtotal-label']");
  }

  tax() {
    return cy.get("[data-test='tax-label']");
  }

  total() {
    return cy.get("[data-test='total-label']");
  }

  /**
   * Devuelve (como chainable) los montos del resumen ya convertidos a número:
   * { subtotal, tax, total }.
   */
  getTotals() {
    return cy.get("[data-test='checkout-summary-container']").then(($summary) => ({
      subtotal: parsePrice($summary.find("[data-test='subtotal-label']").text()),
      tax: parsePrice($summary.find("[data-test='tax-label']").text()),
      total: parsePrice($summary.find("[data-test='total-label']").text()),
    }));
  }

  finish() {
    cy.get("[data-test='finish']").click();
    return this;
  }
}

export default new CheckoutStepTwoPage();
