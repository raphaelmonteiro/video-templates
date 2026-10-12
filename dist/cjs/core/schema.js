"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.offerCarouselPropsSchema = exports.ASSET_SRC_PATTERN = exports.OFFER_CAROUSEL_LAYOUT_PRESETS = exports.TIMING_TOLERANCE_S = exports.OFFER_CAROUSEL_MAX_OFFERS = exports.OFFER_CAROUSEL_MIN_OFFERS = void 0;
exports.parseOfferCarouselProps = parseOfferCarouselProps;
const zod_1 = require("zod");
const price_1 = require("./price");
const safe_area_1 = require("./safe-area");
/** Limites do formato (spec video-offer-carousel "Ofertas do projeto"). */
exports.OFFER_CAROUSEL_MIN_OFFERS = 3;
exports.OFFER_CAROUSEL_MAX_OFFERS = 6;
/** Tolerância (s) das palavras em relação à janela da fala e da ordem entre falas. */
exports.TIMING_TOLERANCE_S = 0.05;
exports.OFFER_CAROUSEL_LAYOUT_PRESETS = [
    'character_left',
    'character_right',
    'character_bottom',
];
/**
 * Mídia: URL absoluta (http/https/data) ou caminho relativo a `public/`
 * (fixtures). Caminho absoluto de disco ou "/uploads/..." é recusado: o
 * navegador do render não o resolveria.
 */
exports.ASSET_SRC_PATTERN = /^(?:https?:\/\/|data:)|^(?![a-zA-Z][a-zA-Z0-9+.-]*:)(?![/\\])\S/;
const assetSrc = zod_1.z
    .string()
    .min(1)
    .regex(exports.ASSET_SRC_PATTERN, {
    message: 'Use URL absoluta (http/https/data) ou caminho relativo a public/',
});
const hexColor = zod_1.z.string().regex(/^#[0-9a-fA-F]{6}$/, { message: 'Cor no formato #RRGGBB' });
const price = zod_1.z.string().regex(price_1.PRICE_PATTERN, {
    message: 'Preço no formato pt-BR "24,90" (sem "R$")',
});
const seconds = zod_1.z.number().min(0);
const fractionRect = zod_1.z
    .object({
    x: zod_1.z.number().min(0).max(1),
    y: zod_1.z.number().min(0).max(1),
    w: zod_1.z.number().gt(0).max(1),
    h: zod_1.z.number().gt(0).max(1),
})
    .refine((r) => r.x + r.w <= 1 + 1e-9 && r.y + r.h <= 1 + 1e-9, {
    message: 'O retângulo precisa caber inteiro no quadro (x + w ≤ 1 e y + h ≤ 1)',
});
const word = zod_1.z
    .object({ text: zod_1.z.string().min(1), startS: seconds, endS: seconds })
    .refine((w) => w.endS >= w.startS, { message: 'Palavra com fim antes do início' });
const line = zod_1.z.object({
    id: zod_1.z.string().min(1),
    kind: zod_1.z.enum(['opening', 'offer', 'closing']),
    offerId: zod_1.z.string().min(1).optional(),
    startS: seconds,
    endS: seconds,
    words: zod_1.z.array(word),
});
const offer = zod_1.z.object({
    id: zod_1.z.string().min(1),
    name: zod_1.z.string().trim().min(1).max(80),
    price,
    originalPrice: price.optional(),
    unit: zod_1.z.string().trim().min(1).max(24).optional(),
    badge: zod_1.z.string().trim().min(1).max(24).optional(),
    imageUrl: assetSrc,
    catalogId: zod_1.z.string().nullable().optional(),
});
const clip = zod_1.z.object({
    src: assetSrc,
    startS: seconds,
    endS: seconds,
    lineId: zod_1.z.string().min(1).optional(),
});
const character = zod_1.z.object({
    clips: zod_1.z.array(clip).min(1, { message: 'O personagem precisa de ao menos um clipe' }),
    window: fractionRect,
    tileRatio: zod_1.z.number().min(0.5).max(1.5),
    posterUrl: assetSrc.optional(),
    backgroundColor: hexColor.optional(),
});
const brand = zod_1.z.object({
    logoUrl: assetSrc.optional(),
    name: zod_1.z.string().trim().min(1).max(60).optional(),
    primaryColor: hexColor,
    secondaryColor: hexColor,
    fontFamily: zod_1.z.string().trim().min(1),
    fontUrl: assetSrc.optional(),
});
const music = zod_1.z.object({
    src: assetSrc,
    volume: zod_1.z.number().min(0).max(1),
    duck: zod_1.z.boolean().optional(),
});
/**
 * Schema das props da composição (zod 4, o mesmo major do Remotion 4.0.529).
 * Além da forma, valida o contrato do roteiro F2: 3 a 6 ofertas; falas em
 * ordem e sem sobreposição; abertura primeiro, fechamento por último e uma
 * fala por oferta NA ORDEM das ofertas; palavras dentro da janela da fala;
 * clipes em ordem; tamanho de saída entre os quatro suportados.
 */
exports.offerCarouselPropsSchema = zod_1.z
    .object({
    width: zod_1.z.number().int(),
    height: zod_1.z.number().int(),
    fps: zod_1.z.literal(30),
    character,
    offers: zod_1.z
        .array(offer)
        .min(exports.OFFER_CAROUSEL_MIN_OFFERS, {
        message: `Mínimo de ${exports.OFFER_CAROUSEL_MIN_OFFERS} ofertas`,
    })
        .max(exports.OFFER_CAROUSEL_MAX_OFFERS, {
        message: `Máximo de ${exports.OFFER_CAROUSEL_MAX_OFFERS} ofertas (o vídeo tem até 30 s)`,
    }),
    lines: zod_1.z.array(line).min(1),
    brand,
    layoutPreset: zod_1.z.enum(exports.OFFER_CAROUSEL_LAYOUT_PRESETS),
    captions: zod_1.z.boolean(),
    music: music.optional(),
    cardBox: fractionRect.optional(),
})
    .superRefine((props, ctx) => {
    const issue = (path, message) => ctx.addIssue({ code: 'custom', path, message });
    if (!(0, safe_area_1.supportedSizeOf)(props.width, props.height)) {
        issue(['width'], `Tamanho ${props.width}×${props.height} não suportado (aceitos: ${safe_area_1.SUPPORTED_SIZES.map((s) => `${s.width}×${s.height}`).join(', ')})`);
    }
    const offerIds = props.offers.map((o) => o.id);
    const dupOffer = offerIds.find((id, i) => offerIds.indexOf(id) !== i);
    if (dupOffer)
        issue(['offers'], `Oferta repetida: "${dupOffer}"`);
    const lineIds = props.lines.map((l) => l.id);
    const dupLine = lineIds.find((id, i) => lineIds.indexOf(id) !== i);
    if (dupLine)
        issue(['lines'], `Fala repetida: "${dupLine}"`);
    // Estrutura do roteiro: abertura, uma fala por oferta (na ordem), fechamento.
    const lines = props.lines;
    if (lines[0]?.kind !== 'opening')
        issue(['lines', 0, 'kind'], 'A primeira fala é a abertura');
    if (lines.length < 2 || lines[lines.length - 1]?.kind !== 'closing') {
        issue(['lines', Math.max(0, lines.length - 1), 'kind'], 'A última fala é o fechamento');
    }
    lines.forEach((l, i) => {
        if ((l.kind === 'opening' || l.kind === 'closing') && i !== 0 && i !== lines.length - 1) {
            issue(['lines', i, 'kind'], `"${l.kind}" só pode ser a primeira/última fala`);
        }
        if (l.kind === 'offer' && !l.offerId)
            issue(['lines', i, 'offerId'], 'Fala de oferta sem offerId');
        if (l.kind !== 'offer' && l.offerId) {
            issue(['lines', i, 'offerId'], 'Só falas de oferta têm offerId');
        }
    });
    const offerLineIds = lines.filter((l) => l.kind === 'offer').map((l) => l.offerId ?? '');
    if (offerLineIds.join('\u0000') !== offerIds.join('\u0000')) {
        issue(['lines'], `Precisa haver exatamente uma fala por oferta, na ordem das ofertas ` +
            `(ofertas: ${offerIds.join(', ')}; falas: ${offerLineIds.join(', ') || 'nenhuma'})`);
    }
    // Tempos: falas em ordem, sem sobreposição; palavras dentro da fala, em ordem.
    lines.forEach((l, i) => {
        if (l.endS <= l.startS)
            issue(['lines', i, 'endS'], 'Fala com duração nula ou negativa');
        const prev = lines[i - 1];
        if (prev && l.startS < prev.endS - exports.TIMING_TOLERANCE_S) {
            issue(['lines', i, 'startS'], `A fala "${l.id}" começa antes do fim de "${prev.id}"`);
        }
        l.words.forEach((w, j) => {
            if (w.startS < l.startS - exports.TIMING_TOLERANCE_S || w.endS > l.endS + exports.TIMING_TOLERANCE_S) {
                issue(['lines', i, 'words', j], `Palavra "${w.text}" fora da janela da fala "${l.id}" (tempos absolutos na timeline)`);
            }
            const prevWord = l.words[j - 1];
            if (prevWord && w.startS < prevWord.startS) {
                issue(['lines', i, 'words', j], 'Palavras fora de ordem');
            }
        });
    });
    props.character.clips.forEach((c, i) => {
        if (c.endS <= c.startS)
            issue(['character', 'clips', i, 'endS'], 'Clipe com duração nula');
        const prev = props.character.clips[i - 1];
        if (prev && c.startS < prev.endS - exports.TIMING_TOLERANCE_S) {
            issue(['character', 'clips', i, 'startS'], 'Clipes sobrepostos ou fora de ordem');
        }
    });
});
/** Checagem de compilação: o schema e os tipos declarados à mão não podem divergir. */
const schemaMatchesTypes = true;
void schemaMatchesTypes;
/** Valida props desconhecidas; devolve as props tipadas ou a lista de problemas (para 400/422). */
function parseOfferCarouselProps(input) {
    const result = exports.offerCarouselPropsSchema.safeParse(input);
    if (result.success)
        return { success: true, data: result.data };
    return {
        success: false,
        issues: result.error.issues.map((i) => ({
            path: i.path.map(String).join('.'),
            message: i.message,
        })),
    };
}
//# sourceMappingURL=schema.js.map