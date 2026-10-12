import React from 'react';
import type { CardInnerLayout } from '../core/layout';
import type { OfferCarouselOffer } from '../core/types';
interface Fonts {
    family: string;
    ready: boolean;
}
/**
 * Card de oferta: foto inteira (object-fit contain, nunca cortada), nome
 * ajustado com `fitText` (1–2 linhas), preço atual em destaque a partir da
 * string congelada, preço anterior riscado, unidade e badge. Todo texto vem
 * dos dados das props — nada é gerado por modelo de imagem/vídeo.
 */
export declare const OfferCard: React.FC<{
    offer: OfferCarouselOffer;
    inner: CardInnerLayout;
    fonts: Fonts;
    accentColor: string;
    secondaryColor: string;
}>;
export {};
//# sourceMappingURL=OfferCard.d.ts.map