import React from 'react';
import { AbsoluteFill } from 'remotion';

/**
 * Embalagem PLACEHOLDER (só para fixtures) em fundo branco, com aspectos
 * variados — verifica que a foto aparece inteira (object-fit contain).
 */
export type FixtureProductProps = {
  kind: 'bag' | 'pack' | 'bottle' | 'carton' | 'meat' | 'soda';
  label: string;
  sub: string;
  color: string;
  width: number;
  height: number;
};

const Label: React.FC<{ x: number; y: number; w: number; h: number; label: string; sub: string; color: string }> = ({
  x,
  y,
  w,
  h,
  label,
  sub,
  color,
}) => (
  <g>
    <rect x={x} y={y} width={w} height={h} rx={h * 0.12} fill="#fff" stroke={color} strokeWidth={4} />
    <text x={x + w / 2} y={y + h * 0.5} textAnchor="middle" fontSize={h * 0.32} fontWeight={800} fill={color} fontFamily="Arial, sans-serif">
      {label}
    </text>
    <text x={x + w / 2} y={y + h * 0.82} textAnchor="middle" fontSize={h * 0.2} fontWeight={600} fill="#333" fontFamily="Arial, sans-serif">
      {sub}
    </text>
  </g>
);

export const FixtureProduct: React.FC<FixtureProductProps> = ({ kind, label, sub, color, width, height }) => {
  const vb = `0 0 ${width} ${height}`;
  const cx = width / 2;
  let shape: React.ReactNode;
  if (kind === 'bag') {
    shape = (
      <g>
        <path d={`M${width * 0.2} ${height * 0.12} L${width * 0.8} ${height * 0.12} L${width * 0.86} ${height * 0.9} Q${cx} ${height * 0.96} ${width * 0.14} ${height * 0.9} Z`} fill={color} />
        <rect x={width * 0.2} y={height * 0.08} width={width * 0.6} height={height * 0.06} fill="#fff" opacity={0.5} />
        <Label x={width * 0.24} y={height * 0.38} w={width * 0.52} h={height * 0.26} label={label} sub={sub} color={color} />
      </g>
    );
  } else if (kind === 'pack') {
    shape = (
      <g>
        <rect x={width * 0.1} y={height * 0.15} width={width * 0.8} height={height * 0.72} rx={20} fill={color} />
        <rect x={width * 0.1} y={height * 0.15} width={width * 0.8} height={height * 0.12} rx={20} fill="#000" opacity={0.25} />
        <Label x={width * 0.18} y={height * 0.4} w={width * 0.64} h={height * 0.3} label={label} sub={sub} color={color} />
      </g>
    );
  } else if (kind === 'bottle' || kind === 'soda') {
    shape = (
      <g>
        <rect x={cx - width * 0.07} y={height * 0.04} width={width * 0.14} height={height * 0.06} rx={6} fill={kind === 'soda' ? '#C62828' : '#F9A825'} />
        <path d={`M${cx - width * 0.1} ${height * 0.1} L${cx + width * 0.1} ${height * 0.1} L${cx + width * 0.28} ${height * 0.3} L${cx + width * 0.28} ${height * 0.92} Q${cx} ${height * 0.97} ${cx - width * 0.28} ${height * 0.92} L${cx - width * 0.28} ${height * 0.3} Z`} fill={color} opacity={0.92} />
        <Label x={cx - width * 0.3} y={height * 0.46} w={width * 0.6} h={height * 0.2} label={label} sub={sub} color={kind === 'soda' ? '#C62828' : '#8D6E00'} />
      </g>
    );
  } else if (kind === 'carton') {
    shape = (
      <g>
        <path d={`M${width * 0.22} ${height * 0.2} L${cx} ${height * 0.06} L${width * 0.78} ${height * 0.2} Z`} fill="#90CAF9" />
        <rect x={width * 0.22} y={height * 0.2} width={width * 0.56} height={height * 0.74} fill={color} />
        <Label x={width * 0.26} y={height * 0.42} w={width * 0.48} h={height * 0.24} label={label} sub={sub} color="#1565C0" />
      </g>
    );
  } else {
    shape = (
      <g>
        <rect x={width * 0.08} y={height * 0.22} width={width * 0.84} height={height * 0.6} rx={30} fill="#ECEFF1" stroke="#B0BEC5" strokeWidth={6} />
        <ellipse cx={cx} cy={height * 0.52} rx={width * 0.34} ry={height * 0.22} fill={color} />
        <ellipse cx={cx + width * 0.12} cy={height * 0.44} rx={width * 0.12} ry={height * 0.06} fill="#FFCDD2" opacity={0.8} />
        <path d={`M${width * 0.2} ${height * 0.62} Q${cx} ${height * 0.78} ${width * 0.8} ${height * 0.6}`} stroke="#FFF3E0" strokeWidth={22} fill="none" />
      </g>
    );
  }
  return (
    <AbsoluteFill style={{ background: '#FFFFFF' }}>
      <svg viewBox={vb} width={width} height={height}>
        {shape}
      </svg>
    </AbsoluteFill>
  );
};
