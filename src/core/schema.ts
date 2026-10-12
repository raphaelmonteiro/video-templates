import { z } from 'zod';
import { PRICE_PATTERN } from './price';
import { SUPPORTED_SIZES, supportedSizeOf } from './safe-area';
import type { OfferCarouselProps } from './types';

/** Limites do formato (spec video-offer-carousel "Ofertas do projeto"). */
export const OFFER_CAROUSEL_MIN_OFFERS = 3;
export const OFFER_CAROUSEL_MAX_OFFERS = 6;

/** Tolerância (s) das palavras em relação à janela da fala e da ordem entre falas. */
export const TIMING_TOLERANCE_S = 0.05;

export const OFFER_CAROUSEL_LAYOUT_PRESETS = [
  'character_left',
  'character_right',
  'character_bottom',
] as const;

/**
 * Mídia: URL absoluta (http/https/data) ou caminho relativo a `public/`
 * (fixtures). Caminho absoluto de disco ou "/uploads/..." é recusado: o
 * navegador do render não o resolveria.
 */
export const ASSET_SRC_PATTERN = /^(?:https?:\/\/|data:)|^(?![a-zA-Z][a-zA-Z0-9+.-]*:)(?![/\\])\S/;

const assetSrc = z
  .string()
  .min(1)
  .regex(ASSET_SRC_PATTERN, {
    message: 'Use URL absoluta (http/https/data) ou caminho relativo a public/',
  });

const hexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/, { message: 'Cor no formato #RRGGBB' });

const price = z.string().regex(PRICE_PATTERN, {
  message: 'Preço no formato pt-BR "24,90" (sem "R$")',
});

const seconds = z.number().min(0);

const fractionRect = z
  .object({
    x: z.number().min(0).max(1),
    y: z.number().min(0).max(1),
    w: z.number().gt(0).max(1),
    h: z.number().gt(0).max(1),
  })
  .refine((r) => r.x + r.w <= 1 + 1e-9 && r.y + r.h <= 1 + 1e-9, {
    message: 'O retângulo precisa caber inteiro no quadro (x + w ≤ 1 e y + h ≤ 1)',
  });

const word = z
  .object({ text: z.string().min(1), startS: seconds, endS: seconds })
  .refine((w) => w.endS >= w.startS, { message: 'Palavra com fim antes do início' });

const line = z.object({
  id: z.string().min(1),
  kind: z.enum(['opening', 'offer', 'closing']),
  offerId: z.string().min(1).optional(),
  startS: seconds,
  endS: seconds,
  words: z.array(word),
});

const offer = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1).max(80),
  price,
  originalPrice: price.optional(),
  unit: z.string().trim().min(1).max(24).optional(),
  badge: z.string().trim().min(1).max(24).optional(),
  imageUrl: assetSrc,
  catalogId: z.string().nullable().optional(),
});

const clip = z.object({
  src: assetSrc,
  startS: seconds,
  endS: seconds,
  lineId: z.string().min(1).optional(),
});

const character = z.object({
  clips: z.array(clip).min(1, { message: 'O personagem precisa de ao menos um clipe' }),
  window: fractionRect,
  tileRatio: z.number().min(0.5).max(1.5),
  posterUrl: assetSrc.optional(),
  backgroundColor: hexColor.optional(),
});

const brand = z.object({
  logoUrl: assetSrc.optional(),
  name: z.string().trim().min(1).max(60).optional(),
  primaryColor: hexColor,
  secondaryColor: hexColor,
  fontFamily: z.string().trim().min(1),
  fontUrl: assetSrc.optional(),
});

const music = z.object({
  src: assetSrc,
  volume: z.number().min(0).max(1),
  duck: z.boolean().optional(),
});

/**
 * Schema das props da composição (zod 4, o mesmo major do Remotion 4.0.529).
 * Além da forma, valida o contrato do roteiro F2: 3 a 6 ofertas; falas em
 * ordem e sem sobreposição; abertura primeiro, fechamento por último e uma
 * fala por oferta NA ORDEM das ofertas; palavras dentro da janela da fala;
 * clipes em ordem; tamanho de saída entre os quatro suportados.
 */
export const offerCarouselPropsSchema = z
  .object({
    width: z.number().int(),
    height: z.number().int(),
    fps: z.literal(30),
    character,
    offers: z
      .array(offer)
      .min(OFFER_CAROUSEL_MIN_OFFERS, {
        message: `Mínimo de ${OFFER_CAROUSEL_MIN_OFFERS} ofertas`,
      })
      .max(OFFER_CAROUSEL_MAX_OFFERS, {
        message: `Máximo de ${OFFER_CAROUSEL_MAX_OFFERS} ofertas (o vídeo tem até 30 s)`,
      }),
    lines: z.array(line).min(1),
    brand,
    layoutPreset: z.enum(OFFER_CAROUSEL_LAYOUT_PRESETS),
    captions: z.boolean(),
    music: music.optional(),
    cardBox: fractionRect.optional(),
  })
  .superRefine((props, ctx) => {
    const issue = (path: (string | number)[], message: string) =>
      ctx.addIssue({ code: 'custom', path, message });

    if (!supportedSizeOf(props.width, props.height)) {
      issue(
        ['width'],
        `Tamanho ${props.width}×${props.height} não suportado (aceitos: ${SUPPORTED_SIZES.map(
          (s) => `${s.width}×${s.height}`,
        ).join(', ')})`,
      );
    }

    const offerIds = props.offers.map((o) => o.id);
    const dupOffer = offerIds.find((id, i) => offerIds.indexOf(id) !== i);
    if (dupOffer) issue(['offers'], `Oferta repetida: "${dupOffer}"`);

    const lineIds = props.lines.map((l) => l.id);
    const dupLine = lineIds.find((id, i) => lineIds.indexOf(id) !== i);
    if (dupLine) issue(['lines'], `Fala repetida: "${dupLine}"`);

    // Estrutura do roteiro: abertura, uma fala por oferta (na ordem), fechamento.
    const lines = props.lines;
    if (lines[0]?.kind !== 'opening') issue(['lines', 0, 'kind'], 'A primeira fala é a abertura');
    if (lines.length < 2 || lines[lines.length - 1]?.kind !== 'closing') {
      issue(['lines', Math.max(0, lines.length - 1), 'kind'], 'A última fala é o fechamento');
    }
    lines.forEach((l, i) => {
      if ((l.kind === 'opening' || l.kind === 'closing') && i !== 0 && i !== lines.length - 1) {
        issue(['lines', i, 'kind'], `"${l.kind}" só pode ser a primeira/última fala`);
      }
      if (l.kind === 'offer' && !l.offerId) issue(['lines', i, 'offerId'], 'Fala de oferta sem offerId');
      if (l.kind !== 'offer' && l.offerId) {
        issue(['lines', i, 'offerId'], 'Só falas de oferta têm offerId');
      }
    });
    const offerLineIds = lines.filter((l) => l.kind === 'offer').map((l) => l.offerId ?? '');
    if (offerLineIds.join('\u0000') !== offerIds.join('\u0000')) {
      issue(
        ['lines'],
        `Precisa haver exatamente uma fala por oferta, na ordem das ofertas ` +
          `(ofertas: ${offerIds.join(', ')}; falas: ${offerLineIds.join(', ') || 'nenhuma'})`,
      );
    }

    // Tempos: falas em ordem, sem sobreposição; palavras dentro da fala, em ordem.
    lines.forEach((l, i) => {
      if (l.endS <= l.startS) issue(['lines', i, 'endS'], 'Fala com duração nula ou negativa');
      const prev = lines[i - 1];
      if (prev && l.startS < prev.endS - TIMING_TOLERANCE_S) {
        issue(['lines', i, 'startS'], `A fala "${l.id}" começa antes do fim de "${prev.id}"`);
      }
      l.words.forEach((w, j) => {
        if (w.startS < l.startS - TIMING_TOLERANCE_S || w.endS > l.endS + TIMING_TOLERANCE_S) {
          issue(
            ['lines', i, 'words', j],
            `Palavra "${w.text}" fora da janela da fala "${l.id}" (tempos absolutos na timeline)`,
          );
        }
        const prevWord = l.words[j - 1];
        if (prevWord && w.startS < prevWord.startS) {
          issue(['lines', i, 'words', j], 'Palavras fora de ordem');
        }
      });
    });

    props.character.clips.forEach((c, i) => {
      if (c.endS <= c.startS) issue(['character', 'clips', i, 'endS'], 'Clipe com duração nula');
      const prev = props.character.clips[i - 1];
      if (prev && c.startS < prev.endS - TIMING_TOLERANCE_S) {
        issue(['character', 'clips', i, 'startS'], 'Clipes sobrepostos ou fora de ordem');
      }
    });
  });

type Equals<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;
/** Checagem de compilação: o schema e os tipos declarados à mão não podem divergir. */
const schemaMatchesTypes: Equals<z.infer<typeof offerCarouselPropsSchema>, OfferCarouselProps> = true;
void schemaMatchesTypes;

export interface PropsValidationIssue {
  path: string;
  message: string;
}

/** Valida props desconhecidas; devolve as props tipadas ou a lista de problemas (para 400/422). */
export function parseOfferCarouselProps(
  input: unknown,
): { success: true; data: OfferCarouselProps } | { success: false; issues: PropsValidationIssue[] } {
  const result = offerCarouselPropsSchema.safeParse(input);
  if (result.success) return { success: true, data: result.data };
  return {
    success: false,
    issues: result.error.issues.map((i) => ({
      path: i.path.map(String).join('.'),
      message: i.message,
    })),
  };
}
