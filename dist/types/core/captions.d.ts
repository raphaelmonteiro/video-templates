import type { Caption } from '@remotion/captions';
import type { OfferCarouselLine, OfferCarouselProps } from './types';
/**
 * Legendas por palavra (spec video-composition-render "Legendas por formato";
 * design D8): as palavras das falas (timestamps absolutos) viram `Caption[]`
 * do @remotion/captions e páginas no estilo TikTok com `createTikTokStyleCaptions`.
 * Uma página nunca atravessa duas falas.
 */
export declare const CAPTIONS_ALIGNMENT_MISSING = "CAPTIONS_ALIGNMENT_MISSING";
export type CaptionsReadiness = {
    ok: true;
    code: null;
    captionsEnabled: boolean;
    missingLineIds: [];
} | {
    ok: false;
    code: typeof CAPTIONS_ALIGNMENT_MISSING;
    captionsEnabled: true;
    missingLineIds: string[];
    message: string;
};
/**
 * Legendas pedidas e alguma fala sem palavras → `CAPTIONS_ALIGNMENT_MISSING`
 * para o backend BLOQUEAR (aviso + aceite explícito, nunca omitir em
 * silêncio). A composição, nesse caso, apenas não desenha legendas.
 */
export declare function captionsReadiness(props: Pick<OfferCarouselProps, 'captions' | 'lines'>): CaptionsReadiness;
/** A composição só desenha legendas quando ligadas E prontas (todas as falas com palavras). */
export declare function shouldRenderCaptions(props: Pick<OfferCarouselProps, 'captions' | 'lines'>): boolean;
/**
 * Palavras de UMA fala → `Caption[]` em ms absolutos. Convenção do
 * @remotion/captions: a partir da segunda palavra o texto leva o espaço
 * inicial; a última palavra da fala marca `pageBreakAfter`.
 */
export declare function lineToCaptions(line: Pick<OfferCarouselLine, 'words'>): Caption[];
export interface CaptionToken {
    text: string;
    fromMs: number;
    toMs: number;
}
export interface CaptionPage {
    lineId: string;
    text: string;
    startMs: number;
    /** Fim de exibição: início da próxima página ou última palavra + `captionHoldS`. */
    endMs: number;
    tokens: CaptionToken[];
}
export interface CaptionPagesOptions {
    combineTokensWithinMilliseconds?: number;
    holdMs?: number;
}
/** Páginas de legenda de todas as falas, em ordem, sem atravessar falas. */
export declare function buildCaptionPages(lines: Pick<OfferCarouselLine, 'id' | 'words'>[], options?: CaptionPagesOptions): CaptionPage[];
/** Página visível em `tMs`, ou null. */
export declare function activeCaptionPage(pages: CaptionPage[], tMs: number): CaptionPage | null;
/** Índice da palavra destacada: a última que já começou (−1 antes da primeira). */
export declare function activeTokenIndex(page: CaptionPage, tMs: number): number;
//# sourceMappingURL=captions.d.ts.map