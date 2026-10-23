/**
 * Entrada do pacote `@chroma/video-templates`: núcleo puro (`./core`) + as
 * composições React para o `<Player>` do frontend e para o worker. O bundle do
 * Remotion usa `src/index.ts` (registerRoot), não este arquivo. O frontend da
 * peça de ofertas importa `./piece` (sem Remotion).
 */
export * from './core/index';
export { OfferCarousel } from './components/OfferCarousel';
export { calculateOfferCarouselMetadata } from './components/metadata';
export { resolveAssetSrc } from './components/resolve-src';
export { fontStackFor } from './components/fonts';
export { OfferPieceStill, calculateOfferPieceStillMetadata, usePieceFontsReady, } from './components/OfferPieceStill';
export { PieceCanvas, absoluteUrl, backgroundStyle, footerLines, pieceSafeArea, rectToPx, DEFAULT_PIECE_FONT, } from './components/piece/PieceCanvas';
//# sourceMappingURL=lib.js.map