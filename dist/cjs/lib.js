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
exports.fontStackFor = exports.resolveAssetSrc = exports.calculateOfferCarouselMetadata = exports.OfferCarousel = void 0;
/**
 * Entrada do pacote `@chroma/video-templates`: núcleo puro (`./core`) + a
 * composição React para o `<Player>` do frontend. O bundle do Remotion usa
 * `src/index.ts` (registerRoot), não este arquivo.
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
//# sourceMappingURL=lib.js.map