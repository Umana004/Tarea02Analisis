import React from 'react';

const GLOW = {
  red: '0 0 18px 6px rgba(239,68,68,0.7)',
  yellow: '0 0 18px 6px rgba(245,158,11,0.7)',
  green: '0 0 18px 6px rgba(34,197,94,0.7)',
};

const DIM = {
  red: '#3d1212',
  yellow: '#3d2d08',
  green: '#0d2d15',
};

const ACTIVE = {
  red: '#ef4444',
  yellow: '#f59e0b',
  green: '#22c55e',
};

export default function TrafficLight({ light, direction }) {
  const { red, yellow, green } = light;

  const bulb = (color, on) => (
    <div style={{
      width: 28,
      height: 28,
      borderRadius: '50%',
      background: on ? ACTIVE[color] : DIM[color],
      boxShadow: on ? GLOW[color] : 'none',
      transition: 'background 0.25s, box-shadow 0.25s',
    }} />
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <span style={{
        fontFamily: 'var(--font-display)',
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: '0.12em',
        color: 'var(--muted)',
        textTransform: 'uppercase',
        marginBottom: 4,
      }}>{direction}</span>
      <div style={{
        background: '#0a0b0e',
        border: '2px solid rgba(255,255,255,0.1)',
        borderRadius: 10,
        padding: '10px 8px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        boxShadow: '0 4px 24px rgba(0,0,0,0.6)',
      }}>
        {bulb('red', red)}
        {bulb('yellow', yellow)}
        {bulb('green', green)}
      </div>
    </div>
  );
}
