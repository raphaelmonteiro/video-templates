import React from 'react';
import type { PxRect } from '../core/layout';
import type { OfferCarouselCharacter } from '../core/types';
/**
 * Personagem numa região FIXA do quadro, no aspecto do tile, durante o vídeo
 * inteiro. Cada fala tem um clipe conformado ao seu áudio (D7) colocado no seu
 * instante com `<Sequence>`; o áudio da fala vem do próprio clipe (TTS
 * muxado). Entre falas fica o pôster (tile de fala parado), com fade curto do
 * clipe sobre ele para suavizar o corte.
 */
export declare const CharacterWindow: React.FC<{
    character: OfferCarouselCharacter;
    rect: PxRect;
    fps: number;
    fallbackColor: string;
}>;
//# sourceMappingURL=CharacterWindow.d.ts.map