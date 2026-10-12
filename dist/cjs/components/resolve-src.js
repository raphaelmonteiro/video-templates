"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveAssetSrc = resolveAssetSrc;
const remotion_1 = require("remotion");
const assets_1 = require("../core/assets");
/** URL absoluta passa direto; caminho relativo vira `staticFile` (pasta public/ do bundle). */
function resolveAssetSrc(src) {
    return (0, assets_1.isAbsoluteAssetUrl)(src) ? src : (0, remotion_1.staticFile)(src);
}
//# sourceMappingURL=resolve-src.js.map