"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fontStackFor = fontStackFor;
exports.useBrandFontReady = useBrandFontReady;
const fonts_1 = require("@remotion/fonts");
const react_1 = require("react");
const remotion_1 = require("remotion");
const tokens_1 = require("../core/tokens");
const resolve_src_1 = require("./resolve-src");
/** "Nunito Sans" → `"Nunito Sans", <fallback>`; uma pilha já com vírgulas ganha só o fallback. */
function fontStackFor(fontFamily) {
    const trimmed = fontFamily.trim();
    const primary = trimmed.includes(',') || /^["']/.test(trimmed) || !/\s/.test(trimmed)
        ? trimmed
        : `"${trimmed}"`;
    return `${primary}, ${tokens_1.FALLBACK_FONT_STACK}`;
}
const loaded = new Map();
/**
 * Carrega `brand.fontUrl` (quando houver) antes de qualquer medição de texto:
 * devolve false até a fonte estar em `document.fonts`, e segura o render com
 * `delayRender` até o React reprocessar com a fonte pronta — assim o `fitText`
 * nunca mede com a fonte de fallback.
 */
function useBrandFontReady(brand) {
    const key = brand.fontUrl ? `${brand.fontFamily}|${brand.fontUrl}` : null;
    const [ready, setReady] = (0, react_1.useState)(key === null);
    const [handle] = (0, react_1.useState)(() => (key ? (0, remotion_1.delayRender)(`Fonte da marca: ${brand.fontFamily}`) : null));
    (0, react_1.useEffect)(() => {
        if (!key || !brand.fontUrl)
            return;
        let promise = loaded.get(key);
        if (!promise) {
            promise = (0, fonts_1.loadFont)({ family: brand.fontFamily.trim(), url: (0, resolve_src_1.resolveAssetSrc)(brand.fontUrl) });
            loaded.set(key, promise);
        }
        let cancelled = false;
        promise.then(() => {
            if (!cancelled)
                setReady(true);
        }, (err) => {
            // Fonte indisponível: segue com o fallback (determinístico) em vez de travar o render.
            console.warn(`Falha ao carregar a fonte ${brand.fontFamily}:`, err);
            if (!cancelled)
                setReady(true);
        });
        return () => {
            cancelled = true;
        };
    }, [key, brand.fontFamily, brand.fontUrl]);
    (0, react_1.useEffect)(() => {
        if (ready && handle !== null)
            (0, remotion_1.continueRender)(handle);
    }, [ready, handle]);
    return ready;
}
//# sourceMappingURL=fonts.js.map