import React from 'react';
import { AbsoluteFill } from 'remotion';
import type { OfferCarouselBrand } from '../core/types';
import { shade } from './color';

/**
 * Fundo em gradiente da marca (quadro inteiro; o fundo não é validado contra a
 * área segura). Formas estáticas: nada depende do quadro, então o fundo é
 * idêntico em qualquer instante.
 */
export const Background: React.FC<{ brand: OfferCarouselBrand; width: number; height: number }> = ({
  brand,
  width,
  height,
}) => {
  const big = Math.max(width, height);
  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(160deg, ${shade(brand.primaryColor, 0.08)} 0%, ${
          brand.primaryColor
        } 45%, ${shade(brand.primaryColor, -0.38)} 100%)`,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          width: big * 0.75,
          height: big * 0.75,
          right: -big * 0.28,
          top: -big * 0.22,
          borderRadius: '50%',
          background: brand.secondaryColor,
          opacity: 0.22,
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: big * 0.55,
          height: big * 0.55,
          left: -big * 0.25,
          bottom: -big * 0.18,
          borderRadius: '50%',
          border: `${Math.round(big * 0.03)}px solid ${brand.secondaryColor}`,
          opacity: 0.18,
        }}
      />
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(ellipse at 50% 35%, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0) 60%)',
        }}
      />
    </AbsoluteFill>
  );
};
