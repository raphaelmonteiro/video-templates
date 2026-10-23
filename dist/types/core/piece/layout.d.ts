import type { PieceRect } from './types';
/**
 * Auto-layout da ÁREA DE PRODUTOS da peça (tarefa 3.1 da change
 * video-peca-configuravel): distribui N produtos em células dentro do
 * `areaRect` (frações do quadro), com um destaque opcional ocupando duas
 * colunas na primeira linha.
 *
 * Determinístico e puro — o editor roda a cada mudança ("arrumar de novo"), o
 * worker desenha as MESMAS células no quadro parado quando `layout: 'auto'` e
 * o servidor re-layouta ao duplicar a peça em outro formato.
 *
 * Distribuições (colunas por quantidade): 1 → 1; 2 → 2; 3 → 3 em área larga
 * (w/h ≥ 1,2) ou 2+1; 4 → 2×2; 5–9 → 3 colunas; 10–12 → 4. Com `featuredId`
 * (N ≥ 3) o destaque ocupa 2 colunas na primeira linha e os demais seguem na
 * grade. A última linha incompleta fica CENTRALIZADA (design: "5, 7 e 9 a 12
 * usam a seguinte com a última linha centralizada"). Folga entre células = 2%
 * da largura da área (a mesma em px nos dois eixos).
 *
 * Tamanhos mínimos de texto, a 1080 px de largura: preço ≥ 36 px, nome ≥ 24 px
 * (`textScale` leva a célula a esses mínimos; o canvas aplica).
 */
export interface LayoutProductsInput {
    /** Área de produtos em frações do quadro. */
    areaRect: PieceRect;
    /** Dimensões do quadro em px (proporção real das células e mínimos de texto). */
    width: number;
    height: number;
    /** Ids dos itens, na ordem da peça. */
    itemIds: string[];
    featuredId?: string | null;
}
export interface LayoutProductsResult {
    rects: Record<string, PieceRect>;
    cols: number;
    rows: number;
    /** Largura/altura de uma célula comum em px. */
    cellPx: {
        width: number;
        height: number;
    };
    /** Fator aplicado aos textos (1 = tamanho base; > 1 quando a célula é pequena e os mínimos mandam). */
    textScale: number;
}
export declare const LAYOUT_GAP_RATIO = 0.02;
export declare const PRICE_MIN_PX_AT_1080 = 36;
export declare const NAME_MIN_PX_AT_1080 = 24;
/** Preço base = 16% da largura da célula; nome base = 9% (ver `productTextSizes`). */
export declare const PRICE_BASE_RATIO = 0.16;
export declare const NAME_BASE_RATIO = 0.09;
export declare function columnsFor(count: number, areaAspect: number): number;
/** Tamanhos de texto (px) de uma célula, respeitando os mínimos a 1080 de largura. */
export declare function productTextSizes(cellWidthPx: number, frameWidthPx: number): {
    pricePx: number;
    namePx: number;
    scale: number;
};
export declare function layoutProducts(input: LayoutProductsInput): LayoutProductsResult;
//# sourceMappingURL=layout.d.ts.map