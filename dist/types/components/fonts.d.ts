import type { OfferCarouselBrand } from '../core/types';
/** "Nunito Sans" → `"Nunito Sans", <fallback>`; uma pilha já com vírgulas ganha só o fallback. */
export declare function fontStackFor(fontFamily: string): string;
/**
 * Carrega `brand.fontUrl` (quando houver) antes de qualquer medição de texto:
 * devolve false até a fonte estar em `document.fonts`, e segura o render com
 * `delayRender` até o React reprocessar com a fonte pronta — assim o `fitText`
 * nunca mede com a fonte de fallback.
 */
export declare function useBrandFontReady(brand: Pick<OfferCarouselBrand, 'fontFamily' | 'fontUrl'>): boolean;
//# sourceMappingURL=fonts.d.ts.map