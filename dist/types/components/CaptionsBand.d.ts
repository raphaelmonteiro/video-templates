import React from 'react';
import { CaptionPage } from '../core/captions';
import type { PxRect } from '../core/layout';
/**
 * Legenda por palavra (páginas do createTikTokStyleCaptions) dentro da faixa
 * da área segura, com a palavra ativa destacada. A página inteira cabe na
 * faixa: fonte por `fitText` limitada a [min, max]; abaixo do mínimo, quebra em
 * até duas linhas no mínimo. A palavra ativa muda de cor.
 */
export declare const CaptionsBand: React.FC<{
    pages: CaptionPage[];
    rect: PxRect;
    timeMs: number;
    fonts: {
        family: string;
        ready: boolean;
    };
    highlightColor: string;
}>;
//# sourceMappingURL=CaptionsBand.d.ts.map