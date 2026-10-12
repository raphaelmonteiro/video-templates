import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { AbsoluteFill } from 'remotion';
import { shade } from './color';
/**
 * Fundo em gradiente da marca (quadro inteiro; o fundo não é validado contra a
 * área segura). Formas estáticas: nada depende do quadro, então o fundo é
 * idêntico em qualquer instante.
 */
export const Background = ({ brand, width, height, }) => {
    const big = Math.max(width, height);
    return (_jsxs(AbsoluteFill, { style: {
            background: `linear-gradient(160deg, ${shade(brand.primaryColor, 0.08)} 0%, ${brand.primaryColor} 45%, ${shade(brand.primaryColor, -0.38)} 100%)`,
            overflow: 'hidden',
        }, children: [_jsx("div", { style: {
                    position: 'absolute',
                    width: big * 0.75,
                    height: big * 0.75,
                    right: -big * 0.28,
                    top: -big * 0.22,
                    borderRadius: '50%',
                    background: brand.secondaryColor,
                    opacity: 0.22,
                } }), _jsx("div", { style: {
                    position: 'absolute',
                    width: big * 0.55,
                    height: big * 0.55,
                    left: -big * 0.25,
                    bottom: -big * 0.18,
                    borderRadius: '50%',
                    border: `${Math.round(big * 0.03)}px solid ${brand.secondaryColor}`,
                    opacity: 0.18,
                } }), _jsx(AbsoluteFill, { style: {
                    background: 'radial-gradient(ellipse at 50% 35%, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0) 60%)',
                } })] }));
};
//# sourceMappingURL=Background.js.map