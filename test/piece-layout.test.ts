import { describe, expect, it } from 'vitest';
import { columnsFor, layoutProducts, productTextSizes } from '../src/core/piece/layout';
import type { PieceRect } from '../src/core/piece/types';

const AREA: PieceRect = { x: 0.05, y: 0.2, w: 0.9, h: 0.52 };
const ids = (n: number) => Array.from({ length: n }, (_, i) => `p${i + 1}`);

const inside = (rect: PieceRect, area: PieceRect) =>
  rect.x >= area.x - 1e-6 &&
  rect.y >= area.y - 1e-6 &&
  rect.x + rect.w <= area.x + area.w + 1e-6 &&
  rect.y + rect.h <= area.y + area.h + 1e-6;

const overlaps = (a: PieceRect, b: PieceRect) =>
  a.x < b.x + b.w - 1e-6 &&
  b.x < a.x + a.w - 1e-6 &&
  a.y < b.y + b.h - 1e-6 &&
  b.y < a.y + a.h - 1e-6;

const rect = (result: ReturnType<typeof layoutProducts>, id: string): PieceRect => {
  const r = result.rects[id];
  if (!r) throw new Error(`sem rect para ${id}`);
  return r;
};

/**
 * Tarefa 3.1 — auto-layout da área de produtos, números FIXADOS a 1080×1920.
 * O editor (frontend) e o quadro parado (worker) usam esta função; se um
 * número mudar aqui, muda nos dois lados ao mesmo tempo.
 */
describe('layoutProducts', () => {
  it('colunas por quantidade: 1→1, 2→2, 3→2 (área alta) ou 3 (larga), 4→2, 5–9→3, 10–12→4', () => {
    expect([1, 2, 3, 4, 5, 9, 10, 12].map((n) => columnsFor(n, 0.97))).toEqual([
      1, 2, 2, 2, 3, 3, 4, 4,
    ]);
    expect(columnsFor(3, 1.5)).toBe(3);
  });

  it('4 produtos em 9:16 → 2×2 com folga de 2% da área; células dentro da área, sem sobreposição', () => {
    const result = layoutProducts({ areaRect: AREA, width: 1080, height: 1920, itemIds: ids(4) });
    expect([result.cols, result.rows]).toEqual([2, 2]);
    const rects = Object.values(result.rects);
    expect(rects).toHaveLength(4);
    rects.forEach((r) => expect(inside(r, AREA)).toBe(true));
    for (let i = 0; i < rects.length; i += 1) {
      for (let j = i + 1; j < rects.length; j += 1) {
        expect(overlaps(rects[i] as PieceRect, rects[j] as PieceRect)).toBe(false);
      }
    }
    // gap = 0.9 × 2% = 0.018; célula = (0.9 − 3×0.018)/2 = 0.423
    expect(rect(result, 'p1')).toEqual({ x: 0.068, y: 0.21013, w: 0.423, h: 0.24481 });
    expect(rect(result, 'p4').x).toBeCloseTo(0.509, 5);
    expect(result.cellPx).toEqual({ width: 457, height: 470 });
    expect(result.textScale).toBe(1);
  });

  it('destaque ocupa duas colunas na primeira linha; os demais seguem na grade (6 itens → 3×3)', () => {
    const result = layoutProducts({
      areaRect: AREA,
      width: 1080,
      height: 1920,
      itemIds: ids(6),
      featuredId: 'p3',
    });
    expect([result.cols, result.rows]).toEqual([3, 3]);
    const featured = rect(result, 'p3');
    const common = rect(result, 'p1');
    expect(featured.w).toBeCloseTo(common.w * 2 + 0.018, 4);
    expect(featured.x).toBe(0.068);
    // p1 (primeiro não destacado) fica à direita do destaque, na primeira linha
    expect(common.y).toBe(featured.y);
    expect(common.x).toBeGreaterThan(featured.x + featured.w - 1e-6);
    const all = Object.values(result.rects);
    all.forEach((r) => expect(inside(r, AREA)).toBe(true));
    for (let i = 0; i < all.length; i += 1) {
      for (let j = i + 1; j < all.length; j += 1) {
        expect(overlaps(all[i] as PieceRect, all[j] as PieceRect)).toBe(false);
      }
    }
  });

  it('destaque é ignorado com menos de 3 itens ou id desconhecido; ids repetidos contam uma vez; vazio → nada', () => {
    const base = { areaRect: AREA, width: 1080, height: 1920 };
    expect(layoutProducts({ ...base, itemIds: ids(2), featuredId: 'p1' }).rows).toBe(1);
    expect(rect(layoutProducts({ ...base, itemIds: ids(4), featuredId: 'zz' }), 'p1').w).toBeCloseTo(
      0.423,
      5,
    );
    expect(Object.keys(layoutProducts({ ...base, itemIds: ['a', 'a', 'b'] }).rects)).toEqual([
      'a',
      'b',
    ]);
    expect(layoutProducts({ ...base, itemIds: [] })).toEqual({
      rects: {},
      cols: 0,
      rows: 0,
      cellPx: { width: 0, height: 0 },
      textScale: 1,
    });
  });

  it('4:5 com 12 itens → 4×3; textos crescem até os mínimos (preço ≥ 36 px, nome ≥ 24 px a 1080)', () => {
    const result = layoutProducts({
      areaRect: { x: 0.05, y: 0.18, w: 0.9, h: 0.6 },
      width: 1080,
      height: 1350,
      itemIds: ids(12),
    });
    expect([result.cols, result.rows]).toEqual([4, 3]);
    // célula ≈ (0.9 − 5×0.018)/4 = 0.2025 → 219 px: preço base 35 px < 36 → escala sobe
    expect(result.cellPx.width).toBe(219);
    const sizes = productTextSizes(result.cellPx.width, 1080);
    expect(sizes.pricePx).toBeGreaterThanOrEqual(36);
    expect(sizes.namePx).toBeGreaterThanOrEqual(24);
    expect(result.textScale).toBeGreaterThan(1);
    // célula larga: tamanhos base, escala 1
    expect(productTextSizes(457, 1080)).toEqual({ pricePx: 73, namePx: 41, scale: 1 });
  });

  it('a última linha incompleta fica centralizada (5 itens → 3 + 2 centrados; com destaque, o item sozinho vai ao meio)', () => {
    const five = layoutProducts({ areaRect: AREA, width: 1080, height: 1920, itemIds: ids(5) });
    expect([five.cols, five.rows]).toEqual([3, 2]);
    // célula = (0.9 − 4×0.018)/3 = 0.276; passo = 0.294; meia coluna de deslocamento
    expect(rect(five, 'p1').x).toBe(0.068);
    expect(rect(five, 'p4').x).toBeCloseTo(0.068 + 0.294 / 2, 5);
    expect(rect(five, 'p5').x).toBeCloseTo(0.068 + 0.294 * 1.5, 5);
    expect(rect(five, 'p4').y).toBe(rect(five, 'p5').y);
    const featured = layoutProducts({
      areaRect: AREA,
      width: 1080,
      height: 1920,
      itemIds: ids(6),
      featuredId: 'p1',
    });
    // linha 0: destaque (2 col) + p2; linha 1: p3 p4 p5; linha 2: p6 sozinho, centrado
    expect(rect(featured, 'p6').x).toBeCloseTo(0.068 + 0.294, 5);
    expect(rect(featured, 'p3').x).toBe(0.068);
    // linhas completas não mudam
    const twelve = layoutProducts({ areaRect: AREA, width: 1080, height: 1920, itemIds: ids(12) });
    expect(rect(twelve, 'p9').x).toBe(0.068);
  });

  it('é determinístico: a mesma entrada dá a mesma saída', () => {
    const input = { areaRect: AREA, width: 1080, height: 1920, itemIds: ids(5), featuredId: 'p2' };
    expect(layoutProducts(input)).toEqual(layoutProducts(input));
  });
});
