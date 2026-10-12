/**
 * Tipos das props da composição OfferCarousel (F2 "ofertas em sequência").
 * Declarados à mão (sem `z.infer`) para que os consumidores não dependam da
 * versão do zod para tipar; `schema.ts` garante em compilação que o schema e
 * estes tipos são idênticos.
 *
 * Convenções:
 * - TEMPOS em segundos ABSOLUTOS na timeline da composição (0 = primeiro
 *   quadro). Palavras também: `word.startS = início da fala na timeline +
 *   início da palavra no alinhamento do TTS`.
 * - FRAÇÕES 0..1 do QUADRO DE SAÍDA (não da arte), com 4 casas.
 * - MÍDIA (`src`, `imageUrl`, `logoUrl`...): URL absoluta (`http(s)://`,
 *   `data:`) ou caminho relativo à pasta `public/` do bundle (só fixtures).
 */
export {};
//# sourceMappingURL=types.js.map