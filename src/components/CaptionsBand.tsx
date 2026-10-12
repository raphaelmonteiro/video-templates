import React, { useMemo } from 'react';
import { activeCaptionPage, activeTokenIndex, CaptionPage } from '../core/captions';
import type { PxRect } from '../core/layout';
import { tokens } from '../core/tokens';
import { fitSingleLine } from './fit';

/**
 * Legenda por palavra (páginas do createTikTokStyleCaptions) dentro da faixa
 * da área segura, com a palavra ativa destacada. A página inteira cabe na
 * faixa: fonte por `fitText` limitada a [min, max]; abaixo do mínimo, quebra em
 * até duas linhas no mínimo. A palavra ativa muda de cor.
 */
export const CaptionsBand: React.FC<{
  pages: CaptionPage[];
  rect: PxRect;
  timeMs: number;
  fonts: { family: string; ready: boolean };
  highlightColor: string;
}> = ({ pages, rect, timeMs, fonts, highlightColor }) => {
  const page = activeCaptionPage(pages, timeMs);
  const { maxFontSize, minFontSize, lineHeight, strokePx } = tokens.captions;
  const padX = Math.round(strokePx * 1.5);
  const fontSize = useMemo(() => {
    if (!page) return maxFontSize;
    if (!fonts.ready) return minFontSize;
    const fitted = fitSingleLine(
      page.text,
      { width: rect.width - 2 * padX, height: rect.height / lineHeight },
      fonts.family,
      tokens.font.weightBlack,
      maxFontSize,
    );
    return Math.max(minFontSize, fitted);
  }, [page, fonts.ready, fonts.family, rect.width, rect.height, padX]);
  if (!page) return null;
  const active = activeTokenIndex(page, timeMs);
  return (
    <div
      style={{
        position: 'absolute',
        left: rect.x,
        top: rect.y,
        width: rect.width,
        height: rect.height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        padding: `0 ${padX}px`,
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          textAlign: 'center',
          fontSize,
          lineHeight,
          fontWeight: tokens.font.weightBlack,
          color: tokens.color.captionText,
          WebkitTextStroke: `${strokePx}px ${tokens.color.captionStroke}`,
          paintOrder: 'stroke fill',
          maxHeight: rect.height,
        }}
      >
        {page.tokens.map((token, i) => {
          // O espaço fica FORA do span destacado: a palavra ativa muda só de cor
          // (sem escala), então a largura medida pelo fitText vale para todo quadro.
          const lead = /^\s*/.exec(token.text)?.[0] ?? '';
          return (
            <React.Fragment key={`${token.fromMs}-${i}`}>
              {lead}
              <span style={{ color: i === active ? highlightColor : undefined }}>
                {token.text.slice(lead.length)}
              </span>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
