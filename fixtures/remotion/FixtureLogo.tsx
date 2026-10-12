import React from 'react';
import { AbsoluteFill } from 'remotion';

/** Logo PLACEHOLDER de cliente (fundo transparente) — só para fixtures. */
export const FixtureLogo: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: 'transparent' }}>
    <svg viewBox="0 0 900 450" width={900} height={450}>
      <rect x="20" y="40" width="860" height="370" rx="185" fill="#C62828" />
      <rect x="44" y="64" width="812" height="322" rx="161" fill="none" stroke="#FFD600" strokeWidth="14" />
      <circle cx="180" cy="225" r="92" fill="#FFD600" />
      <path d="M130 200 h100 l-14 60 h-72 z" fill="#C62828" />
      <circle cx="150" cy="282" r="12" fill="#C62828" />
      <circle cx="205" cy="282" r="12" fill="#C62828" />
      <text x="555" y="235" textAnchor="middle" textLength="560" lengthAdjust="spacingAndGlyphs" fontSize="112" fontWeight="900" fill="#FFFFFF" fontFamily="Arial Black, Arial, sans-serif">
        BOM PREÇO
      </text>
      <text x="555" y="315" textAnchor="middle" textLength="500" lengthAdjust="spacingAndGlyphs" fontSize="52" fontWeight="700" fill="#FFD600" fontFamily="Arial, sans-serif">
        SUPERMERCADO
      </text>
    </svg>
  </AbsoluteFill>
);
