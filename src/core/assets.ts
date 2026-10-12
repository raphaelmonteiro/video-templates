/** URL absoluta (http/https/data/blob)? Caso contrário é caminho relativo a `public/`. */
export function isAbsoluteAssetUrl(src: string): boolean {
  return /^(?:https?:|data:|blob:)/i.test(src);
}
