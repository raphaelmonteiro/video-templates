import { describe, expect, it } from 'vitest';
import { offerCarouselPropsSchema, parseOfferCarouselProps } from '../src/core/schema';
import { sampleProps } from './helpers';

const messages = (input: unknown) => {
  const result = parseOfferCarouselProps(input);
  return result.success ? [] : result.issues.map((i) => `${i.path}: ${i.message}`);
};

describe('offerCarouselPropsSchema', () => {
  it('aceita a fixture de 6 ofertas', () => {
    expect(offerCarouselPropsSchema.safeParse(sampleProps()).success).toBe(true);
  });

  it('recusa 2 ofertas informando o mínimo de 3', () => {
    const props = sampleProps();
    props.offers = props.offers.slice(0, 2);
    props.lines = [props.lines[0]!, ...props.lines.slice(1, 3), props.lines[props.lines.length - 1]!];
    expect(messages(props)).toContain('offers: Mínimo de 3 ofertas');
  });

  it('recusa 7 ofertas informando o máximo de 6 e o limite de 30 s', () => {
    const props = sampleProps();
    props.offers.push({ ...props.offers[0]!, id: 'of-extra' });
    expect(messages(props)).toContain('offers: Máximo de 6 ofertas (o vídeo tem até 30 s)');
  });

  it('aceita 3 ofertas (limite inferior)', () => {
    const props = sampleProps();
    props.offers = props.offers.slice(0, 3);
    props.lines = [...props.lines.slice(0, 4), props.lines[props.lines.length - 1]!];
    expect(messages(props)).toEqual([]);
  });

  it.each([
    ['offers.0.imageUrl', (p: any) => delete p.offers[0].imageUrl],
    ['offers.0.price', (p: any) => delete p.offers[0].price],
    ['offers.0.name', (p: any) => delete p.offers[0].name],
    ['brand.primaryColor', (p: any) => delete p.brand.primaryColor],
    ['brand.fontFamily', (p: any) => delete p.brand.fontFamily],
    ['character.window', (p: any) => delete p.character.window],
    ['character.tileRatio', (p: any) => delete p.character.tileRatio],
    ['layoutPreset', (p: any) => delete p.layoutPreset],
    ['captions', (p: any) => delete p.captions],
    ['lines.1.words', (p: any) => delete p.lines[1].words],
  ])('exige o campo %s', (path, mutate) => {
    const props = sampleProps();
    mutate(props);
    expect(messages(props).some((m) => m.startsWith(`${path}:`))).toBe(true);
  });

  it('não exige preço anterior, unidade, badge, logo nem música', () => {
    const props = sampleProps();
    for (const o of props.offers) {
      delete o.originalPrice;
      delete o.unit;
      delete o.badge;
    }
    delete props.brand.logoUrl;
    delete props.music;
    expect(messages(props)).toEqual([]);
  });

  it.each(['24.90', 'R$ 24,90', '24,9', '24', 'vinte'])('recusa o preço "%s"', (price) => {
    const props = sampleProps();
    props.offers[0]!.price = price;
    expect(messages(props)).toContain('offers.0.price: Preço no formato pt-BR "24,90" (sem "R$")');
  });

  it('aceita preço com milhar', () => {
    const props = sampleProps();
    props.offers[0]!.price = '1.299,00';
    expect(messages(props)).toEqual([]);
  });

  it('recusa mídia com caminho absoluto de disco ou /uploads relativo à origem', () => {
    const props = sampleProps();
    props.offers[0]!.imageUrl = '/uploads/products/arroz.png';
    props.character.clips[0]!.src = 'file:///tmp/clip.mp4';
    const m = messages(props);
    expect(m.some((x) => x.startsWith('offers.0.imageUrl:'))).toBe(true);
    expect(m.some((x) => x.startsWith('character.clips.0.src:'))).toBe(true);
  });

  it('aceita URL http(s) e data:', () => {
    const props = sampleProps();
    props.offers[0]!.imageUrl = 'http://127.0.0.1:3001/uploads/products/arroz.png';
    props.brand.logoUrl = 'data:image/png;base64,AAAA';
    expect(messages(props)).toEqual([]);
  });

  it('exige fps 30', () => {
    const props = sampleProps() as any;
    props.fps = 25;
    expect(messages(props).some((x) => x.startsWith('fps:'))).toBe(true);
  });

  it('exige um dos quatro tamanhos (1080×1920, 1080×1350, 1080×1080, 1920×1080)', () => {
    const props = sampleProps() as any;
    props.width = 720;
    props.height = 1280;
    expect(messages(props).some((x) => x.startsWith('width:') && x.includes('720×1280'))).toBe(true);
  });

  it('exige abertura primeiro, fechamento por último e uma fala por oferta na ordem', () => {
    const noClosing = sampleProps();
    noClosing.lines.pop();
    expect(messages(noClosing).some((m) => m.includes('A última fala é o fechamento'))).toBe(true);

    const swapped = sampleProps();
    const [a, b] = [swapped.lines[1]!, swapped.lines[2]!];
    [a.offerId, b.offerId] = [b.offerId, a.offerId];
    expect(messages(swapped).some((m) => m.includes('uma fala por oferta, na ordem'))).toBe(true);

    const noOfferId = sampleProps();
    delete noOfferId.lines[1]!.offerId;
    expect(messages(noOfferId)).toContain('lines.1.offerId: Fala de oferta sem offerId');
  });

  it('exige palavras dentro da janela da fala (tempos absolutos)', () => {
    const props = sampleProps();
    // palavras relativas ao início da fala (erro comum): caem antes da fala 3
    const line = props.lines[2]!;
    line.words = line.words.map((w) => ({ ...w, startS: w.startS - line.startS, endS: w.endS - line.startS }));
    expect(messages(props).some((m) => m.startsWith('lines.2.words.0:'))).toBe(true);
  });

  it('recusa falas sobrepostas', () => {
    const props = sampleProps();
    props.lines[3]!.startS = props.lines[2]!.startS + 0.5;
    expect(messages(props).some((m) => m.startsWith('lines.3.startS:'))).toBe(true);
  });

  it('recusa ofertas repetidas', () => {
    const props = sampleProps();
    props.offers[1]!.id = props.offers[0]!.id;
    expect(messages(props)).toContain(`offers: Oferta repetida: "${props.offers[0]!.id}"`);
  });
});
