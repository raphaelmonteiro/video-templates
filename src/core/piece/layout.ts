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
  cellPx: { width: number; height: number };
  /** Fator aplicado aos textos (1 = tamanho base; > 1 quando a célula é pequena e os mínimos mandam). */
  textScale: number;
}

export const LAYOUT_GAP_RATIO = 0.02;
export const PRICE_MIN_PX_AT_1080 = 36;
export const NAME_MIN_PX_AT_1080 = 24;
/** Preço base = 16% da largura da célula; nome base = 9% (ver `productTextSizes`). */
export const PRICE_BASE_RATIO = 0.16;
export const NAME_BASE_RATIO = 0.09;

export function columnsFor(count: number, areaAspect: number): number {
  if (count <= 1) return 1;
  if (count === 2) return 2;
  if (count === 3) return areaAspect >= 1.2 ? 3 : 2;
  if (count === 4) return 2;
  if (count <= 9) return 3;
  return 4;
}

/** Tamanhos de texto (px) de uma célula, respeitando os mínimos a 1080 de largura. */
export function productTextSizes(
  cellWidthPx: number,
  frameWidthPx: number,
): { pricePx: number; namePx: number; scale: number } {
  const unit = frameWidthPx / 1080;
  const priceMin = PRICE_MIN_PX_AT_1080 * unit;
  const nameMin = NAME_MIN_PX_AT_1080 * unit;
  const priceBase = cellWidthPx * PRICE_BASE_RATIO;
  const nameBase = cellWidthPx * NAME_BASE_RATIO;
  const scale = Math.max(1, priceMin / priceBase, nameMin / nameBase);
  return {
    pricePx: Math.round(priceBase * scale),
    namePx: Math.round(nameBase * scale),
    scale: Number(scale.toFixed(4)),
  };
}

const round = (value: number) => Number(value.toFixed(5));

export function layoutProducts(input: LayoutProductsInput): LayoutProductsResult {
  const { areaRect, width, height } = input;
  const ids = input.itemIds.filter((id, i, all) => all.indexOf(id) === i);
  const count = ids.length;
  if (count === 0) {
    return { rects: {}, cols: 0, rows: 0, cellPx: { width: 0, height: 0 }, textScale: 1 };
  }
  const areaPx = { w: areaRect.w * width, h: areaRect.h * height };
  const featured =
    input.featuredId && count >= 3 && ids.includes(input.featuredId) ? input.featuredId : null;
  const cols = columnsFor(count, areaPx.w / Math.max(1, areaPx.h));
  // com destaque: a primeira linha tem o destaque (2 colunas) + (cols-2) itens comuns
  const firstRowOthers = featured ? Math.max(0, cols - 2) : cols;
  const rest = featured ? count - 1 - firstRowOthers : count;
  const rows = featured ? 1 + Math.ceil(Math.max(0, rest) / cols) : Math.ceil(count / cols);
  const gapX = areaRect.w * LAYOUT_GAP_RATIO;
  const gapY = (gapX * width) / height; // mesma folga em px nos dois eixos
  const cellW = (areaRect.w - gapX * (cols + 1)) / cols;
  const cellH = (areaRect.h - gapY * (rows + 1)) / rows;

  const rects: Record<string, PieceRect> = {};
  const place = (id: string, col: number, row: number, span = 1) => {
    rects[id] = {
      x: round(areaRect.x + gapX + col * (cellW + gapX)),
      y: round(areaRect.y + gapY + row * (cellH + gapY)),
      w: round(cellW * span + gapX * (span - 1)),
      h: round(cellH),
    };
  };
  const ordered = featured ? [featured, ...ids.filter((id) => id !== featured)] : ids;
  let index = 0;
  if (featured) {
    place(featured, 0, 0, Math.min(2, cols));
    index = 1;
    for (let col = Math.min(2, cols); col < cols && index < ordered.length; col += 1) {
      place(ordered[index] as string, col, 0);
      index += 1;
    }
  }
  let row = featured ? 1 : 0;
  while (index < ordered.length) {
    // linha incompleta (só pode ser a última) centralizada: deslocamento em colunas
    const inRow = Math.min(cols, ordered.length - index);
    const offset = (cols - inRow) / 2;
    for (let col = 0; col < inRow; col += 1) {
      place(ordered[index] as string, col + offset, row);
      index += 1;
    }
    row += 1;
  }
  const cellPx = { width: Math.round(cellW * width), height: Math.round(cellH * height) };
  return { rects, cols, rows, cellPx, textScale: productTextSizes(cellPx.width, width).scale };
}
