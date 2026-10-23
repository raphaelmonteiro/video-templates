/** Id da composição registrada no Root (o worker passa este id ao `selectComposition`). */
export const OFFER_CAROUSEL_COMPOSITION_ID = 'OfferCarousel';

/** Quadro parado da peça de ofertas (change video-peca-configuravel) — `renderStill` no worker. */
export const OFFER_PIECE_STILL_COMPOSITION_ID = 'OfferPieceStill';

/**
 * Versão da COMPOSIÇÃO (semver), espelhada em `package.json#compositionVersion`
 * (um teste garante a igualdade). Entra no hash determinístico do render do
 * backend (spec video-composition-render "Render determinístico") e no
 * preflight, que compara a versão do bundle do worker com a do frontend (D3b).
 * Mude-a sempre que uma alteração puder mudar pixels ou áudio do resultado.
 *
 * 0.2.0 — composição `OfferPieceStill` (peça de ofertas) ao lado do OfferCarousel.
 */
export const COMPOSITION_VERSION = '0.2.0';

/**
 * Qual composição as input props do render pedem: as props da peça trazem
 * `document.blocks`; as do carrossel, `offers[]`. `null` = indeterminado
 * (Studio sem input props) — a raiz registra todas.
 */
export function compositionIdForInputProps(input: Record<string, unknown> | null | undefined): string | null {
  if (!input || typeof input !== 'object') return null;
  const doc = input.document;
  if (doc && typeof doc === 'object' && Array.isArray((doc as { blocks?: unknown }).blocks)) {
    return OFFER_PIECE_STILL_COMPOSITION_ID;
  }
  if (Array.isArray(input.offers)) return OFFER_CAROUSEL_COMPOSITION_ID;
  return null;
}
