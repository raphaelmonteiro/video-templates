import { jsx as _jsx } from "react/jsx-runtime";
import { loadFont } from '@remotion/fonts';
import { useEffect, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender, Img, } from 'remotion';
import { parseOfferPieceStillProps } from '../core/piece/schema';
import { PieceCanvas } from './piece/PieceCanvas';
import { resolveAssetSrc } from './resolve-src';
/** `<Img>` do Remotion aceita as props do canvas (src/alt/style/draggable); só os propTypes do `draggable` divergem (Booleanish). */
const RemotionImg = Img;
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
export function usePieceFontsReady(fonts) {
    const key = fontKey(fonts);
    const [ready, setReady] = useState(fonts.length === 0);
    const [handle] = useState(() => (fonts.length > 0 ? delayRender('Fontes da peça') : null));
    useEffect(() => {
        if (fonts.length === 0)
            return;
        let cancelled = false;
        const all = fonts.map((font) => {
            const id = `${font.family}|${font.url}`;
            let promise = loaded.get(id);
            if (!promise) {
                promise = loadFont({ family: font.family.trim(), url: resolveAssetSrc(font.url) }).catch((err) => {
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
    useEffect(() => {
        if (ready && handle !== null)
            continueRender(handle);
    }, [ready, handle]);
    return ready;
}
export const OfferPieceStill = ({ document, width, height, fonts }) => {
    usePieceFontsReady(fonts ?? document.fonts ?? []);
    return (_jsx(AbsoluteFill, { style: { background: '#000000' }, children: _jsx(PieceCanvas, { document: document, width: width, height: height, imgComponent: RemotionImg, resolveAssetUrl: resolveAssetSrc }) }));
};
/**
 * `calculateMetadata` do quadro: tamanho das props. Recusa props que o schema
 * rejeita (o backend valida antes; defesa em profundidade, como no OfferCarousel).
 */
export const calculateOfferPieceStillMetadata = ({ props, }) => {
    const parsed = parseOfferPieceStillProps(props);
    if (!parsed.success) {
        throw new Error(`Props do quadro da peça inválidas: ${parsed.issues
            .map((i) => `${i.path || '(raiz)'}: ${i.message}`)
            .join(' | ')}`);
    }
    return { width: props.width, height: props.height };
};
//# sourceMappingURL=OfferPieceStill.js.map