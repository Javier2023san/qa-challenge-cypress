/**
 * Helpers planos (lógica pura, sin comandos de Cypress).
 */

/**
 * Convierte un texto con precio a número. Sirve tanto para "$29.99" como
 * para etiquetas del resumen como "Item total: $129.94" o "Tax: $10.40".
 */
export function parsePrice(text) {
  const match = String(text).match(/\$\s*([\d.,]+)/);
  if (!match) {
    throw new Error(`No se encontró un precio en el texto: "${text}"`);
  }
  return Number(match[1].replace(/,/g, ""));
}

/** Suma una lista de precios en formato texto ("$29.99"). */
export function sumPrices(prices) {
  return prices.reduce((sum, price) => sum + parsePrice(price), 0);
}
