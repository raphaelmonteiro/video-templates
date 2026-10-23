/**
 * Descritor da PEÇA DE OFERTAS (change video-peca-configuravel): o que o
 * cliente monta no editor e que vira o quadro parado do vídeo. Espelho fiel de
 * `domain/mc-piece.ts` do backend, em FRAÇÕES 0..1 do quadro de saída — o mesmo
 * documento alimenta a prévia do editor (`PieceCanvas` em DOM) e o
 * `render_still` do worker (composição `OfferPieceStill`), então "prévia =
 * quadro final" sem comparar pixels.
 *
 * Declarados à mão (sem `z.infer`), como os tipos do OfferCarousel;
 * `schema.ts` garante em compilação que schema e tipos não divergem.
 */
export const PIECE_SCHEMA_VERSION = 1;
export const PIECE_ASPECT_RATIOS = ['9:16', '4:5'];
export const PIECE_MIN_PRODUCTS = 2;
export const PIECE_MAX_PRODUCTS = 12;
export const PIECE_MAX_SPOKEN = 6;
export const PIECE_SINGLE_MAX_PRODUCTS = 3;
export const PIECE_MAX_TEXTS = 5;
/** Lado menor do personagem ≥ 25% da largura do quadro (boca legível no vídeo). */
export const PIECE_MIN_CHARACTER_WIDTH = 0.25;
/** Dimensões de saída por formato (as mesmas do backend, `compositionDimensions`). */
export const PIECE_DIMENSIONS = {
    '9:16': { width: 1080, height: 1920 },
    '4:5': { width: 1080, height: 1350 },
};
export const PIECE_BLOCK_TYPES = ['logo', 'text', 'footer', 'products', 'character'];
/** Primeiro bloco de um tipo (a peça tem no máximo um de logo/footer/products/character). */
export function pieceBlock(document, type) {
    return ((document.blocks ?? []).find((b) => b.type === type) ??
        null);
}
export function pieceDimensions(aspectRatio) {
    return PIECE_DIMENSIONS[aspectRatio] ?? PIECE_DIMENSIONS['9:16'];
}
/** URLs de mídia que a peça referencia (fundo, logo, fotos, imagem única), sem repetição. */
export function pieceMediaUrls(document) {
    const urls = [];
    const add = (url) => {
        const trimmed = (url ?? '').trim();
        if (trimmed && !urls.includes(trimmed))
            urls.push(trimmed);
    };
    if (document.background?.mode === 'image')
        add(document.background.imageUrl);
    for (const block of document.blocks ?? []) {
        if (block.type === 'logo')
            add(block.imageUrl);
        if (block.type === 'products') {
            add(block.singleImageUrl);
            for (const item of block.items ?? [])
                add(item.imageUrl);
        }
    }
    return urls;
}
//# sourceMappingURL=types.js.map