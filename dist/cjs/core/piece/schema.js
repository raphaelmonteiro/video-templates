"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.offerPieceStillPropsSchema = exports.pieceDocumentSchema = void 0;
exports.parsePieceDocument = parsePieceDocument;
exports.parseOfferPieceStillProps = parseOfferPieceStillProps;
const zod_1 = require("zod");
const schema_1 = require("../schema");
const types_1 = require("./types");
/**
 * Schema (zod 4) do descritor da peça e das props da composição
 * `OfferPieceStill`. Valida a FORMA (tipos, enums, tuplas, frações numéricas);
 * as regras de negócio (2 a 12 produtos, até 6 falados, nome legível, foto em
 * /uploads/, lado do personagem) são do backend (`validatePieceDocument`) e
 * devolvem `issues[]` ao editor sem bloquear o autosave — por isso este schema
 * NÃO as repete: um documento que o backend aceitou precisa passar aqui.
 */
const rect = zod_1.z.object({ x: zod_1.z.number(), y: zod_1.z.number(), w: zod_1.z.number(), h: zod_1.z.number() });
const background = zod_1.z.discriminatedUnion('mode', [
    zod_1.z.object({ mode: zod_1.z.literal('solid'), color: zod_1.z.string() }),
    zod_1.z.object({
        mode: zod_1.z.literal('gradient'),
        colors: zod_1.z.tuple([zod_1.z.string(), zod_1.z.string()]),
        angle: zod_1.z.number(),
    }),
    zod_1.z.object({
        mode: zod_1.z.literal('image'),
        imageUrl: zod_1.z.string().min(1),
        fit: zod_1.z.enum(['cover', 'contain']).optional(),
        blur: zod_1.z.number().min(0).max(1).optional(),
        darken: zod_1.z.number().min(0).max(1).optional(),
    }),
]);
const blockBase = { id: zod_1.z.string().min(1), rect, zIndex: zod_1.z.number() };
const logoBlock = zod_1.z.object({ ...blockBase, type: zod_1.z.literal('logo'), imageUrl: zod_1.z.string().nullable() });
const textBlock = zod_1.z.object({
    ...blockBase,
    type: zod_1.z.literal('text'),
    text: zod_1.z.string(),
    fontFamily: zod_1.z.string().nullable().optional(),
    fontSize: zod_1.z.number().positive(),
    color: zod_1.z.string(),
    align: zod_1.z.enum(['left', 'center', 'right']),
    weight: zod_1.z.enum(['regular', 'bold']),
});
const footerBlock = zod_1.z.object({
    ...blockBase,
    type: zod_1.z.literal('footer'),
    style: zod_1.z.enum(['bar', 'pill']),
    address: zod_1.z.string().nullable().optional(),
    phone: zod_1.z.string().nullable().optional(),
    validity: zod_1.z.object({ from: zod_1.z.string(), to: zod_1.z.string() }).nullable().optional(),
    legal: zod_1.z.string().nullable().optional(),
    backgroundColor: zod_1.z.string(),
    textColor: zod_1.z.string(),
});
const productItem = zod_1.z.object({
    id: zod_1.z.string().min(1),
    catalogId: zod_1.z.string().nullable().optional(),
    name: zod_1.z.string(),
    grams: zod_1.z.string().nullable().optional(),
    unit: zod_1.z.string().nullable().optional(),
    price: zod_1.z.string(),
    originalPrice: zod_1.z.string().nullable().optional(),
    imageUrl: zod_1.z.string(),
    rect: rect.nullable().optional(),
    featured: zod_1.z.boolean().optional(),
    spoken: zod_1.z.boolean(),
});
const productsBlock = zod_1.z.object({
    ...blockBase,
    type: zod_1.z.literal('products'),
    mode: zod_1.z.enum(['grid', 'single']),
    layout: zod_1.z.enum(['auto', 'manual']),
    areaStyle: zod_1.z
        .object({
        background: zod_1.z.string().nullable().optional(),
        radius: zod_1.z.number().optional(),
        shadow: zod_1.z.boolean().optional(),
    })
        .nullable()
        .optional(),
    tagStyle: zod_1.z
        .object({ kind: zod_1.z.enum(['badge', 'plain']), color: zod_1.z.string(), textColor: zod_1.z.string() })
        .nullable()
        .optional(),
    items: zod_1.z.array(productItem),
    singleImageUrl: zod_1.z.string().nullable().optional(),
});
const characterBlock = zod_1.z.object({
    ...blockBase,
    type: zod_1.z.literal('character'),
    kitId: zod_1.z.string(),
    mode: zod_1.z.enum(['in_piece', 'logo_face']),
    panel: zod_1.z.object({ shape: zod_1.z.enum(['none', 'card', 'circle']), color: zod_1.z.string() }),
});
const pieceFont = zod_1.z.object({ family: zod_1.z.string().min(1), url: zod_1.z.string().min(1) });
exports.pieceDocumentSchema = zod_1.z.object({
    schemaVersion: zod_1.z.number().int(),
    aspectRatio: zod_1.z.enum(types_1.PIECE_ASPECT_RATIOS),
    background,
    blocks: zod_1.z.array(zod_1.z.discriminatedUnion('type', [logoBlock, textBlock, footerBlock, productsBlock, characterBlock])),
    fonts: zod_1.z.array(pieceFont).optional(),
});
const inferredIsDocument = null;
const documentIsInferred = null;
void inferredIsDocument;
void documentIsInferred;
/**
 * Props do quadro parado: descritor válido, dimensões do formato e mídias/fontes
 * em URL que o navegador do render resolve (absoluta http/https/data ou caminho
 * relativo a `public/` — nunca `/uploads/...` cru nem caminho de disco).
 */
exports.offerPieceStillPropsSchema = zod_1.z
    .object({
    document: exports.pieceDocumentSchema,
    width: zod_1.z.number().int(),
    height: zod_1.z.number().int(),
    fonts: zod_1.z.array(pieceFont),
})
    .superRefine((props, ctx) => {
    const issue = (path, message) => ctx.addIssue({ code: 'custom', path, message });
    const dims = (0, types_1.pieceDimensions)(props.document.aspectRatio);
    if (props.width !== dims.width || props.height !== dims.height) {
        issue(['width'], `Formato ${props.document.aspectRatio} renderiza em ${dims.width}×${dims.height}; ` +
            `recebido ${props.width}×${props.height}`);
    }
    (0, types_1.pieceMediaUrls)(props.document).forEach((url) => {
        if (!schema_1.ASSET_SRC_PATTERN.test(url)) {
            issue(['document'], `Mídia "${url}": use URL absoluta (http/https/data) ou caminho relativo a public/`);
        }
    });
    props.fonts.forEach((font, i) => {
        if (!schema_1.ASSET_SRC_PATTERN.test(font.url)) {
            issue(['fonts', i, 'url'], `Fonte "${font.family}": URL absoluta ou relativa a public/`);
        }
    });
});
const inferredIsStillProps = null;
const stillPropsIsInferred = null;
void inferredIsStillProps;
void stillPropsIsInferred;
function toIssues(error) {
    return error.issues.map((i) => ({ path: i.path.map(String).join('.'), message: i.message }));
}
/** Valida um descritor desconhecido; devolve o documento tipado ou a lista de problemas. */
function parsePieceDocument(input) {
    const result = exports.pieceDocumentSchema.safeParse(input);
    if (result.success)
        return { success: true, data: result.data };
    return { success: false, issues: toIssues(result.error) };
}
/** Valida as props do quadro parado (o worker chama antes do `renderStill`). */
function parseOfferPieceStillProps(input) {
    const result = exports.offerPieceStillPropsSchema.safeParse(input);
    if (result.success)
        return { success: true, data: result.data };
    return { success: false, issues: toIssues(result.error) };
}
//# sourceMappingURL=schema.js.map