import { offsetRect, PxRect, resolveLayout } from './layout';
import { SafeAreaPx, SUPPORTED_SIZES, supportedSizeOf } from './safe-area';
import { tokens } from './tokens';
import type { OfferCarouselProps } from './types';

/**
 * Validação do layout contra a área segura do tamanho de saída (spec
 * video-composition-render "Tamanhos e áreas seguras"; design D13). Pura:
 * o backend chama antes de enfileirar o render (recusa apontando o elemento)
 * e a composição repete a checagem no `calculateMetadata` (defesa em
 * profundidade: o render falha antes do primeiro quadro).
 *
 * Os cards compartilham a mesma caixa; um problema na caixa gera UM item por
 * card afetado (cada oferta e o card de logo da abertura/fechamento), cada um
 * apontando o card pelo id e pelo nome.
 */

export type LayoutIssueCode =
  | 'UNSUPPORTED_SIZE'
  | 'ELEMENT_OUTSIDE_SAFE_AREA'
  | 'CARD_OVERLAPS_CHARACTER'
  | 'CAPTIONS_OVERLAP_ELEMENT'
  | 'WINDOW_ASPECT_MISMATCH'
  | 'CARD_TOO_SMALL';

export type LayoutElement = 'frame' | 'character_window' | 'card' | 'logo_card' | 'captions';

export type SafeAreaEdge = 'left' | 'top' | 'right' | 'bottom';

export interface LayoutIssue {
  code: LayoutIssueCode;
  element: LayoutElement;
  /** Id da oferta (cards), `logo` (card da abertura/fechamento) ou null. */
  elementId: string | null;
  message: string;
  details: {
    rect?: PxRect;
    safeArea?: SafeAreaPx;
    edges?: SafeAreaEdge[];
    /** Distância (px) de cada borda vazada até a borda do quadro. */
    distanceToFrameEdgePx?: Partial<Record<SafeAreaEdge, number>>;
    other?: LayoutElement;
    [key: string]: unknown;
  };
}

const EDGE_LABEL: Record<SafeAreaEdge, string> = {
  left: 'esquerda',
  top: 'superior',
  right: 'direita',
  bottom: 'inferior',
};

function edgesOutside(rect: PxRect, safe: SafeAreaPx, tol: number): SafeAreaEdge[] {
  const edges: SafeAreaEdge[] = [];
  if (rect.x < safe.left - tol) edges.push('left');
  if (rect.y < safe.top - tol) edges.push('top');
  if (rect.x + rect.width > safe.right + tol) edges.push('right');
  if (rect.y + rect.height > safe.bottom + tol) edges.push('bottom');
  return edges;
}

function intersects(a: PxRect, b: PxRect): boolean {
  return (
    a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height
  );
}

function frameDistances(
  rect: PxRect,
  edges: SafeAreaEdge[],
  width: number,
  height: number,
): Partial<Record<SafeAreaEdge, number>> {
  const out: Partial<Record<SafeAreaEdge, number>> = {};
  for (const e of edges) {
    if (e === 'left') out.left = rect.x;
    if (e === 'top') out.top = rect.y;
    if (e === 'right') out.right = width - (rect.x + rect.width);
    if (e === 'bottom') out.bottom = height - (rect.y + rect.height);
  }
  return out;
}

type ValidateProps = Pick<
  OfferCarouselProps,
  'width' | 'height' | 'character' | 'layoutPreset' | 'captions' | 'cardBox' | 'offers'
>;

/** Cards que ocupam a caixa: cada oferta e o card de logo (abertura/fechamento). */
function cardTargets(props: ValidateProps) {
  return [
    ...props.offers.map((offer, i) => ({
      element: 'card' as const,
      elementId: offer.id,
      label: `card da oferta ${i + 1} ("${offer.name}")`,
    })),
    { element: 'logo_card' as const, elementId: 'logo', label: 'card do logo (abertura/fechamento)' },
  ];
}

/**
 * Problemas do layout; lista vazia = layout aceito. Checagens:
 * tamanho suportado; janela do personagem dentro da área segura e no aspecto
 * do tile (±2%); cada card dentro da área segura, sem sobrepor o personagem e
 * com tamanho mínimo legível; faixa de legendas dentro da área segura e sem
 * sobrepor personagem nem cards (quando ligadas). Os elementos internos do
 * card (texto, preço, badge) ficam dentro do card por construção.
 */
export function validateLayout(props: ValidateProps): LayoutIssue[] {
  const { width, height } = props;
  if (!supportedSizeOf(width, height)) {
    return [
      {
        code: 'UNSUPPORTED_SIZE',
        element: 'frame',
        elementId: null,
        message:
          `Tamanho ${width}×${height} não suportado ` +
          `(aceitos: ${SUPPORTED_SIZES.map((s) => `${s.width}×${s.height}`).join(', ')}).`,
        details: {},
      },
    ];
  }
  const issues: LayoutIssue[] = [];
  const layout = resolveLayout(props);
  const { safe } = layout;
  const tol = tokens.layout.safeAreaTolerancePx;
  const safeLabel = `x ${safe.left}–${safe.right}, y ${safe.top}–${safe.bottom}`;

  // Janela do personagem.
  const charEdges = edgesOutside(layout.character, safe, tol);
  if (charEdges.length > 0) {
    issues.push({
      code: 'ELEMENT_OUTSIDE_SAFE_AREA',
      element: 'character_window',
      elementId: null,
      message:
        `A janela do personagem sai da área segura de ${width}×${height} (${safeLabel}) ` +
        `pela borda ${charEdges.map((e) => EDGE_LABEL[e]).join(', ')}.`,
      details: {
        rect: layout.character,
        safeArea: safe,
        edges: charEdges,
        distanceToFrameEdgePx: frameDistances(layout.character, charEdges, width, height),
      },
    });
  }
  const windowRatio = layout.character.width / layout.character.height;
  const tileRatio = props.character.tileRatio;
  const deviation = Math.abs(windowRatio - tileRatio) / tileRatio;
  if (deviation > tokens.layout.windowAspectTolerance) {
    issues.push({
      code: 'WINDOW_ASPECT_MISMATCH',
      element: 'character_window',
      elementId: null,
      message:
        `A janela do personagem precisa manter o aspecto do tile (${tileRatio.toFixed(3)}, ` +
        `tolerância de 2%); a janela tem ${windowRatio.toFixed(3)}.`,
      details: { windowRatio: Number(windowRatio.toFixed(4)), tileRatio },
    });
  }

  // Cards (todos compartilham a caixa).
  const card = layout.card;
  const cardEdges = edgesOutside(card, safe, tol);
  const overlapsCharacter = intersects(card, layout.character);
  const tooSmall =
    card.width < tokens.layout.cardMinWidth || card.height < tokens.layout.cardMinHeight;
  for (const target of cardTargets(props)) {
    if (cardEdges.length > 0) {
      issues.push({
        code: 'ELEMENT_OUTSIDE_SAFE_AREA',
        element: target.element,
        elementId: target.elementId,
        message:
          `O ${target.label} sai da área segura de ${width}×${height} (${safeLabel}) ` +
          `pela borda ${cardEdges.map((e) => EDGE_LABEL[e]).join(', ')}.`,
        details: {
          rect: card,
          safeArea: safe,
          edges: cardEdges,
          distanceToFrameEdgePx: frameDistances(card, cardEdges, width, height),
        },
      });
    }
    if (overlapsCharacter) {
      issues.push({
        code: 'CARD_OVERLAPS_CHARACTER',
        element: target.element,
        elementId: target.elementId,
        message: `O ${target.label} sobrepõe a janela do personagem.`,
        details: { rect: card, other: 'character_window', otherRect: layout.character },
      });
    }
    if (tooSmall) {
      issues.push({
        code: 'CARD_TOO_SMALL',
        element: target.element,
        elementId: target.elementId,
        message:
          `O ${target.label} tem ${card.width}×${card.height} px; o mínimo legível é ` +
          `${tokens.layout.cardMinWidth}×${tokens.layout.cardMinHeight} px.`,
        details: { rect: card },
      });
    }
  }

  // Legendas.
  if (layout.captions) {
    const capEdges = edgesOutside(layout.captions, safe, tol);
    if (capEdges.length > 0) {
      issues.push({
        code: 'ELEMENT_OUTSIDE_SAFE_AREA',
        element: 'captions',
        elementId: null,
        message: `A faixa de legendas sai da área segura de ${width}×${height} (${safeLabel}).`,
        details: { rect: layout.captions, safeArea: safe, edges: capEdges },
      });
    }
    const others: Array<[LayoutElement, PxRect]> = [
      ['character_window', layout.character],
      ['card', card],
    ];
    for (const [other, rect] of others) {
      if (intersects(layout.captions, rect)) {
        issues.push({
          code: 'CAPTIONS_OVERLAP_ELEMENT',
          element: 'captions',
          elementId: null,
          message:
            other === 'card'
              ? 'A faixa de legendas sobrepõe a caixa dos cards.'
              : 'A faixa de legendas sobrepõe a janela do personagem.',
          details: { rect: layout.captions, other, otherRect: rect },
        });
      }
    }
  }
  return issues;
}

/** Retângulos absolutos dos elementos internos do card (útil para depurar e para a prévia). */
export function cardElementRects(props: ValidateProps) {
  const layout = resolveLayout(props);
  const inner = layout.cardInner;
  return {
    card: layout.card,
    image: offsetRect(inner.image, layout.card),
    badge: offsetRect(inner.badge, layout.card),
    name: offsetRect(inner.name, layout.card),
    originalPrice: offsetRect(inner.originalPrice, layout.card),
    price: offsetRect(inner.price, layout.card),
  };
}
