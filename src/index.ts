/**
 * Entrada do BUNDLER do Remotion (`npx remotion render src/index.ts ...` e
 * `bundle({entryPoint})` no worker). Não é a entrada do pacote npm (lib.ts).
 */
import { registerRoot } from 'remotion';
import { RemotionRoot } from './Root';

registerRoot(RemotionRoot);
