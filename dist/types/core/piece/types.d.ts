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
export declare const PIECE_SCHEMA_VERSION = 1;
export declare const PIECE_ASPECT_RATIOS: readonly ["9:16", "4:5"];
export type PieceAspectRatio = (typeof PIECE_ASPECT_RATIOS)[number];
export declare const PIECE_MIN_PRODUCTS = 2;
export declare const PIECE_MAX_PRODUCTS = 12;
export declare const PIECE_MAX_SPOKEN = 6;
export declare const PIECE_SINGLE_MAX_PRODUCTS = 3;
export declare const PIECE_MAX_TEXTS = 5;
/** Lado menor do personagem ≥ 25% da largura do quadro (boca legível no vídeo). */
export declare const PIECE_MIN_CHARACTER_WIDTH = 0.25;
/** Dimensões de saída por formato (as mesmas do backend, `compositionDimensions`). */
export declare const PIECE_DIMENSIONS: Record<PieceAspectRatio, {
    width: number;
    height: number;
}>;
/** Retângulo em frações 0..1 do quadro de saída (`w`/`h`, não `width`/`height`: é o contrato do backend). */
export interface PieceRect {
    x: number;
    y: number;
    w: number;
    h: number;
}
export type PieceBackground = {
    mode: 'solid';
    color: string;
} | {
    mode: 'gradient';
    colors: [string, string];
    angle: number;
} | {
    mode: 'image';
    imageUrl: string;
    fit?: 'cover' | 'contain';
    /** 0..1 */
    blur?: number;
    /** 0..1 */
    darken?: number;
};
export declare const PIECE_BLOCK_TYPES: readonly ["logo", "text", "footer", "products", "character"];
export type PieceBlockType = (typeof PIECE_BLOCK_TYPES)[number];
interface PieceBlockBase {
    id: string;
    type: PieceBlockType;
    rect: PieceRect;
    zIndex: number;
}
export interface PieceLogoBlock extends PieceBlockBase {
    type: 'logo';
    imageUrl: string | null;
}
export interface PieceTextBlock extends PieceBlockBase {
    type: 'text';
    text: string;
    /** Família de uma fonte da conta (`document.fonts`); ausente = fonte padrão. */
    fontFamily?: string | null;
    /** Tamanho da fonte como fração da LARGURA do quadro (independe da resolução). */
    fontSize: number;
    color: string;
    align: 'left' | 'center' | 'right';
    weight: 'regular' | 'bold';
}
export interface PieceFooterBlock extends PieceBlockBase {
    type: 'footer';
    style: 'bar' | 'pill';
    address?: string | null;
    phone?: string | null;
    /** Datas ISO (AAAA-MM-DD). */
    validity?: {
        from: string;
        to: string;
    } | null;
    legal?: string | null;
    backgroundColor: string;
    textColor: string;
}
export interface PieceProductItem {
    /** Chave estável do item na peça. */
    id: string;
    catalogId?: string | null;
    name: string;
    /** Gramatura/volume exibidos ("500 g", "2 L"); nunca falados. */
    grams?: string | null;
    unit?: string | null;
    /** "24,90" — já formatado, sem "R$". */
    price: string;
    originalPrice?: string | null;
    imageUrl: string;
    /** Posição dentro da área (fração do QUADRO); ausente em `layout: 'auto'`. */
    rect?: PieceRect | null;
    featured?: boolean;
    /** Entra na fala do personagem (até PIECE_MAX_SPOKEN). */
    spoken: boolean;
}
export interface PieceProductsBlock extends PieceBlockBase {
    type: 'products';
    mode: 'grid' | 'single';
    layout: 'auto' | 'manual';
    areaStyle?: {
        background?: string | null;
        radius?: number;
        shadow?: boolean;
    } | null;
    tagStyle?: {
        kind: 'badge' | 'plain';
        color: string;
        textColor: string;
    } | null;
    items: PieceProductItem[];
    /** Foto montada pelo cliente (modo `single`). */
    singleImageUrl?: string | null;
}
export interface PieceCharacterBlock extends PieceBlockBase {
    type: 'character';
    kitId: string;
    mode: 'in_piece' | 'logo_face';
    /** Painel liso atrás do personagem (lançamento: sempre liso; `none` só com chroma, fase 2). */
    panel: {
        shape: 'none' | 'card' | 'circle';
        color: string;
    };
}
export type PieceBlock = PieceLogoBlock | PieceTextBlock | PieceFooterBlock | PieceProductsBlock | PieceCharacterBlock;
export interface PieceFont {
    family: string;
    /** Arquivo da fonte (.woff2/.woff/.ttf/.otf); no render, URL absoluta. */
    url: string;
}
export interface PieceDocument {
    schemaVersion: number;
    aspectRatio: PieceAspectRatio;
    background: PieceBackground;
    blocks: PieceBlock[];
    /** Fontes da conta usadas pelos textos (família + arquivo). */
    fonts?: PieceFont[];
}
/**
 * Props da composição `OfferPieceStill`: o descritor com TODAS as mídias e
 * fontes em URL absoluta, as dimensões do formato e as fontes a carregar
 * (alias, não interface: o Remotion exige props atribuíveis a Record<string, unknown>).
 */
export type OfferPieceStillProps = {
    document: PieceDocument;
    width: number;
    height: number;
    fonts: PieceFont[];
};
/** Primeiro bloco de um tipo (a peça tem no máximo um de logo/footer/products/character). */
export declare function pieceBlock<T extends PieceBlockType>(document: PieceDocument, type: T): Extract<PieceBlock, {
    type: T;
}> | null;
export declare function pieceDimensions(aspectRatio: PieceAspectRatio): {
    width: number;
    height: number;
};
/** URLs de mídia que a peça referencia (fundo, logo, fotos, imagem única), sem repetição. */
export declare function pieceMediaUrls(document: PieceDocument): string[];
export {};
//# sourceMappingURL=types.d.ts.map