import React from 'react';
import { Composition, getInputProps, Still } from 'remotion';
import pieceSample from '../fixtures/piece-9x16.json';
import sample from '../fixtures/sample-6-offers.json';
import { calculateOfferCarouselMetadata } from './components/metadata';
import { OfferCarousel } from './components/OfferCarousel';
import { calculateOfferPieceStillMetadata, OfferPieceStill } from './components/OfferPieceStill';
import { offerPieceStillPropsSchema } from './core/piece/schema';
import type { OfferPieceStillProps } from './core/piece/types';
import { offerCarouselPropsSchema } from './core/schema';
import { OFFER_CAROUSEL_FPS } from './core/tokens';
import type { OfferCarouselProps } from './core/types';
import {
  compositionIdForInputProps,
  OFFER_CAROUSEL_COMPOSITION_ID,
  OFFER_PIECE_STILL_COMPOSITION_ID,
} from './core/version';

/** Props de exemplo (fixtures) — só valem no Studio; o worker sempre passa inputProps. */
const carouselDefaults = sample as OfferCarouselProps;
const pieceDefaults = pieceSample as unknown as OfferPieceStillProps;

/**
 * Uma composição por bundle no render (docs/benchmark.md): no 4.0.529, com
 * várias <Composition> na raiz o renderer pode consultar a lista antes de todas
 * registrarem. As input props do worker dizem qual composição ele quer
 * (`compositionIdForInputProps`); sem input props (Studio) as duas aparecem.
 */
const requested = compositionIdForInputProps(getInputProps() as Record<string, unknown>);
const show = (id: string) => requested === null || requested === id;

export const RemotionRoot: React.FC = () => (
  <>
    {show(OFFER_CAROUSEL_COMPOSITION_ID) && (
      <Composition
        id={OFFER_CAROUSEL_COMPOSITION_ID}
        component={OfferCarousel}
        schema={offerCarouselPropsSchema}
        defaultProps={carouselDefaults}
        calculateMetadata={calculateOfferCarouselMetadata}
        fps={OFFER_CAROUSEL_FPS}
        width={1080}
        height={1920}
        durationInFrames={OFFER_CAROUSEL_FPS * 30}
      />
    )}
    {show(OFFER_PIECE_STILL_COMPOSITION_ID) && (
      <Still
        id={OFFER_PIECE_STILL_COMPOSITION_ID}
        component={OfferPieceStill}
        schema={offerPieceStillPropsSchema}
        defaultProps={pieceDefaults}
        calculateMetadata={calculateOfferPieceStillMetadata}
        width={1080}
        height={1920}
      />
    )}
  </>
);
