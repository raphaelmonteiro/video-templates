import React from 'react';
import { Composition } from 'remotion';
import sample from '../fixtures/sample-6-offers.json';
import { calculateOfferCarouselMetadata } from './components/metadata';
import { OfferCarousel } from './components/OfferCarousel';
import { offerCarouselPropsSchema } from './core/schema';
import { OFFER_CAROUSEL_FPS } from './core/tokens';
import type { OfferCarouselProps } from './core/types';
import { OFFER_CAROUSEL_COMPOSITION_ID } from './core/version';

/** Props de exemplo (fixture de 6 ofertas) — só valem no Studio; o worker sempre passa inputProps. */
const defaultProps = sample as OfferCarouselProps;

export const RemotionRoot: React.FC = () => (
  <Composition
    id={OFFER_CAROUSEL_COMPOSITION_ID}
    component={OfferCarousel}
    schema={offerCarouselPropsSchema}
    defaultProps={defaultProps}
    calculateMetadata={calculateOfferCarouselMetadata}
    fps={OFFER_CAROUSEL_FPS}
    width={1080}
    height={1920}
    durationInFrames={OFFER_CAROUSEL_FPS * 30}
  />
);
