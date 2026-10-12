import type { OfferCarouselLine, OfferCarouselProps } from './types';
/**
 * Timing PURO dos cards (spec video-offer-carousel "Card sincronizado com a
 * fala"; design D8): a transição de entrada de cada card TERMINA na primeira
 * palavra da fala da sua oferta e começa no máximo 0,5 s antes; o card fica
 * até a entrada do card seguinte (a saída acontece na MESMA janela da entrada
 * do próximo, como um "empurra") ou até o card de fechamento. Abertura e
 * fechamento mostram o logo do cliente na mesma caixa. Os instantes vêm dos
 * timestamps do TTS; sem palavras, cai no início da fala (o backend bloqueia
 * esse caso antes com SPEECH_ALIGNMENT_MISSING).
 */
export type CardSlotKind = 'opening' | 'offer' | 'closing';
export interface CardSlot {
    kind: CardSlotKind;
    /** offerId para ofertas; id da fala para abertura/fechamento. */
    id: string;
    lineId: string;
    offerId: string | null;
    /** Primeira palavra da fala (s) — onde a entrada termina. */
    anchorS: number;
    enterStartS: number;
    enterEndS: number;
    /** Janela da saída (= janela de entrada do card seguinte); null = fica até o fim. */
    exitStartS: number | null;
    exitEndS: number | null;
    /** true quando a fala não tinha palavras e o âncora caiu no início da fala. */
    anchorFromLineStart: boolean;
}
export interface CardTimelineOptions {
    /** Duração da transição de entrada (s); ≤ 0,5 (spec). */
    entryS?: number;
}
/** Instante da primeira palavra da fala; sem alinhamento, o início da fala. */
export declare function firstWordS(line: Pick<OfferCarouselLine, 'startS' | 'words'>): number;
/** Linha do tempo dos cards na ordem das falas: [abertura, ofertas..., fechamento]. */
export declare function computeCardTimeline(props: Pick<OfferCarouselProps, 'lines'>, options?: CardTimelineOptions): CardSlot[];
export interface CardVisualState {
    /** O card precisa ser desenhado neste instante. */
    visible: boolean;
    /** Progresso da entrada 0..1 (1 = totalmente visível). */
    enter: number;
    /** Progresso da saída 0..1 (1 = já saiu). */
    exit: number;
}
/** Estado do card no instante `tS` (s). */
export declare function cardStateAt(slot: CardSlot, tS: number): CardVisualState;
/** Segundos → quadro (arredondamento único usado por clipes e cards). */
export declare function secondsToFrame(seconds: number, fps: number): number;
/** Fim do conteúdo falado (s): fim da última fala ou do último clipe. */
export declare function contentEndS(props: Pick<OfferCarouselProps, 'lines' | 'character'>): number;
/**
 * Duração da composição em quadros: fim da última fala (ou clipe) + cartela
 * final (`endcardPaddingS`), arredondado para cima. É o que o
 * `calculateMetadata` devolve e o que a prévia (Player) deve usar.
 */
export declare function computeDurationInFrames(props: Pick<OfferCarouselProps, 'lines' | 'character' | 'fps'>, endcardPaddingS?: number): number;
export interface DuckingOptions {
    /** Atenuação nas falas (dB, negativa). */
    duckDb?: number;
    /** Rampa (s) antes/depois de cada fala. */
    rampS?: number;
}
/**
 * Ganho da música (0..1, multiplica o volume base) no instante `tS`: atenuado
 * em `duckDb` dentro das janelas de fala, com rampas lineares de `rampS` nas
 * bordas. Determinístico (derivado só dos tempos das falas).
 */
export declare function musicGainAt(tS: number, lines: Pick<OfferCarouselLine, 'startS' | 'endS'>[], options?: DuckingOptions): number;
//# sourceMappingURL=timing.d.ts.map