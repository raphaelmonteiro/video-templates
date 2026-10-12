/**
 * Núcleo PURO do pacote (sem React): schema, tipos, tokens, versão e helpers
 * de layout, validação, timing, preço e legendas. É o que o backend importa
 * (`@chroma/video-templates/core`) para validar props antes do render.
 */
export * from './version';
export * from './tokens';
export * from './types';
export * from './safe-area';
export * from './price';
export * from './schema';
export * from './layout';
export * from './validate-layout';
export * from './timing';
export * from './captions';
export * from './assets';
