/** URL absoluta (http/https/data/blob)? Caso contrário é caminho relativo a `public/`. */
export function isAbsoluteAssetUrl(src) {
    return /^(?:https?:|data:|blob:)/i.test(src);
}
//# sourceMappingURL=assets.js.map