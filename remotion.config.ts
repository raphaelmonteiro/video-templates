/**
 * Configuração da CLI do Remotion (studio/render/still/benchmark locais).
 * O worker do backend NÃO lê este arquivo: ele chama `bundle()` +
 * `renderMedia()` com as opções explícitas (ver docs/benchmark.md).
 */
import { Config } from '@remotion/cli/config';

Config.setEntryPoint('./src/index.ts');
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(90);
Config.setOverwriteOutput(true);
Config.setCodec('h264');
Config.setPixelFormat('yuv420p');
