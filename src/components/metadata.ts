import type { CalculateMetadataFunction } from 'remotion';
import { computeDurationInFrames } from '../core/timing';
import type { OfferCarouselProps } from '../core/types';
import { validateLayout } from '../core/validate-layout';

/**
 * `calculateMetadata` da composição: tamanho e fps das props e duração = fim
 * da última fala + cartela. Recusa o render quando o layout viola a área
 * segura (o backend valida antes; isto é a defesa em profundidade).
 */
export const calculateOfferCarouselMetadata: CalculateMetadataFunction<OfferCarouselProps> = ({
  props,
}) => {
  const issues = validateLayout(props);
  if (issues.length > 0) {
    throw new Error(
      `Layout inválido para ${props.width}×${props.height}: ` +
        issues.map((i) => `[${i.code}${i.elementId ? `:${i.elementId}` : ''}] ${i.message}`).join(' | '),
    );
  }
  return {
    durationInFrames: computeDurationInFrames(props),
    fps: props.fps,
    width: props.width,
    height: props.height,
  };
};
