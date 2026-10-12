import React from 'react';
import { AbsoluteFill, Html5Audio, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';

/**
 * Clipe falado PLACEHOLDER (só para fixtures): um mascote vetorial em fundo
 * liso, no aspecto do tile (3:4), com a boca abrindo nas janelas das palavras
 * e o "TTS" sintético muxado — imita o clipe conformado do step `talk` (D7).
 */
export type FixtureTalkClipProps = {
  durationS: number;
  /** Janelas das palavras, em segundos RELATIVOS ao início do clipe. */
  words: { startS: number; endS: number }[];
  audioSrc?: string;
  background: string;
  body: string;
};

export const FixtureTalkClip: React.FC<FixtureTalkClipProps> = ({ words, audioSrc, background, body }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  const word = words.find((w) => t >= w.startS && t <= w.endS);
  const mouth = word ? 0.25 + 0.75 * Math.abs(Math.sin(2 * Math.PI * 4.2 * (t - word.startS))) : 0.06;
  const blink = frame % 96 >= 92 ? 0.12 : 1;
  const bob = Math.sin(t * 2 * Math.PI * 0.6) * 6;
  return (
    <AbsoluteFill style={{ background }}>
      <svg viewBox="0 0 300 400" width={width} height={height}>
        <g transform={`translate(0 ${bob})`}>
          <ellipse cx="150" cy="392" rx="95" ry="10" fill="rgba(0,0,0,0.12)" />
          <rect x="70" y="120" width="160" height="250" rx="70" fill={body} />
          <path d="M150 120 C 150 80, 175 60, 200 55" stroke="#2E7D32" strokeWidth="10" fill="none" strokeLinecap="round" />
          <ellipse cx="205" cy="52" rx="24" ry="12" fill="#43A047" transform="rotate(-20 205 52)" />
          <ellipse cx="120" cy="200" rx="16" ry={18 * blink} fill="#fff" />
          <ellipse cx="180" cy="200" rx="16" ry={18 * blink} fill="#fff" />
          <circle cx="123" cy="203" r={8 * blink} fill="#1b1b1b" />
          <circle cx="183" cy="203" r={8 * blink} fill="#1b1b1b" />
          <ellipse cx="96" cy="245" rx="14" ry="8" fill="rgba(255,255,255,0.35)" />
          <ellipse cx="204" cy="245" rx="14" ry="8" fill="rgba(255,255,255,0.35)" />
          <ellipse cx="150" cy="262" rx="34" ry={4 + 26 * mouth} fill="#5D1A1A" />
          <ellipse cx="150" cy={266 + 18 * mouth} rx={18 * Math.min(1, mouth + 0.2)} ry={6 * mouth} fill="#E57373" />
        </g>
      </svg>
      {audioSrc ? <Html5Audio src={staticFile(audioSrc)} /> : null}
    </AbsoluteFill>
  );
};
