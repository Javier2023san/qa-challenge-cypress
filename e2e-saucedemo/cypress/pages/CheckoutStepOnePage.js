/**
 * Page Object de /checkout-step-one.html (datos del comprador).
 */
class CheckoutStepOnePage {
  fillInfo({ firstName, lastName, postalCode }) {
    cy.get("[data-test='firstName']").type(firstName);
    cy.get("[data-test='lastName']").type(lastName);
    cy.get("[data-test='postalCode']").type(postalCode);
    return this;
  }

  errorMessage() {
    return cy.get("[data-test='error']");
  }

  continueToOverview() {
    cy.get("[data-test='continue']").click();
    return this;
  }
}

export default new CheckoutStepOnePage();
