"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PIECE_BLOCK_TYPES = exports.PIECE_DIMENSIONS = exports.PIECE_MIN_CHARACTER_WIDTH = exports.PIECE_MAX_TEXTS = exports.PIECE_SINGLE_MAX_PRODUCTS = exports.PIECE_MAX_SPOKEN = exports.PIECE_MAX_PRODUCTS = exports.PIECE_MIN_PRODUCTS = exports.PIECE_ASPECT_RATIOS = exports.PIECE_SCHEMA_VERSION = void 0;
exports.pieceBlock = pieceBlock;
exports.pieceDimensions = pieceDimensions;
exports.pieceMediaUrls = pieceMediaUrls;
exports.PIECE_SCHEMA_VERSION = 1;
exports.PIECE_ASPECT_RATIOS = ['9:16', '4:5'];
exports.PIECE_MIN_PRODUCTS = 2;
exports.PIECE_MAX_PRODUCTS = 12;
exports.PIECE_MAX_SPOKEN = 6;
exports.PIECE_SINGLE_MAX_PRODUCTS = 3;
exports.PIECE_MAX_TEXTS = 5;
/** Lado menor do personagem ≥ 25% da largura do quadro (boca legível no vídeo). */
exports.PIECE_MIN_CHARACTER_WIDTH = 0.25;
/** Dimensões de saída por formato (as mesmas do backend, `compositionDimensions`). */
exports.PIECE_DIMENSIONS = {
    '9:16': { width: 1080, height: 1920 },
    '4:5': { width: 1080, height: 1350 },
};
exports.PIECE_BLOCK_TYPES = ['logo', 'text', 'footer', 'products', 'character'];
/** Primeiro bloco de um tipo (a peça tem no máximo um de logo/footer/products/character). */
function pieceBlock(document, type) {
    return ((document.blocks ?? []).find((b) => b.type === type) ??
        null);
}
function pieceDimensions(aspectRatio) {
    return exports.PIECE_DIMENSIONS[aspectRatio] ?? exports.PIECE_DIMENSIONS['9:16'];
}
/** URLs de mídia que a peça referencia (fundo, logo, fotos, imagem única), sem repetição. */
function pieceMediaUrls(document) {
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