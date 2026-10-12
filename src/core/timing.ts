import { tokens } from './tokens';
import type { OfferCarouselLine, OfferCarouselProps } from './types';

/**
 * Timing PURO dos cards (spec video-offer-carousel "Card sincronizado com a
 * fala"; design D8): a transição de entrada de cada card TERMINA na primeira
 * palavra da fala da sua oferta e começa no máximo 0,5 s antes; o card fica
 * até a entrada do card seguinte (a saída acontece na MESMA janela da entrada
 * do próximo, como um "empurra") ou até o card de fechamento. Abertura e
 * fechamento mostram o logo do cliente na mesma caixa. Os instantes vêm dos
 * timestamps do TTS; sem palavras, cai no início da fala (o backend bloqueia
 * esse caso antes com SPEECH_ALIGNMENT_MISSING).
 */

export type CardSlotKind = 'opening' | 'offer' | 'closing';

export interface CardSlot {
  kind: CardSlotKind;
  /** offerId para ofertas; id da fala para abertura/fechamento. */
  id: string;
  lineId: string;
  offerId: string | null;
  /** Primeira palavra da fala (s) — onde a entrada termina. */
  anchorS: number;
  enterStartS: number;
  enterEndS: number;
  /** Janela da saída (= janela de entrada do card seguinte); null = fica até o fim. */
  exitStartS: number | null;
  exitEndS: number | null;
  /** true quando a fala não tinha palavras e o âncora caiu no início da fala. */
  anchorFromLineStart: boolean;
}

export interface CardTimelineOptions {
  /** Duração da transição de entrada (s); ≤ 0,5 (spec). */
  entryS?: number;
}

/** Instante da primeira palavra da fala; sem alinhamento, o início da fala. */
export function firstWordS(line: Pick<OfferCarouselLine, 'startS' | 'words'>): number {
  return line.words[0]?.startS ?? line.startS;
}

/** Linha do tempo dos cards na ordem das falas: [abertura, ofertas..., fechamento]. */
export function computeCardTimeline(
  props: Pick<OfferCarouselProps, 'lines'>,
  options: CardTimelineOptions = {},
): CardSlot[] {
  const entryS = options.entryS ?? tokens.timing.cardEntryS;
  if (!(entryS >= 0 && entryS <= tokens.timing.cardMaxLeadS)) {
    throw new Error(
      `A transição de entrada precisa durar entre 0 e ${tokens.timing.cardMaxLeadS} s (recebido ${entryS})`,
    );
  }
  const slots: CardSlot[] = [];
  for (const line of props.lines) {
    const anchorS = firstWordS(line);
    const prev = slots[slots.length - 1];
    let enterStartS: number;
    let enterEndS: number;
    if (line.kind === 'opening' && !prev) {
      // O logo da abertura já está na tela no primeiro quadro (miniatura/pôster).
      enterStartS = 0;
      enterEndS = 0;
    } else {
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
    const current = slots[i]!;
    const next = slots[i + 1]!;
    current.exitStartS = next.enterStartS;
    current.exitEndS = next.enterEndS;
  }
  return slots;
}

export interface CardVisualState {
  /** O card precisa ser desenhado neste instante. */
  visible: boolean;
  /** Progresso da entrada 0..1 (1 = totalmente visível). */
  enter: number;
  /** Progresso da saída 0..1 (1 = já saiu). */
  exit: number;
}

const progress = (t: number, start: number, end: number) =>
  end <= start ? (t >= end ? 1 : 0) : Math.min(1, Math.max(0, (t - start) / (end - start)));

/** Estado do card no instante `tS` (s). */
export function cardStateAt(slot: CardSlot, tS: number): CardVisualState {
  if (tS < slot.enterStartS) return { visible: false, enter: 0, exit: 0 };
  const enter = progress(tS, slot.enterStartS, slot.enterEndS);
  const exit =
    slot.exitStartS == null || slot.exitEndS == null
      ? 0
      : progress(tS, slot.exitStartS, slot.exitEndS);
  return { visible: exit < 1, enter, exit };
}

/** Segundos → quadro (arredondamento único usado por clipes e cards). */
export function secondsToFrame(seconds: number, fps: number): number {
  return Math.round(seconds * fps);
}

/** Fim do conteúdo falado (s): fim da última fala ou do último clipe. */
export function contentEndS(props: Pick<OfferCarouselProps, 'lines' | 'character'>): number {
  const lineEnd = Math.max(0, ...props.lines.map((l) => l.endS));
  const clipEnd = Math.max(0, ...props.character.clips.map((c) => c.endS));
  return Math.max(lineEnd, clipEnd);
}

/**
 * Duração da composição em quadros: fim da última fala (ou clipe) + cartela
 * final (`endcardPaddingS`), arredondado para cima. É o que o
 * `calculateMetadata` devolve e o que a prévia (Player) deve usar.
 */
export function computeDurationInFrames(
  props: Pick<OfferCarouselProps, 'lines' | 'character' | 'fps'>,
  endcardPaddingS: number = tokens.timing.endcardPaddingS,
): number {
  return Math.max(1, Math.ceil((contentEndS(props) + endcardPaddingS) * props.fps - 1e-9));
}

// ───────────────────────────── trilha (ducking) ─────────────────────────────

export interface DuckingOptions {
  /** Atenuação nas falas (dB, negativa). */
  duckDb?: number;
  /** Rampa (s) antes/depois de cada fala. */
  rampS?: number;
}

/**
 * Ganho da música (0..1, multiplica o volume base) no instante `tS`: atenuado
 * em `duckDb` dentro das janelas de fala, com rampas lineares de `rampS` nas
 * bordas. Determinístico (derivado só dos tempos das falas).
 */
export function musicGainAt(
  tS: number,
  lines: Pick<OfferCarouselLine, 'startS' | 'endS'>[],
  options: DuckingOptions = {},
): number {
  const duckDb = options.duckDb ?? tokens.music.duckDb;
  const rampS = options.rampS ?? tokens.music.duckRampS;
  const ducked = 10 ** (duckDb / 20);
  let weight = 0;
  for (const line of lines) {
    const dist = tS < line.startS ? line.startS - tS : tS > line.endS ? tS - line.endS : 0;
    const w = rampS <= 0 ? (dist === 0 ? 1 : 0) : Math.max(0, 1 - dist / rampS);
    if (w > weight) weight = w;
    if (weight === 1) break;
  }
  return 1 - (1 - ducked) * weight;
}
