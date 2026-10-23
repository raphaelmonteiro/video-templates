import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import pieceSample from '../fixtures/piece-9x16.json';
import {
  absoluteUrl,
  backgroundStyle,
  footerLines,
  PieceCanvas,
  type PieceImgProps,
  pieceSafeArea,
  rectToPx,
} from '../src/components/piece/PieceCanvas';
import { layoutProducts } from '../src/core/piece/layout';
import {
  type OfferPieceStillProps,
  pieceBlock,
  type PieceDocument,
  type PieceProductsBlock,
} from '../src/core/piece/types';

function fixture(): PieceDocument {
  return {
    schemaVersion: 1,
    aspectRatio: '9:16',
    background: { mode: 'solid', color: '#F3F4F6' },
    fonts: [{ family: 'Bebas Neue', url: '/uploads/fonts/bebas.ttf' }],
    blocks: [
      {
        id: 'products',
        type: 'products',
        rect: { x: 0.05, y: 0.2, w: 0.9, h: 0.52 },
        zIndex: 1,
        mode: 'grid',
        layout: 'auto',
        areaStyle: { background: '#FFFFFF', radius: 0.03, shadow: true },
        tagStyle: { kind: 'badge', color: '#D32F2F', textColor: '#FFFFFF' },
        items: [
          {
            id: 'it-1',
            name: 'Picanha bovina',
            price: '59,90',
            unit: 'kg',
            imageUrl: '/uploads/gallery/p1.png',
            spoken: true,
          },
          {
            id: 'it-2',
            name: 'Cerveja lata',
            grams: '350 ml',
            price: '3,49',
            originalPrice: '4,29',
            imageUrl: '/uploads/gallery/p2.png',
            spoken: false,
          },
        ],
      },
      {
        id: 'footer',
        type: 'footer',
        rect: { x: 0, y: 0.92, w: 1, h: 0.08 },
        zIndex: 2,
        style: 'bar',
        address: 'Rua das Flores, 100',
        phone: '(11) 99999-0000',
        validity: { from: '2026-04-14', to: '2026-04-16' },
        legal: 'ou enquanto durarem os estoques',
        backgroundColor: '#111827',
        textColor: '#FFFFFF',
      },
      {
        id: 'logo',
        type: 'logo',
        rect: { x: 0.05, y: 0.03, w: 0.3, h: 0.1 },
        zIndex: 3,
        imageUrl: '/uploads/logos/c.png',
      },
      {
        id: 'text-0',
        type: 'text',
        rect: { x: 0.4, y: 0.04, w: 0.55, h: 0.08 },
        zIndex: 3,
        text: 'OFERTAS & CIA',
        fontFamily: 'Bebas Neue',
        fontSize: 0.06,
        color: '#D32F2F',
        align: 'right',
        weight: 'bold',
      },
      {
        id: 'character',
        type: 'character',
        rect: { x: 0.58, y: 0.6, w: 0.37, h: 0.28 },
        zIndex: 4,
        kitId: 'kit-1',
        mode: 'in_piece',
        panel: { shape: 'card', color: '#FFE082' },
      },
    ],
  };
}

const products = (doc: PieceDocument): PieceProductsBlock => {
  const block = pieceBlock(doc, 'products');
  if (!block) throw new Error('fixture sem produtos');
  return block;
};

/** Tarefa 3.2 — o canvas desenha o descritor sem estado (renderToStaticMarkup). */
describe('PieceCanvas', () => {
  it('quadro 1080×1920: fundo sólido, @font-face das fontes da conta, um nó por bloco com as mídias absolutas', () => {
    const html = renderToStaticMarkup(
      <PieceCanvas document={fixture()} width={1080} height={1920} assetBase="http://api.local" />,
    );
    expect(html).toContain('data-piece-canvas=""');
    expect(html).toContain('width:1080px;height:1920px');
    expect(html).toContain('background:#F3F4F6');
    expect(html).toContain(
      "@font-face{font-family:&#x27;Bebas Neue&#x27;;src:url(&quot;http://api.local/uploads/fonts/bebas.ttf&quot;)",
    );
    expect(html).toContain('data-piece-block="logo"');
    expect(html).toContain('src="http://api.local/uploads/logos/c.png"');
    expect(html).toContain('src="http://api.local/uploads/gallery/p1.png"');
    expect(html).toContain('Picanha bovina');
    expect(html).toContain('59,90');
    expect(html).toContain('/kg');
    expect(html).toContain('de R$ 4,29'); // preço anterior riscado
    expect(html).toContain('350 ml');
    expect(html).toContain('OFERTAS &amp; CIA');
    expect(html).toContain('Rua das Flores, 100 · (11) 99999-0000');
    expect(html).toContain('Ofertas válidas de 14/04 a 16/04');
    // painel do personagem na cor do bloco, posicionado pelo rect (626, 1152)
    expect(html).toContain('background:#FFE082');
    expect(html).toContain('left:626px;top:1152px');
    // logo em (54, 58) 324×192
    expect(html).toContain('left:54px;top:58px;width:324px;height:192px');
  });

  it('fundo em degradê e imagem (um <img> cobrindo o quadro, com fit/blur/escurecimento); logo ausente mostra o espaço reservado', () => {
    const gradient = backgroundStyle({
      ...fixture(),
      background: { mode: 'gradient', colors: ['#D32F2F', '#F9A825'], angle: 160 },
    });
    expect(gradient.base.background).toBe('linear-gradient(160deg, #D32F2F, #F9A825)');
    const image = backgroundStyle(
      {
        ...fixture(),
        background: { mode: 'image', imageUrl: '/uploads/bg.jpg', fit: 'contain', blur: 0.5, darken: 0.3 },
      },
      'http://api.local',
    );
    expect(image.image?.src).toBe('http://api.local/uploads/bg.jpg');
    expect(image.image?.style).toMatchObject({ objectFit: 'contain', filter: 'blur(12px)' });
    expect(image.darken).toBe(0.3);
    const withImage = renderToStaticMarkup(
      <PieceCanvas
        document={{
          ...fixture(),
          background: { mode: 'image', imageUrl: '/uploads/bg.jpg', darken: 0.3 },
        }}
        width={1080}
        height={1920}
        assetBase="http://api.local"
      />,
    );
    expect(withImage).toContain('src="http://api.local/uploads/bg.jpg"');
    expect(withImage).toContain('background:rgba(0,0,0,0.3)');

    const doc = fixture();
    const logo = pieceBlock(doc, 'logo');
    if (logo) logo.imageUrl = null;
    expect(renderToStaticMarkup(<PieceCanvas document={doc} width={1080} height={1920} />)).toContain(
      'LOGO',
    );
  });

  it('imagem única: foto da área e até 3 selos; layout manual usa os rects dos itens', () => {
    const doc = fixture();
    const single = products(doc);
    single.mode = 'single';
    single.singleImageUrl = '/uploads/gallery/mesa.png';
    let html = renderToStaticMarkup(
      <PieceCanvas document={doc} width={1080} height={1920} assetBase="http://x" />,
    );
    expect(html).toContain('src="http://x/uploads/gallery/mesa.png"');
    expect(html).not.toContain('src="http://x/uploads/gallery/p1.png"');
    expect(html).toContain('Picanha bovina');

    const manual = fixture();
    const block = products(manual);
    block.layout = 'manual';
    const [first, second] = block.items;
    if (!first || !second) throw new Error('fixture com menos de 2 itens');
    first.rect = { x: 0.1, y: 0.3, w: 0.3, h: 0.2 };
    second.rect = { x: 0.5, y: 0.3, w: 0.3, h: 0.2 };
    html = renderToStaticMarkup(<PieceCanvas document={manual} width={1080} height={1920} />);
    expect(html).toContain('left:108px;top:576px;width:324px;height:384px');
    expect(html).toContain('left:540px;top:576px;width:324px;height:384px');
  });

  it('seleção, guias da área segura e poster do personagem', () => {
    const html = renderToStaticMarkup(
      <PieceCanvas
        document={fixture()}
        width={1080}
        height={1920}
        selectedBlockId="character"
        showSafeArea
        characterPosterUrl="http://x/tile.png"
      />,
    );
    expect(html).toContain('outline:3px solid #2563EB');
    expect(html).toContain('data-piece-safe-area=""');
    expect(html).toContain('src="http://x/tile.png"');
    expect(pieceSafeArea(1080, 1920)).toEqual({ x: 43, y: 43, width: 994, height: 1834 });
  });

  it('o Remotion troca o <img> e a resolução de URL: imgComponent recebe cada mídia já resolvida', () => {
    const seen: string[] = [];
    const Spy: React.FC<PieceImgProps> = (p) => {
      seen.push(p.src);
      return <i data-src={p.src} />;
    };
    const html = renderToStaticMarkup(
      <PieceCanvas
        document={fixture()}
        width={1080}
        height={1920}
        imgComponent={Spy}
        resolveAssetUrl={(url) => `static:${url}`}
        characterPosterUrl="poster.png"
      />,
    );
    expect(html).not.toContain('<img');
    expect(seen).toEqual([
      'static:/uploads/gallery/p1.png',
      'static:/uploads/gallery/p2.png',
      'static:/uploads/logos/c.png',
      'poster.png',
    ]);
    expect(html).toContain('src:url(&quot;static:/uploads/fonts/bebas.ttf&quot;)');
  });

  it('a fixture compartilhada (piece-9x16) desenha as células do auto-layout com destaque (3 colunas, 3 linhas)', () => {
    const { document } = structuredClone(pieceSample) as unknown as OfferPieceStillProps;
    const block = products(document);
    const layout = layoutProducts({
      areaRect: block.rect,
      width: 1080,
      height: 1920,
      itemIds: block.items.map((i) => i.id),
      featuredId: 'it-picanha',
    });
    expect([layout.cols, layout.rows]).toEqual([3, 3]);
    const html = renderToStaticMarkup(<PieceCanvas document={document} width={1080} height={1920} />);
    const featured = rectToPx(layout.rects['it-picanha'] as NonNullable<typeof layout.rects.x>, 1080, 1920);
    expect(html).toContain(`left:${featured.x}px;top:${featured.y}px;width:${featured.width}px`);
    // destaque largo (2 colunas): foto à esquerda; as células comuns ficam na vertical
    expect(featured.width / featured.height).toBeGreaterThanOrEqual(1.4);
    expect(html.match(/data-piece-cell="horizontal"/g)).toHaveLength(1);
    expect(html.match(/data-piece-cell="vertical"/g)).toHaveLength(5);
    expect(html).toContain('OFERTAS DA SEMANA');
    expect(html).toContain('Ofertas válidas de 20/10 a 26/10');
    expect(html).toContain('linear-gradient(160deg, #C62828, #7F0000)');
  });

  it('helpers: URLs absolutas, frações → px sem buracos, linhas do rodapé', () => {
    expect(absoluteUrl('/uploads/a.png', 'http://api/')).toBe('http://api/uploads/a.png');
    expect(absoluteUrl('https://cdn/x.png', 'http://api')).toBe('https://cdn/x.png');
    expect(absoluteUrl('data:image/png;base64,AA', 'http://api')).toBe('data:image/png;base64,AA');
    expect(absoluteUrl('  ', 'http://api')).toBeNull();
    expect(absoluteUrl('/uploads/a.png')).toBe('/uploads/a.png');
    expect(rectToPx({ x: 0.05, y: 0.2, w: 0.9, h: 0.52 }, 1080, 1920)).toEqual({
      x: 54,
      y: 384,
      width: 972,
      height: 998,
    });
    expect(
      footerLines({
        id: 'f',
        type: 'footer',
        rect: { x: 0, y: 0.9, w: 1, h: 0.1 },
        zIndex: 1,
        style: 'pill',
        phone: '(11) 1',
        validity: { from: '2026-04-14', to: '2026-04-16' },
        backgroundColor: '#000',
        textColor: '#fff',
      }),
    ).toEqual(['(11) 1', 'Ofertas válidas de 14/04 a 16/04']);
  });
});
