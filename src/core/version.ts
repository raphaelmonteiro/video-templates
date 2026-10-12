/** Id da composição registrada no Root (o worker passa este id ao `selectComposition`). */
export const OFFER_CAROUSEL_COMPOSITION_ID = 'OfferCarousel';

/**
 * Versão da COMPOSIÇÃO (semver), espelhada em `package.json#compositionVersion`
 * (um teste garante a igualdade). Entra no hash determinístico do render do
 * backend (spec video-composition-render "Render determinístico") e no
 * preflight, que compara a versão do bundle do worker com a do frontend (D3b).
 * Mude-a sempre que uma alteração puder mudar pixels ou áudio do resultado.
 */
export const COMPOSITION_VERSION = '0.1.0';
