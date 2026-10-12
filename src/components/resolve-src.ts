import { staticFile } from 'remotion';
import { isAbsoluteAssetUrl } from '../core/assets';

/** URL absoluta passa direto; caminho relativo vira `staticFile` (pasta public/ do bundle). */
export function resolveAssetSrc(src: string): string {
  return isAbsoluteAssetUrl(src) ? src : staticFile(src);
}
