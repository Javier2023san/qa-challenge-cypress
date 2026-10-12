import InventoryPage from "../pages/InventoryPage";
import CartPage from "../pages/CartPage";
import CheckoutStepOnePage from "../pages/CheckoutStepOnePage";
import CheckoutStepTwoPage from "../pages/CheckoutStepTwoPage";
import CheckoutCompletePage from "../pages/CheckoutCompletePage";
import { sumPrices } from "../support/helpers";

/**
 * E2E - flujo completo de compra en Sauce Demo (standard_user).
 *
 * Decisión: los 3 productos a comprar se leen de lo que muestra el catálogo
 * (las primeras 3 tarjetas), no se hardcodean por nombre. El enunciado pide
 * validar "nombre de los productos seleccionados", así que todas las
 * assertions posteriores comparan contra esa selección capturada en vez de
 * strings literales: el test sigue funcionando aunque cambien el catálogo,
 * los precios o el orden.
 */
describe("Sauce Demo - Flujo de compra end-to-end", () => {
  const PRODUCTS_TO_BUY = 3;

  beforeEach(() => {
    // Precondición: usuario logueado en el catálogo (el login está fuera del
    // alcance de la prueba, ver support/commands.js)
    cy.login();

    // Datos de checkout desde un fixture (no hardcodeados en el spec)
    cy.fixture("checkout-info.json").as("checkoutInfo");

    // Productos seleccionados dinámicamente desde el catálogo
    InventoryPage.getFirstProducts(PRODUCTS_TO_BUY).as("selectedProducts");
  });

  it("permite seleccionar productos, comprarlos y ver la confirmación final", function () {
    // `function` (y no arrow) para acceder a los alias con this.<alias>
    const { selectedProducts, checkoutInfo } = this;
    const expectedCartItems = selectedProducts.map(({ name, price }) => ({
      name,
      price,
      quantity: "1", // cada producto se agrega una sola vez
    }));

    // 1 y 2. Seleccionar 3 productos y agregarlos al carrito
    selectedProducts.forEach(({ name }) => InventoryPage.addProductToCartByName(name));
    InventoryPage.cartBadge().should("have.text", String(PRODUCTS_TO_BUY));

    // 3. Acceder al carrito
    InventoryPage.goToCart();
    cy.url().should("include", "/cart.html");
    CartPage.title().should("have.text", "Your Cart");

    // 4. Validar cantidad de productos, nombres, precios individuales e
    // información mostrada en el carrito (cantidad por ítem y descripción)
    CartPage.items().should("have.length", PRODUCTS_TO_BUY);
    CartPage.getDisplayedItems().should("deep.equal", expectedCartItems);
    CartPage.itemDescriptions().each(($desc) => {
      expect($desc.text().trim(), "descripción del producto").to.not.be.empty;
    });

    // 5. Iniciar el checkout
    CartPage.checkout();
    cy.url().should("include", "/checkout-step-one.html");

    // 6. Completar los datos requeridos
    CheckoutStepOnePage.fillInfo(checkoutInfo).continueToOverview();
    cy.url().should("include", "/checkout-step-two.html");

    // El resumen muestra los mismos productos, y los montos son coherentes:
    // subtotal = suma de los precios seleccionados, y total = subtotal + tax
    CheckoutStepTwoPage.getDisplayedItems().should("deep.equal", expectedCartItems);
    CheckoutStepTwoPage.getTotals().then(({ subtotal, tax, total }) => {
      const expectedSubtotal = sumPrices(selectedProducts.map((p) => p.price));
      expect(subtotal, "subtotal = suma de precios").to.be.closeTo(expectedSubtotal, 0.001);
      expect(tax, "impuesto").to.be.greaterThan(0);
      expect(total, "total = subtotal + impuesto").to.be.closeTo(subtotal + tax, 0.001);
    });

    // 7. Finalizar la compra
    CheckoutStepTwoPage.finish();
    cy.url().should("include", "/checkout-complete.html");

    // 8. Validar el mensaje final de confirmación
    CheckoutCompletePage.header().should("have.text", "Thank you for your order!");
    CheckoutCompletePage.text().should("contain", "Your order has been dispatched");
    InventoryPage.cartBadge().should("not.exist"); // el carrito quedó vacío
  });

  it("no permite continuar el checkout con los datos del comprador vacíos", function () {
    InventoryPage.addProductToCartByName(this.selectedProducts[0].name).goToCart();
    CartPage.checkout();
    cy.url().should("include", "/checkout-step-one.html");

    CheckoutStepOnePage.continueToOverview();

    CheckoutStepOnePage.errorMessage().should("contain", "First Name is required");
    cy.url().should("include", "/checkout-step-one.html");
  });
});
