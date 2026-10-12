"use strict";
/**
 * Design tokens da composição OfferCarousel. Valores em pixels são do quadro
 * de saída (1080p); tempos em segundos. Nada aqui depende de React.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokens = exports.FALLBACK_FONT_STACK = exports.OFFER_CAROUSEL_FPS = void 0;
exports.OFFER_CAROUSEL_FPS = 30;
/**
 * Pilha de fontes de fallback. DejaVu Sans é a fonte que o preflight do worker
 * exige (D14; `ttf-dejavu` na imagem Alpine, `fonts-dejavu-core` na VM), então
 * o render do servidor é determinístico mesmo sem `brand.fontUrl`.
 */
exports.FALLBACK_FONT_STACK = '"DejaVu Sans", "Helvetica Neue", Helvetica, Arial, sans-serif';
exports.tokens = {
    font: {
        fallbackStack: exports.FALLBACK_FONT_STACK,
        weightRegular: 500,
        weightBold: 700,
        weightBlack: 800,
    },
    color: {
        cardBackground: '#FFFFFF',
        imageBackground: '#FFFFFF',
        cardText: '#17171C',
        mutedText: '#5C6070',
        strike: '#D32F2F',
        captionText: '#FFFFFF',
        captionStroke: '#000000',
        shadow: 'rgba(0, 0, 0, 0.28)',
    },
    radius: {
        card: 40,
        window: 36,
        image: 28,
    },
    layout: {
        /** Espaço entre regiões (personagem, cards, legendas), px. */
        gap: 24,
        /** Largura máxima do personagem nos presets laterais, fração da largura da área segura. */
        sideCharacterWidthFraction: 0.4,
        /** Altura do personagem no preset inferior, fração da altura útil. */
        bottomCharacterHeightFraction: 0.42,
        /** Faixa de legendas no topo da área segura (px), por orientação do quadro. */
        captionBandPortrait: 150,
        captionBandLandscape: 140,
        /** Card vertical não passa de 1,45 × a largura (fica centrado na região). */
        cardMaxHeightRatio: 1.45,
        /** Card horizontal não passa de 2,6 × a altura (fica centrado na região). */
        cardMaxWidthRatio: 2.6,
        /** Card com largura/altura ≥ este valor usa o arranjo horizontal (foto à esquerda). */
        horizontalCardMinAspect: 1.05,
        /** Menor card legível (px). */
        cardMinWidth: 280,
        cardMinHeight: 240,
        /** Folga da checagem de área segura: absorve o arredondamento das frações a 4 casas. */
        safeAreaTolerancePx: 1,
        /** Tolerância entre o aspecto da janela do personagem e o do tile (2%). */
        windowAspectTolerance: 0.02,
    },
    timing: {
        /** Transição de entrada do card: termina NA primeira palavra (spec: começa ≤ 0,5 s antes). */
        cardEntryS: 0.45,
        /** Limite da spec para o início da transição antes da primeira palavra. */
        cardMaxLeadS: 0.5,
        /** Cartela final: tempo com o logo depois do fim da última fala. */
        endcardPaddingS: 1.5,
        /** Fade (quadros) de entrada/saída de cada clipe sobre o pôster do personagem. */
        clipFadeFrames: 3,
        /** Legenda some este tempo depois da última palavra da página (s). */
        captionHoldS: 0.5,
        /** `combineTokensWithinMilliseconds` do createTikTokStyleCaptions. */
        captionCombineMs: 1200,
    },
    captions: {
        maxFontSize: 68,
        minFontSize: 38,
        lineHeight: 1.12,
        strokePx: 12,
    },
    card: {
        nameMaxFontSize: 72,
        nameMinFontSize: 26,
        nameLineHeight: 1.08,
        priceCurrencyScale: 0.42,
        priceCentsScale: 0.6,
        unitScale: 0.3,
        /** Deslocamento horizontal (px) da transição de entrada. */
        slidePx: 140,
    },
    music: {
        /** Atenuação durante as janelas de fala (dB) — spec: ≥ 12 LU abaixo. */
        duckDb: -14,
        /** Rampa de entrada/saída do ducking (s). */
        duckRampS: 0.25,
    },
};
//# sourceMappingURL=tokens.js.map