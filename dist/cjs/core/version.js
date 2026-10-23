"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.COMPOSITION_VERSION = exports.OFFER_PIECE_STILL_COMPOSITION_ID = exports.OFFER_CAROUSEL_COMPOSITION_ID = void 0;
exports.compositionIdForInputProps = compositionIdForInputProps;
/** Id da composição registrada no Root (o worker passa este id ao `selectComposition`). */
exports.OFFER_CAROUSEL_COMPOSITION_ID = 'OfferCarousel';
/** Quadro parado da peça de ofertas (change video-peca-configuravel) — `renderStill` no worker. */
exports.OFFER_PIECE_STILL_COMPOSITION_ID = 'OfferPieceStill';
/**
 * Versão da COMPOSIÇÃO (semver), espelhada em `package.json#compositionVersion`
 * (um teste garante a igualdade). Entra no hash determinístico do render do
 * backend (spec video-composition-render "Render determinístico") e no
 * preflight, que compara a versão do bundle do worker com a do frontend (D3b).
 * Mude-a sempre que uma alteração puder mudar pixels ou áudio do resultado.
 *
 * 0.2.0 — composição `OfferPieceStill` (peça de ofertas) ao lado do OfferCarousel.
 */
exports.COMPOSITION_VERSION = '0.2.0';
/**
 * Qual composição as input props do render pedem: as props da peça trazem
 * `document.blocks`; as do carrossel, `offers[]`. `null` = indeterminado
 * (Studio sem input props) — a raiz registra todas.
 */
function compositionIdForInputProps(input) {
    if (!input || typeof input !== 'object')
        return null;
    const doc = input.document;
    if (doc && typeof doc === 'object' && Array.isArray(doc.blocks)) {
        return exports.OFFER_PIECE_STILL_COMPOSITION_ID;
    }
    if (Array.isArray(input.offers))
        return exports.OFFER_CAROUSEL_COMPOSITION_ID;
    return null;
}
//# sourceMappingURL=version.js.map