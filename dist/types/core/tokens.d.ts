/**
 * Design tokens da composição OfferCarousel. Valores em pixels são do quadro
 * de saída (1080p); tempos em segundos. Nada aqui depende de React.
 */
export declare const OFFER_CAROUSEL_FPS = 30;
/**
 * Pilha de fontes de fallback. DejaVu Sans é a fonte que o preflight do worker
 * exige (D14; `ttf-dejavu` na imagem Alpine, `fonts-dejavu-core` na VM), então
 * o render do servidor é determinístico mesmo sem `brand.fontUrl`.
 */
export declare const FALLBACK_FONT_STACK = "\"DejaVu Sans\", \"Helvetica Neue\", Helvetica, Arial, sans-serif";
export declare const tokens: {
    readonly font: {
        readonly fallbackStack: "\"DejaVu Sans\", \"Helvetica Neue\", Helvetica, Arial, sans-serif";
        readonly weightRegular: 500;
        readonly weightBold: 700;
        readonly weightBlack: 800;
    };
    readonly color: {
        readonly cardBackground: "#FFFFFF";
        readonly imageBackground: "#FFFFFF";
        readonly cardText: "#17171C";
        readonly mutedText: "#5C6070";
        readonly strike: "#D32F2F";
        readonly captionText: "#FFFFFF";
        readonly captionStroke: "#000000";
        readonly shadow: "rgba(0, 0, 0, 0.28)";
    };
    readonly radius: {
        readonly card: 40;
        readonly window: 36;
        readonly image: 28;
    };
    readonly layout: {
        /** Espaço entre regiões (personagem, cards, legendas), px. */
        readonly gap: 24;
        /** Largura máxima do personagem nos presets laterais, fração da largura da área segura. */
        readonly sideCharacterWidthFraction: 0.4;
        /** Altura do personagem no preset inferior, fração da altura útil. */
        readonly bottomCharacterHeightFraction: 0.42;
        /** Faixa de legendas no topo da área segura (px), por orientação do quadro. */
        readonly captionBandPortrait: 150;
        readonly captionBandLandscape: 140;
        /** Card vertical não passa de 1,45 × a largura (fica centrado na região). */
        readonly cardMaxHeightRatio: 1.45;
        /** Card horizontal não passa de 2,6 × a altura (fica centrado na região). */
        readonly cardMaxWidthRatio: 2.6;
        /** Card com largura/altura ≥ este valor usa o arranjo horizontal (foto à esquerda). */
        readonly horizontalCardMinAspect: 1.05;
        /** Menor card legível (px). */
        readonly cardMinWidth: 280;
        readonly cardMinHeight: 240;
        /** Folga da checagem de área segura: absorve o arredondamento das frações a 4 casas. */
        readonly safeAreaTolerancePx: 1;
        /** Tolerância entre o aspecto da janela do personagem e o do tile (2%). */
        readonly windowAspectTolerance: 0.02;
    };
    readonly timing: {
        /** Transição de entrada do card: termina NA primeira palavra (spec: começa ≤ 0,5 s antes). */
        readonly cardEntryS: 0.45;
        /** Limite da spec para o início da transição antes da primeira palavra. */
        readonly cardMaxLeadS: 0.5;
        /** Cartela final: tempo com o logo depois do fim da última fala. */
        readonly endcardPaddingS: 1.5;
        /** Fade (quadros) de entrada/saída de cada clipe sobre o pôster do personagem. */
        readonly clipFadeFrames: 3;
        /** Legenda some este tempo depois da última palavra da página (s). */
        readonly captionHoldS: 0.5;
        /** `combineTokensWithinMilliseconds` do createTikTokStyleCaptions. */
        readonly captionCombineMs: 1200;
    };
    readonly captions: {
        readonly maxFontSize: 68;
        readonly minFontSize: 38;
        readonly lineHeight: 1.12;
        readonly strokePx: 12;
    };
    readonly card: {
        readonly nameMaxFontSize: 72;
        readonly nameMinFontSize: 26;
        readonly nameLineHeight: 1.08;
        readonly priceCurrencyScale: 0.42;
        readonly priceCentsScale: 0.6;
        readonly unitScale: 0.3;
        /** Deslocamento horizontal (px) da transição de entrada. */
        readonly slidePx: 140;
    };
    readonly music: {
        /** Atenuação durante as janelas de fala (dB) — spec: ≥ 12 LU abaixo. */
        readonly duckDb: -14;
        /** Rampa de entrada/saída do ducking (s). */
        readonly duckRampS: 0.25;
    };
};
export type OfferCarouselTokens = typeof tokens;
//# sourceMappingURL=tokens.d.ts.map