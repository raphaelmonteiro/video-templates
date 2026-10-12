import { describe, expect, it } from 'vitest';
import { formatPrice, formatUnit, isValidPrice, priceParts } from '../src/core/price';

describe('formatPrice', () => {
  it.each([
    ['24,90', 'R$ 24,90'],
    ['8,99', 'R$ 8,99'],
    ['10,49', 'R$ 10,49'],
    ['0,99', 'R$ 0,99'],
    ['1.299,00', 'R$ 1.299,00'],
    ['R$ 24,90', 'R$ 24,90'],
    ['  r$15,49 ', 'R$ 15,49'],
  ])('"%s" → "%s" (exato, da string)', (input, expected) => {
    expect(formatPrice(input)).toBe(expected);
  });

  it('nunca reformata por aritmética (sem ponto decimal, sem casas extras)', () => {
    for (const p of ['8,99', '10,49', '0,10', '19,90', '33,33']) {
      const out = formatPrice(p);
      expect(out).toBe(`R$ ${p}`);
      expect(out).not.toMatch(/\d\.\d{2}$/);
    }
  });

  it.each(['8.99', '8,9', '8', '', 'R$', '8,999', '1299,0'])('recusa "%s"', (input) => {
    expect(isValidPrice(input)).toBe(false);
    expect(() => formatPrice(input)).toThrow(/Preço inválido/);
  });
});

describe('priceParts', () => {
  it.each(['24,90', '8,99', '1.299,00'])('as partes recompõem o preço formatado (%s)', (price) => {
    const p = priceParts(price);
    expect(`${p.currency} ${p.integer}${p.cents}`).toBe(formatPrice(price));
  });

  it('separa inteiro e centavos', () => {
    expect(priceParts('24,90')).toEqual({ currency: 'R$', integer: '24', cents: ',90' });
    expect(priceParts('1.299,00')).toEqual({ currency: 'R$', integer: '1.299', cents: ',00' });
  });
});

describe('formatUnit', () => {
  it('unidades curtas viram sufixo; o resto aparece como veio', () => {
    expect(formatUnit('kg')).toBe('/kg');
    expect(formatUnit('un')).toBe('/un');
    expect(formatUnit('/kg')).toBe('/kg');
    expect(formatUnit('cada')).toBe('cada');
    expect(formatUnit('pct 500 g')).toBe('pct 500 g');
    expect(formatUnit('')).toBeNull();
    expect(formatUnit(undefined)).toBeNull();
  });
});
