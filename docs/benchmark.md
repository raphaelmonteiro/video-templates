# Benchmark de render — OfferCarousel 0.1.0

Medido em 12/10/2026 com a fixture `fixtures/sample-6-offers.json` (6 ofertas, 8 falas, 23,94 s de fala,
1080×1920, 30 fps, 764 quadros = 25,47 s com a cartela). Os números são **locais**: a medição que decide a
liberação do F2 é a da VM `encarte-vm` (tarefas 6.2 e 6.5, `docs/evidence/video-formatos/f2-vm.md` na raiz
de `chroma/`).

## Máquina

| Item | Valor |
|------|-------|
| Hardware | Apple M1, 8 núcleos, 16 GB |
| SO | macOS (Darwin 25.6.0) |
| Node | 22.11.0 **x64 sob Rosetta 2** |
| Remotion | 4.0.529 (`@remotion/compositor-darwin-x64`) |
| Navegador | Chrome Headless Shell `mac-x64` baixado por `npx remotion browser ensure` (98 MB) |

Node, compositor e navegador rodam traduzidos pelo Rosetta, o que pesa na CPU e explica a concorrência
quase não escalar. A VM (Linux x86_64 nativo) deve ser bem diferente: refaça a medição lá.

## Resultados

| Medição | Comando | Tempo |
|---------|---------|-------|
| Render completo, concorrência padrão (4x) | `npx remotion render src/index.ts OfferCarousel out/sample.mp4 --props=fixtures/sample-6-offers.json` | **3 min 17 s** de relógio (inclui bundle de ~3 s e abertura do navegador) |
| Benchmark, concorrência 1 | `npx remotion benchmark src/index.ts OfferCarousel --props=fixtures/sample-6-offers.json --runs=1 --concurrencies=1,4` | **3 min 24 s** |
| Benchmark, concorrência 4 | (mesmo comando) | **3 min 02 s** |
| Still do quadro 174 | `npx remotion still src/index.ts OfferCarousel out/still.png --props=fixtures/sample-6-offers.json --frame=174` | 28 s (com bundle) |
| API do worker: `bundle()` a partir de `node_modules/@chroma/video-templates/src/index.ts`, `enableCaching: false` | ensaio da tarefa 6.5 (pacote instalado como dependência git) | 12,2 s |
| API do worker: `selectComposition()` | idem | 3,5 s |
| API do worker: `renderMedia({concurrency: 1})`, 90 quadros, mídia por URL http | idem | 55,8 s (1,61 quadro/s) |
| Gerar as fixtures (`node scripts/make-fixtures.mjs`) | 6 PNG + logo + pôster + 8 clipes MP4 | ~4 min |

Na concorrência 1 o custo é de ~0,27 s por quadro nesta máquina, ou seja, ~4 min para um vídeo de 30 s
(900 quadros). O design (riscos) prevê Lambda ou VM dedicada se o p95 na VM passar de 3 min.

## Saída verificada (ffprobe do próprio Remotion: `npx remotion ffprobe`)

- Vídeo: H.264 High (profile 100), 1080×1920, 30/1 fps, 764 quadros, 25,47 s, `yuvj420p`.
- Áudio: AAC LC, 48 kHz, estéreo, 25,51 s.
- Arquivo: 3,99 MB.
- Loudness (`loudnorm` em modo de medição): integrada −17,1 LUFS, pico real −8,5 dBTP. Trecho com fala
  (2,6–3,6 s): −16,1 LUFS. Trecho só com trilha depois da última fala (24,3–25,3 s): −28,3 LUFS.

O MP4 do `render_remotion` é intermediário: o `finalize` refaz loudness (−14 LUFS / −1 dBTP) e o perfil do
canal (yuv420p, GOP fechado, `+faststart`), então `yuvj420p` aqui não chega ao arquivo entregue.

## Observações para o worker (6.2/6.5)

- **Primeira abertura do navegador**: sob Rosetta, o primeiro lançamento de um binário recém-baixado levou
  ~15 s e estourou o tempo de conexão de 25 s do Remotion (`Timed out after 25000 ms while trying to
  connect to the browser`). Na segunda vez abriu em ~1,3 s. No deploy: `npx remotion browser ensure`, um
  lançamento de aquecimento e `browserExecutable` = `MC_RENDER_BROWSER` em `openBrowser()`.
- **`openBrowser()` sem `browserExecutable`** baixa outro Chrome Headless Shell para o `node_modules/.remotion`
  do projeto que chama. Passe sempre o executável do preflight.
- **Uma composição por bundle**: no 4.0.529 o `CompositionManagerProvider` atualiza a lista de composições
  dentro do updater do `setState`. Com várias `<Composition>` na raiz, o renderer às vezes só enxergava a
  primeira ("Could not find composition"). `src/Root.tsx` registra só `OfferCarousel`.
- **Cache do webpack**: o bundle do worker é feito uma vez por deploy. Use `enableCaching: false` para não
  herdar cache de outra versão em `node_modules/.cache/webpack`.
- **Trilha em loop**: o callback de `volume` recebe o quadro da volta corrente, a menos que
  `loopVolumeCurveBehavior="extend"`. A composição já usa `extend`; sem isso o ducking reiniciava a cada
  volta do arquivo de música, e a trilha ficava −14 dB fora das falas (medido: −42 LUFS em vez de −28).

## Reproduzir

```bash
export PATH=$HOME/.nvm/versions/node/v22.11.0/bin:$PATH
npm ci
npx remotion browser ensure
npm run build && node scripts/make-fixtures.mjs   # só se as fixtures mudarem
npm run render:sample
npx remotion benchmark src/index.ts OfferCarousel --props=fixtures/sample-6-offers.json --runs=1 --concurrencies=1,4
```
