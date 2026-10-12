import { describe, expect, it } from 'vitest';
import {
  activeCaptionPage,
  activeTokenIndex,
  buildCaptionPages,
  CAPTIONS_ALIGNMENT_MISSING,
  captionsReadiness,
  lineToCaptions,
  shouldRenderCaptions,
} from '../src/core/captions';
import { sampleProps } from './helpers';

describe('captionsReadiness', () => {
  it('legendas desligadas → ok (nada a bloquear)', () => {
    const props = { ...sampleProps(), captions: false };
    props.lines[1]!.words = [];
    expect(captionsReadiness(props)).toMatchObject({ ok: true, code: null, captionsEnabled: false });
    expect(shouldRenderCaptions(props)).toBe(false);
  });

  it('legendas ligadas e todas as falas com palavras → ok', () => {
    const props = sampleProps();
    expect(captionsReadiness(props)).toMatchObject({ ok: true, code: null, captionsEnabled: true });
    expect(shouldRenderCaptions(props)).toBe(true);
  });

  it('legendas ligadas e alguma fala sem palavras → CAPTIONS_ALIGNMENT_MISSING (o render omite)', () => {
    const props = sampleProps();
    props.lines[1]!.words = [];
    props.lines[4]!.words = [];
    const r = captionsReadiness(props);
    expect(r.ok).toBe(false);
    expect(r.code).toBe(CAPTIONS_ALIGNMENT_MISSING);
    expect(r.missingLineIds).toEqual([props.lines[1]!.id, props.lines[4]!.id]);
    expect(shouldRenderCaptions(props)).toBe(false);
  });
});

describe('legendas por palavra', () => {
  const props = sampleProps();
  const pages = buildCaptionPages(props.lines);

  it('converte palavras em Caption[] do @remotion/captions (ms absolutos, espaço inicial)', () => {
    const line = props.lines[1]!;
    const caps = lineToCaptions(line);
    expect(caps[0]).toMatchObject({ text: line.words[0]!.text, startMs: Math.round(line.words[0]!.startS * 1000) });
    expect(caps[1]!.text).toBe(` ${line.words[1]!.text}`);
    expect(caps[caps.length - 1]!.pageBreakAfter).toBe(true);
  });

  it('cobre todas as palavras, em ordem, e nenhuma página atravessa duas falas', () => {
    const allWords = props.lines.flatMap((l) => l.words.map((w) => w.text));
    expect(pages.flatMap((p) => p.tokens.map((t) => t.text.trim()))).toEqual(allWords);
    for (const page of pages) {
      const line = props.lines.find((l) => l.id === page.lineId)!;
      for (const t of page.tokens) {
        expect(t.fromMs).toBeGreaterThanOrEqual(Math.round(line.startS * 1000) - 1);
        expect(t.toMs).toBeLessThanOrEqual(Math.round(line.endS * 1000) + 1);
      }
    }
  });

  it('cada palavra aparece no seu instante e só uma página fica na tela', () => {
    for (let i = 0; i < pages.length - 1; i += 1) {
      expect(pages[i]!.endMs).toBeLessThanOrEqual(pages[i + 1]!.startMs);
    }
    const word = props.lines[2]!.words[1]!;
    const tMs = Math.round(word.startS * 1000) + 10;
    const page = activeCaptionPage(pages, tMs)!;
    expect(page.lineId).toBe(props.lines[2]!.id);
    expect(page.tokens[activeTokenIndex(page, tMs)]!.text.trim()).toBe(word.text);
  });

  it('nada na tela antes da primeira palavra', () => {
    expect(activeCaptionPage(pages, 0)).toBeNull();
  });
});
