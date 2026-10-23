"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PRODUCT_CELL_HORIZONTAL_MIN_ASPECT = exports.DEFAULT_PIECE_FONT = void 0;
exports.absoluteUrl = absoluteUrl;
exports.rectToPx = rectToPx;
exports.pieceSafeArea = pieceSafeArea;
exports.backgroundStyle = backgroundStyle;
exports.footerLines = footerLines;
exports.PieceCanvas = PieceCanvas;
const jsx_runtime_1 = require("react/jsx-runtime");
const layout_1 = require("../../core/piece/layout");
exports.DEFAULT_PIECE_FONT = "'DejaVu Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif";
function absoluteUrl(url, base) {
    const trimmed = (url ?? '').trim();
    if (!trimmed)
        return null;
    if (/^(?:https?:|data:|blob:)/i.test(trimmed) || !base)
        return trimmed;
    const root = base.replace(/\/+$/, '');
    return trimmed.startsWith('/') ? `${root}${trimmed}` : `${root}/${trimmed}`;
}
/** Frações → pixels do quadro, sem buracos entre blocos vizinhos. */
function rectToPx(rect, width, height) {
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
function pieceSafeArea(width, height) {
    const margin = Math.round(width * 0.04);
    return { x: margin, y: margin, width: width - margin * 2, height: height - margin * 2 };
}
const abs = (px) => ({
    position: 'absolute',
    left: px.x,
    top: px.y,
    width: px.width,
    height: px.height,
    boxSizing: 'border-box',
});
function backgroundStyle(document, assetBase, resolveUrl) {
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
const DefaultImg = (props) => (0, jsx_runtime_1.jsx)("img", { ...props });
const LogoBlockView = ({ block, px, ctx, }) => {
    const url = ctx.resolve(block.imageUrl);
    if (!url) {
        return ((0, jsx_runtime_1.jsx)("div", { style: {
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: Math.round(px.height * 0.1),
                background: 'rgba(255,255,255,0.85)',
                color: '#9CA3AF',
                fontFamily: exports.DEFAULT_PIECE_FONT,
                fontSize: Math.max(14, Math.round(px.height * 0.3)),
                fontWeight: 700,
            }, children: "LOGO" }));
    }
    return ((0, jsx_runtime_1.jsx)(ctx.Img, { src: url, alt: "", draggable: false, style: { width: '100%', height: '100%', objectFit: 'contain', display: 'block' } }));
};
const TextBlockView = ({ block, ctx }) => {
    const size = Math.max(10, Math.round((block.fontSize || 0.05) * ctx.width));
    return ((0, jsx_runtime_1.jsx)("div", { style: {
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: block.align === 'center' ? 'center' : block.align === 'right' ? 'flex-end' : 'flex-start',
            textAlign: block.align,
            fontFamily: block.fontFamily ? `'${block.fontFamily}', ${ctx.fontFamily}` : ctx.fontFamily,
            fontSize: size,
            lineHeight: 1.1,
            fontWeight: block.weight === 'bold' ? 800 : 400,
            color: block.color || '#111827',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            overflow: 'hidden',
        }, children: block.text }));
};
/** Linhas do rodapé: contato, validade ("de dd/mm a dd/mm") e texto legal. */
function footerLines(block) {
    const lines = [];
    const contact = [block.address, block.phone].map((s) => (s ?? '').trim()).filter(Boolean);
    if (contact.length)
        lines.push(contact.join(' · '));
    const validity = block.validity;
    if (validity?.from && validity?.to) {
        const fmt = (iso) => {
            const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
            return m ? `${m[3]}/${m[2]}` : iso;
        };
        lines.push(`Ofertas válidas de ${fmt(validity.from)} a ${fmt(validity.to)}`);
    }
    if ((block.legal ?? '').trim())
        lines.push(block.legal.trim());
    return lines;
}
const FooterBlockView = ({ block, px, ctx, }) => {
    const lines = footerLines(block);
    const size = Math.max(12, Math.round(px.height / Math.max(2.4, lines.length * 1.6 + 0.8)));
    return ((0, jsx_runtime_1.jsx)("div", { style: {
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
        }, children: lines.map((line, i) => ((0, jsx_runtime_1.jsx)("div", { style: {
                fontWeight: i === 0 ? 700 : 400,
                opacity: i === lines.length - 1 && lines.length > 1 ? 0.8 : 1,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '100%',
            }, children: line }, i))) }));
};
const DEFAULT_TAG = { kind: 'badge', color: '#D32F2F', textColor: '#FFFFFF' };
const PriceTag = ({ item, pricePx, tag, fontFamily }) => {
    const unit = (item.unit ?? '').trim().replace(/^\//, '');
    return ((0, jsx_runtime_1.jsxs)("div", { style: {
            display: 'inline-flex',
            alignItems: 'baseline',
            gap: Math.round(pricePx * 0.15),
            padding: tag.kind === 'badge' ? `${Math.round(pricePx * 0.12)}px ${Math.round(pricePx * 0.3)}px` : 0,
            borderRadius: Math.round(pricePx * 0.25),
            background: tag.kind === 'badge' ? tag.color : 'transparent',
            color: tag.kind === 'badge' ? tag.textColor : tag.color,
            fontFamily,
            fontWeight: 900,
            lineHeight: 1,
            whiteSpace: 'nowrap',
            maxWidth: '100%',
        }, children: [(0, jsx_runtime_1.jsx)("span", { style: { fontSize: Math.round(pricePx * 0.45) }, children: "R$" }), (0, jsx_runtime_1.jsx)("span", { style: { fontSize: pricePx }, children: item.price }), unit ? (0, jsx_runtime_1.jsxs)("span", { style: { fontSize: Math.round(pricePx * 0.45) }, children: ["/", unit] }) : null] }));
};
/** Célula com largura/altura ≥ este valor (o destaque em duas colunas) põe a foto à esquerda dos textos. */
exports.PRODUCT_CELL_HORIZONTAL_MIN_ASPECT = 1.4;
const ProductCell = ({ item, px, tag, areaRadius, ctx }) => {
    // Célula larga (destaque): foto à esquerda e textos à direita, dimensionados pela coluna de
    // texto — senão o preço cresce com a largura e não sobra altura para a foto.
    const horizontal = px.width / px.height >= exports.PRODUCT_CELL_HORIZONTAL_MIN_ASPECT;
    const pad = Math.round((horizontal ? px.height : px.width) * 0.06);
    const textWidth = horizontal ? Math.round((px.width - 3 * pad) * 0.55) : px.width;
    const { pricePx, namePx } = (0, layout_1.productTextSizes)(textWidth, ctx.width);
    const url = ctx.resolve(item.imageUrl);
    const photo = ((0, jsx_runtime_1.jsx)("div", { style: {
            flex: horizontal ? '0 0 45%' : '1 1 0',
            minHeight: 0,
            minWidth: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        }, children: url ? ((0, jsx_runtime_1.jsx)(ctx.Img, { src: url, alt: "", draggable: false, style: { maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', display: 'block' } })) : ((0, jsx_runtime_1.jsx)("div", { style: { width: '100%', height: '100%', background: '#E5E7EB', borderRadius: 8 } })) }));
    const texts = ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)("div", { style: {
                    flexShrink: 0,
                    fontSize: namePx,
                    lineHeight: 1.1,
                    fontWeight: 700,
                    color: '#111827',
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                }, children: [item.name, item.grams ? (0, jsx_runtime_1.jsxs)("span", { style: { fontWeight: 400, color: '#6B7280' }, children: [" ", item.grams] }) : null] }), item.originalPrice ? ((0, jsx_runtime_1.jsxs)("div", { style: {
                    flexShrink: 0,
                    fontSize: Math.round(namePx * 0.9),
                    color: '#6B7280',
                    textDecoration: 'line-through',
                    lineHeight: 1,
                }, children: ["de R$ ", item.originalPrice] })) : null, (0, jsx_runtime_1.jsx)("div", { style: { flexShrink: 0, display: 'flex' }, children: (0, jsx_runtime_1.jsx)(PriceTag, { item: item, pricePx: pricePx, tag: tag, fontFamily: ctx.fontFamily }) })] }));
    const cell = {
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
        return ((0, jsx_runtime_1.jsxs)("div", { "data-piece-cell": "horizontal", style: { ...cell, flexDirection: 'row' }, children: [photo, (0, jsx_runtime_1.jsx)("div", { style: {
                        flex: '1 1 0',
                        minWidth: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        gap: Math.round(pad * 0.5),
                    }, children: texts })] }));
    }
    return ((0, jsx_runtime_1.jsxs)("div", { "data-piece-cell": "vertical", style: { ...cell, flexDirection: 'column' }, children: [photo, texts] }));
};
const ProductsBlockView = ({ block, px, ctx, }) => {
    const { width, height } = ctx;
    const tag = { ...DEFAULT_TAG, ...(block.tagStyle ?? {}) };
    const areaRadius = Math.round((block.areaStyle?.radius ?? 0) * width);
    const items = block.items ?? [];
    const areaBackground = block.areaStyle?.background ?? null;
    const area = ((0, jsx_runtime_1.jsx)("div", { style: {
            ...abs(px),
            borderRadius: areaRadius,
            background: areaBackground ?? 'transparent',
            boxShadow: block.areaStyle?.shadow && areaBackground ? '0 6px 24px rgba(0,0,0,0.18)' : undefined,
        } }));
    if (block.mode === 'single') {
        const url = ctx.resolve(block.singleImageUrl);
        const pad = Math.round(px.width * 0.03);
        const tagPx = (0, layout_1.productTextSizes)(px.width * 0.5, width).pricePx;
        return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [area, (0, jsx_runtime_1.jsx)("div", { style: {
                        ...abs(px),
                        padding: pad,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }, children: url ? ((0, jsx_runtime_1.jsx)(ctx.Img, { src: url, alt: "", draggable: false, style: { maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' } })) : ((0, jsx_runtime_1.jsx)("div", { style: { width: '100%', height: '100%', background: '#E5E7EB', borderRadius: areaRadius } })) }), (0, jsx_runtime_1.jsx)("div", { style: {
                        position: 'absolute',
                        left: px.x + pad * 2,
                        bottom: height - (px.y + px.height) + pad * 2,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: Math.round(tagPx * 0.3),
                        maxWidth: px.width - pad * 4,
                    }, children: items.slice(0, 3).map((item) => ((0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', alignItems: 'center', gap: Math.round(tagPx * 0.3) }, children: [(0, jsx_runtime_1.jsx)("span", { style: {
                                    fontFamily: ctx.fontFamily,
                                    fontWeight: 700,
                                    fontSize: Math.round(tagPx * 0.5),
                                    color: '#FFFFFF',
                                    textShadow: '0 1px 4px rgba(0,0,0,0.6)',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    maxWidth: px.width * 0.45,
                                }, children: item.name }), (0, jsx_runtime_1.jsx)(PriceTag, { item: item, pricePx: Math.round(tagPx * 0.8), tag: tag, fontFamily: ctx.fontFamily })] }, item.id))) })] }));
    }
    const manual = block.layout === 'manual' && items.length > 0 && items.every((i) => i.rect);
    const rects = manual
        ? Object.fromEntries(items.map((i) => [i.id, i.rect]))
        : (0, layout_1.layoutProducts)({
            areaRect: block.rect,
            width,
            height,
            itemIds: items.map((i) => i.id),
            featuredId: items.find((i) => i.featured)?.id ?? null,
        }).rects;
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [area, items.map((item) => {
                const rect = rects[item.id];
                if (!rect)
                    return null;
                return ((0, jsx_runtime_1.jsx)(ProductCell, { item: item, px: rectToPx(rect, width, height), tag: tag, areaRadius: areaRadius, ctx: ctx }, item.id));
            })] }));
};
const CharacterBlockView = ({ block, px, posterUrl, ctx }) => {
    const shape = block.panel?.shape ?? 'card';
    const color = block.panel?.color || '#FFFFFF';
    return ((0, jsx_runtime_1.jsx)("div", { style: {
            width: '100%',
            height: '100%',
            background: shape === 'none' ? 'transparent' : color,
            borderRadius: shape === 'circle' ? '50%' : shape === 'card' ? Math.round(px.width * 0.06) : 0,
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
        }, children: posterUrl ? ((0, jsx_runtime_1.jsx)(ctx.Img, { src: posterUrl, alt: "", draggable: false, style: {
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                objectPosition: 'center bottom',
                display: 'block',
            } })) : null }));
};
function blockContent(block, px, props, ctx) {
    switch (block.type) {
        case 'logo':
            return (0, jsx_runtime_1.jsx)(LogoBlockView, { block: block, px: px, ctx: ctx });
        case 'text':
            return (0, jsx_runtime_1.jsx)(TextBlockView, { block: block, ctx: ctx });
        case 'footer':
            return (0, jsx_runtime_1.jsx)(FooterBlockView, { block: block, px: px, ctx: ctx });
        case 'character':
            return (0, jsx_runtime_1.jsx)(CharacterBlockView, { block: block, px: px, posterUrl: props.characterPosterUrl, ctx: ctx });
        default:
            return null;
    }
}
function PieceCanvas(props) {
    const { document, width, height, assetBase } = props;
    const fontFamily = props.defaultFontFamily ?? exports.DEFAULT_PIECE_FONT;
    const resolve = (url) => {
        const trimmed = (url ?? '').trim();
        if (!trimmed)
            return null;
        return props.resolveAssetUrl ? props.resolveAssetUrl(trimmed) : absoluteUrl(trimmed, assetBase);
    };
    const ctx = {
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
    return ((0, jsx_runtime_1.jsxs)("div", { "data-piece-canvas": "", style: { position: 'relative', width, height, overflow: 'hidden', ...bg.base, fontFamily }, children: [fonts.length > 0 ? ((0, jsx_runtime_1.jsx)("style", { children: fonts
                    .map((f) => `@font-face{font-family:'${f.family.replace(/'/g, '')}';src:url("${resolve(f.url)}");font-display:block;}`)
                    .join('\n') })) : null, bg.image ? (0, jsx_runtime_1.jsx)(ctx.Img, { src: bg.image.src, alt: "", draggable: false, style: bg.image.style }) : null, bg.darken > 0 ? ((0, jsx_runtime_1.jsx)("div", { style: { position: 'absolute', inset: 0, background: `rgba(0,0,0,${bg.darken})` } })) : null, blocks.map((block) => {
                const px = rectToPx(block.rect, width, height);
                const selected = props.selectedBlockId === block.id;
                const content = block.type === 'products' ? ((0, jsx_runtime_1.jsx)(ProductsBlockView, { block: block, px: px, ctx: ctx })) : ((0, jsx_runtime_1.jsx)("div", { "data-piece-block": block.id, "data-piece-block-type": block.type, style: {
                        ...abs(px),
                        zIndex: block.zIndex,
                        outline: selected ? '3px solid #2563EB' : undefined,
                        outlineOffset: selected ? 2 : undefined,
                        cursor: props.onBlockClick ? 'pointer' : undefined,
                    }, onClick: props.onBlockClick ? () => props.onBlockClick?.(block.id) : undefined, children: blockContent(block, px, props, ctx) }));
                if (block.type === 'products') {
                    const wrapped = ((0, jsx_runtime_1.jsx)("div", { "data-piece-block": block.id, "data-piece-block-type": "products", style: { position: 'absolute', inset: 0, zIndex: block.zIndex, pointerEvents: 'none' }, children: content }, block.id));
                    return props.renderBlock ? ((0, jsx_runtime_1.jsx)("div", { children: props.renderBlock(block, wrapped, px) }, block.id)) : (wrapped);
                }
                return props.renderBlock ? ((0, jsx_runtime_1.jsx)("div", { children: props.renderBlock(block, content, px) }, block.id)) : ((0, jsx_runtime_1.jsx)("div", { style: { display: 'contents' }, children: content }, block.id));
            }), props.showSafeArea ? ((0, jsx_runtime_1.jsx)("div", { "data-piece-safe-area": "", style: {
                    ...abs(safe),
                    border: '1px dashed rgba(37,99,235,0.7)',
                    pointerEvents: 'none',
                    zIndex: 9999,
                } })) : null] }));
}
//# sourceMappingURL=PieceCanvas.js.map