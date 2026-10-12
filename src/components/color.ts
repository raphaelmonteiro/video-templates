/** Utilitários de cor (#RRGGBB) para gradiente, contraste do badge e destaque da legenda. */

function parseHex(hex: string): [number, number, number] {
  const value = hex.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(value.slice(i, i + 2), 16)) as [number, number, number];
}

const toHex = (n: number) =>
  Math.round(Math.min(255, Math.max(0, n)))
    .toString(16)
    .padStart(2, '0');

/** Mistura com preto (amount < 0) ou branco (amount > 0), −1..1. */
export function shade(hex: string, amount: number): string {
  const target = amount < 0 ? 0 : 255;
  const a = Math.abs(amount);
  return `#${parseHex(hex)
    .map((c) => toHex(c + (target - c) * a))
    .join('')}`;
}

/** Luminância relativa (WCAG) 0..1. */
export function luminance(hex: string): number {
  const [r, g, b] = parseHex(hex).map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Texto legível sobre um fundo. */
export function textOn(hex: string): string {
  return luminance(hex) > 0.45 ? '#111111' : '#FFFFFF';
}

/** Cor da palavra ativa na legenda: a secundária da marca quando clara o bastante, senão amarelo. */
export function captionHighlight(secondaryColor: string): string {
  return luminance(secondaryColor) >= 0.3 ? secondaryColor : '#FFE14D';
}
