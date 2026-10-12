/**
 * Preços em pt-BR SEM aritmética: o texto do card é sempre a string congelada
 * do projeto ("24,90"), nunca um número reformatado — assim "8,99" nunca vira
 * "8.99" nem "8,990000001". Mesmo contrato de `formatOfferPrice` do backend
 * (mc-art-offers.ts): sem "R$", vírgula decimal, ponto de milhar opcional.
 */
/** "24,90", "1.299,00", "0,99". */
export declare const PRICE_PATTERN: RegExp;
export declare const CURRENCY_SYMBOL = "R$";
/** Remove "R$" e espaços das bordas; não altera dígitos nem separadores. */
export declare function normalizePrice(price: string): string;
export declare function isValidPrice(price: string): boolean;
/** "24,90" → "R$ 24,90" (exato, espaço simples entre o símbolo e o número). */
export declare function formatPrice(price: string): string;
export interface PriceParts {
    currency: string;
    /** Parte inteira com o ponto de milhar original ("1.299"). */
    integer: string;
    /** Vírgula + centavos (",90"). */
    cents: string;
}
/**
 * Partes para a tipografia do card (símbolo menor, inteiro grande, centavos
 * menores). `currency + ' ' + integer + cents === formatPrice(price)`.
 */
export declare function priceParts(price: string): PriceParts;
export declare function formatUnit(unit: string | null | undefined): string | null;
//# sourceMappingURL=price.d.ts.map