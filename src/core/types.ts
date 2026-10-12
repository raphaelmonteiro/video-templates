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

export type OfferCarouselLayoutPreset = 'character_left' | 'character_right' | 'character_bottom';

export type OfferCarouselLineKind = 'opening' | 'offer' | 'closing';

/** Retângulo em frações 0..1 do quadro de saída. */
export interface FractionRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface OfferCarouselWord {
  text: string;
  startS: number;
  endS: number;
}

export interface OfferCarouselLine {
  id: string;
  kind: OfferCarouselLineKind;
  /** Obrigatório em `offer`, proibido em `opening`/`closing`. */
  offerId?: string;
  startS: number;
  endS: number;
  /** Palavras com timestamps (alinhamento do TTS). Vazio = alinhamento ausente. */
  words: OfferCarouselWord[];
}

export interface OfferCarouselOffer {
  id: string;
  name: string;
  /** "24,90" — sem "R$", exatamente como congelado no projeto. */
  price: string;
  /** Preço anterior ("de"), mostrado riscado. */
  originalPrice?: string;
  unit?: string;
  badge?: string;
  imageUrl: string;
  /** Origem no catálogo (informativo; não afeta pixels). */
  catalogId?: string | null;
}

/** Um clipe conformado por fala (D7): o arquivo começa em `startS` e dura `endS - startS`. */
export interface OfferCarouselClip {
  src: string;
  startS: number;
  endS: number;
  /** Fala de origem (informativo; facilita depuração). */
  lineId?: string;
}

export interface OfferCarouselCharacter {
  clips: OfferCarouselClip[];
  /** Janela do personagem (frações do quadro), no aspecto do tile. */
  window: FractionRect;
  /** Largura/altura do tile (ex.: 0,75 para 3:4). */
  tileRatio: number;
  /** Quadro parado do personagem (tile de fala) mostrado entre falas. */
  posterUrl?: string;
  /** Cor de fundo da janela (#RRGGBB) — a mesma cor do tile de fala recolorido. */
  backgroundColor?: string;
}

export interface OfferCarouselBrand {
  logoUrl?: string;
  /** Nome do cliente, mostrado na abertura/fechamento quando não há logo. */
  name?: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  /** Arquivo da fonte (.woff2/.woff/.ttf/.otf); ausente = fonte instalada ou fallback DejaVu Sans. */
  fontUrl?: string;
}

export interface OfferCarouselMusic {
  src: string;
  /** Volume base 0..1. */
  volume: number;
  /** Atenua a música nas janelas de fala (default true). */
  duck?: boolean;
}

/** Alias (não interface): o Remotion exige props atribuíveis a Record<string, unknown>. */
export type OfferCarouselProps = {
  width: number;
  height: number;
  fps: 30;
  character: OfferCarouselCharacter;
  offers: OfferCarouselOffer[];
  lines: OfferCarouselLine[];
  brand: OfferCarouselBrand;
  layoutPreset: OfferCarouselLayoutPreset;
  captions: boolean;
  music?: OfferCarouselMusic;
  /**
   * Caixa dos cards (frações do quadro). Ausente = a do preset. Existe para a
   * prévia fiel (spec: card movido na prévia aparece na mesma posição no MP4).
   */
  cardBox?: FractionRect;
};
