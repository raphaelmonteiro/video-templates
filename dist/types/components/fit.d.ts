export interface FittedLines {
    lines: string[];
    fontSize: number;
}
/**
 * Nome do produto em 1 ou 2 linhas com `fitText`: testa a linha única e cada
 * quebra possível entre palavras, mede cada linha e escolhe a opção com a
 * MAIOR fonte que cabe na largura e na altura da caixa (empate → menos linhas).
 */
export declare function fitNameLines(name: string, box: {
    width: number;
    height: number;
}, fontFamily: string, fontWeight: number): FittedLines;
/** Uma linha que cabe na largura e na altura (com teto opcional). */
export declare function fitSingleLine(text: string, box: {
    width: number;
    height: number;
}, fontFamily: string, fontWeight: number, maxFontSize?: number): number;
export interface CompositePart {
    text: string;
    /** Tamanho relativo à fonte base. */
    scale: number;
    /** Margens horizontais em "em" da fonte base. */
    marginEm?: number;
}
/**
 * Fonte base para uma linha composta de partes com tamanhos diferentes (preço
 * "R$" + inteiro + ",90" + unidade), medindo cada parte no tamanho em que
 * será desenhada — a generalização do `fitText` para tipografia mista.
 */
export declare function fitComposite(parts: CompositePart[], withinWidth: number, fontFamily: string, fontWeight: number): number;
//# sourceMappingURL=fit.d.ts.map