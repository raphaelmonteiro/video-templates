import { describe, expect, it } from 'vitest';
import pkg from '../package.json';
import {
  COMPOSITION_VERSION,
  OFFER_CAROUSEL_COMPOSITION_ID,
  OFFER_PIECE_STILL_COMPOSITION_ID,
} from '../src/core/version';

describe('COMPOSITION_VERSION', () => {
  it('é semver e igual a package.json#compositionVersion', () => {
    expect(COMPOSITION_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
    expect(COMPOSITION_VERSION).toBe(pkg.compositionVersion);
  });
  it('ids das composições', () => {
    expect(OFFER_CAROUSEL_COMPOSITION_ID).toBe('OfferCarousel');
    expect(OFFER_PIECE_STILL_COMPOSITION_ID).toBe('OfferPieceStill');
  });
});
