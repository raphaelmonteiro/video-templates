import { safeAreaFor } from './safe-area';
import { tokens } from './tokens';
const round4 = (n) => Number(n.toFixed(4));
/** Faixa de legendas por orientação do quadro. */
function captionBandHeight(width, height) {
    return height >= width ? tokens.layout.captionBandPortrait : tokens.layout.captionBandLandscape;
}
/** Limita o card a uma proporção legível e o centraliza na região disponível. */
function fitCardInRegion(region) {
    const { cardMaxHeightRatio, cardMaxWidthRatio } = tokens.layout;
    let { width, height } = region;
    if (height > width * cardMaxHeightRatio)
        height = Math.floor(width * cardMaxHeightRatio);
    if (width > height * cardMaxWidthRatio)
        width = Math.floor(height * cardMaxWidthRatio);
    return {
        x: region.x + Math.floor((region.width - width) / 2),
        y: region.y + Math.floor((region.height - height) / 2),
        width,
        height,
    };
}
/**
 * Regiões do preset em PIXELS, sempre dentro da área segura do tamanho:
 * - legendas (quando ligadas): faixa no topo da área segura, largura total;
 * - `character_left|right`: personagem numa coluna lateral, ancorado embaixo,
 *   no aspecto do tile; cards na coluna restante;
 * - `character_bottom`: personagem centrado embaixo; cards acima dele.
 * O personagem e os cards nunca se sobrepõem (separados por `gap`).
 */
export function presetLayout(input) {
    const { width, height, preset, captions } = input;
    const ratio = input.tileRatio > 0 ? input.tileRatio : 0.75;
    const gap = tokens.layout.gap;
    const safe = safeAreaFor(width, height);
    const safeW = safe.right - safe.left;
    const band = captions ? captionBandHeight(width, height) : 0;
    const captionsRect = captions
        ? { x: safe.left, y: safe.top, width: safeW, height: band }
        : null;
    const contentTop = safe.top + (captions ? band + gap : 0);
    const contentH = safe.bottom - contentTop;
    if (preset === 'character_bottom') {
        let charH = Math.floor(contentH * tokens.layout.bottomCharacterHeightFraction);
        let charW = Math.floor(charH * ratio);
        if (charW > safeW) {
            charW = safeW;
            charH = Math.floor(charW / ratio);
        }
        const character = {
            x: safe.left + Math.floor((safeW - charW) / 2),
            y: safe.bottom - charH,
            width: charW,
            height: charH,
        };
        const card = fitCardInRegion({
            x: safe.left,
            y: contentTop,
            width: safeW,
            height: character.y - gap - contentTop,
        });
        return { safe, character, card, captions: captionsRect };
    }
    let charW = Math.floor(Math.min(safeW * tokens.layout.sideCharacterWidthFraction, contentH * ratio));
    const charH = Math.floor(charW / ratio);
    if (charH > contentH)
        charW = Math.floor(contentH * ratio);
    const character = {
        x: preset === 'character_left' ? safe.left : safe.right - charW,
        y: safe.bottom - Math.floor(charW / ratio),
        width: charW,
        height: Math.floor(charW / ratio),
    };
    const cardRegion = {
        x: preset === 'character_left' ? safe.left + charW + gap : safe.left,
        y: contentTop,
        width: safeW - charW - gap,
        height: contentH,
    };
    return { safe, character, card: fitCardInRegion(cardRegion), captions: captionsRect };
}
/** Pixels → frações do quadro arredondadas PARA DENTRO (a borda nunca vaza por arredondamento). */
export function pxToFractionRect(rect, width, height) {
    const x = Math.ceil((rect.x / width) * 1e4) / 1e4;
    const y = Math.ceil((rect.y / height) * 1e4) / 1e4;
    const right = Math.floor(((rect.x + rect.width) / width) * 1e4) / 1e4;
    const bottom = Math.floor(((rect.y + rect.height) / height) * 1e4) / 1e4;
    return { x: round4(x), y: round4(y), w: round4(right - x), h: round4(bottom - y) };
}
/** Frações → pixels do quadro (inteiros). */
export function fractionRectToPx(rect, width, height) {
    const x = Math.round(rect.x * width);
    const y = Math.round(rect.y * height);
    return {
        x,
        y,
        width: Math.round((rect.x + rect.w) * width) - x,
        height: Math.round((rect.y + rect.h) * height) - y,
    };
}
/**
 * O que backend e frontend gravam nas props a partir do preset escolhido:
 * janela do personagem e caixa dos cards em frações do quadro.
 */
export function presetFractions(input) {
    const px = presetLayout(input);
    return {
        window: pxToFractionRect(px.character, input.width, input.height),
        cardBox: pxToFractionRect(px.card, input.width, input.height),
        captions: px.captions ? pxToFractionRect(px.captions, input.width, input.height) : null,
    };
}
const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
/**
 * Arranjo interno fixo do card (independe da oferta, para todos os cards
 * terem a mesma cara): vertical (foto em cima) quando o card é alto, horizontal
 * (foto à esquerda) quando é largo. Tudo fica dentro do card.
 */
export function cardInnerLayout(card) {
    const { width, height } = card;
    const orientation = width / height >= tokens.layout.horizontalCardMinAspect ? 'horizontal' : 'vertical';
    const padding = Math.round(Math.min(width, height) * 0.06);
    const innerW = width - 2 * padding;
    const innerH = height - 2 * padding;
    const gap = Math.max(6, Math.round(innerH * 0.02));
    if (orientation === 'vertical') {
        const imageH = Math.round(innerH * 0.5);
        const nameH = Math.round(innerH * 0.17);
        const originalH = Math.round(innerH * 0.07);
        const badgeH = Math.round(clamp(innerH * 0.075, 40, 76));
        const image = { x: padding, y: padding, width: innerW, height: imageH };
        const name = { x: padding, y: image.y + imageH + gap, width: innerW, height: nameH };
        const originalPrice = { x: padding, y: name.y + nameH + gap, width: innerW, height: originalH };
        const priceY = originalPrice.y + originalH + gap;
        const price = { x: padding, y: priceY, width: innerW, height: padding + innerH - priceY };
        const badge = { x: padding, y: padding, width: Math.round(innerW * 0.72), height: badgeH };
        return { orientation, padding, image, badge, name, originalPrice, price };
    }
    const imageSize = Math.min(innerH, Math.round(innerW * 0.45));
    const image = {
        x: padding,
        y: padding + Math.round((innerH - imageSize) / 2),
        width: imageSize,
        height: imageSize,
    };
    const colX = padding + imageSize + padding;
    const colW = width - padding - colX;
    const badgeH = Math.round(clamp(innerH * 0.13, 40, 76));
    const nameH = Math.round(innerH * 0.27);
    const originalH = Math.round(innerH * 0.12);
    const badge = { x: colX, y: padding, width: Math.round(colW * 0.8), height: badgeH };
    const name = { x: colX, y: badge.y + badgeH + gap, width: colW, height: nameH };
    const originalPrice = { x: colX, y: name.y + nameH + gap, width: colW, height: originalH };
    const priceY = originalPrice.y + originalH + gap;
    const price = { x: colX, y: priceY, width: colW, height: padding + innerH - priceY };
    return { orientation, padding, image, badge, name, originalPrice, price };
}
/** Desloca um retângulo relativo ao card para coordenadas do quadro. */
export function offsetRect(rect, origin) {
    return { ...rect, x: rect.x + origin.x, y: rect.y + origin.y };
}
/**
 * Layout efetivo das props: janela do personagem das props (frações),
 * caixa dos cards das props ou do preset, faixa de legendas do preset.
 */
export function resolveLayout(props) {
    const preset = presetLayout({
        width: props.width,
        height: props.height,
        tileRatio: props.character.tileRatio,
        preset: props.layoutPreset,
        captions: props.captions,
    });
    const card = props.cardBox
        ? fractionRectToPx(props.cardBox, props.width, props.height)
        : preset.card;
    return {
        width: props.width,
        height: props.height,
        safe: preset.safe,
        character: fractionRectToPx(props.character.window, props.width, props.height),
        card,
        cardInner: cardInnerLayout(card),
        captions: preset.captions,
        cardBoxOverridden: Boolean(props.cardBox),
    };
}
//# sourceMappingURL=layout.js.map