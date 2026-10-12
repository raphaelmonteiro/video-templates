import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo } from 'react';
import { AbsoluteFill, Easing, Html5Audio, useCurrentFrame, useVideoConfig } from 'remotion';
import { buildCaptionPages, shouldRenderCaptions } from '../core/captions';
import { resolveLayout } from '../core/layout';
import { cardStateAt, computeCardTimeline, musicGainAt } from '../core/timing';
import { tokens } from '../core/tokens';
import { Background } from './Background';
import { CaptionsBand } from './CaptionsBand';
import { CharacterWindow } from './CharacterWindow';
import { captionHighlight, luminance } from './color';
import { fontStackFor, useBrandFontReady } from './fonts';
import { LogoCard } from './LogoCard';
import { OfferCard } from './OfferCard';
import { resolveAssetSrc } from './resolve-src';
const easeOut = Easing.out(Easing.cubic);
/**
 * Transição em pilha: o card que entra desliza da direita e fica opaco logo no
 * início da janela (15%), cobrindo o card anterior, que recua (escala) por
 * baixo e some quando a entrada termina — os textos dos dois nunca se misturam.
 */
function cardMotion(enter, exit) {
    const e = easeOut(enter);
    const x = easeOut(exit);
    const translate = (1 - e) * tokens.card.slidePx;
    const scale = (0.95 + 0.05 * e) * (1 - 0.08 * x);
    const opacity = Math.min(1, enter / 0.15) * (exit >= 1 ? 0 : 1);
    return { opacity, transform: `translateX(${translate}px) scale(${scale})` };
}
/**
 * Composição F2 "ofertas em sequência": fundo da marca, personagem numa região
 * fixa, cards sincronizados com as falas (entrada concluída na primeira
 * palavra), logo na abertura e no fechamento, legendas por palavra e trilha
 * opcional com ducking nas falas.
 */
export const OfferCarousel = (props) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const tS = frame / fps;
    const fontFamily = fontStackFor(props.brand.fontFamily);
    const fontsReady = useBrandFontReady(props.brand);
    const fonts = useMemo(() => ({ family: fontFamily, ready: fontsReady }), [fontFamily, fontsReady]);
    const layout = useMemo(() => resolveLayout(props), [props.width, props.height, props.character, props.layoutPreset, props.captions, props.cardBox]);
    const timeline = useMemo(() => computeCardTimeline(props), [props.lines]);
    const offersById = useMemo(() => new Map(props.offers.map((o) => [o.id, o])), [props.offers]);
    const captionPages = useMemo(() => (shouldRenderCaptions(props) ? buildCaptionPages(props.lines) : []), [props.captions, props.lines]);
    const accentColor = luminance(props.brand.primaryColor) < 0.5 ? props.brand.primaryColor : tokens.color.cardText;
    const hasLogoContent = Boolean(props.brand.logoUrl || props.brand.name);
    const renderSlot = (slot) => {
        const state = cardStateAt(slot, tS);
        if (!state.visible)
            return null;
        const offer = slot.offerId ? offersById.get(slot.offerId) : undefined;
        if (slot.kind === 'offer' && !offer)
            return null;
        if (slot.kind !== 'offer' && !hasLogoContent)
            return null;
        return (_jsx("div", { "data-card": slot.kind === 'offer' ? slot.offerId : slot.kind, style: {
                position: 'absolute',
                left: layout.card.x,
                top: layout.card.y,
                width: layout.card.width,
                height: layout.card.height,
                borderRadius: tokens.radius.card,
                background: tokens.color.cardBackground,
                boxShadow: `0 24px 60px ${tokens.color.shadow}`,
                overflow: 'hidden',
                ...cardMotion(state.enter, state.exit),
            }, children: offer ? (_jsx(OfferCard, { offer: offer, inner: layout.cardInner, fonts: fonts, accentColor: accentColor, secondaryColor: props.brand.secondaryColor })) : (_jsx(LogoCard, { brand: props.brand, width: layout.card.width, height: layout.card.height, fonts: fonts })) }, `${slot.kind}-${slot.id}`));
    };
    return (_jsxs(AbsoluteFill, { style: { fontFamily, overflow: 'hidden' }, children: [_jsx(Background, { brand: props.brand, width: props.width, height: props.height }), _jsx(CharacterWindow, { character: props.character, rect: layout.character, fps: fps, fallbackColor: props.brand.secondaryColor }), timeline.map(renderSlot), layout.captions && captionPages.length > 0 ? (_jsx(CaptionsBand, { pages: captionPages, rect: layout.captions, timeMs: tS * 1000, fonts: fonts, highlightColor: captionHighlight(props.brand.secondaryColor) })) : null, props.music ? (_jsx(Html5Audio, { src: resolveAssetSrc(props.music.src), loop: true, 
                // 'extend': o quadro do callback segue contando entre as voltas do loop
                // (o default 'repeat' reinicia a cada volta e o ducking sairia da fala).
                loopVolumeCurveBehavior: "extend", volume: (f) => props.music.volume *
                    (props.music.duck === false ? 1 : musicGainAt(f / fps, props.lines)) })) : null] }));
};
//# sourceMappingURL=OfferCarousel.js.map