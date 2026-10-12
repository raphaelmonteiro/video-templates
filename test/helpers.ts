import sample from '../fixtures/sample-6-offers.json';
import type { OfferCarouselProps } from '../src/core/types';

/** Cópia profunda da fixture de 6 ofertas (1080×1920, personagem à esquerda). */
export function sampleProps(): OfferCarouselProps {
  return structuredClone(sample) as OfferCarouselProps;
}
