import { describe, expect, it } from 'vitest';
import {
  cardStateAt,
  computeCardTimeline,
  computeDurationInFrames,
  firstWordS,
  musicGainAt,
} from '../src/core/timing';
import { tokens } from '../src/core/tokens';
import type { OfferCarouselLine } from '../src/core/types';
import { sampleProps } from './helpers';

const EPS = 1e-9;

describe('computeCardTimeline', () => {
  const props = sampleProps();
  const timeline = computeCardTimeline(props);
  const offerSlots = timeline.filter((s) => s.kind === 'offer');

  it('tem abertura, um card por oferta na ordem e fechamento', () => {
    expect(timeline.map((s) => s.kind)).toEqual([
      'opening',
      ...props.offers.map(() => 'offer'),
      'closing',
    ]);
    expect(offerSlots.map((s) => s.offerId)).toEqual(props.offers.map((o) => o.id));
  });

  it('a entrada de cada card termina NA primeira palavra da fala da oferta', () => {
    for (const slot of offerSlots) {
      const line = props.lines.find((l) => l.offerId === slot.offerId)!;
      expect(slot.enterEndS).toBe(line.words[0]!.startS);
      expect(cardStateAt(slot, line.words[0]!.startS)).toEqual({ visible: true, enter: 1, exit: 0 });
    }
  });

  it('a entrada começa no máximo 0,5 s antes da primeira palavra (e depois de 0)', () => {
    for (const slot of [...offerSlots, timeline[timeline.length - 1]!]) {
      const lead = slot.enterEndS - slot.enterStartS;
      expect(lead).toBeGreaterThan(0);
      expect(lead).toBeLessThanOrEqual(0.5 + EPS);
      expect(lead).toBeCloseTo(tokens.timing.cardEntryS, 9);
      // antes do início da transição o card não aparece
      expect(cardStateAt(slot, slot.enterStartS - 0.01).visible).toBe(false);
    }
  });

  it('o card fica até a entrada do card seguinte (sai na mesma janela)', () => {
    for (let i = 0; i < timeline.length - 1; i += 1) {
      const slot = timeline[i]!;
      const next = timeline[i + 1]!;
      expect(slot.exitStartS).toBe(next.enterStartS);
      expect(slot.exitEndS).toBe(next.enterEndS);
      // totalmente visível de enterEnd até a entrada do próximo
      for (const t of [slot.enterEndS, (slot.enterEndS + next.enterStartS) / 2, next.enterStartS]) {
        expect(cardStateAt(slot, t)).toEqual({ visible: true, enter: 1, exit: 0 });
      }
      // some quando o próximo termina de entrar
      expect(cardStateAt(slot, next.enterEndS).visible).toBe(false);
    }
  });

  it('cenário da spec: card 2 totalmente visível na 1ª palavra da fala 2 e some na entrada do card 3', () => {
    const line2 = props.lines.filter((l) => l.kind === 'offer')[1]!;
    const card2 = offerSlots[1]!;
    const card3 = offerSlots[2]!;
    expect(cardStateAt(card2, line2.words[0]!.startS)).toEqual({ visible: true, enter: 1, exit: 0 });
    const midEntry3 = (card3.enterStartS + card3.enterEndS) / 2;
    const s = cardStateAt(card2, midEntry3);
    expect(s.visible).toBe(true);
    expect(s.exit).toBeGreaterThan(0);
    expect(cardStateAt(card2, card3.enterEndS).visible).toBe(false);
  });

  it('o último card de oferta sai na entrada do fechamento; o fechamento fica até o fim', () => {
    const closing = timeline[timeline.length - 1]!;
    const lastOffer = offerSlots[offerSlots.length - 1]!;
    expect(lastOffer.exitEndS).toBe(firstWordS(props.lines[props.lines.length - 1]!));
    expect(closing.exitStartS).toBeNull();
    expect(cardStateAt(closing, 9999)).toEqual({ visible: true, enter: 1, exit: 0 });
  });

  it('o logo da abertura está visível no primeiro quadro', () => {
    expect(cardStateAt(timeline[0]!, 0)).toEqual({ visible: true, enter: 1, exit: 0 });
  });

  it('nunca começa a entrada antes de o card anterior terminar de entrar (falas curtas)', () => {
    const lines: OfferCarouselLine[] = [
      { id: 'o', kind: 'opening', startS: 0, endS: 0.3, words: [{ text: 'Oi', startS: 0.0, endS: 0.2 }] },
      { id: 'a', kind: 'offer', offerId: 'a', startS: 0.4, endS: 0.7, words: [{ text: 'A', startS: 0.45, endS: 0.6 }] },
      { id: 'b', kind: 'offer', offerId: 'b', startS: 0.75, endS: 1.0, words: [{ text: 'B', startS: 0.8, endS: 0.95 }] },
      { id: 'c', kind: 'closing', startS: 1.1, endS: 2, words: [{ text: 'Tchau', startS: 1.2, endS: 1.5 }] },
    ];
    const t = computeCardTimeline({ lines });
    expect(t[1]!.enterStartS).toBeCloseTo(0, 9);
    expect(t[2]!.enterStartS).toBeCloseTo(0.45, 9); // não antes de a entrar por completo
    expect(t[2]!.enterEndS).toBe(0.8);
    for (const s of t.slice(1)) expect(s.enterEndS - s.enterStartS).toBeLessThanOrEqual(0.5 + EPS);
  });

  it('sem palavras, o âncora cai no início da fala e fica sinalizado', () => {
    const p = sampleProps();
    p.lines[2]!.words = [];
    const slot = computeCardTimeline(p).find((s) => s.lineId === p.lines[2]!.id)!;
    expect(slot.enterEndS).toBe(p.lines[2]!.startS);
    expect(slot.anchorFromLineStart).toBe(true);
  });

  it('recusa transição de entrada maior que 0,5 s', () => {
    expect(() => computeCardTimeline(props, { entryS: 0.6 })).toThrow(/entre 0 e 0.5 s/);
  });
});

describe('computeDurationInFrames', () => {
  it('fim da última fala + cartela, arredondado para cima a 30 fps', () => {
    const props = sampleProps();
    const lastEnd = props.lines[props.lines.length - 1]!.endS;
    expect(computeDurationInFrames(props)).toBe(
      Math.ceil((lastEnd + tokens.timing.endcardPaddingS) * 30 - 1e-9),
    );
  });

  it('considera um clipe que termina depois da última fala', () => {
    const props = sampleProps();
    props.character.clips[props.character.clips.length - 1]!.endS = 40;
    expect(computeDurationInFrames(props)).toBe(Math.ceil((40 + tokens.timing.endcardPaddingS) * 30));
  });
});

describe('musicGainAt (ducking)', () => {
  const lines = [{ startS: 2, endS: 4 }];
  it('atenua a música em −14 dB dentro da fala e volta a 1 fora', () => {
    expect(musicGainAt(3, lines)).toBeCloseTo(10 ** (-14 / 20), 6);
    expect(musicGainAt(0.5, lines)).toBe(1);
    expect(musicGainAt(6, lines)).toBe(1);
  });
  it('rampa linear nas bordas', () => {
    const ducked = 10 ** (-14 / 20);
    expect(musicGainAt(4 + tokens.music.duckRampS / 2, lines)).toBeCloseTo(1 - (1 - ducked) / 2, 6);
  });
});
