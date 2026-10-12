/**
 * Entrada de bundler SÓ das fixtures (gerador em scripts/make-fixtures.mjs):
 * clipes falados placeholder, embalagens e logo. Fica fora do pacote.
 *
 * Com `fixtureId` nas input props, monta SÓ aquela composição: no Remotion
 * 4.0.529 o CompositionManagerProvider atualiza a lista dentro do updater do
 * setState, e com várias <Composition> o renderer pode consultar a lista antes
 * de todas registrarem ("Could not find composition"). Uma por bundle evita a
 * corrida (a raiz do pacote, src/Root.tsx, tem uma só).
 */
import React from 'react';
import { Composition, getInputProps, registerRoot, Still } from 'remotion';
import { FixtureLogo } from './FixtureLogo';
import { FixtureProduct, FixtureProductProps } from './FixtureProduct';
import { FixtureTalkClip, FixtureTalkClipProps } from './FixtureTalkClip';

const talkDefaults: FixtureTalkClipProps = { durationS: 2, words: [], background: '#FFE082', body: '#E53935' };
const productDefaults: FixtureProductProps = {
  kind: 'bag',
  label: 'ARROZ',
  sub: '5 kg',
  color: '#1E88E5',
  width: 800,
  height: 1000,
};

const only = (getInputProps() as { fixtureId?: string }).fixtureId;
const show = (id: string) => !only || only === id;

const Root: React.FC = () => (
  <>
    {show('FixtureTalkClip') && (
    <Composition
      id="FixtureTalkClip"
      component={FixtureTalkClip}
      defaultProps={talkDefaults}
      fps={30}
      width={540}
      height={720}
      durationInFrames={60}
      calculateMetadata={({ props }) => ({ durationInFrames: Math.max(1, Math.round(props.durationS * 30)) })}
    />
    )}
    {show('FixtureProduct') && (
    <Composition
      id="FixtureProduct"
      component={FixtureProduct}
      defaultProps={productDefaults}
      fps={30}
      width={800}
      height={1000}
      durationInFrames={1}
      calculateMetadata={({ props }) => ({ width: props.width, height: props.height })}
    />
    )}
    {show('FixtureLogo') && <Still id="FixtureLogo" component={FixtureLogo} width={900} height={450} />}
  </>
);

registerRoot(Root);
