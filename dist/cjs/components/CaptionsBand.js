"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.CaptionsBand = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importStar(require("react"));
const captions_1 = require("../core/captions");
const tokens_1 = require("../core/tokens");
const fit_1 = require("./fit");
/**
 * Legenda por palavra (páginas do createTikTokStyleCaptions) dentro da faixa
 * da área segura, com a palavra ativa destacada. A página inteira cabe na
 * faixa: fonte por `fitText` limitada a [min, max]; abaixo do mínimo, quebra em
 * até duas linhas no mínimo. A palavra ativa muda de cor.
 */
const CaptionsBand = ({ pages, rect, timeMs, fonts, highlightColor }) => {
    const page = (0, captions_1.activeCaptionPage)(pages, timeMs);
    const { maxFontSize, minFontSize, lineHeight, strokePx } = tokens_1.tokens.captions;
    const padX = Math.round(strokePx * 1.5);
    const fontSize = (0, react_1.useMemo)(() => {
        if (!page)
            return maxFontSize;
        if (!fonts.ready)
            return minFontSize;
        const fitted = (0, fit_1.fitSingleLine)(page.text, { width: rect.width - 2 * padX, height: rect.height / lineHeight }, fonts.family, tokens_1.tokens.font.weightBlack, maxFontSize);
        return Math.max(minFontSize, fitted);
    }, [page, fonts.ready, fonts.family, rect.width, rect.height, padX]);
    if (!page)
        return null;
    const active = (0, captions_1.activeTokenIndex)(page, timeMs);
    return ((0, jsx_runtime_1.jsx)("div", { style: {
            position: 'absolute',
            left: rect.x,
            top: rect.y,
            width: rect.width,
            height: rect.height,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            padding: `0 ${padX}px`,
            boxSizing: 'border-box',
        }, children: (0, jsx_runtime_1.jsx)("div", { style: {
                textAlign: 'center',
                fontSize,
                lineHeight,
                fontWeight: tokens_1.tokens.font.weightBlack,
                color: tokens_1.tokens.color.captionText,
                WebkitTextStroke: `${strokePx}px ${tokens_1.tokens.color.captionStroke}`,
                paintOrder: 'stroke fill',
                maxHeight: rect.height,
            }, children: page.tokens.map((token, i) => {
                // O espaço fica FORA do span destacado: a palavra ativa muda só de cor
                // (sem escala), então a largura medida pelo fitText vale para todo quadro.
                const lead = /^\s*/.exec(token.text)?.[0] ?? '';
                return ((0, jsx_runtime_1.jsxs)(react_1.default.Fragment, { children: [lead, (0, jsx_runtime_1.jsx)("span", { style: { color: i === active ? highlightColor : undefined }, children: token.text.slice(lead.length) })] }, `${token.fromMs}-${i}`));
            }) }) }));
};
exports.CaptionsBand = CaptionsBand;
//# sourceMappingURL=CaptionsBand.js.map