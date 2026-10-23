import { describe, expect, it } from 'vitest';
import pieceSample from '../fixtures/piece-9x16.json';
import {
  type OfferPieceStillProps,
  parseOfferPieceStillProps,
  parsePieceDocument,
  pieceBlock,
  pieceDimensions,
  pieceMediaUrls,
  type PieceDocument,
} from '../src/core/piece/index';
import { compositionIdForInputProps, OFFER_PIECE_STILL_COMPOSITION_ID } from '../src/core/version';

const props = (): OfferPieceStillProps =>
  structuredClone(pieceSample) as unknown as OfferPieceStillProps;
const doc = (): PieceDocument => props().document;

/** Tarefas 3.4 e 3.6 — schema do descritor, props do quadro e a fixture compartilhada. */
describe('parsePieceDocument / parseOfferPieceStillProps', () => {
  it('a fixture piece-9x16 é um descritor válido e props válidas do quadro (1080×1920)', () => {
    const parsed = parsePieceDocument(doc());
    expect(parsed.success).toBe(true);
    const still = parseOfferPieceStillProps(props());
    expect(still.success).toBe(true);
    expect(pieceDimensions('9:16')).toEqual({ width: 1080, height: 1920 });
    expect(pieceBlock(doc(), 'products')?.items).toHaveLength(6);
    expect(pieceBlock(doc(), 'character')?.panel.color).toBe('#FFE082');
    expect(pieceMediaUrls(doc())).toEqual([
      'fixtures/logo.png',
      'fixtures/products/picanha.png',
      'fixtures/products/arroz.png',
      'fixtures/products/cafe.png',
      'fixtures/products/leite.png',
      'fixtures/products/oleo.png',
      'fixtures/products/refri.png',
    ]);
  });

  it('o parse devolve o documento tipado e NÃO repete regras de negócio (poucos produtos passam)', () => {
    const d = doc();
    const products = pieceBlock(d, 'products');
    if (!products) throw new Error('fixture sem produtos');
    products.items = products.items.slice(0, 1);
    const parsed = parsePieceDocument(d);
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(pieceBlock(parsed.data, 'products')?.items).toHaveLength(1);
  });

  it('recusa forma errada apontando o caminho: formato, bloco desconhecido, rect incompleto, fontSize ≤ 0', () => {
    const bad = parsePieceDocument({
      ...doc(),
      aspectRatio: '1:1',
      blocks: [
        { id: 'x', type: 'sticker', rect: { x: 0, y: 0, w: 1, h: 1 }, zIndex: 1 },
        { id: 'logo', type: 'logo', rect: { x: 0, y: 0, w: 1 }, zIndex: 1, imageUrl: null },
        {
          id: 't',
          type: 'text',
          rect: { x: 0, y: 0, w: 1, h: 0.1 },
          zIndex: 1,
          text: 'a',
          fontSize: 0,
          color: '#000000',
          align: 'left',
          weight: 'bold',
        },
      ],
    });
    expect(bad.success).toBe(false);
    if (!bad.success) {
      const paths = bad.issues.map((i) => i.path);
      expect(paths).toContain('aspectRatio');
      expect(paths.some((p) => p.startsWith('blocks.0'))).toBe(true);
      expect(paths).toContain('blocks.1.rect.h');
      expect(paths).toContain('blocks.2.fontSize');
    }
    expect(parsePieceDocument(null).success).toBe(false);
    expect(parsePieceDocument({ ...doc(), background: { mode: 'neon' } }).success).toBe(false);
  });

  it('props do quadro: dimensões têm de ser as do formato e as mídias/fontes URLs que o navegador resolve', () => {
    const wrongDims = parseOfferPieceStillProps({ ...props(), height: 1350 });
    expect(wrongDims.success).toBe(false);
    if (!wrongDims.success) expect(wrongDims.issues[0]?.message).toContain('1080×1920');

    const p = props();
    const products = pieceBlock(p.document, 'products');
    if (!products?.items[0]) throw new Error('fixture sem produtos');
    products.items[0].imageUrl = '/uploads/gallery/picanha.png';
    const rawUploads = parseOfferPieceStillProps(p);
    expect(rawUploads.success).toBe(false);
    if (!rawUploads.success) {
      expect(rawUploads.issues[0]?.message).toContain('/uploads/gallery/picanha.png');
    }

    const absolute = props();
    const items = pieceBlock(absolute.document, 'products')?.items ?? [];
    items.forEach((item) => {
      item.imageUrl = `http://127.0.0.1:3001/uploads/gallery/${item.id}.png`;
    });
    absolute.fonts = [{ family: 'Bebas Neue', url: 'http://127.0.0.1:3001/uploads/fonts/bebas.ttf' }];
    expect(parseOfferPieceStillProps(absolute).success).toBe(true);
    absolute.fonts = [{ family: 'Bebas Neue', url: '/uploads/fonts/bebas.ttf' }];
    const badFont = parseOfferPieceStillProps(absolute);
    expect(badFont.success).toBe(false);
    if (!badFont.success) expect(badFont.issues[0]?.path).toBe('fonts.0.url');
  });

  it('a raiz do bundle descobre a composição pelas input props', () => {
    expect(compositionIdForInputProps(props())).toBe(OFFER_PIECE_STILL_COMPOSITION_ID);
    expect(compositionIdForInputProps({ offers: [], lines: [] })).toBe('OfferCarousel');
    expect(compositionIdForInputProps({})).toBeNull();
    expect(compositionIdForInputProps(null)).toBeNull();
  });
});
