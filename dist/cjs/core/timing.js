"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.firstWordS = firstWordS;
exports.computeCardTimeline = computeCardTimeline;
exports.cardStateAt = cardStateAt;
exports.secondsToFrame = secondsToFrame;
exports.contentEndS = contentEndS;
exports.computeDurationInFrames = computeDurationInFrames;
exports.musicGainAt = musicGainAt;
const tokens_1 = require("./tokens");
/** Instante da primeira palavra da fala; sem alinhamento, o início da fala. */
function firstWordS(line) {
    return line.words[0]?.startS ?? line.startS;
}
/** Linha do tempo dos cards na ordem das falas: [abertura, ofertas..., fechamento]. */
function computeCardTimeline(props, options = {}) {
    const entryS = options.entryS ?? tokens_1.tokens.timing.cardEntryS;
    if (!(entryS >= 0 && entryS <= tokens_1.tokens.timing.cardMaxLeadS)) {
        throw new Error(`A transição de entrada precisa durar entre 0 e ${tokens_1.tokens.timing.cardMaxLeadS} s (recebido ${entryS})`);
    }
    const slots = [];
    for (const line of props.lines) {
        const anchorS = firstWordS(line);
        const prev = slots[slots.length - 1];
        let enterStartS;
        let enterEndS;
        if (line.kind === 'opening' && !prev) {
            // O logo da abertura já está na tela no primeiro quadro (miniatura/pôster).
            enterStartS = 0;
            enterEndS = 0;
        }
        else {
            enterEndS = anchorS;
            enterStartS = Math.max(0, anchorS - entryS, prev ? prev.enterEndS : 0);
        }
        slots.push({
            kind: line.kind,
            id: line.kind === 'offer' ? (line.offerId ?? line.id) : line.id,
            lineId: line.id,
            offerId: line.kind === 'offer' ? (line.offerId ?? null) : null,
            anchorS,
            enterStartS,
            enterEndS,
            exitStartS: null,
            exitEndS: null,
            anchorFromLineStart: line.words.length === 0,
        });
    }
    for (let i = 0; i < slots.length - 1; i += 1) {
        const current = slots[i];
        const next = slots[i + 1];
        current.exitStartS = next.enterStartS;
        current.exitEndS = next.enterEndS;
    }
    return slots;
}
const progress = (t, start, end) => end <= start ? (t >= end ? 1 : 0) : Math.min(1, Math.max(0, (t - start) / (end - start)));
/** Estado do card no instante `tS` (s). */
function cardStateAt(slot, tS) {
    if (tS < slot.enterStartS)
        return { visible: false, enter: 0, exit: 0 };
    const enter = progress(tS, slot.enterStartS, slot.enterEndS);
    const exit = slot.exitStartS == null || slot.exitEndS == null
        ? 0
        : progress(tS, slot.exitStartS, slot.exitEndS);
    return { visible: exit < 1, enter, exit };
}
/** Segundos → quadro (arredondamento único usado por clipes e cards). */
function secondsToFrame(seconds, fps) {
    return Math.round(seconds * fps);
}
/** Fim do conteúdo falado (s): fim da última fala ou do último clipe. */
function contentEndS(props) {
    const lineEnd = Math.max(0, ...props.lines.map((l) => l.endS));
    const clipEnd = Math.max(0, ...props.character.clips.map((c) => c.endS));
    return Math.max(lineEnd, clipEnd);
}
/**
 * Duração da composição em quadros: fim da última fala (ou clipe) + cartela
 * final (`endcardPaddingS`), arredondado para cima. É o que o
 * `calculateMetadata` devolve e o que a prévia (Player) deve usar.
 */
function computeDurationInFrames(props, endcardPaddingS = tokens_1.tokens.timing.endcardPaddingS) {
    return Math.max(1, Math.ceil((contentEndS(props) + endcardPaddingS) * props.fps - 1e-9));
}
/**
 * Ganho da música (0..1, multiplica o volume base) no instante `tS`: atenuado
 * em `duckDb` dentro das janelas de fala, com rampas lineares de `rampS` nas
 * bordas. Determinístico (derivado só dos tempos das falas).
 */
function musicGainAt(tS, lines, options = {}) {
    const duckDb = options.duckDb ?? tokens_1.tokens.music.duckDb;
    const rampS = options.rampS ?? tokens_1.tokens.music.duckRampS;
    const ducked = 10 ** (duckDb / 20);
    let weight = 0;
    for (const line of lines) {
        const dist = tS < line.startS ? line.startS - tS : tS > line.endS ? tS - line.endS : 0;
        const w = rampS <= 0 ? (dist === 0 ? 1 : 0) : Math.max(0, 1 - dist / rampS);
        if (w > weight)
            weight = w;
        if (weight === 1)
            break;
    }
    return 1 - (1 - ducked) * weight;
}
//# sourceMappingURL=timing.js.map