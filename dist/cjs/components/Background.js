"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Background = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const remotion_1 = require("remotion");
const color_1 = require("./color");
/**
 * Fundo em gradiente da marca (quadro inteiro; o fundo não é validado contra a
 * área segura). Formas estáticas: nada depende do quadro, então o fundo é
 * idêntico em qualquer instante.
 */
const Background = ({ brand, width, height, }) => {
    const big = Math.max(width, height);
    return ((0, jsx_runtime_1.jsxs)(remotion_1.AbsoluteFill, { style: {
            background: `linear-gradient(160deg, ${(0, color_1.shade)(brand.primaryColor, 0.08)} 0%, ${brand.primaryColor} 45%, ${(0, color_1.shade)(brand.primaryColor, -0.38)} 100%)`,
            overflow: 'hidden',
        }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                    position: 'absolute',
                    width: big * 0.75,
                    height: big * 0.75,
                    right: -big * 0.28,
                    top: -big * 0.22,
                    borderRadius: '50%',
                    background: brand.secondaryColor,
                    opacity: 0.22,
                } }), (0, jsx_runtime_1.jsx)("div", { style: {
                    position: 'absolute',
                    width: big * 0.55,
                    height: big * 0.55,
                    left: -big * 0.25,
                    bottom: -big * 0.18,
                    borderRadius: '50%',
                    border: `${Math.round(big * 0.03)}px solid ${brand.secondaryColor}`,
                    opacity: 0.18,
                } }), (0, jsx_runtime_1.jsx)(remotion_1.AbsoluteFill, { style: {
                    background: 'radial-gradient(ellipse at 50% 35%, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0) 60%)',
                } })] }));
};
exports.Background = Background;
//# sourceMappingURL=Background.js.map