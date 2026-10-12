"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OfferCard = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const remotion_1 = require("remotion");
const price_1 = require("../core/price");
const tokens_1 = require("../core/tokens");
const color_1 = require("./color");
const fit_1 = require("./fit");
const resolve_src_1 = require("./resolve-src");
const abs = (r) => ({
    position: 'absolute',
    left: r.x,
    top: r.y,
    width: r.width,
    height: r.height,
});
const PriceLine = ({ price, unit, rect, fonts, color }) => {
    const parts = (0, price_1.priceParts)(price);
    const { priceCurrencyScale, priceCentsScale, unitScale } = tokens_1.tokens.card;
    const weight = tokens_1.tokens.font.weightBlack;
    const fontSize = (0, react_1.useMemo)(() => {
        const byHeight = rect.height * 0.92;
        if (!fonts.ready)
            return Math.floor(byHeight * 0.6);
        const byWidth = (0, fit_1.fitComposite)([
            { text: parts.currency, scale: priceCurrencyScale, marginEm: 0.08 },
            { text: parts.integer, scale: 1 },
            { text: parts.cents, scale: priceCentsScale },
            ...(unit ? [{ text: unit, scale: unitScale, marginEm: 0.08 }] : []),
        ], rect.width, fonts.family, weight);
        return Math.floor(Math.min(byWidth, byHeight));
    }, [fonts.ready, fonts.family, parts.currency, parts.integer, parts.cents, unit, rect.width, rect.height]);
    return ((0, jsx_runtime_1.jsxs)("div", { "aria-label": (0, price_1.formatPrice)(price), "data-price": (0, price_1.formatPrice)(price), style: {
            ...abs(rect),
            display: 'flex',
            alignItems: 'flex-end',
            whiteSpace: 'nowrap',
            color,
            fontWeight: weight,
            lineHeight: 1,
        }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', alignItems: 'flex-start' }, children: [(0, jsx_runtime_1.jsx)("span", { style: {
                            fontSize: fontSize * priceCurrencyScale,
                            marginTop: fontSize * 0.1,
                            marginRight: fontSize * 0.08,
                        }, children: parts.currency }), (0, jsx_runtime_1.jsx)("span", { style: { fontSize, letterSpacing: '-0.02em' }, children: parts.integer }), (0, jsx_runtime_1.jsx)("span", { style: { fontSize: fontSize * priceCentsScale, marginTop: fontSize * 0.04 }, children: parts.cents })] }), unit ? ((0, jsx_runtime_1.jsx)("span", { style: {
                    fontSize: fontSize * unitScale,
                    marginLeft: fontSize * 0.08,
                    marginBottom: fontSize * 0.1,
                    color: tokens_1.tokens.color.mutedText,
                    fontWeight: tokens_1.tokens.font.weightBold,
                }, children: unit })) : null] }));
};
/**
 * Card de oferta: foto inteira (object-fit contain, nunca cortada), nome
 * ajustado com `fitText` (1–2 linhas), preço atual em destaque a partir da
 * string congelada, preço anterior riscado, unidade e badge. Todo texto vem
 * dos dados das props — nada é gerado por modelo de imagem/vídeo.
 */
const OfferCard = ({ offer, inner, fonts, accentColor, secondaryColor }) => {
    const name = (0, react_1.useMemo)(() => fonts.ready
        ? (0, fit_1.fitNameLines)(offer.name, inner.name, fonts.family, tokens_1.tokens.font.weightBold)
        : { lines: [offer.name], fontSize: tokens_1.tokens.card.nameMinFontSize }, [fonts.ready, fonts.family, offer.name, inner.name]);
    const original = offer.originalPrice ? `de ${(0, price_1.formatPrice)(offer.originalPrice)}` : null;
    const originalSize = (0, react_1.useMemo)(() => original && fonts.ready
        ? (0, fit_1.fitSingleLine)(original, inner.originalPrice, fonts.family, tokens_1.tokens.font.weightBold, 46)
        : Math.floor(inner.originalPrice.height * 0.7), [original, fonts.ready, fonts.family, inner.originalPrice]);
    const badgePadX = Math.round(inner.badge.height * 0.45);
    const badgeSize = (0, react_1.useMemo)(() => offer.badge && fonts.ready
        ? (0, fit_1.fitSingleLine)(offer.badge, { width: inner.badge.width - 2 * badgePadX, height: inner.badge.height * 0.56 }, fonts.family, tokens_1.tokens.font.weightBlack)
        : Math.floor(inner.badge.height * 0.5), [offer.badge, fonts.ready, fonts.family, inner.badge, badgePadX]);
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("div", { style: {
                    ...abs(inner.image),
                    borderRadius: tokens_1.tokens.radius.image,
                    background: tokens_1.tokens.color.imageBackground,
                    overflow: 'hidden',
                }, children: (0, jsx_runtime_1.jsx)(remotion_1.Img, { src: (0, resolve_src_1.resolveAssetSrc)(offer.imageUrl), style: { width: '100%', height: '100%', objectFit: 'contain' } }) }), offer.badge ? ((0, jsx_runtime_1.jsx)("div", { style: { ...abs(inner.badge), display: 'flex', alignItems: 'flex-start' }, children: (0, jsx_runtime_1.jsx)("div", { style: {
                        height: inner.badge.height,
                        maxWidth: inner.badge.width,
                        padding: `0 ${badgePadX}px`,
                        borderRadius: inner.badge.height / 2,
                        background: secondaryColor,
                        color: (0, color_1.textOn)(secondaryColor),
                        display: 'flex',
                        alignItems: 'center',
                        fontSize: badgeSize,
                        fontWeight: tokens_1.tokens.font.weightBlack,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        boxShadow: `0 6px 16px ${tokens_1.tokens.color.shadow}`,
                        textTransform: 'none',
                    }, children: offer.badge }) })) : null, (0, jsx_runtime_1.jsx)("div", { style: {
                    ...abs(inner.name),
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    color: tokens_1.tokens.color.cardText,
                    fontWeight: tokens_1.tokens.font.weightBold,
                    fontSize: name.fontSize,
                    lineHeight: tokens_1.tokens.card.nameLineHeight,
                }, children: name.lines.map((l, i) => ((0, jsx_runtime_1.jsx)("div", { style: { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }, children: l }, i))) }), original ? ((0, jsx_runtime_1.jsxs)("div", { style: {
                    ...abs(inner.originalPrice),
                    display: 'flex',
                    alignItems: 'center',
                    whiteSpace: 'nowrap',
                    fontSize: originalSize,
                    fontWeight: tokens_1.tokens.font.weightBold,
                    color: tokens_1.tokens.color.mutedText,
                }, children: [(0, jsx_runtime_1.jsx)("span", { children: "de\u00A0" }), (0, jsx_runtime_1.jsx)("span", { style: {
                            textDecoration: 'line-through',
                            textDecorationColor: tokens_1.tokens.color.strike,
                            textDecorationThickness: Math.max(3, Math.round(originalSize * 0.1)),
                        }, children: (0, price_1.formatPrice)(offer.originalPrice) })] })) : null, (0, jsx_runtime_1.jsx)(PriceLine, { price: offer.price, unit: (0, price_1.formatUnit)(offer.unit), rect: inner.price, fonts: fonts, color: accentColor })] }));
};
exports.OfferCard = OfferCard;
//# sourceMappingURL=OfferCard.js.map