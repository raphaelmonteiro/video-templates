#!/usr/bin/env node
/**
 * Gera as fixtures do pacote de forma determinística:
 * 1. timeline das falas (palavras com tempos sintéticos, como um TTS com
 *    timestamps) e `fixtures/sample-6-offers.json` (props de 6 ofertas, 1080×1920);
 * 2. áudio "TTS" sintético por fala e uma trilha em loop (WAV PCM, sem ffmpeg);
 * 3. com o próprio Remotion (bundle + renderStill/renderMedia, a mesma API do
 *    worker): embalagens PNG, logo PNG, pôster e um clipe MP4 por fala.
 *
 * Uso: npm run build && node scripts/make-fixtures.mjs [--json-only | --skip-clips]
 */
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const core = require(path.join(root, 'dist/cjs/core/index.js'));
const jsonOnly = process.argv.includes('--json-only');
const skipClips = process.argv.includes('--skip-clips');

const WIDTH = 1080;
const HEIGHT = 1920;
const TILE_RATIO = 0.75;
const PRESET = 'character_left';
const GAP_S = 0.2; // MC_TALK_GAP_MS do backend
const SAMPLE_RATE = 24000;

const offers = [
  { id: 'of-arroz', name: 'Arroz Branco Tipo 1 5 kg', price: '24,90', originalPrice: '29,90', badge: 'OFERTA', imageUrl: 'fixtures/products/arroz.png', catalogId: 'cat-101', product: { kind: 'bag', label: 'ARROZ', sub: 'Tipo 1 · 5 kg', color: '#1E88E5', width: 800, height: 1000 } },
  { id: 'of-cafe', name: 'Café Torrado e Moído 500 g', price: '15,49', originalPrice: '18,99', badge: '-18%', imageUrl: 'fixtures/products/cafe.png', catalogId: 'cat-102', product: { kind: 'pack', label: 'CAFÉ', sub: '500 g', color: '#6D4C41', width: 1000, height: 760 } },
  { id: 'of-oleo', name: 'Óleo de Soja 900 ml', price: '7,99', unit: 'un', imageUrl: 'fixtures/products/oleo.png', catalogId: 'cat-103', product: { kind: 'bottle', label: 'ÓLEO', sub: '900 ml', color: '#FDD835', width: 600, height: 1000 } },
  { id: 'of-leite', name: 'Leite Integral 1 L', price: '4,79', originalPrice: '5,49', badge: 'LEVE 6 PAGUE 5', imageUrl: 'fixtures/products/leite.png', catalogId: 'cat-104', product: { kind: 'carton', label: 'LEITE', sub: 'Integral 1 L', color: '#E3F2FD', width: 700, height: 1000 } },
  { id: 'of-picanha', name: 'Picanha Bovina Resfriada', price: '69,90', unit: 'kg', badge: 'AÇOUGUE', imageUrl: 'fixtures/products/picanha.png', catalogId: null, product: { kind: 'meat', label: 'PICANHA', sub: 'kg', color: '#C62828', width: 1000, height: 800 } },
  { id: 'of-refri', name: 'Refrigerante de Cola 2 L', price: '8,99', originalPrice: '10,49', imageUrl: 'fixtures/products/refri.png', catalogId: 'cat-106', product: { kind: 'soda', label: 'COLA', sub: '2 litros', color: '#4E342E', width: 560, height: 1000 } },
];

const script = [
  { id: 'l-abertura', kind: 'opening', text: 'Chegaram as ofertas do Bom Preço!' },
  { id: 'l-arroz', kind: 'offer', offerId: 'of-arroz', text: 'Arroz cinco quilos, vinte e quatro e noventa!' },
  { id: 'l-cafe', kind: 'offer', offerId: 'of-cafe', text: 'Café quinhentos gramas, quinze e quarenta e nove!' },
  { id: 'l-oleo', kind: 'offer', offerId: 'of-oleo', text: 'Óleo de soja, sete e noventa e nove!' },
  { id: 'l-leite', kind: 'offer', offerId: 'of-leite', text: 'Leite integral, quatro e setenta e nove!' },
  { id: 'l-picanha', kind: 'offer', offerId: 'of-picanha', text: 'Picanha, sessenta e nove e noventa o quilo!' },
  { id: 'l-refri', kind: 'offer', offerId: 'of-refri', text: 'Refrigerante dois litros, oito e noventa e nove!' },
  { id: 'l-fechamento', kind: 'closing', text: 'Só até domingo. Te espero lá!' },
];

const r3 = (n) => Number(n.toFixed(3));

/** Tempos sintéticos de um TTS pt-BR (~15 caracteres/s), relativos ao início da fala. */
function synthWords(text) {
  const lead = 0.06;
  const tail = 0.1;
  let t = lead;
  const words = text.split(/\s+/).map((w) => {
    const dur = 0.045 + 0.058 * w.length;
    const word = { text: w, startS: r3(t), endS: r3(t + dur) };
    t += dur + 0.035 + (/[,;]$/.test(w) ? 0.14 : /[.!?]$/.test(w) ? 0.2 : 0);
    return word;
  });
  const last = words[words.length - 1];
  return { words, durationS: r3(last.endS + tail) };
}

// Timeline (mesma regra de buildSpeechTimeline: durações medidas + silêncio entre falas).
let cursor = 0;
const timeline = script.map((line, i) => {
  if (i > 0) cursor = r3(cursor + GAP_S);
  const { words, durationS } = synthWords(line.text);
  const startS = cursor;
  const endS = r3(startS + durationS);
  cursor = endS;
  return { ...line, startS, endS, durationS, relWords: words };
});

const layout = core.presetFractions({ width: WIDTH, height: HEIGHT, tileRatio: TILE_RATIO, preset: PRESET, captions: true });

const props = {
  width: WIDTH,
  height: HEIGHT,
  fps: 30,
  character: {
    clips: timeline.map((l, i) => ({ src: `fixtures/clips/line-${i + 1}.mp4`, startS: l.startS, endS: l.endS, lineId: l.id })),
    window: layout.window,
    tileRatio: TILE_RATIO,
    posterUrl: 'fixtures/character-poster.png',
    backgroundColor: '#FFE082',
  },
  offers: offers.map(({ product, ...o }) => o),
  lines: timeline.map((l) => ({
    id: l.id,
    kind: l.kind,
    ...(l.offerId ? { offerId: l.offerId } : {}),
    startS: l.startS,
    endS: l.endS,
    words: l.relWords.map((w) => ({ text: w.text, startS: r3(l.startS + w.startS), endS: r3(l.startS + w.endS) })),
  })),
  brand: {
    logoUrl: 'fixtures/logo.png',
    name: 'Supermercado Bom Preço',
    primaryColor: '#C62828',
    secondaryColor: '#FFD600',
    fontFamily: 'DejaVu Sans',
  },
  layoutPreset: PRESET,
  captions: true,
  music: { src: 'fixtures/music-loop.wav', volume: 0.35 },
};

const parsed = core.parseOfferCarouselProps(props);
if (!parsed.success) throw new Error(`Fixture inválida: ${JSON.stringify(parsed.issues, null, 2)}`);
const issues = core.validateLayout(props);
if (issues.length) throw new Error(`Layout da fixture inválido: ${JSON.stringify(issues, null, 2)}`);

mkdirSync(path.join(root, 'fixtures'), { recursive: true });
writeFileSync(path.join(root, 'fixtures/sample-6-offers.json'), `${JSON.stringify(props, null, 2)}\n`);
const totalS = timeline[timeline.length - 1].endS;
console.log(`fixtures/sample-6-offers.json: ${timeline.length} falas, ${totalS.toFixed(2)} s de fala, ${core.computeDurationInFrames(props)} quadros`);

// ───────────────────────────── áudio sintético ─────────────────────────────

function writeWav(file, samples) {
  const buf = Buffer.alloc(44 + samples.length * 2);
  buf.write('RIFF', 0);
  buf.writeUInt32LE(36 + samples.length * 2, 4);
  buf.write('WAVE', 8);
  buf.write('fmt ', 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20); // PCM
  buf.writeUInt16LE(1, 22); // mono
  buf.writeUInt32LE(SAMPLE_RATE, 24);
  buf.writeUInt32LE(SAMPLE_RATE * 2, 28);
  buf.writeUInt16LE(2, 32);
  buf.writeUInt16LE(16, 34);
  buf.write('data', 36);
  buf.writeUInt32LE(samples.length * 2, 40);
  samples.forEach((s, i) => buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, s)) * 32767), 44 + i * 2));
  writeFileSync(file, buf);
}

/** "Voz" sintética: harmônicos com envelope por palavra e modulação silábica. */
function speechSamples(durationS, words) {
  const n = Math.round(durationS * SAMPLE_RATE);
  const out = new Float32Array(n);
  words.forEach((w, wi) => {
    const f0 = 150 + 25 * Math.sin(wi * 1.7);
    const a = Math.round(w.startS * SAMPLE_RATE);
    const b = Math.min(n, Math.round(w.endS * SAMPLE_RATE));
    for (let i = a; i < b; i += 1) {
      const t = (i - a) / SAMPLE_RATE;
      const len = (b - a) / SAMPLE_RATE;
      const env = Math.min(1, t / 0.015, (len - t) / 0.03);
      const syl = 0.55 + 0.45 * Math.sin(2 * Math.PI * 4.2 * t);
      let v = 0;
      for (let k = 1; k <= 5; k += 1) v += Math.sin(2 * Math.PI * k * f0 * t) / k;
      out[i] = 0.32 * v * env * syl;
    }
  });
  return out;
}

/** Trilha em loop de 8 s: acordes C · Am · F · G em ondas suaves. */
function musicSamples() {
  const chords = [
    [261.63, 329.63, 392.0],
    [220.0, 261.63, 329.63],
    [174.61, 220.0, 261.63],
    [196.0, 246.94, 293.66],
  ];
  const n = 8 * SAMPLE_RATE;
  const out = new Float32Array(n);
  for (let i = 0; i < n; i += 1) {
    const t = i / SAMPLE_RATE;
    const c = chords[Math.floor(t / 2) % 4];
    const local = t % 2;
    const env = Math.min(1, local / 0.05, (2 - local) / 0.08);
    const beat = 0.75 + 0.25 * Math.cos(2 * Math.PI * 2 * t);
    let v = 0;
    for (const f of c) v += Math.sin(2 * Math.PI * f * t) + 0.3 * Math.sin(2 * Math.PI * 2 * f * t);
    out[i] = 0.12 * v * env * beat;
  }
  return out;
}

const pub = path.join(root, 'public/fixtures');
for (const dir of ['audio', 'clips', 'products']) mkdirSync(path.join(pub, dir), { recursive: true });
timeline.forEach((l, i) => writeWav(path.join(pub, `audio/line-${i + 1}.wav`), speechSamples(l.durationS, l.relWords)));
writeWav(path.join(pub, 'music-loop.wav'), musicSamples());

if (jsonOnly) process.exit(0);

// ───────────────────────────── mídia via Remotion ─────────────────────────────

const { bundle } = require('@remotion/bundler');
const { ensureBrowser, renderMedia, renderStill, selectComposition } = require('@remotion/renderer');

await ensureBrowser();
const serveUrl = await bundle({
  entryPoint: path.join(root, 'fixtures/remotion/index.tsx'),
  publicDir: path.join(root, 'public'),
  enableCaching: false,
});

async function still(id, props, output) {
  const inputProps = { ...props, fixtureId: id };
  const composition = await selectComposition({ serveUrl, id, inputProps });
  await renderStill({ composition, serveUrl, inputProps, output, imageFormat: 'png' });
  console.log(`  ${path.relative(root, output)}`);
}

for (const o of offers) {
  await still('FixtureProduct', o.product, path.join(root, 'public', o.imageUrl));
}
await still('FixtureLogo', {}, path.join(pub, 'logo.png'));
await still('FixtureTalkClip', { durationS: 1, words: [], background: '#FFE082', body: '#E53935' }, path.join(pub, 'character-poster.png'));

for (const [i, l] of skipClips ? [] : timeline.entries()) {
  const inputProps = {
    durationS: l.durationS,
    words: l.relWords.map(({ startS, endS }) => ({ startS, endS })),
    audioSrc: `fixtures/audio/line-${i + 1}.wav`,
    background: '#FFE082',
    body: '#E53935',
    fixtureId: 'FixtureTalkClip',
  };
  const composition = await selectComposition({ serveUrl, id: 'FixtureTalkClip', inputProps });
  const output = path.join(pub, `clips/line-${i + 1}.mp4`);
  await renderMedia({ composition, serveUrl, inputProps, codec: 'h264', outputLocation: output, crf: 28, audioBitrate: '96k' });
  console.log(`  ${path.relative(root, output)} (${composition.durationInFrames} quadros)`);
}
rmSync(serveUrl, { recursive: true, force: true });
