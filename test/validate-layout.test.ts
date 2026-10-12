import { describe, expect, it } from 'vitest';
import { presetFractions, presetLayout, resolveLayout } from '../src/core/layout';
import { OFFER_CAROUSEL_LAYOUT_PRESETS } from '../src/core/schema';
import { safeAreaFor, SUPPORTED_SIZES } from '../src/core/safe-area';
import { validateLayout } from '../src/core/validate-layout';
import type { OfferCarouselProps } from '../src/core/types';
import { sampleProps } from './helpers';

function withSize(width: number, height: number, preset = 'character_left' as const): OfferCarouselProps {
  const props = sampleProps();
  const f = presetFractions({ width, height, tileRatio: props.character.tileRatio, preset, captions: true });
  return { ...props, width, height, layoutPreset: preset, character: { ...props.character, window: f.window } };
}

describe('presets', () => {
  for (const size of SUPPORTED_SIZES) {
    for (const preset of OFFER_CAROUSEL_LAYOUT_PRESETS) {
      for (const captions of [true, false]) {
        it(`${preset} em ${size.width}×${size.height} (legendas ${captions}) é válido`, () => {
          const props = sampleProps();
          const f = presetFractions({ width: size.width, height: size.height, tileRatio: 0.75, preset, captions });
          const p: OfferCarouselProps = {
            ...props,
            width: size.width,
            height: size.height,
            layoutPreset: preset,
            captions,
            character: { ...props.character, window: f.window },
          };
          expect(validateLayout(p)).toEqual([]);
          const px = presetLayout({ width: size.width, height: size.height, tileRatio: 0.75, preset, captions });
          // personagem no aspecto do tile e sem sobrepor os cards
          expect(px.character.width / px.character.height).toBeCloseTo(0.75, 2);
          const overlap =
            px.card.x < px.character.x + px.character.width &&
            px.character.x < px.card.x + px.card.width &&
            px.card.y < px.character.y + px.character.height &&
            px.character.y < px.card.y + px.card.height;
          expect(overlap).toBe(false);
        });
      }
    }
  }

  it('personagem à esquerda: faixa esquerda inferior; cards à direita', () => {
    const l = presetLayout({ width: 1080, height: 1920, tileRatio: 0.75, preset: 'character_left', captions: true });
    const safe = safeAreaFor(1080, 1920);
    expect(l.character.x).toBe(safe.left);
    expect(l.character.y + l.character.height).toBe(safe.bottom);
    expect(l.card.x).toBeGreaterThan(l.character.x + l.character.width);
  });
});

describe('validateLayout', () => {
  it('1080×1920: card abaixo de y 1248 → recusa apontando cada card', () => {
    const props = withSize(1080, 1920);
    const layout = resolveLayout(props);
    // desce a caixa dos cards até passar da área segura (y 1248)
    props.cardBox = { x: layout.card.x / 1080, y: 1000 / 1920, w: layout.card.width / 1080, h: 400 / 1920 };
    const issues = validateLayout(props).filter((i) => i.code === 'ELEMENT_OUTSIDE_SAFE_AREA');
    const cardIssues = issues.filter((i) => i.element === 'card');
    expect(cardIssues.map((i) => i.elementId)).toEqual(props.offers.map((o) => o.id));
    expect(cardIssues[0]!.details.edges).toEqual(['bottom']);
    expect(cardIssues[0]!.message).toContain('card da oferta 1 ("Arroz Branco Tipo 1 5 kg")');
    expect(cardIssues[0]!.message).toContain('y 269–1248');
    expect(issues.some((i) => i.element === 'logo_card')).toBe(true);
  });

  it('1080×1350: card a 40 px da borda direita → recusa apontando o card', () => {
    const props = withSize(1080, 1350);
    const layout = resolveLayout(props);
    const right = 1080 - 40;
    props.cardBox = {
      x: layout.card.x / 1080,
      y: layout.card.y / 1350,
      w: (right - layout.card.x) / 1080,
      h: layout.card.height / 1350,
    };
    const issues = validateLayout(props).filter((i) => i.element === 'card');
    expect(issues).toHaveLength(props.offers.length);
    expect(issues[0]!.code).toBe('ELEMENT_OUTSIDE_SAFE_AREA');
    expect(issues[0]!.elementId).toBe(props.offers[0]!.id);
    expect(issues[0]!.details.edges).toEqual(['right']);
    expect(issues[0]!.details.distanceToFrameEdgePx).toEqual({ right: 40 });
    expect(issues[0]!.message).toContain('borda direita');
  });

  it('card a 65 px da borda em 1080×1350 é aceito (limite da área segura)', () => {
    const props = withSize(1080, 1350);
    const layout = resolveLayout(props);
    props.cardBox = {
      x: layout.card.x / 1080,
      y: layout.card.y / 1350,
      w: (1080 - 65 - layout.card.x) / 1080,
      h: layout.card.height / 1350,
    };
    expect(validateLayout(props)).toEqual([]);
  });

  it('card sobre o personagem → CARD_OVERLAPS_CHARACTER', () => {
    const props = withSize(1080, 1920);
    props.cardBox = { ...props.character.window };
    const issues = validateLayout(props);
    expect(issues.some((i) => i.code === 'CARD_OVERLAPS_CHARACTER' && i.elementId === props.offers[0]!.id)).toBe(
      true,
    );
  });

  it('janela do personagem fora da área segura → aponta a janela', () => {
    const props = withSize(1080, 1920);
    props.character.window = { ...props.character.window, y: 0.6 };
    const issue = validateLayout(props).find((i) => i.element === 'character_window');
    expect(issue?.code).toBe('ELEMENT_OUTSIDE_SAFE_AREA');
    expect(issue?.details.edges).toContain('bottom');
  });

  it('janela fora do aspecto do tile → WINDOW_ASPECT_MISMATCH', () => {
    const props = withSize(1080, 1920);
    props.character.window = { ...props.character.window, w: props.character.window.w * 0.8 };
    expect(validateLayout(props).map((i) => i.code)).toContain('WINDOW_ASPECT_MISMATCH');
  });

  it('cards sobre a faixa de legendas → CAPTIONS_OVERLAP_ELEMENT', () => {
    const props = withSize(1080, 1920);
    const layout = resolveLayout(props);
    props.cardBox = { x: layout.card.x / 1080, y: 280 / 1920, w: layout.card.width / 1080, h: 600 / 1920 };
    expect(validateLayout(props).map((i) => i.code)).toContain('CAPTIONS_OVERLAP_ELEMENT');
  });

  it('card pequeno demais → CARD_TOO_SMALL', () => {
    const props = withSize(1080, 1920);
    props.cardBox = { x: 0.5, y: 0.3, w: 0.2, h: 0.1 };
    expect(validateLayout(props).map((i) => i.code)).toContain('CARD_TOO_SMALL');
  });

  it('tamanho fora dos quatro suportados → UNSUPPORTED_SIZE', () => {
    const props = { ...sampleProps(), width: 720, height: 1280 };
    expect(validateLayout(props)).toEqual([expect.objectContaining({ code: 'UNSUPPORTED_SIZE', element: 'frame' })]);
  });
});
