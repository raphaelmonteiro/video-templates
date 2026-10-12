"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CharacterWindow = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const remotion_1 = require("remotion");
const timing_1 = require("../core/timing");
const tokens_1 = require("../core/tokens");
const resolve_src_1 = require("./resolve-src");
const ClipView = ({ src, durationInFrames, fade, }) => {
    const frame = (0, remotion_1.useCurrentFrame)();
    const f = tokens_1.tokens.timing.clipFadeFrames;
    const opacity = fade && durationInFrames > 2 * f
        ? (0, remotion_1.interpolate)(frame, [0, f, durationInFrames - f, durationInFrames], [0, 1, 1, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
        })
        : 1;
    return ((0, jsx_runtime_1.jsx)(remotion_1.OffthreadVideo, { src: (0, resolve_src_1.resolveAssetSrc)(src), style: { width: '100%', height: '100%', objectFit: 'cover', opacity } }));
};
/**
 * Personagem numa região FIXA do quadro, no aspecto do tile, durante o vídeo
 * inteiro. Cada fala tem um clipe conformado ao seu áudio (D7) colocado no seu
 * instante com `<Sequence>`; o áudio da fala vem do próprio clipe (TTS
 * muxado). Entre falas fica o pôster (tile de fala parado), com fade curto do
 * clipe sobre ele para suavizar o corte.
 */
const CharacterWindow = ({ character, rect, fps, fallbackColor }) => {
    const hasPoster = Boolean(character.posterUrl);
    return ((0, jsx_runtime_1.jsxs)("div", { style: {
            position: 'absolute',
            left: rect.x,
            top: rect.y,
            width: rect.width,
            height: rect.height,
            borderRadius: tokens_1.tokens.radius.window,
            overflow: 'hidden',
            background: character.backgroundColor ?? fallbackColor,
            boxShadow: `0 18px 48px ${tokens_1.tokens.color.shadow}`,
        }, children: [character.posterUrl ? ((0, jsx_runtime_1.jsx)(remotion_1.Img, { src: (0, resolve_src_1.resolveAssetSrc)(character.posterUrl), style: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' } })) : null, character.clips.map((clip, i) => {
                const from = (0, timing_1.secondsToFrame)(clip.startS, fps);
                const durationInFrames = Math.max(1, (0, timing_1.secondsToFrame)(clip.endS, fps) - from);
                return ((0, jsx_runtime_1.jsx)(remotion_1.Sequence, { from: from, durationInFrames: durationInFrames, name: `Fala ${clip.lineId ?? i + 1}`, children: (0, jsx_runtime_1.jsx)(ClipView, { src: clip.src, durationInFrames: durationInFrames, fade: hasPoster }) }, `${clip.lineId ?? i}-${clip.src}`));
            })] }));
};
exports.CharacterWindow = CharacterWindow;
//# sourceMappingURL=CharacterWindow.js.map