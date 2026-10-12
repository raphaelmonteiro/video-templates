"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CAPTIONS_ALIGNMENT_MISSING = void 0;
exports.captionsReadiness = captionsReadiness;
exports.shouldRenderCaptions = shouldRenderCaptions;
exports.lineToCaptions = lineToCaptions;
exports.buildCaptionPages = buildCaptionPages;
exports.activeCaptionPage = activeCaptionPage;
exports.activeTokenIndex = activeTokenIndex;
const captions_1 = require("@remotion/captions");
const tokens_1 = require("./tokens");
/**
 * Legendas por palavra (spec video-composition-render "Legendas por formato";
 * design D8): as palavras das falas (timestamps absolutos) viram `Caption[]`
 * do @remotion/captions e páginas no estilo TikTok com `createTikTokStyleCaptions`.
 * Uma página nunca atravessa duas falas.
 */
exports.CAPTIONS_ALIGNMENT_MISSING = 'CAPTIONS_ALIGNMENT_MISSING';
/**
 * Legendas pedidas e alguma fala sem palavras → `CAPTIONS_ALIGNMENT_MISSING`
 * para o backend BLOQUEAR (aviso + aceite explícito, nunca omitir em
 * silêncio). A composição, nesse caso, apenas não desenha legendas.
 */
function captionsReadiness(props) {
    if (!props.captions)
        return { ok: true, code: null, captionsEnabled: false, missingLineIds: [] };
    const missingLineIds = props.lines.filter((l) => l.words.length === 0).map((l) => l.id);
    if (missingLineIds.length === 0) {
        return { ok: true, code: null, captionsEnabled: true, missingLineIds: [] };
    }
    return {
        ok: false,
        code: exports.CAPTIONS_ALIGNMENT_MISSING,
        captionsEnabled: true,
        missingLineIds,
        message: `Legendas ativadas, mas ${missingLineIds.length} fala(s) não têm timestamps por palavra ` +
            `(${missingLineIds.join(', ')}): aceite a entrega sem legendas ou refaça o TTS.`,
    };
}
/** A composição só desenha legendas quando ligadas E prontas (todas as falas com palavras). */
function shouldRenderCaptions(props) {
    return captionsReadiness(props).ok && props.captions;
}
/**
 * Palavras de UMA fala → `Caption[]` em ms absolutos. Convenção do
 * @remotion/captions: a partir da segunda palavra o texto leva o espaço
 * inicial; a última palavra da fala marca `pageBreakAfter`.
 */
function lineToCaptions(line) {
    return line.words.map((w, i) => ({
        text: i === 0 ? w.text : ` ${w.text}`,
        startMs: Math.round(w.startS * 1000),
        endMs: Math.round(w.endS * 1000),
        timestampMs: Math.round(((w.startS + w.endS) / 2) * 1000),
        confidence: 1,
        ...(i === line.words.length - 1 ? { pageBreakAfter: true } : {}),
    }));
}
/** Páginas de legenda de todas as falas, em ordem, sem atravessar falas. */
function buildCaptionPages(lines, options = {}) {
    const combine = options.combineTokensWithinMilliseconds ?? tokens_1.tokens.timing.captionCombineMs;
    const holdMs = options.holdMs ?? Math.round(tokens_1.tokens.timing.captionHoldS * 1000);
    const pages = [];
    for (const line of lines) {
        if (line.words.length === 0)
            continue;
        const { pages: tiktok } = (0, captions_1.createTikTokStyleCaptions)({
            captions: lineToCaptions(line),
            combineTokensWithinMilliseconds: combine,
        });
        for (const page of tiktok) {
            if (page.tokens.length === 0)
                continue;
            const lastToken = page.tokens[page.tokens.length - 1];
            pages.push({
                lineId: line.id,
                text: page.text,
                startMs: page.startMs,
                endMs: lastToken.toMs + holdMs,
                tokens: page.tokens.map((t) => ({ text: t.text, fromMs: t.fromMs, toMs: t.toMs })),
            });
        }
    }
    // Uma página some quando a próxima entra (nunca duas na tela).
    for (let i = 0; i < pages.length - 1; i += 1) {
        const current = pages[i];
        const next = pages[i + 1];
        if (current.endMs > next.startMs)
            current.endMs = next.startMs;
    }
    return pages;
}
/** Página visível em `tMs`, ou null. */
function activeCaptionPage(pages, tMs) {
    return pages.find((p) => tMs >= p.startMs && tMs < p.endMs) ?? null;
}
/** Índice da palavra destacada: a última que já começou (−1 antes da primeira). */
function activeTokenIndex(page, tMs) {
    let index = -1;
    page.tokens.forEach((t, i) => {
        if (tMs >= t.fromMs)
            index = i;
    });
    return index;
}
//# sourceMappingURL=captions.js.map