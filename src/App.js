import React from 'react';
import './index.css';
import useTrafficController from './useTrafficController';
import Intersection from './Intersection';

const SUB_COLOR = { verde: '#22c55e', amarillo: '#f59e0b', rojo: '#ef4444' };
const EVENT_COLOR = { system: '#6b7280', green: '#22c55e', yellow: '#f59e0b', red: '#ef4444', info: '#4f8ef7' };

function Btn({ children, onClick, variant = 'default', disabled }) {
  const styles = {
    default: { background: 'var(--surface2)', color: 'var(--text)', border: '1px solid var(--border)' },
    start: { background: '#16a34a', color: '#fff', border: '1px solid #22c55e' },
    pause: { background: '#b45309', color: '#fff', border: '1px solid #f59e0b' },
    reset: { background: 'var(--surface2)', color: 'var(--muted)', border: '1px solid var(--border)' },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{
      ...styles[variant],
      padding: '10px 0',
      width: '100%',
      borderRadius: 8,
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      fontSize: 13,
      letterSpacing: '0.06em',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      transition: 'opacity 0.2s',
    }}>
      {children}
    </button>
  );
}

function Stat({ label, value, color }) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 10,
      padding: '12px 16px',
    }}>
      <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-display)', letterSpacing: '0.08em', marginBottom: 6 }}>
        {label.toUpperCase()}
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, color: color || 'var(--text)', fontFamily: 'var(--font-display)' }}>
        {value}
      </div>
    </div>
  );
}

export default function App() {
  const {
    lights, phase, subPhase, cycles, fmtElapsed, running,
    cycleDuration, setCycleDuration,
    events, cars,
    start, pause, reset,
    currentPhaseLabel,
  } = useTrafficController();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Header */}
      <header style={{
        borderBottom: '1px solid var(--border)',
        padding: '14px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'var(--surface)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: running ? '#22c55e' : '#6b7280',
            boxShadow: running ? '0 0 8px #22c55e' : 'none',
          }} />
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 15, letterSpacing: '0.05em' }}>
            SIMULACIÓN DE CRUCE
          </span>
        </div>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--muted)' }}>
          SEMAFORO
        </span>
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: 11,
          color: running ? '#22c55e' : '#6b7280',
          border: `1px solid ${running ? '#22c55e44' : 'var(--border)'}`,
          borderRadius: 6, padding: '3px 10px',
        }}>
          {running ? 'EJECUTANDO' : 'DETENIDO'}
        </span>
      </header>

      {/* Main layout */}
      <div style={{ flex: 1, display: 'flex', gap: 0 }}>
        {/* Left panel */}
        <aside style={{
          width: 220,
          borderRight: '1px solid var(--border)',
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          background: 'var(--surface)',
          flexShrink: 0,
        }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 11, letterSpacing: '0.15em', color: 'var(--muted)' }}>
            CONTROLES
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Btn variant="start" onClick={start} disabled={running}>▶ Iniciar</Btn>
            <Btn variant="pause" onClick={pause} disabled={!running}>⏸ Pausar</Btn>
            <Btn variant="reset" onClick={reset}>↺ Reiniciar</Btn>
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 10, fontFamily: 'var(--font-display)', letterSpacing: '0.08em' }}>
              CICLO (SEGUNDOS)
            </div>
            <input
              type="range" min={2} max={15} value={cycleDuration}
              onChange={e => setCycleDuration(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--accent)', marginBottom: 6 }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--muted)' }}>
              <span>2</span>
              <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{cycleDuration}s</span>
              <span>15</span>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Stat label="Fase actual" value={currentPhaseLabel} color="#4f8ef7" />
            <Stat label="Sub-fase" value={subPhase.toUpperCase()} color={SUB_COLOR[subPhase]} />
            <Stat label="Ciclos" value={cycles} />
            <Stat label="Tiempo" value={fmtElapsed()} />
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 10, fontFamily: 'var(--font-display)', letterSpacing: '0.08em' }}>
              LEYENDA
            </div>
            {[['#ef4444', 'Rojo — detenido'], ['#f59e0b', 'Amarillo — transición'], ['#22c55e', 'Verde — circulando']].map(([c, l]) => (
              <div key={c} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: c, boxShadow: `0 0 6px ${c}88`, flexShrink: 0 }} />
                <span style={{ fontSize: 11, color: 'var(--muted)' }}>{l}</span>
              </div>
            ))}
          </div>
        </aside>

        {/* Center — intersection */}
        <main style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg)',
          padding: 24,
        }}>
          <Intersection lights={lights} cars={cars} />
        </main>

        {/* Right panel — events */}
        <aside style={{
          width: 300,
          borderLeft: '1px solid var(--border)',
          background: 'var(--surface)',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
        }}>
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border)',
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: 11,
            letterSpacing: '0.15em',
            color: 'var(--muted)',
          }}>
            EVENTOS DEL CONTROLADOR
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
            {events.map((ev, i) => (
              <div key={i} style={{
                padding: '7px 20px',
                display: 'flex',
                gap: 12,
                alignItems: 'flex-start',
                borderBottom: '1px solid rgba(255,255,255,0.03)',
              }}>
                <span style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'var(--font-mono)', flexShrink: 0, marginTop: 1 }}>
                  [{ev.time}]
                </span>
                <span style={{
                  fontSize: 12,
                  fontFamily: 'var(--font-mono)',
                  color: EVENT_COLOR[ev.type] || 'var(--text)',
                }}>
                  {ev.msg}
                </span>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
