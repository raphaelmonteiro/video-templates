import type { ComponentType, CSSProperties, ReactNode } from 'react';
import type { PxRect } from '../../core/layout';
import type { PieceBlock, PieceDocument, PieceFooterBlock, PieceRect } from '../../core/piece/types';
/**
 * `PieceCanvas` (tarefa 3.2 da change video-peca-configuravel): desenha o
 * descritor da peça em tamanho NATURAL (`width`×`height` px). O editor escala
 * por CSS `transform: scale`; o worker renderiza o MESMO componente na
 * composição `OfferPieceStill` (Remotion). Sem estado e sem dependência do
 * Remotion — só React —, para o frontend importar de
 * `@chroma/video-templates/piece` sem carregar o Remotion.
 *
 * - fundo: cor, degradê (ângulo CSS) ou imagem (fit, blur, escurecimento);
 * - blocos por `zIndex`: logo, textos (fonte da conta ou padrão), rodapé
 *   faixa/pill (endereço · telefone · validade · texto legal), área de
 *   produtos (grade auto/manual ou imagem única com selos) e painel liso do
 *   personagem (com o poster do tile, quando dado);
 * - mídias: URL relativa vira absoluta por `assetBase`; o Remotion passa
 *   `resolveAssetUrl` (staticFile) e `imgComponent` (`<Img>`, que segura o
 *   quadro até a imagem carregar — por isso toda imagem, inclusive o fundo, é
 *   um `<img>`, nunca `background-image`).
 */
export interface PieceImgProps {
    src: string;
    alt?: string;
    style?: CSSProperties;
    draggable?: boolean;
}
export interface PieceCanvasProps {
    document: PieceDocument;
    width: number;
    height: number;
    /** Base das URLs relativas (`/uploads/...`); vazio = como está. */
    assetBase?: string;
    /** Resolve a URL final de cada mídia/fonte (padrão: `absoluteUrl(url, assetBase)`). */
    resolveAssetUrl?: (url: string) => string;
    /** Componente de imagem (padrão `<img>`; o Remotion passa `Img`). */
    imgComponent?: ComponentType<PieceImgProps>;
    /** Poster do tile do personagem (silhueta na prévia / quadro); null = painel vazio. */
    characterPosterUrl?: string | null;
    /** Família padrão dos textos sem fonte da conta. */
    defaultFontFamily?: string;
    /** Envolve cada bloco (o editor coloca as alças de arrasto por aqui). */
    renderBlock?: (block: PieceBlock, content: ReactNode, px: PxRect) => ReactNode;
    /** Chamado no clique num bloco (o editor seleciona). */
    onBlockClick?: (blockId: string) => void;
    /** Bloco destacado (o editor desenha a borda). */
    selectedBlockId?: string | null;
    /** Mostra guias da área segura (editor). */
    showSafeArea?: boolean;
}
export declare const DEFAULT_PIECE_FONT = "'DejaVu Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif";
export declare function absoluteUrl(url: string | null | undefined, base?: string): string | null;
/** Frações → pixels do quadro, sem buracos entre blocos vizinhos. */
export declare function rectToPx(rect: PieceRect, width: number, height: number): PxRect;
/** Área segura da peça (margem de 4% da largura) — guias do editor e aviso de bloco fora. */
export declare function pieceSafeArea(width: number, height: number): PxRect;
export interface PieceBackgroundStyle {
    base: CSSProperties;
    /** Fundo em imagem: `src` e estilo do `<img>` que cobre o quadro; null nos outros modos. */
    image: {
        src: string;
        style: CSSProperties;
    } | null;
    /** 0..1 — camada preta por cima da imagem. */
    darken: number;
}
export declare function backgroundStyle(document: PieceDocument, assetBase?: string, resolveUrl?: (url: string) => string): PieceBackgroundStyle;
/** Linhas do rodapé: contato, validade ("de dd/mm a dd/mm") e texto legal. */
export declare function footerLines(block: PieceFooterBlock): string[];
export interface PriceTagStyle {
    kind: 'badge' | 'plain';
    color: string;
    textColor: string;
}
/** Célula com largura/altura ≥ este valor (o destaque em duas colunas) põe a foto à esquerda dos textos. */
export declare const PRODUCT_CELL_HORIZONTAL_MIN_ASPECT = 1.4;
export declare function PieceCanvas(props: PieceCanvasProps): import("react").JSX.Element;
//# sourceMappingURL=PieceCanvas.d.ts.map