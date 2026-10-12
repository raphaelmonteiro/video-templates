"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fitNameLines = fitNameLines;
exports.fitSingleLine = fitSingleLine;
exports.fitComposite = fitComposite;
const layout_utils_1 = require("@remotion/layout-utils");
const tokens_1 = require("../core/tokens");
/**
 * Ajuste de texto pela medida real do navegador (@remotion/layout-utils).
 * Só roda dentro do render (precisa de DOM) e só depois da fonte pronta.
 */
const SAMPLE = 100;
/** Folga para o arredondamento de subpixel não estourar a caixa. */
const SAFETY = 0.97;
/**
 * Nome do produto em 1 ou 2 linhas com `fitText`: testa a linha única e cada
 * quebra possível entre palavras, mede cada linha e escolhe a opção com a
 * MAIOR fonte que cabe na largura e na altura da caixa (empate → menos linhas).
 */
function fitNameLines(name, box, fontFamily, fontWeight) {
    const words = name.trim().split(/\s+/).filter(Boolean);
    const { nameMaxFontSize, nameMinFontSize, nameLineHeight } = tokens_1.tokens.card;
    const candidates = [[words.join(' ')]];
    for (let k = 1; k < words.length; k += 1) {
        candidates.push([words.slice(0, k).join(' '), words.slice(k).join(' ')]);
    }
    let best = { lines: [words.join(' ')], fontSize: 0 };
    for (const lines of candidates) {
        const byWidth = Math.min(...lines.map((line) => (0, layout_utils_1.fitText)({ text: line, withinWidth: box.width, fontFamily, fontWeight }).fontSize));
        const byHeight = box.height / (lines.length * nameLineHeight);
        const size = Math.floor(Math.min(byWidth * SAFETY, byHeight, nameMaxFontSize));
        if (size > best.fontSize)
            best = { lines, fontSize: size };
    }
    return { lines: best.lines, fontSize: Math.max(nameMinFontSize, best.fontSize) };
}
/** Uma linha que cabe na largura e na altura (com teto opcional). */
function fitSingleLine(text, box, fontFamily, fontWeight, maxFontSize = Infinity) {
    const byWidth = (0, layout_utils_1.fitText)({ text, withinWidth: box.width, fontFamily, fontWeight }).fontSize;
    return Math.max(1, Math.floor(Math.min(byWidth * SAFETY, box.height, maxFontSize)));
}
/**
 * Fonte base para uma linha composta de partes com tamanhos diferentes (preço
 * "R$" + inteiro + ",90" + unidade), medindo cada parte no tamanho em que
 * será desenhada — a generalização do `fitText` para tipografia mista.
 */
function fitComposite(parts, withinWidth, fontFamily, fontWeight) {
    const widthAtSample = parts.reduce((sum, part) => {
        const measured = (0, layout_utils_1.measureText)({
            text: part.text,
            fontFamily,
            fontWeight,
            fontSize: SAMPLE * part.scale,
        }).width;
        return sum + measured + (part.marginEm ?? 0) * SAMPLE;
    }, 0);
    return widthAtSample > 0 ? (withinWidth / widthAtSample) * SAMPLE * SAFETY : SAMPLE;
}
//# sourceMappingURL=fit.js.map