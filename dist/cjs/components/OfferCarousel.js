"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OfferCarousel = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const remotion_1 = require("remotion");
const captions_1 = require("../core/captions");
const layout_1 = require("../core/layout");
const timing_1 = require("../core/timing");
const tokens_1 = require("../core/tokens");
const Background_1 = require("./Background");
const CaptionsBand_1 = require("./CaptionsBand");
const CharacterWindow_1 = require("./CharacterWindow");
const color_1 = require("./color");
const fonts_1 = require("./fonts");
const LogoCard_1 = require("./LogoCard");
const OfferCard_1 = require("./OfferCard");
const resolve_src_1 = require("./resolve-src");
const easeOut = remotion_1.Easing.out(remotion_1.Easing.cubic);
/**
 * Transição em pilha: o card que entra desliza da direita e fica opaco logo no
 * início da janela (15%), cobrindo o card anterior, que recua (escala) por
 * baixo e some quando a entrada termina — os textos dos dois nunca se misturam.
 */
function cardMotion(enter, exit) {
    const e = easeOut(enter);
    const x = easeOut(exit);
    const translate = (1 - e) * tokens_1.tokens.card.slidePx;
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
const OfferCarousel = (props) => {
    const frame = (0, remotion_1.useCurrentFrame)();
    const { fps } = (0, remotion_1.useVideoConfig)();
    const tS = frame / fps;
    const fontFamily = (0, fonts_1.fontStackFor)(props.brand.fontFamily);
    const fontsReady = (0, fonts_1.useBrandFontReady)(props.brand);
    const fonts = (0, react_1.useMemo)(() => ({ family: fontFamily, ready: fontsReady }), [fontFamily, fontsReady]);
    const layout = (0, react_1.useMemo)(() => (0, layout_1.resolveLayout)(props), [props.width, props.height, props.character, props.layoutPreset, props.captions, props.cardBox]);
    const timeline = (0, react_1.useMemo)(() => (0, timing_1.computeCardTimeline)(props), [props.lines]);
    const offersById = (0, react_1.useMemo)(() => new Map(props.offers.map((o) => [o.id, o])), [props.offers]);
    const captionPages = (0, react_1.useMemo)(() => ((0, captions_1.shouldRenderCaptions)(props) ? (0, captions_1.buildCaptionPages)(props.lines) : []), [props.captions, props.lines]);
    const accentColor = (0, color_1.luminance)(props.brand.primaryColor) < 0.5 ? props.brand.primaryColor : tokens_1.tokens.color.cardText;
    const hasLogoContent = Boolean(props.brand.logoUrl || props.brand.name);
    const renderSlot = (slot) => {
        const state = (0, timing_1.cardStateAt)(slot, tS);
        if (!state.visible)
            return null;
        const offer = slot.offerId ? offersById.get(slot.offerId) : undefined;
        if (slot.kind === 'offer' && !offer)
            return null;
        if (slot.kind !== 'offer' && !hasLogoContent)
            return null;
        return ((0, jsx_runtime_1.jsx)("div", { "data-card": slot.kind === 'offer' ? slot.offerId : slot.kind, style: {
                position: 'absolute',
                left: layout.card.x,
                top: layout.card.y,
                width: layout.card.width,
                height: layout.card.height,
                borderRadius: tokens_1.tokens.radius.card,
                background: tokens_1.tokens.color.cardBackground,
                boxShadow: `0 24px 60px ${tokens_1.tokens.color.shadow}`,
                overflow: 'hidden',
                ...cardMotion(state.enter, state.exit),
            }, children: offer ? ((0, jsx_runtime_1.jsx)(OfferCard_1.OfferCard, { offer: offer, inner: layout.cardInner, fonts: fonts, accentColor: accentColor, secondaryColor: props.brand.secondaryColor })) : ((0, jsx_runtime_1.jsx)(LogoCard_1.LogoCard, { brand: props.brand, width: layout.card.width, height: layout.card.height, fonts: fonts })) }, `${slot.kind}-${slot.id}`));
    };
    return ((0, jsx_runtime_1.jsxs)(remotion_1.AbsoluteFill, { style: { fontFamily, overflow: 'hidden' }, children: [(0, jsx_runtime_1.jsx)(Background_1.Background, { brand: props.brand, width: props.width, height: props.height }), (0, jsx_runtime_1.jsx)(CharacterWindow_1.CharacterWindow, { character: props.character, rect: layout.character, fps: fps, fallbackColor: props.brand.secondaryColor }), timeline.map(renderSlot), layout.captions && captionPages.length > 0 ? ((0, jsx_runtime_1.jsx)(CaptionsBand_1.CaptionsBand, { pages: captionPages, rect: layout.captions, timeMs: tS * 1000, fonts: fonts, highlightColor: (0, color_1.captionHighlight)(props.brand.secondaryColor) })) : null, props.music ? ((0, jsx_runtime_1.jsx)(remotion_1.Html5Audio, { src: (0, resolve_src_1.resolveAssetSrc)(props.music.src), loop: true, 
                // 'extend': o quadro do callback segue contando entre as voltas do loop
                // (o default 'repeat' reinicia a cada volta e o ducking sairia da fala).
                loopVolumeCurveBehavior: "extend", volume: (f) => props.music.volume *
                    (props.music.duck === false ? 1 : (0, timing_1.musicGainAt)(f / fps, props.lines)) })) : null] }));
};
exports.OfferCarousel = OfferCarousel;
//# sourceMappingURL=OfferCarousel.js.map