import type { CalculateMetadataFunction } from 'remotion';
import type { OfferCarouselProps } from '../core/types';
/**
 * `calculateMetadata` da composição: tamanho e fps das props e duração = fim
 * da última fala + cartela. Recusa o render quando o layout viola a área
 * segura (o backend valida antes; isto é a defesa em profundidade).
 */
export declare const calculateOfferCarouselMetadata: CalculateMetadataFunction<OfferCarouselProps>;
//# sourceMappingURL=metadata.d.ts.map