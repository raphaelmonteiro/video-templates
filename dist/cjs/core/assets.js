"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAbsoluteAssetUrl = isAbsoluteAssetUrl;
/** URL absoluta (http/https/data/blob)? Caso contrário é caminho relativo a `public/`. */
function isAbsoluteAssetUrl(src) {
    return /^(?:https?:|data:|blob:)/i.test(src);
}
//# sourceMappingURL=assets.js.map