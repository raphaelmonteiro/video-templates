"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_PIECE_FONT = exports.rectToPx = exports.pieceSafeArea = exports.footerLines = exports.backgroundStyle = exports.absoluteUrl = exports.PieceCanvas = exports.usePieceFontsReady = exports.calculateOfferPieceStillMetadata = exports.OfferPieceStill = exports.fontStackFor = exports.resolveAssetSrc = exports.calculateOfferCarouselMetadata = exports.OfferCarousel = void 0;
/**
 * Entrada do pacote `@chroma/video-templates`: núcleo puro (`./core`) + as
 * composições React para o `<Player>` do frontend e para o worker. O bundle do
 * Remotion usa `src/index.ts` (registerRoot), não este arquivo. O frontend da
 * peça de ofertas importa `./piece` (sem Remotion).
 */
__exportStar(require("./core/index"), exports);
var OfferCarousel_1 = require("./components/OfferCarousel");
Object.defineProperty(exports, "OfferCarousel", { enumerable: true, get: function () { return OfferCarousel_1.OfferCarousel; } });
var metadata_1 = require("./components/metadata");
Object.defineProperty(exports, "calculateOfferCarouselMetadata", { enumerable: true, get: function () { return metadata_1.calculateOfferCarouselMetadata; } });
var resolve_src_1 = require("./components/resolve-src");
Object.defineProperty(exports, "resolveAssetSrc", { enumerable: true, get: function () { return resolve_src_1.resolveAssetSrc; } });
var fonts_1 = require("./components/fonts");
Object.defineProperty(exports, "fontStackFor", { enumerable: true, get: function () { return fonts_1.fontStackFor; } });
var OfferPieceStill_1 = require("./components/OfferPieceStill");
Object.defineProperty(exports, "OfferPieceStill", { enumerable: true, get: function () { return OfferPieceStill_1.OfferPieceStill; } });
Object.defineProperty(exports, "calculateOfferPieceStillMetadata", { enumerable: true, get: function () { return OfferPieceStill_1.calculateOfferPieceStillMetadata; } });
Object.defineProperty(exports, "usePieceFontsReady", { enumerable: true, get: function () { return OfferPieceStill_1.usePieceFontsReady; } });
var PieceCanvas_1 = require("./components/piece/PieceCanvas");
Object.defineProperty(exports, "PieceCanvas", { enumerable: true, get: function () { return PieceCanvas_1.PieceCanvas; } });
Object.defineProperty(exports, "absoluteUrl", { enumerable: true, get: function () { return PieceCanvas_1.absoluteUrl; } });
Object.defineProperty(exports, "backgroundStyle", { enumerable: true, get: function () { return PieceCanvas_1.backgroundStyle; } });
Object.defineProperty(exports, "footerLines", { enumerable: true, get: function () { return PieceCanvas_1.footerLines; } });
Object.defineProperty(exports, "pieceSafeArea", { enumerable: true, get: function () { return PieceCanvas_1.pieceSafeArea; } });
Object.defineProperty(exports, "rectToPx", { enumerable: true, get: function () { return PieceCanvas_1.rectToPx; } });
Object.defineProperty(exports, "DEFAULT_PIECE_FONT", { enumerable: true, get: function () { return PieceCanvas_1.DEFAULT_PIECE_FONT; } });
//# sourceMappingURL=lib.js.map