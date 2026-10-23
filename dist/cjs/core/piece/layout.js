"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NAME_BASE_RATIO = exports.PRICE_BASE_RATIO = exports.NAME_MIN_PX_AT_1080 = exports.PRICE_MIN_PX_AT_1080 = exports.LAYOUT_GAP_RATIO = void 0;
exports.columnsFor = columnsFor;
exports.productTextSizes = productTextSizes;
exports.layoutProducts = layoutProducts;
exports.LAYOUT_GAP_RATIO = 0.02;
exports.PRICE_MIN_PX_AT_1080 = 36;
exports.NAME_MIN_PX_AT_1080 = 24;
/** Preço base = 16% da largura da célula; nome base = 9% (ver `productTextSizes`). */
exports.PRICE_BASE_RATIO = 0.16;
exports.NAME_BASE_RATIO = 0.09;
function columnsFor(count, areaAspect) {
    if (count <= 1)
        return 1;
    if (count === 2)
        return 2;
    if (count === 3)
        return areaAspect >= 1.2 ? 3 : 2;
    if (count === 4)
        return 2;
    if (count <= 9)
        return 3;
    return 4;
}
/** Tamanhos de texto (px) de uma célula, respeitando os mínimos a 1080 de largura. */
function productTextSizes(cellWidthPx, frameWidthPx) {
    const unit = frameWidthPx / 1080;
    const priceMin = exports.PRICE_MIN_PX_AT_1080 * unit;
    const nameMin = exports.NAME_MIN_PX_AT_1080 * unit;
    const priceBase = cellWidthPx * exports.PRICE_BASE_RATIO;
    const nameBase = cellWidthPx * exports.NAME_BASE_RATIO;
    const scale = Math.max(1, priceMin / priceBase, nameMin / nameBase);
    return {
        pricePx: Math.round(priceBase * scale),
        namePx: Math.round(nameBase * scale),
        scale: Number(scale.toFixed(4)),
    };
}
const round = (value) => Number(value.toFixed(5));
function layoutProducts(input) {
    const { areaRect, width, height } = input;
    const ids = input.itemIds.filter((id, i, all) => all.indexOf(id) === i);
    const count = ids.length;
    if (count === 0) {
        return { rects: {}, cols: 0, rows: 0, cellPx: { width: 0, height: 0 }, textScale: 1 };
    }
    const areaPx = { w: areaRect.w * width, h: areaRect.h * height };
    const featured = input.featuredId && count >= 3 && ids.includes(input.featuredId) ? input.featuredId : null;
    const cols = columnsFor(count, areaPx.w / Math.max(1, areaPx.h));
    // com destaque: a primeira linha tem o destaque (2 colunas) + (cols-2) itens comuns
    const firstRowOthers = featured ? Math.max(0, cols - 2) : cols;
    const rest = featured ? count - 1 - firstRowOthers : count;
    const rows = featured ? 1 + Math.ceil(Math.max(0, rest) / cols) : Math.ceil(count / cols);
    const gapX = areaRect.w * exports.LAYOUT_GAP_RATIO;
    const gapY = (gapX * width) / height; // mesma folga em px nos dois eixos
    const cellW = (areaRect.w - gapX * (cols + 1)) / cols;
    const cellH = (areaRect.h - gapY * (rows + 1)) / rows;
    const rects = {};
    const place = (id, col, row, span = 1) => {
        rects[id] = {
            x: round(areaRect.x + gapX + col * (cellW + gapX)),
            y: round(areaRect.y + gapY + row * (cellH + gapY)),
            w: round(cellW * span + gapX * (span - 1)),
            h: round(cellH),
        };
    };
    const ordered = featured ? [featured, ...ids.filter((id) => id !== featured)] : ids;
    let index = 0;
    if (featured) {
        place(featured, 0, 0, Math.min(2, cols));
        index = 1;
        for (let col = Math.min(2, cols); col < cols && index < ordered.length; col += 1) {
            place(ordered[index], col, 0);
            index += 1;
        }
    }
    let row = featured ? 1 : 0;
    while (index < ordered.length) {
        // linha incompleta (só pode ser a última) centralizada: deslocamento em colunas
        const inRow = Math.min(cols, ordered.length - index);
        const offset = (cols - inRow) / 2;
        for (let col = 0; col < inRow; col += 1) {
            place(ordered[index], col + offset, row);
            index += 1;
        }
        row += 1;
    }
    const cellPx = { width: Math.round(cellW * width), height: Math.round(cellH * height) };
    return { rects, cols, rows, cellPx, textScale: productTextSizes(cellPx.width, width).scale };
}
//# sourceMappingURL=layout.js.map