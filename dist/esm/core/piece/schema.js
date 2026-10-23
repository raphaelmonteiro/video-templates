import { z } from 'zod';
import { ASSET_SRC_PATTERN } from '../schema';
import { PIECE_ASPECT_RATIOS, pieceDimensions, pieceMediaUrls, } from './types';
/**
 * Schema (zod 4) do descritor da peça e das props da composição
 * `OfferPieceStill`. Valida a FORMA (tipos, enums, tuplas, frações numéricas);
 * as regras de negócio (2 a 12 produtos, até 6 falados, nome legível, foto em
 * /uploads/, lado do personagem) são do backend (`validatePieceDocument`) e
 * devolvem `issues[]` ao editor sem bloquear o autosave — por isso este schema
 * NÃO as repete: um documento que o backend aceitou precisa passar aqui.
 */
const rect = z.object({ x: z.number(), y: z.number(), w: z.number(), h: z.number() });
const background = z.discriminatedUnion('mode', [
    z.object({ mode: z.literal('solid'), color: z.string() }),
    z.object({
        mode: z.literal('gradient'),
        colors: z.tuple([z.string(), z.string()]),
        angle: z.number(),
    }),
    z.object({
        mode: z.literal('image'),
        imageUrl: z.string().min(1),
        fit: z.enum(['cover', 'contain']).optional(),
        blur: z.number().min(0).max(1).optional(),
        darken: z.number().min(0).max(1).optional(),
    }),
]);
const blockBase = { id: z.string().min(1), rect, zIndex: z.number() };
const logoBlock = z.object({ ...blockBase, type: z.literal('logo'), imageUrl: z.string().nullable() });
const textBlock = z.object({
    ...blockBase,
    type: z.literal('text'),
    text: z.string(),
    fontFamily: z.string().nullable().optional(),
    fontSize: z.number().positive(),
    color: z.string(),
    align: z.enum(['left', 'center', 'right']),
    weight: z.enum(['regular', 'bold']),
});
const footerBlock = z.object({
    ...blockBase,
    type: z.literal('footer'),
    style: z.enum(['bar', 'pill']),
    address: z.string().nullable().optional(),
    phone: z.string().nullable().optional(),
    validity: z.object({ from: z.string(), to: z.string() }).nullable().optional(),
    legal: z.string().nullable().optional(),
    backgroundColor: z.string(),
    textColor: z.string(),
});
const productItem = z.object({
    id: z.string().min(1),
    catalogId: z.string().nullable().optional(),
    name: z.string(),
    grams: z.string().nullable().optional(),
    unit: z.string().nullable().optional(),
    price: z.string(),
    originalPrice: z.string().nullable().optional(),
    imageUrl: z.string(),
    rect: rect.nullable().optional(),
    featured: z.boolean().optional(),
    spoken: z.boolean(),
});
const productsBlock = z.object({
    ...blockBase,
    type: z.literal('products'),
    mode: z.enum(['grid', 'single']),
    layout: z.enum(['auto', 'manual']),
    areaStyle: z
        .object({
        background: z.string().nullable().optional(),
        radius: z.number().optional(),
        shadow: z.boolean().optional(),
    })
        .nullable()
        .optional(),
    tagStyle: z
        .object({ kind: z.enum(['badge', 'plain']), color: z.string(), textColor: z.string() })
        .nullable()
        .optional(),
    items: z.array(productItem),
    singleImageUrl: z.string().nullable().optional(),
});
const characterBlock = z.object({
    ...blockBase,
    type: z.literal('character'),
    kitId: z.string(),
    mode: z.enum(['in_piece', 'logo_face']),
    panel: z.object({ shape: z.enum(['none', 'card', 'circle']), color: z.string() }),
});
const pieceFont = z.object({ family: z.string().min(1), url: z.string().min(1) });
export const pieceDocumentSchema = z.object({
    schemaVersion: z.number().int(),
    aspectRatio: z.enum(PIECE_ASPECT_RATIOS),
    background,
    blocks: z.array(z.discriminatedUnion('type', [logoBlock, textBlock, footerBlock, productsBlock, characterBlock])),
    fonts: z.array(pieceFont).optional(),
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
export const offerPieceStillPropsSchema = z
    .object({
    document: pieceDocumentSchema,
    width: z.number().int(),
    height: z.number().int(),
    fonts: z.array(pieceFont),
})
    .superRefine((props, ctx) => {
    const issue = (path, message) => ctx.addIssue({ code: 'custom', path, message });
    const dims = pieceDimensions(props.document.aspectRatio);
    if (props.width !== dims.width || props.height !== dims.height) {
        issue(['width'], `Formato ${props.document.aspectRatio} renderiza em ${dims.width}×${dims.height}; ` +
            `recebido ${props.width}×${props.height}`);
    }
    pieceMediaUrls(props.document).forEach((url) => {
        if (!ASSET_SRC_PATTERN.test(url)) {
            issue(['document'], `Mídia "${url}": use URL absoluta (http/https/data) ou caminho relativo a public/`);
        }
    });
    props.fonts.forEach((font, i) => {
        if (!ASSET_SRC_PATTERN.test(font.url)) {
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
export function parsePieceDocument(input) {
    const result = pieceDocumentSchema.safeParse(input);
    if (result.success)
        return { success: true, data: result.data };
    return { success: false, issues: toIssues(result.error) };
}
/** Valida as props do quadro parado (o worker chama antes do `renderStill`). */
export function parseOfferPieceStillProps(input) {
    const result = offerPieceStillPropsSchema.safeParse(input);
    if (result.success)
        return { success: true, data: result.data };
    return { success: false, issues: toIssues(result.error) };
}
//# sourceMappingURL=schema.js.map