import React from 'react';
import { Img, interpolate, OffthreadVideo, Sequence, useCurrentFrame } from 'remotion';
import type { PxRect } from '../core/layout';
import { secondsToFrame } from '../core/timing';
import { tokens } from '../core/tokens';
import type { OfferCarouselCharacter } from '../core/types';
import { resolveAssetSrc } from './resolve-src';

const ClipView: React.FC<{ src: string; durationInFrames: number; fade: boolean }> = ({
  src,
  durationInFrames,
  fade,
}) => {
  const frame = useCurrentFrame();
  const f = tokens.timing.clipFadeFrames;
  const opacity =
    fade && durationInFrames > 2 * f
      ? interpolate(frame, [0, f, durationInFrames - f, durationInFrames], [0, 1, 1, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        })
      : 1;
  return (
    <OffthreadVideo
      src={resolveAssetSrc(src)}
      style={{ width: '100%', height: '100%', objectFit: 'cover', opacity }}
    />
  );
};

/**
 * Personagem numa região FIXA do quadro, no aspecto do tile, durante o vídeo
 * inteiro. Cada fala tem um clipe conformado ao seu áudio (D7) colocado no seu
 * instante com `<Sequence>`; o áudio da fala vem do próprio clipe (TTS
 * muxado). Entre falas fica o pôster (tile de fala parado), com fade curto do
 * clipe sobre ele para suavizar o corte.
 */
export const CharacterWindow: React.FC<{
  character: OfferCarouselCharacter;
  rect: PxRect;
  fps: number;
  fallbackColor: string;
}> = ({ character, rect, fps, fallbackColor }) => {
  const hasPoster = Boolean(character.posterUrl);
  return (
    <div
      style={{
        position: 'absolute',
        left: rect.x,
        top: rect.y,
        width: rect.width,
        height: rect.height,
        borderRadius: tokens.radius.window,
        overflow: 'hidden',
        background: character.backgroundColor ?? fallbackColor,
        boxShadow: `0 18px 48px ${tokens.color.shadow}`,
      }}
    >
      {character.posterUrl ? (
        <Img
          src={resolveAssetSrc(character.posterUrl)}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : null}
      {character.clips.map((clip, i) => {
        const from = secondsToFrame(clip.startS, fps);
        const durationInFrames = Math.max(1, secondsToFrame(clip.endS, fps) - from);
        return (
          <Sequence
            key={`${clip.lineId ?? i}-${clip.src}`}
            from={from}
            durationInFrames={durationInFrames}
            name={`Fala ${clip.lineId ?? i + 1}`}
          >
            <ClipView src={clip.src} durationInFrames={durationInFrames} fade={hasPoster} />
          </Sequence>
        );
      })}
    </div>
  );
};
