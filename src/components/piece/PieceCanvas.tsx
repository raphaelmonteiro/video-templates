import type { ComponentType, CSSProperties, ReactNode } from 'react';
import type { PxRect } from '../../core/layout';
import { layoutProducts, productTextSizes } from '../../core/piece/layout';
import type {
  PieceBlock,
  PieceCharacterBlock,
  PieceDocument,
  PieceFooterBlock,
  PieceLogoBlock,
  PieceProductItem,
  PieceProductsBlock,
  PieceRect,
  PieceTextBlock,
} from '../../core/piece/types';

/**
 * `PieceCanvas` (tarefa 3.2 da change video-peca-configuravel): desenha o
 * descritor da peça em tamanho NATURAL (`width`×`height` px). O editor escala
 * por CSS `transform: scale`; o worker renderiza o MESMO componente na
 * composição `OfferPieceStill` (Remotion). Sem estado e sem dependência do
 * Remotion — só React —, para o frontend importar de
 * `@chroma/video-templates/piece` sem carregar o Remotion.
 *
 * - fundo: cor, degradê (ângulo CSS) ou imagem (fit, blur, escurecimento);
 * - blocos por `zIndex`: logo, textos (fonte da conta ou padrão), rodapé
 *   faixa/pill (endereço · telefone · validade · texto legal), área de
 *   produtos (grade auto/manual ou imagem única com selos) e painel liso do
 *   personagem (com o poster do tile, quando dado);
 * - mídias: URL relativa vira absoluta por `assetBase`; o Remotion passa
 *   `resolveAssetUrl` (staticFile) e `imgComponent` (`<Img>`, que segura o
 *   quadro até a imagem carregar — por isso toda imagem, inclusive o fundo, é
 *   um `<img>`, nunca `background-image`).
 */

export interface PieceImgProps {
  src: string;
  alt?: string;
  style?: CSSProperties;
  draggable?: boolean;
}

export interface PieceCanvasProps {
  document: PieceDocument;
  width: number;
  height: number;
  /** Base das URLs relativas (`/uploads/...`); vazio = como está. */
  assetBase?: string;
  /** Resolve a URL final de cada mídia/fonte (padrão: `absoluteUrl(url, assetBase)`). */
  resolveAssetUrl?: (url: string) => string;
  /** Componente de imagem (padrão `<img>`; o Remotion passa `Img`). */
  imgComponent?: ComponentType<PieceImgProps>;
  /** Poster do tile do personagem (silhueta na prévia / quadro); null = painel vazio. */
  characterPosterUrl?: string | null;
  /** Família padrão dos textos sem fonte da conta. */
  defaultFontFamily?: string;
  /** Envolve cada bloco (o editor coloca as alças de arrasto por aqui). */
  renderBlock?: (block: PieceBlock, content: ReactNode, px: PxRect) => ReactNode;
  /** Chamado no clique num bloco (o editor seleciona). */
  onBlockClick?: (blockId: string) => void;
  /** Bloco destacado (o editor desenha a borda). */
  selectedBlockId?: string | null;
  /** Mostra guias da área segura (editor). */
  showSafeArea?: boolean;
}

export const DEFAULT_PIECE_FONT = "'DejaVu Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif";

export function absoluteUrl(url: string | null | undefined, base?: string): string | null {
  const trimmed = (url ?? '').trim();
  if (!trimmed) return null;
  if (/^(?:https?:|data:|blob:)/i.test(trimmed) || !base) return trimmed;
  const root = base.replace(/\/+$/, '');
  return trimmed.startsWith('/') ? `${root}${trimmed}` : `${root}/${trimmed}`;
}

/** Frações → pixels do quadro, sem buracos entre blocos vizinhos. */
export function rectToPx(rect: PieceRect, width: number, height: number): PxRect {
  const x = Math.round(rect.x * width);
  const y = Math.round(rect.y * height);
  return {
    x,
    y,
    width: Math.max(1, Math.round((rect.x + rect.w) * width) - x),
    height: Math.max(1, Math.round((rect.y + rect.h) * height) - y),
  };
}

/** Área segura da peça (margem de 4% da largura) — guias do editor e aviso de bloco fora. */
export function pieceSafeArea(width: number, height: number): PxRect {
  const margin = Math.round(width * 0.04);
  return { x: margin, y: margin, width: width - margin * 2, height: height - margin * 2 };
}

type ResolveUrl = (url: string | null | undefined) => string | null;

const abs = (px: PxRect): CSSProperties => ({
  position: 'absolute',
  left: px.x,
  top: px.y,
  width: px.width,
  height: px.height,
  boxSizing: 'border-box',
});

export interface PieceBackgroundStyle {
  base: CSSProperties;
  /** Fundo em imagem: `src` e estilo do `<img>` que cobre o quadro; null nos outros modos. */
  image: { src: string; style: CSSProperties } | null;
  /** 0..1 — camada preta por cima da imagem. */
  darken: number;
}

export function backgroundStyle(
  document: PieceDocument,
  assetBase?: string,
  resolveUrl?: (url: string) => string,
): PieceBackgroundStyle {
  const bg = document.background;
  if (bg?.mode === 'gradient') {
    const [a, b] = bg.colors ?? ['#D32F2F', '#F9A825'];
    const angle = Number.isFinite(bg.angle) ? bg.angle : 180;
    return { base: { background: `linear-gradient(${angle}deg, ${a}, ${b})` }, image: null, darken: 0 };
  }
  if (bg?.mode === 'image') {
    const trimmed = (bg.imageUrl ?? '').trim();
    const src = trimmed ? (resolveUrl ? resolveUrl(trimmed) : absoluteUrl(trimmed, assetBase)) : null;
    const blur = Math.max(0, Math.min(1, bg.blur ?? 0));
    return {
      base: { background: '#111827' },
      image: src
        ? {
            src,
            style: {
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: bg.fit === 'contain' ? 'contain' : 'cover',
              objectPosition: 'center',
              display: 'block',
              filter: blur > 0 ? `blur(${Math.round(blur * 24)}px)` : undefined,
              transform: blur > 0 ? 'scale(1.05)' : undefined,
            },
          }
        : null,
      darken: Math.max(0, Math.min(1, bg.darken ?? 0)),
    };
  }
  return {
    base: { background: (bg && 'color' in bg && bg.color) || '#F3F4F6' },
    image: null,
    darken: 0,
  };
}

const DefaultImg: ComponentType<PieceImgProps> = (props) => <img {...props} />;

interface ViewContext {
  width: number;
  height: number;
  resolve: ResolveUrl;
  Img: ComponentType<PieceImgProps>;
  fontFamily: string;
}

const LogoBlockView: React.FC<{ block: PieceLogoBlock; px: PxRect; ctx: ViewContext }> = ({
  block,
  px,
  ctx,
}) => {
  const url = ctx.resolve(block.imageUrl);
  if (!url) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: Math.round(px.height * 0.1),
          background: 'rgba(255,255,255,0.85)',
          color: '#9CA3AF',
          fontFamily: DEFAULT_PIECE_FONT,
          fontSize: Math.max(14, Math.round(px.height * 0.3)),
          fontWeight: 700,
        }}
      >
        LOGO
      </div>
    );
  }
  return (
    <ctx.Img
      src={url}
      alt=""
      draggable={false}
      style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
    />
  );
};

const TextBlockView: React.FC<{ block: PieceTextBlock; ctx: ViewContext }> = ({ block, ctx }) => {
  const size = Math.max(10, Math.round((block.fontSize || 0.05) * ctx.width));
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent:
          block.align === 'center' ? 'center' : block.align === 'right' ? 'flex-end' : 'flex-start',
        textAlign: block.align,
        fontFamily: block.fontFamily ? `'${block.fontFamily}', ${ctx.fontFamily}` : ctx.fontFamily,
        fontSize: size,
        lineHeight: 1.1,
        fontWeight: block.weight === 'bold' ? 800 : 400,
        color: block.color || '#111827',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        overflow: 'hidden',
      }}
    >
      {block.text}
    </div>
  );
};

/** Linhas do rodapé: contato, validade ("de dd/mm a dd/mm") e texto legal. */
export function footerLines(block: PieceFooterBlock): string[] {
  const lines: string[] = [];
  const contact = [block.address, block.phone].map((s) => (s ?? '').trim()).filter(Boolean);
  if (contact.length) lines.push(contact.join(' · '));
  const validity = block.validity;
  if (validity?.from && validity?.to) {
    const fmt = (iso: string) => {
      const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
      return m ? `${m[3]}/${m[2]}` : iso;
    };
    lines.push(`Ofertas válidas de ${fmt(validity.from)} a ${fmt(validity.to)}`);
  }
  if ((block.legal ?? '').trim()) lines.push((block.legal as string).trim());
  return lines;
}

const FooterBlockView: React.FC<{ block: PieceFooterBlock; px: PxRect; ctx: ViewContext }> = ({
  block,
  px,
  ctx,
}) => {
  const lines = footerLines(block);
  const size = Math.max(12, Math.round(px.height / Math.max(2.4, lines.length * 1.6 + 0.8)));
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        borderRadius: block.style === 'pill' ? px.height / 2 : 0,
        background: block.backgroundColor || '#111827',
        color: block.textColor || '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Math.round(size * 0.25),
        padding: `0 ${Math.round(px.width * 0.04)}px`,
        fontFamily: ctx.fontFamily,
        fontSize: size,
        lineHeight: 1.15,
        textAlign: 'center',
        overflow: 'hidden',
      }}
    >
      {lines.map((line, i) => (
        <div
          key={i}
          style={{
            fontWeight: i === 0 ? 700 : 400,
            opacity: i === lines.length - 1 && lines.length > 1 ? 0.8 : 1,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '100%',
          }}
        >
          {line}
        </div>
      ))}
    </div>
  );
};

export interface PriceTagStyle {
  kind: 'badge' | 'plain';
  color: string;
  textColor: string;
}

const DEFAULT_TAG: PriceTagStyle = { kind: 'badge', color: '#D32F2F', textColor: '#FFFFFF' };

const PriceTag: React.FC<{
  item: PieceProductItem;
  pricePx: number;
  tag: PriceTagStyle;
  fontFamily: string;
}> = ({ item, pricePx, tag, fontFamily }) => {
  const unit = (item.unit ?? '').trim().replace(/^\//, '');
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'baseline',
        gap: Math.round(pricePx * 0.15),
        padding:
          tag.kind === 'badge' ? `${Math.round(pricePx * 0.12)}px ${Math.round(pricePx * 0.3)}px` : 0,
        borderRadius: Math.round(pricePx * 0.25),
        background: tag.kind === 'badge' ? tag.color : 'transparent',
        color: tag.kind === 'badge' ? tag.textColor : tag.color,
        fontFamily,
        fontWeight: 900,
        lineHeight: 1,
        whiteSpace: 'nowrap',
        maxWidth: '100%',
      }}
    >
      <span style={{ fontSize: Math.round(pricePx * 0.45) }}>R$</span>
      <span style={{ fontSize: pricePx }}>{item.price}</span>
      {unit ? <span style={{ fontSize: Math.round(pricePx * 0.45) }}>/{unit}</span> : null}
    </div>
  );
};

/** Célula com largura/altura ≥ este valor (o destaque em duas colunas) põe a foto à esquerda dos textos. */
export const PRODUCT_CELL_HORIZONTAL_MIN_ASPECT = 1.4;

const ProductCell: React.FC<{
  item: PieceProductItem;
  px: PxRect;
  tag: PriceTagStyle;
  areaRadius: number;
  ctx: ViewContext;
}> = ({ item, px, tag, areaRadius, ctx }) => {
  // Célula larga (destaque): foto à esquerda e textos à direita, dimensionados pela coluna de
  // texto — senão o preço cresce com a largura e não sobra altura para a foto.
  const horizontal = px.width / px.height >= PRODUCT_CELL_HORIZONTAL_MIN_ASPECT;
  const pad = Math.round((horizontal ? px.height : px.width) * 0.06);
  const textWidth = horizontal ? Math.round((px.width - 3 * pad) * 0.55) : px.width;
  const { pricePx, namePx } = productTextSizes(textWidth, ctx.width);
  const url = ctx.resolve(item.imageUrl);
  const photo = (
    <div
      style={{
        flex: horizontal ? '0 0 45%' : '1 1 0',
        minHeight: 0,
        minWidth: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {url ? (
        <ctx.Img
          src={url}
          alt=""
          draggable={false}
          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', display: 'block' }}
        />
      ) : (
        <div style={{ width: '100%', height: '100%', background: '#E5E7EB', borderRadius: 8 }} />
      )}
    </div>
  );
  const texts = (
    <>
      <div
        style={{
          flexShrink: 0,
          fontSize: namePx,
          lineHeight: 1.1,
          fontWeight: 700,
          color: '#111827',
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
        }}
      >
        {item.name}
        {item.grams ? <span style={{ fontWeight: 400, color: '#6B7280' }}> {item.grams}</span> : null}
      </div>
      {item.originalPrice ? (
        <div
          style={{
            flexShrink: 0,
            fontSize: Math.round(namePx * 0.9),
            color: '#6B7280',
            textDecoration: 'line-through',
            lineHeight: 1,
          }}
        >
          de R$ {item.originalPrice}
        </div>
      ) : null}
      <div style={{ flexShrink: 0, display: 'flex' }}>
        <PriceTag item={item} pricePx={pricePx} tag={tag} fontFamily={ctx.fontFamily} />
      </div>
    </>
  );
  const cell: CSSProperties = {
    ...abs(px),
    background: '#FFFFFF',
    borderRadius: Math.max(8, Math.round(areaRadius * 0.6)),
    boxShadow: '0 2px 10px rgba(0,0,0,0.12)',
    display: 'flex',
    padding: pad,
    gap: Math.round(pad * (horizontal ? 1 : 0.5)),
    overflow: 'hidden',
    fontFamily: ctx.fontFamily,
  };
  if (horizontal) {
    return (
      <div data-piece-cell="horizontal" style={{ ...cell, flexDirection: 'row' }}>
        {photo}
        <div
          style={{
            flex: '1 1 0',
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: Math.round(pad * 0.5),
          }}
        >
          {texts}
        </div>
      </div>
    );
  }
  return (
    <div data-piece-cell="vertical" style={{ ...cell, flexDirection: 'column' }}>
      {photo}
      {texts}
    </div>
  );
};

const ProductsBlockView: React.FC<{ block: PieceProductsBlock; px: PxRect; ctx: ViewContext }> = ({
  block,
  px,
  ctx,
}) => {
  const { width, height } = ctx;
  const tag: PriceTagStyle = { ...DEFAULT_TAG, ...(block.tagStyle ?? {}) };
  const areaRadius = Math.round((block.areaStyle?.radius ?? 0) * width);
  const items = block.items ?? [];
  const areaBackground = block.areaStyle?.background ?? null;
  const area = (
    <div
      style={{
        ...abs(px),
        borderRadius: areaRadius,
        background: areaBackground ?? 'transparent',
        boxShadow:
          block.areaStyle?.shadow && areaBackground ? '0 6px 24px rgba(0,0,0,0.18)' : undefined,
      }}
    />
  );
  if (block.mode === 'single') {
    const url = ctx.resolve(block.singleImageUrl);
    const pad = Math.round(px.width * 0.03);
    const tagPx = productTextSizes(px.width * 0.5, width).pricePx;
    return (
      <>
        {area}
        <div
          style={{
            ...abs(px),
            padding: pad,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {url ? (
            <ctx.Img
              src={url}
              alt=""
              draggable={false}
              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
            />
          ) : (
            <div style={{ width: '100%', height: '100%', background: '#E5E7EB', borderRadius: areaRadius }} />
          )}
        </div>
        <div
          style={{
            position: 'absolute',
            left: px.x + pad * 2,
            bottom: height - (px.y + px.height) + pad * 2,
            display: 'flex',
            flexDirection: 'column',
            gap: Math.round(tagPx * 0.3),
            maxWidth: px.width - pad * 4,
          }}
        >
          {items.slice(0, 3).map((item) => (
            <div
              key={item.id}
              style={{ display: 'flex', alignItems: 'center', gap: Math.round(tagPx * 0.3) }}
            >
              <span
                style={{
                  fontFamily: ctx.fontFamily,
                  fontWeight: 700,
                  fontSize: Math.round(tagPx * 0.5),
                  color: '#FFFFFF',
                  textShadow: '0 1px 4px rgba(0,0,0,0.6)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: px.width * 0.45,
                }}
              >
                {item.name}
              </span>
              <PriceTag
                item={item}
                pricePx={Math.round(tagPx * 0.8)}
                tag={tag}
                fontFamily={ctx.fontFamily}
              />
            </div>
          ))}
        </div>
      </>
    );
  }
  const manual = block.layout === 'manual' && items.length > 0 && items.every((i) => i.rect);
  const rects = manual
    ? Object.fromEntries(items.map((i) => [i.id, i.rect as PieceRect]))
    : layoutProducts({
        areaRect: block.rect,
        width,
        height,
        itemIds: items.map((i) => i.id),
        featuredId: items.find((i) => i.featured)?.id ?? null,
      }).rects;
  return (
    <>
      {area}
      {items.map((item) => {
        const rect = rects[item.id];
        if (!rect) return null;
        return (
          <ProductCell
            key={item.id}
            item={item}
            px={rectToPx(rect, width, height)}
            tag={tag}
            areaRadius={areaRadius}
            ctx={ctx}
          />
        );
      })}
    </>
  );
};

const CharacterBlockView: React.FC<{
  block: PieceCharacterBlock;
  px: PxRect;
  posterUrl?: string | null;
  ctx: ViewContext;
}> = ({ block, px, posterUrl, ctx }) => {
  const shape = block.panel?.shape ?? 'card';
  const color = block.panel?.color || '#FFFFFF';
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: shape === 'none' ? 'transparent' : color,
        borderRadius: shape === 'circle' ? '50%' : shape === 'card' ? Math.round(px.width * 0.06) : 0,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}
    >
      {posterUrl ? (
        <ctx.Img
          src={posterUrl}
          alt=""
          draggable={false}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            objectPosition: 'center bottom',
            display: 'block',
          }}
        />
      ) : null}
    </div>
  );
};

function blockContent(
  block: PieceBlock,
  px: PxRect,
  props: PieceCanvasProps,
  ctx: ViewContext,
): ReactNode {
  switch (block.type) {
    case 'logo':
      return <LogoBlockView block={block} px={px} ctx={ctx} />;
    case 'text':
      return <TextBlockView block={block} ctx={ctx} />;
    case 'footer':
      return <FooterBlockView block={block} px={px} ctx={ctx} />;
    case 'character':
      return <CharacterBlockView block={block} px={px} posterUrl={props.characterPosterUrl} ctx={ctx} />;
    default:
      return null;
  }
}

export function PieceCanvas(props: PieceCanvasProps) {
  const { document, width, height, assetBase } = props;
  const fontFamily = props.defaultFontFamily ?? DEFAULT_PIECE_FONT;
  const resolve: ResolveUrl = (url) => {
    const trimmed = (url ?? '').trim();
    if (!trimmed) return null;
    return props.resolveAssetUrl ? props.resolveAssetUrl(trimmed) : absoluteUrl(trimmed, assetBase);
  };
  const ctx: ViewContext = {
    width,
    height,
    resolve,
    Img: props.imgComponent ?? DefaultImg,
    fontFamily,
  };
  const bg = backgroundStyle(document, assetBase, props.resolveAssetUrl);
  const blocks = [...(document.blocks ?? [])].sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0));
  const fonts = (document.fonts ?? []).filter((f) => f.family && f.url);
  const safe = pieceSafeArea(width, height);
  return (
    <div
      data-piece-canvas=""
      style={{ position: 'relative', width, height, overflow: 'hidden', ...bg.base, fontFamily }}
    >
      {fonts.length > 0 ? (
        <style>
          {fonts
            .map(
              (f) =>
                `@font-face{font-family:'${f.family.replace(/'/g, '')}';src:url("${resolve(
                  f.url,
                )}");font-display:block;}`,
            )
            .join('\n')}
        </style>
      ) : null}
      {bg.image ? <ctx.Img src={bg.image.src} alt="" draggable={false} style={bg.image.style} /> : null}
      {bg.darken > 0 ? (
        <div style={{ position: 'absolute', inset: 0, background: `rgba(0,0,0,${bg.darken})` }} />
      ) : null}
      {blocks.map((block) => {
        const px = rectToPx(block.rect, width, height);
        const selected = props.selectedBlockId === block.id;
        const content =
          block.type === 'products' ? (
            <ProductsBlockView block={block} px={px} ctx={ctx} />
          ) : (
            <div
              data-piece-block={block.id}
              data-piece-block-type={block.type}
              style={{
                ...abs(px),
                zIndex: block.zIndex,
                outline: selected ? '3px solid #2563EB' : undefined,
                outlineOffset: selected ? 2 : undefined,
                cursor: props.onBlockClick ? 'pointer' : undefined,
              }}
              onClick={props.onBlockClick ? () => props.onBlockClick?.(block.id) : undefined}
            >
              {blockContent(block, px, props, ctx)}
            </div>
          );
        if (block.type === 'products') {
          const wrapped = (
            <div
              key={block.id}
              data-piece-block={block.id}
              data-piece-block-type="products"
              style={{ position: 'absolute', inset: 0, zIndex: block.zIndex, pointerEvents: 'none' }}
            >
              {content}
            </div>
          );
          return props.renderBlock ? (
            <div key={block.id}>{props.renderBlock(block, wrapped, px)}</div>
          ) : (
            wrapped
          );
        }
        return props.renderBlock ? (
          <div key={block.id}>{props.renderBlock(block, content, px)}</div>
        ) : (
          <div key={block.id} style={{ display: 'contents' }}>
            {content}
          </div>
        );
      })}
      {props.showSafeArea ? (
        <div
          data-piece-safe-area=""
          style={{
            ...abs(safe),
            border: '1px dashed rgba(37,99,235,0.7)',
            pointerEvents: 'none',
            zIndex: 9999,
          }}
        />
      ) : null}
    </div>
  );
}
