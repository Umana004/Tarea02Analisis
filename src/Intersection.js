import React from 'react';
import TrafficLight from './TrafficLight';

const CAR_COLORS = ['#ef4444', '#4f8ef7', '#22c55e', '#f59e0b', '#a855f7', '#ec4899'];
const getColor = (id) => CAR_COLORS[Math.abs(id.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % CAR_COLORS.length];

function Car({ color }) {
  return (
    <div style={{
      width: 18, height: 10,
      background: color,
      borderRadius: 3,
      boxShadow: `0 0 6px ${color}88`,
      border: '1px solid rgba(255,255,255,0.2)',
      flexShrink: 0,
    }} />
  );
}

function CarQueue({ cars, direction }) {
  const visible = cars.slice(0, 5);
  const isVertical = direction === 'N' || direction === 'S';

  return (
    <div style={{
      display: 'flex',
      flexDirection: isVertical ? 'column' : 'row',
      gap: 4,
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      {visible.map(c => <Car key={c.id} color={getColor(c.id)} />)}
    </div>
  );
}

export default function Intersection({ lights, cars }) {
  const roadColor = '#1a1d24';
  const grassColor = '#0e1a12';
  const laneColor = 'rgba(255,255,255,0.15)';
  const stripeColor = 'rgba(255,255,255,0.7)';

  const size = 420;
  const roadW = 90;
  const center = size / 2;

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      {/* SVG road */}
      <svg width={size} height={size} style={{ position: 'absolute', top: 0, left: 0 }}>
        {/* Grass quadrants */}
        <rect x={0} y={0} width={center - roadW/2} height={center - roadW/2} fill={grassColor} />
        <rect x={center + roadW/2} y={0} width={center - roadW/2} height={center - roadW/2} fill={grassColor} />
        <rect x={0} y={center + roadW/2} width={center - roadW/2} height={center - roadW/2} fill={grassColor} />
        <rect x={center + roadW/2} y={center + roadW/2} width={center - roadW/2} height={center - roadW/2} fill={grassColor} />

        {/* Roads */}
        <rect x={center - roadW/2} y={0} width={roadW} height={size} fill={roadColor} />
        <rect x={0} y={center - roadW/2} width={size} height={roadW} fill={roadColor} />

        {/* Center box */}
        <rect x={center - roadW/2} y={center - roadW/2} width={roadW} height={roadW} fill={roadColor} />

        {/* Lane dividers N-S */}
        <line x1={center} y1={0} x2={center} y2={center - roadW/2} stroke={laneColor} strokeWidth={1} strokeDasharray="8 8" />
        <line x1={center} y1={center + roadW/2} x2={center} y2={size} stroke={laneColor} strokeWidth={1} strokeDasharray="8 8" />

        {/* Lane dividers E-W */}
        <line x1={0} y1={center} x2={center - roadW/2} y2={center} stroke={laneColor} strokeWidth={1} strokeDasharray="8 8" />
        <line x1={center + roadW/2} y1={center} x2={size} y2={center} stroke={laneColor} strokeWidth={1} strokeDasharray="8 8" />

        {/* Crosswalks */}
        {[0,1,2,3,4,5].map(i => (
          <React.Fragment key={i}>
            <rect x={center - roadW/2 + 4} y={center - roadW/2 - 18 + i*3} width={roadW - 8} height={2} fill={stripeColor} opacity={0.5} />
            <rect x={center - roadW/2 + 4} y={center + roadW/2 + 2 + i*3} width={roadW - 8} height={2} fill={stripeColor} opacity={0.5} />
            <rect x={center - roadW/2 - 18 + i*3} y={center - roadW/2 + 4} width={2} height={roadW - 8} fill={stripeColor} opacity={0.5} />
            <rect x={center + roadW/2 + 2 + i*3} y={center - roadW/2 + 4} width={2} height={roadW - 8} fill={stripeColor} opacity={0.5} />
          </React.Fragment>
        ))}

        {/* Center mark */}
        <circle cx={center} cy={center} r={6} fill="#2a2d38" stroke="rgba(255,255,255,0.1)" strokeWidth={1} />
      </svg>

      {/* Traffic lights at corners */}
      <div style={{ position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)' }}>
        <TrafficLight light={lights.N} direction="NORTE" />
      </div>
      <div style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)' }}>
        <TrafficLight light={lights.S} direction="SUR" />
      </div>
      <div style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)' }}>
        <TrafficLight light={lights.O} direction="OESTE" />
      </div>
      <div style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)' }}>
        <TrafficLight light={lights.E} direction="ESTE" />
      </div>

      {/* Car queues */}
      <div style={{ position: 'absolute', top: 100, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', gap: 4 }}>
        <CarQueue cars={cars.N} direction="N" />
      </div>
      <div style={{ position: 'absolute', bottom: 100, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', gap: 4 }}>
        <CarQueue cars={cars.S} direction="S" />
      </div>
      <div style={{ position: 'absolute', left: 80, top: '50%', transform: 'translateY(-50%)' }}>
        <CarQueue cars={cars.O} direction="O" />
      </div>
      <div style={{ position: 'absolute', right: 80, top: '50%', transform: 'translateY(-50%)' }}>
        <CarQueue cars={cars.E} direction="E" />
      </div>
    </div>
  );
}
