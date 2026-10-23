import React from 'react';
import { type CalculateMetadataFunction } from 'remotion';
import type { OfferPieceStillProps, PieceFont } from '../core/piece/types';
/** true quando todas as fontes da peça estão em `document.fonts` (ou falharam e o fallback vale). */
export declare function usePieceFontsReady(fonts: PieceFont[]): boolean;
export declare const OfferPieceStill: React.FC<OfferPieceStillProps>;
/**
 * `calculateMetadata` do quadro: tamanho das props. Recusa props que o schema
 * rejeita (o backend valida antes; defesa em profundidade, como no OfferCarousel).
 */
export declare const calculateOfferPieceStillMetadata: CalculateMetadataFunction<OfferPieceStillProps>;
//# sourceMappingURL=OfferPieceStill.d.ts.map