"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogoCard = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const remotion_1 = require("remotion");
const tokens_1 = require("../core/tokens");
const fit_1 = require("./fit");
const resolve_src_1 = require("./resolve-src");
/** Abertura e fechamento: logo do cliente (contain) e, sem logo, o nome. */
const LogoCard = ({ brand, width, height, fonts }) => {
    const pad = Math.round(Math.min(width, height) * 0.1);
    const showName = Boolean(brand.name) && !brand.logoUrl;
    const nameBox = { width: width - 2 * pad, height: Math.round(height * 0.16) };
    const nameSize = (0, react_1.useMemo)(() => showName && fonts.ready
        ? (0, fit_1.fitSingleLine)(brand.name, nameBox, fonts.family, tokens_1.tokens.font.weightBlack, 96)
        : Math.round(nameBox.height * 0.7), [showName, fonts.ready, fonts.family, brand.name, nameBox.width, nameBox.height]);
    return ((0, jsx_runtime_1.jsxs)("div", { style: {
            position: 'absolute',
            inset: pad,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
        }, children: [brand.logoUrl ? ((0, jsx_runtime_1.jsx)(remotion_1.Img, { src: (0, resolve_src_1.resolveAssetSrc)(brand.logoUrl), style: { width: '100%', height: '80%', objectFit: 'contain' } })) : null, showName ? ((0, jsx_runtime_1.jsx)("div", { style: {
                    fontSize: nameSize,
                    fontWeight: tokens_1.tokens.font.weightBlack,
                    color: tokens_1.tokens.color.cardText,
                    whiteSpace: 'nowrap',
                    textAlign: 'center',
                }, children: brand.name })) : null] }));
};
exports.LogoCard = LogoCard;
//# sourceMappingURL=LogoCard.js.map