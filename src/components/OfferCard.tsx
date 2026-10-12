import React, { useMemo } from 'react';
import { Img } from 'remotion';
import type { CardInnerLayout, PxRect } from '../core/layout';
import { formatPrice, formatUnit, priceParts } from '../core/price';
import { tokens } from '../core/tokens';
import type { OfferCarouselOffer } from '../core/types';
import { textOn } from './color';
import { fitComposite, fitNameLines, fitSingleLine } from './fit';
import { resolveAssetSrc } from './resolve-src';

interface Fonts {
  family: string;
  ready: boolean;
}

const abs = (r: PxRect): React.CSSProperties => ({
  position: 'absolute',
  left: r.x,
  top: r.y,
  width: r.width,
  height: r.height,
});

const PriceLine: React.FC<{
  price: string;
  unit: string | null;
  rect: PxRect;
  fonts: Fonts;
  color: string;
}> = ({ price, unit, rect, fonts, color }) => {
  const parts = priceParts(price);
  const { priceCurrencyScale, priceCentsScale, unitScale } = tokens.card;
  const weight = tokens.font.weightBlack;
  const fontSize = useMemo(() => {
    const byHeight = rect.height * 0.92;
    if (!fonts.ready) return Math.floor(byHeight * 0.6);
    const byWidth = fitComposite(
      [
        { text: parts.currency, scale: priceCurrencyScale, marginEm: 0.08 },
        { text: parts.integer, scale: 1 },
        { text: parts.cents, scale: priceCentsScale },
        ...(unit ? [{ text: unit, scale: unitScale, marginEm: 0.08 }] : []),
      ],
      rect.width,
      fonts.family,
      weight,
    );
    return Math.floor(Math.min(byWidth, byHeight));
  }, [fonts.ready, fonts.family, parts.currency, parts.integer, parts.cents, unit, rect.width, rect.height]);

  return (
    <div
      aria-label={formatPrice(price)}
      data-price={formatPrice(price)}
      style={{
        ...abs(rect),
        display: 'flex',
        alignItems: 'flex-end',
        whiteSpace: 'nowrap',
        color,
        fontWeight: weight,
        lineHeight: 1,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start' }}>
        <span
          style={{
            fontSize: fontSize * priceCurrencyScale,
            marginTop: fontSize * 0.1,
            marginRight: fontSize * 0.08,
          }}
        >
          {parts.currency}
        </span>
        <span style={{ fontSize, letterSpacing: '-0.02em' }}>{parts.integer}</span>
        <span style={{ fontSize: fontSize * priceCentsScale, marginTop: fontSize * 0.04 }}>
          {parts.cents}
        </span>
      </div>
      {unit ? (
        <span
          style={{
            fontSize: fontSize * unitScale,
            marginLeft: fontSize * 0.08,
            marginBottom: fontSize * 0.1,
            color: tokens.color.mutedText,
            fontWeight: tokens.font.weightBold,
          }}
        >
          {unit}
        </span>
      ) : null}
    </div>
  );
};

/**
 * Card de oferta: foto inteira (object-fit contain, nunca cortada), nome
 * ajustado com `fitText` (1–2 linhas), preço atual em destaque a partir da
 * string congelada, preço anterior riscado, unidade e badge. Todo texto vem
 * dos dados das props — nada é gerado por modelo de imagem/vídeo.
 */
export const OfferCard: React.FC<{
  offer: OfferCarouselOffer;
  inner: CardInnerLayout;
  fonts: Fonts;
  accentColor: string;
  secondaryColor: string;
}> = ({ offer, inner, fonts, accentColor, secondaryColor }) => {
  const name = useMemo(
    () =>
      fonts.ready
        ? fitNameLines(offer.name, inner.name, fonts.family, tokens.font.weightBold)
        : { lines: [offer.name], fontSize: tokens.card.nameMinFontSize },
    [fonts.ready, fonts.family, offer.name, inner.name],
  );
  const original = offer.originalPrice ? `de ${formatPrice(offer.originalPrice)}` : null;
  const originalSize = useMemo(
    () =>
      original && fonts.ready
        ? fitSingleLine(original, inner.originalPrice, fonts.family, tokens.font.weightBold, 46)
        : Math.floor(inner.originalPrice.height * 0.7),
    [original, fonts.ready, fonts.family, inner.originalPrice],
  );
  const badgePadX = Math.round(inner.badge.height * 0.45);
  const badgeSize = useMemo(
    () =>
      offer.badge && fonts.ready
        ? fitSingleLine(
            offer.badge,
            { width: inner.badge.width - 2 * badgePadX, height: inner.badge.height * 0.56 },
            fonts.family,
            tokens.font.weightBlack,
          )
        : Math.floor(inner.badge.height * 0.5),
    [offer.badge, fonts.ready, fonts.family, inner.badge, badgePadX],
  );

  return (
    <>
      <div
        style={{
          ...abs(inner.image),
          borderRadius: tokens.radius.image,
          background: tokens.color.imageBackground,
          overflow: 'hidden',
        }}
      >
        <Img
          src={resolveAssetSrc(offer.imageUrl)}
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
      </div>
      {offer.badge ? (
        <div style={{ ...abs(inner.badge), display: 'flex', alignItems: 'flex-start' }}>
          <div
            style={{
              height: inner.badge.height,
              maxWidth: inner.badge.width,
              padding: `0 ${badgePadX}px`,
              borderRadius: inner.badge.height / 2,
              background: secondaryColor,
              color: textOn(secondaryColor),
              display: 'flex',
              alignItems: 'center',
              fontSize: badgeSize,
              fontWeight: tokens.font.weightBlack,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              boxShadow: `0 6px 16px ${tokens.color.shadow}`,
              textTransform: 'none',
            }}
          >
            {offer.badge}
          </div>
        </div>
      ) : null}
      <div
        style={{
          ...abs(inner.name),
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          overflow: 'hidden',
          color: tokens.color.cardText,
          fontWeight: tokens.font.weightBold,
          fontSize: name.fontSize,
          lineHeight: tokens.card.nameLineHeight,
        }}
      >
        {name.lines.map((l, i) => (
          <div key={i} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {l}
          </div>
        ))}
      </div>
      {original ? (
        <div
          style={{
            ...abs(inner.originalPrice),
            display: 'flex',
            alignItems: 'center',
            whiteSpace: 'nowrap',
            fontSize: originalSize,
            fontWeight: tokens.font.weightBold,
            color: tokens.color.mutedText,
          }}
        >
          <span>de&nbsp;</span>
          <span
            style={{
              textDecoration: 'line-through',
              textDecorationColor: tokens.color.strike,
              textDecorationThickness: Math.max(3, Math.round(originalSize * 0.1)),
            }}
          >
            {formatPrice(offer.originalPrice!)}
          </span>
        </div>
      ) : null}
      <PriceLine
        price={offer.price}
        unit={formatUnit(offer.unit)}
        rect={inner.price}
        fonts={fonts}
        color={accentColor}
      />
    </>
  );
};
