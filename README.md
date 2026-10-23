# @chroma/video-templates

Composições Remotion do Chroma e o código que o editor (frontend) e o worker
(backend) precisam COMPARTILHAR para que a prévia seja igual ao vídeo:

| Composição | Formato | Entrada do worker | O que desenha |
|------------|---------|-------------------|---------------|
| `OfferCarousel` | F2 "ofertas em sequência" | `renderMedia` | cards animados sincronizados com a fala, personagem na janela, legendas, trilha |
| `OfferPieceStill` | "peça de ofertas" (`offer_piece`) | `renderStill` (1 quadro PNG) | a peça montada no editor (`PieceCanvas`), que vira a arte de fundo do `compose_ffmpeg` |

## Entradas do pacote

| Importar | Conteúdo | Depende de |
|----------|----------|------------|
| `@chroma/video-templates` | tudo: núcleo + composições React (`OfferCarousel`, `OfferPieceStill`, `PieceCanvas`) | react, remotion |
| `@chroma/video-templates/core` | núcleo PURO: schemas zod (`parseOfferCarouselProps`, `parsePieceDocument`, `parseOfferPieceStillProps`), tipos, tokens, `COMPOSITION_VERSION`, ids das composições, layout/validação/timing/legendas do F2, `layoutProducts` da peça | zod |
| `@chroma/video-templates/piece` | a peça de ofertas para o frontend: tipos do descritor, `layoutProducts`, schema e `PieceCanvas` (React puro) | react |
| `@chroma/video-templates/remotion-entry` | `src/index.ts` (`registerRoot`) — entrada do `bundle()` no worker | remotion |
| `@chroma/video-templates/fixtures/*.json` | `sample-6-offers.json` (props do F2) e `piece-9x16.json` (props do quadro da peça) | — |

O backend lê `package.json#remotionEntry` para achar a entrada do bundle e importa
`dist/cjs/core/index.js` para validar as props antes do render (`MC_VIDEO_TEMPLATES_DIR`
aponta para um checkout local; sem ela, `node_modules/@chroma/video-templates`).

## Uma composição por bundle no render

No Remotion 4.0.529, com várias `<Composition>` na raiz o renderer pode consultar a lista
antes de todas registrarem ("Could not find composition"). `src/Root.tsx` lê as input props
do render (`compositionIdForInputProps`): props com `document.blocks` registram só
`OfferPieceStill`; props com `offers[]`, só `OfferCarousel`; sem input props (Studio), as
duas. O worker não precisa fazer nada além de passar as props da composição que quer.

## Peça de ofertas: o mesmo componente nos dois lados

- `PieceCanvas({ document, width, height, assetBase | resolveAssetUrl, imgComponent })` desenha o
  descritor em tamanho natural. O editor escala por CSS e passa `renderBlock`/`onBlockClick`;
  a composição passa o `<Img>` do Remotion (segura o quadro até cada imagem carregar) e
  `staticFile` para URLs relativas. Toda imagem é um `<img>` — nunca `background-image`,
  que o Remotion não espera carregar.
- `layoutProducts({ areaRect, width, height, itemIds, featuredId })` é o auto-layout da área de
  produtos: editor, quadro parado e re-layout no servidor usam a mesma função. Os números
  estão fixados em `test/piece-layout.test.ts`.
- Fontes da conta (`document.fonts[]`, família + URL): o canvas injeta `@font-face`; a
  composição ainda carrega cada uma com `loadFont` sob `delayRender`/`continueRender`, e
  fonte indisponível segue com o fallback (DejaVu Sans) em vez de travar o render.
- `parsePieceDocument`/`parseOfferPieceStillProps` validam a FORMA; as regras de negócio (2 a 12
  produtos, até 6 falados, foto em `/uploads/`, lado do personagem) são do backend e
  voltam ao editor como `issues[]`. Um documento que o backend aceitou passa aqui.

## Distribuição (decisão da tarefa 3.5 da change `video-peca-configuravel`)

O pacote é **privado e não publicado em registro**. A distribuição é por **dependência git
fixada**, com `dist/` **versionado** no repositório (por isso não há `prepare`):

```jsonc
// package.json do backend e do frontend
"@chroma/video-templates": "github:raphaelmonteiro/video-templates#v0.2.0"
```

Regras:

1. `package.json#version` e `#compositionVersion` andam juntos com a tag `vX.Y.Z` em `main`
   (`test/version.test.ts` garante `COMPOSITION_VERSION === compositionVersion`).
2. **Toda mudança que possa alterar pixels ou áudio** de uma composição sobe a
   `COMPOSITION_VERSION`: ela entra no hash determinístico dos renders do backend e no
   preflight do worker.
3. Para lançar: `npm run build && npm test`, commit **com o `dist/`**, tag, push; depois
   trocar a tag nos consumidores (`npm install github:raphaelmonteiro/video-templates#vX.Y.Z`)
   e commitar os lockfiles.
4. No worker da VM, `MC_VIDEO_TEMPLATES_DIR` continua opcional (checkout local com o
   próprio `node_modules`, útil para testar uma versão antes da tag); sem ela o worker usa a
   dependência instalada.

Enquanto uma versão ainda não tem tag, um consumidor pode fixar o commit
(`#<sha>`); a tag entra quando o branch chega em `main`.

## Scripts

```bash
npm ci
npm run typecheck && npm test        # tsc + vitest (124+ testes)
npm run build                        # dist/cjs, dist/esm, dist/types (versionados)
npm run studio                       # Remotion Studio com as duas composições
npm run still:piece                  # quadro da peça da fixture → out/piece.png
npm run still:sample                 # um quadro do F2
npm run render:sample                # MP4 do F2
npm run fixtures                     # regenera fixtures/ e public/fixtures/ (determinístico)
```

Sem Chrome instalado pelo Remotion, passe o navegador: `npx remotion still ... --browser-executable=<caminho>`
(no worker é o `MC_RENDER_BROWSER` do preflight). Medições locais em `docs/benchmark.md`.
