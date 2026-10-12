import { loadFont } from '@remotion/fonts';
import { useEffect, useState } from 'react';
import { continueRender, delayRender } from 'remotion';
import { FALLBACK_FONT_STACK } from '../core/tokens';
import type { OfferCarouselBrand } from '../core/types';
import { resolveAssetSrc } from './resolve-src';

/** "Nunito Sans" → `"Nunito Sans", <fallback>`; uma pilha já com vírgulas ganha só o fallback. */
export function fontStackFor(fontFamily: string): string {
  const trimmed = fontFamily.trim();
  const primary =
    trimmed.includes(',') || /^["']/.test(trimmed) || !/\s/.test(trimmed)
      ? trimmed
      : `"${trimmed}"`;
  return `${primary}, ${FALLBACK_FONT_STACK}`;
}

const loaded = new Map<string, Promise<void>>();

/**
 * Carrega `brand.fontUrl` (quando houver) antes de qualquer medição de texto:
 * devolve false até a fonte estar em `document.fonts`, e segura o render com
 * `delayRender` até o React reprocessar com a fonte pronta — assim o `fitText`
 * nunca mede com a fonte de fallback.
 */
export function useBrandFontReady(brand: Pick<OfferCarouselBrand, 'fontFamily' | 'fontUrl'>): boolean {
  const key = brand.fontUrl ? `${brand.fontFamily}|${brand.fontUrl}` : null;
  const [ready, setReady] = useState(key === null);
  const [handle] = useState(() => (key ? delayRender(`Fonte da marca: ${brand.fontFamily}`) : null));

  useEffect(() => {
    if (!key || !brand.fontUrl) return;
    let promise = loaded.get(key);
    if (!promise) {
      promise = loadFont({ family: brand.fontFamily.trim(), url: resolveAssetSrc(brand.fontUrl) });
      loaded.set(key, promise);
    }
    let cancelled = false;
    promise.then(
      () => {
        if (!cancelled) setReady(true);
      },
      (err: unknown) => {
        // Fonte indisponível: segue com o fallback (determinístico) em vez de travar o render.
        console.warn(`Falha ao carregar a fonte ${brand.fontFamily}:`, err);
        if (!cancelled) setReady(true);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [key, brand.fontFamily, brand.fontUrl]);

  useEffect(() => {
    if (ready && handle !== null) continueRender(handle);
  }, [ready, handle]);

  return ready;
}
