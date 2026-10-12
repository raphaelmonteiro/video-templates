/** Utilitários de cor (#RRGGBB) para gradiente, contraste do badge e destaque da legenda. */
/** Mistura com preto (amount < 0) ou branco (amount > 0), −1..1. */
export declare function shade(hex: string, amount: number): string;
/** Luminância relativa (WCAG) 0..1. */
export declare function luminance(hex: string): number;
/** Texto legível sobre um fundo. */
export declare function textOn(hex: string): string;
/** Cor da palavra ativa na legenda: a secundária da marca quando clara o bastante, senão amarelo. */
export declare function captionHighlight(secondaryColor: string): string;
//# sourceMappingURL=color.d.ts.map