/**
 * Preços em pt-BR SEM aritmética: o texto do card é sempre a string congelada
 * do projeto ("24,90"), nunca um número reformatado — assim "8,99" nunca vira
 * "8.99" nem "8,990000001". Mesmo contrato de `formatOfferPrice` do backend
 * (mc-art-offers.ts): sem "R$", vírgula decimal, ponto de milhar opcional.
 */
/** "24,90", "1.299,00", "0,99". */
export const PRICE_PATTERN = /^(?:\d{1,3}(?:\.\d{3})+|\d+),\d{2}$/;
export const CURRENCY_SYMBOL = 'R$';
/** Remove "R$" e espaços das bordas; não altera dígitos nem separadores. */
export function normalizePrice(price) {
    return price
        .trim()
        .replace(/^R\$\s*/i, '')
        .trim();
}
export function isValidPrice(price) {
    return PRICE_PATTERN.test(normalizePrice(price));
}
function assertValidPrice(price) {
    const normalized = normalizePrice(price);
    if (!PRICE_PATTERN.test(normalized)) {
        throw new Error(`Preço inválido "${price}": use o formato pt-BR "24,90" (sem "R$")`);
    }
    return normalized;
}
/** "24,90" → "R$ 24,90" (exato, espaço simples entre o símbolo e o número). */
export function formatPrice(price) {
    return `${CURRENCY_SYMBOL} ${assertValidPrice(price)}`;
}
/**
 * Partes para a tipografia do card (símbolo menor, inteiro grande, centavos
 * menores). `currency + ' ' + integer + cents === formatPrice(price)`.
 */
export function priceParts(price) {
    const normalized = assertValidPrice(price);
    const comma = normalized.lastIndexOf(',');
    return {
        currency: CURRENCY_SYMBOL,
        integer: normalized.slice(0, comma),
        cents: normalized.slice(comma),
    };
}
/** Unidades curtas que viram sufixo "/kg"; o resto ("cada", "pct 500 g") aparece como veio. */
const SHORT_UNITS = /^(kg|g|mg|un|und|unid|l|lt|ml|cx|pct|dz|m)$/i;
export function formatUnit(unit) {
    const trimmed = unit?.trim();
    if (!trimmed)
        return null;
    if (trimmed.startsWith('/'))
        return trimmed;
    return SHORT_UNITS.test(trimmed) ? `/${trimmed}` : trimmed;
}
//# sourceMappingURL=price.js.map