import React, { useMemo } from 'react';
import { Img } from 'remotion';
import { tokens } from '../core/tokens';
import type { OfferCarouselBrand } from '../core/types';
import { fitSingleLine } from './fit';
import { resolveAssetSrc } from './resolve-src';

/** Abertura e fechamento: logo do cliente (contain) e, sem logo, o nome. */
export const LogoCard: React.FC<{
  brand: OfferCarouselBrand;
  width: number;
  height: number;
  fonts: { family: string; ready: boolean };
}> = ({ brand, width, height, fonts }) => {
  const pad = Math.round(Math.min(width, height) * 0.1);
  const showName = Boolean(brand.name) && !brand.logoUrl;
  const nameBox = { width: width - 2 * pad, height: Math.round(height * 0.16) };
  const nameSize = useMemo(
    () =>
      showName && fonts.ready
        ? fitSingleLine(brand.name!, nameBox, fonts.family, tokens.font.weightBlack, 96)
        : Math.round(nameBox.height * 0.7),
    [showName, fonts.ready, fonts.family, brand.name, nameBox.width, nameBox.height],
  );
  return (
    <div
      style={{
        position: 'absolute',
        inset: pad,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {brand.logoUrl ? (
        <Img
          src={resolveAssetSrc(brand.logoUrl)}
          style={{ width: '100%', height: '80%', objectFit: 'contain' }}
        />
      ) : null}
      {showName ? (
        <div
          style={{
            fontSize: nameSize,
            fontWeight: tokens.font.weightBlack,
            color: tokens.color.cardText,
            whiteSpace: 'nowrap',
            textAlign: 'center',
          }}
        >
          {brand.name}
        </div>
      ) : null}
    </div>
  );
};
