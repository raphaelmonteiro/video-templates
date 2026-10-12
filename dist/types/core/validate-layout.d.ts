import { PxRect } from './layout';
import { SafeAreaPx } from './safe-area';
import type { OfferCarouselProps } from './types';
/**
 * Validação do layout contra a área segura do tamanho de saída (spec
 * video-composition-render "Tamanhos e áreas seguras"; design D13). Pura:
 * o backend chama antes de enfileirar o render (recusa apontando o elemento)
 * e a composição repete a checagem no `calculateMetadata` (defesa em
 * profundidade: o render falha antes do primeiro quadro).
 *
 * Os cards compartilham a mesma caixa; um problema na caixa gera UM item por
 * card afetado (cada oferta e o card de logo da abertura/fechamento), cada um
 * apontando o card pelo id e pelo nome.
 */
export type LayoutIssueCode = 'UNSUPPORTED_SIZE' | 'ELEMENT_OUTSIDE_SAFE_AREA' | 'CARD_OVERLAPS_CHARACTER' | 'CAPTIONS_OVERLAP_ELEMENT' | 'WINDOW_ASPECT_MISMATCH' | 'CARD_TOO_SMALL';
export type LayoutElement = 'frame' | 'character_window' | 'card' | 'logo_card' | 'captions';
export type SafeAreaEdge = 'left' | 'top' | 'right' | 'bottom';
export interface LayoutIssue {
    code: LayoutIssueCode;
    element: LayoutElement;
    /** Id da oferta (cards), `logo` (card da abertura/fechamento) ou null. */
    elementId: string | null;
    message: string;
    details: {
        rect?: PxRect;
        safeArea?: SafeAreaPx;
        edges?: SafeAreaEdge[];
        /** Distância (px) de cada borda vazada até a borda do quadro. */
        distanceToFrameEdgePx?: Partial<Record<SafeAreaEdge, number>>;
        other?: LayoutElement;
        [key: string]: unknown;
    };
}
type ValidateProps = Pick<OfferCarouselProps, 'width' | 'height' | 'character' | 'layoutPreset' | 'captions' | 'cardBox' | 'offers'>;
/**
 * Problemas do layout; lista vazia = layout aceito. Checagens:
 * tamanho suportado; janela do personagem dentro da área segura e no aspecto
 * do tile (±2%); cada card dentro da área segura, sem sobrepor o personagem e
 * com tamanho mínimo legível; faixa de legendas dentro da área segura e sem
 * sobrepor personagem nem cards (quando ligadas). Os elementos internos do
 * card (texto, preço, badge) ficam dentro do card por construção.
 */
export declare function validateLayout(props: ValidateProps): LayoutIssue[];
/** Retângulos absolutos dos elementos internos do card (útil para depurar e para a prévia). */
export declare function cardElementRects(props: ValidateProps): {
    card: PxRect;
    image: PxRect;
    badge: PxRect;
    name: PxRect;
    originalPrice: PxRect;
    price: PxRect;
};
export {};
//# sourceMappingURL=validate-layout.d.ts.map