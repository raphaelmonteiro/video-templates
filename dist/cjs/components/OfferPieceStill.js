"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateOfferPieceStillMetadata = exports.OfferPieceStill = void 0;
exports.usePieceFontsReady = usePieceFontsReady;
const jsx_runtime_1 = require("react/jsx-runtime");
const fonts_1 = require("@remotion/fonts");
const react_1 = require("react");
const remotion_1 = require("remotion");
const schema_1 = require("../core/piece/schema");
const PieceCanvas_1 = require("./piece/PieceCanvas");
const resolve_src_1 = require("./resolve-src");
/** `<Img>` do Remotion aceita as props do canvas (src/alt/style/draggable); só os propTypes do `draggable` divergem (Booleanish). */
const RemotionImg = remotion_1.Img;
/**
 * Composição `OfferPieceStill` (change video-peca-configuravel, tarefas 3.3 e
 * 3.4): UM quadro da peça de ofertas, desenhado pelo mesmo `PieceCanvas` da
 * prévia do editor. O worker chama `renderStill` com as props de
 * `buildOfferPieceStillProps` (mídias e fontes em URL absoluta); o PNG vira o
 * asset `piece_still` e a arte de fundo do `compose_ffmpeg`.
 *
 * Fontes da conta: cada `fonts[i]` é carregada com `loadFont` antes do quadro,
 * com `delayRender`/`continueRender` — texto nunca sai na fonte de fallback
 * por corrida. Fonte indisponível segue com o fallback (determinístico) em vez
 * de travar o render. Imagens vão pelo `<Img>` do Remotion (segura o quadro
 * até carregar) e as URLs relativas (fixtures) por `staticFile`.
 */
const loaded = new Map();
function fontKey(fonts) {
    return fonts.map((f) => `${f.family}|${f.url}`).join('\n');
}
/** true quando todas as fontes da peça estão em `document.fonts` (ou falharam e o fallback vale). */
function usePieceFontsReady(fonts) {
    const key = fontKey(fonts);
    const [ready, setReady] = (0, react_1.useState)(fonts.length === 0);
    const [handle] = (0, react_1.useState)(() => (fonts.length > 0 ? (0, remotion_1.delayRender)('Fontes da peça') : null));
    (0, react_1.useEffect)(() => {
        if (fonts.length === 0)
            return;
        let cancelled = false;
        const all = fonts.map((font) => {
            const id = `${font.family}|${font.url}`;
            let promise = loaded.get(id);
            if (!promise) {
                promise = (0, fonts_1.loadFont)({ family: font.family.trim(), url: (0, resolve_src_1.resolveAssetSrc)(font.url) }).catch((err) => {
                    console.warn(`Falha ao carregar a fonte ${font.family}:`, err);
                });
                loaded.set(id, promise);
            }
            return promise;
        });
        Promise.all(all).then(() => {
            if (!cancelled)
                setReady(true);
        });
        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key]);
    (0, react_1.useEffect)(() => {
        if (ready && handle !== null)
            (0, remotion_1.continueRender)(handle);
    }, [ready, handle]);
    return ready;
}
const OfferPieceStill = ({ document, width, height, fonts }) => {
    usePieceFontsReady(fonts ?? document.fonts ?? []);
    return ((0, jsx_runtime_1.jsx)(remotion_1.AbsoluteFill, { style: { background: '#000000' }, children: (0, jsx_runtime_1.jsx)(PieceCanvas_1.PieceCanvas, { document: document, width: width, height: height, imgComponent: RemotionImg, resolveAssetUrl: resolve_src_1.resolveAssetSrc }) }));
};
exports.OfferPieceStill = OfferPieceStill;
/**
 * `calculateMetadata` do quadro: tamanho das props. Recusa props que o schema
 * rejeita (o backend valida antes; defesa em profundidade, como no OfferCarousel).
 */
const calculateOfferPieceStillMetadata = ({ props, }) => {
    const parsed = (0, schema_1.parseOfferPieceStillProps)(props);
    if (!parsed.success) {
        throw new Error(`Props do quadro da peça inválidas: ${parsed.issues
            .map((i) => `${i.path || '(raiz)'}: ${i.message}`)
            .join(' | ')}`);
    }
    return { width: props.width, height: props.height };
};
exports.calculateOfferPieceStillMetadata = calculateOfferPieceStillMetadata;
//# sourceMappingURL=OfferPieceStill.js.map