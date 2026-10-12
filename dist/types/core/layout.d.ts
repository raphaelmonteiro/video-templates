import { SafeAreaPx } from './safe-area';
import type { FractionRect, OfferCarouselLayoutPreset, OfferCarouselProps } from './types';
/**
 * Geometria PURA da composição: presets de layout (personagem à esquerda,
 * à direita ou embaixo), conversão fração ↔ pixel e o arranjo interno do card.
 * A composição, o validador (`validateLayout`) e a prévia do frontend usam as
 * MESMAS funções, então a posição relativa de um card é idêntica na prévia e
 * no MP4 (spec "Prévia fiel").
 */
export interface PxRect {
    x: number;
    y: number;
    width: number;
    height: number;
}
export interface PresetLayoutInput {
    width: number;
    height: number;
    /** Largura/altura do tile do personagem. */
    tileRatio: number;
    preset: OfferCarouselLayoutPreset;
    /** Com legendas, o preset reserva a faixa de legendas no topo da área segura. */
    captions: boolean;
}
export interface PresetLayoutPx {
    safe: SafeAreaPx;
    character: PxRect;
    card: PxRect;
    /** Faixa das legendas; null quando `captions` é false. */
    captions: PxRect | null;
}
/**
 * Regiões do preset em PIXELS, sempre dentro da área segura do tamanho:
 * - legendas (quando ligadas): faixa no topo da área segura, largura total;
 * - `character_left|right`: personagem numa coluna lateral, ancorado embaixo,
 *   no aspecto do tile; cards na coluna restante;
 * - `character_bottom`: personagem centrado embaixo; cards acima dele.
 * O personagem e os cards nunca se sobrepõem (separados por `gap`).
 */
export declare function presetLayout(input: PresetLayoutInput): PresetLayoutPx;
/** Pixels → frações do quadro arredondadas PARA DENTRO (a borda nunca vaza por arredondamento). */
export declare function pxToFractionRect(rect: PxRect, width: number, height: number): FractionRect;
/** Frações → pixels do quadro (inteiros). */
export declare function fractionRectToPx(rect: FractionRect, width: number, height: number): PxRect;
export interface PresetFractions {
    /** Vai em `props.character.window`. */
    window: FractionRect;
    /** Vai em `props.cardBox` (opcional: é o default do preset). */
    cardBox: FractionRect;
    captions: FractionRect | null;
}
/**
 * O que backend e frontend gravam nas props a partir do preset escolhido:
 * janela do personagem e caixa dos cards em frações do quadro.
 */
export declare function presetFractions(input: PresetLayoutInput): PresetFractions;
export type CardOrientation = 'vertical' | 'horizontal';
/** Sub-regiões do card em pixels RELATIVOS ao canto do card. */
export interface CardInnerLayout {
    orientation: CardOrientation;
    padding: number;
    image: PxRect;
    badge: PxRect;
    name: PxRect;
    originalPrice: PxRect;
    /** Linha do preço atual (o preço ocupa a esquerda; a unidade, a direita). */
    price: PxRect;
}
/**
 * Arranjo interno fixo do card (independe da oferta, para todos os cards
 * terem a mesma cara): vertical (foto em cima) quando o card é alto, horizontal
 * (foto à esquerda) quando é largo. Tudo fica dentro do card.
 */
export declare function cardInnerLayout(card: Pick<PxRect, 'width' | 'height'>): CardInnerLayout;
/** Desloca um retângulo relativo ao card para coordenadas do quadro. */
export declare function offsetRect(rect: PxRect, origin: Pick<PxRect, 'x' | 'y'>): PxRect;
export interface ResolvedLayout {
    width: number;
    height: number;
    safe: SafeAreaPx;
    character: PxRect;
    card: PxRect;
    cardInner: CardInnerLayout;
    captions: PxRect | null;
    /** true quando `cardBox` veio nas props (prévia/ajuste manual). */
    cardBoxOverridden: boolean;
}
type LayoutProps = Pick<OfferCarouselProps, 'width' | 'height' | 'character' | 'layoutPreset' | 'captions' | 'cardBox'>;
/**
 * Layout efetivo das props: janela do personagem das props (frações),
 * caixa dos cards das props ou do preset, faixa de legendas do preset.
 */
export declare function resolveLayout(props: LayoutProps): ResolvedLayout;
export {};
//# sourceMappingURL=layout.d.ts.map