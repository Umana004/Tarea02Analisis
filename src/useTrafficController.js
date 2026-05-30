import { useState, useEffect, useRef, useCallback } from 'react';

const PHASES = [
  { id: 'NS', label: 'Norte – Sur', active: ['N', 'S'], stopped: ['E', 'O'] },
  { id: 'EO', label: 'Este – Oeste', active: ['E', 'O'], stopped: ['N', 'S'] },
];

const SUB = { GREEN: 'verde', YELLOW: 'amarillo', RED: 'rojo' };

function makeLight(color) {
  return { red: color === 'red', yellow: color === 'yellow', green: color === 'green' };
}

const DIRS = ['N', 'S', 'E', 'O'];
const initialLights = () => Object.fromEntries(DIRS.map(d => [d, makeLight('red')]));

export default function useTrafficController() {
  const [lights, setLights] = useState(initialLights);
  const [phase, setPhase] = useState(0);
  const [subPhase, setSubPhase] = useState(SUB.GREEN);
  const [cycles, setCycles] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [cycleDuration, setCycleDuration] = useState(5);
  const [events, setEvents] = useState([
    { time: '00:00:00', msg: 'Sistema iniciado', type: 'system' },
  ]);
  const [cars, setCars] = useState({
    N: [{ id: 'n1', pos: 0 }, { id: 'n2', pos: 1 }, { id: 'n3', pos: 2 }],
    S: [{ id: 's1', pos: 0 }, { id: 's2', pos: 1 }, { id: 's3', pos: 2 }],
    E: [{ id: 'e1', pos: 0 }, { id: 'e2', pos: 1 }, { id: 'e3', pos: 2 }],
    O: [{ id: 'o1', pos: 0 }, { id: 'o2', pos: 1 }, { id: 'o3', pos: 2 }],
  });

  const elapsedRef = useRef(0);
  const phaseRef = useRef(0);
  const subPhaseRef = useRef(SUB.GREEN);
  const subTimerRef = useRef(0);
  const tickRef = useRef(null);
  const carIdRef = useRef(100);

  const fmt = (s) => {
    const h = String(Math.floor(s / 3600)).padStart(2, '0');
    const m = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
    const sec = String(s % 60).padStart(2, '0');
    return `${h}:${m}:${sec}`;
  };

  const addEvent = useCallback((msg, type = 'info') => {
    setEvents(prev => {
      const t = fmt(elapsedRef.current);
      const next = [{ time: t, msg, type }, ...prev].slice(0, 60);
      return next;
    });
  }, []);

  const applyLights = useCallback((phaseIdx, sub) => {
    const { active, stopped } = PHASES[phaseIdx];
    setLights(prev => {
      const next = { ...prev };
      if (sub === SUB.GREEN) {
        active.forEach(d => { next[d] = makeLight('green'); });
        stopped.forEach(d => { next[d] = makeLight('red'); });
      } else if (sub === SUB.YELLOW) {
        active.forEach(d => { next[d] = makeLight('yellow'); });
        stopped.forEach(d => { next[d] = makeLight('red'); });
      } else {
        DIRS.forEach(d => { next[d] = makeLight('red'); });
      }
      return next;
    });
  }, []);

  const spawnCar = useCallback((dir) => {
    const id = `car_${carIdRef.current++}`;
    setCars(prev => ({
      ...prev,
      [dir]: [...prev[dir].slice(-4), { id, pos: 0 }],
    }));
  }, []);

  const moveCars = useCallback((phaseIdx, sub) => {
    const { active } = PHASES[phaseIdx];
    const canMove = sub === SUB.GREEN;
    setCars(prev => {
      const next = { ...prev };
      DIRS.forEach(dir => {
        const moving = canMove && active.includes(dir);
        next[dir] = prev[dir]
          .map(c => ({ ...c, pos: moving ? c.pos + 1 : c.pos }))
          .filter(c => c.pos < 8);
      });
      return next;
    });
  }, []);

  const tick = useCallback(() => {
    elapsedRef.current += 1;
    setElapsed(elapsedRef.current);
    subTimerRef.current += 1;

    const dur = parseInt(localStorage.getItem('cycleDur') || '5', 10);
    const yellowDur = Math.max(1, Math.round(dur * 0.2));
    const allRedDur = 1;

    const cur = subPhaseRef.current;
    const ph = phaseRef.current;

    if (cur === SUB.GREEN && subTimerRef.current >= dur) {
      subPhaseRef.current = SUB.YELLOW;
      subTimerRef.current = 0;
      applyLights(ph, SUB.YELLOW);
      addEvent('Transición a amarillo', 'yellow');
    } else if (cur === SUB.YELLOW && subTimerRef.current >= yellowDur) {
      subPhaseRef.current = SUB.RED;
      subTimerRef.current = 0;
      applyLights(ph, SUB.RED);
      addEvent('Todo rojo', 'red');
    } else if (cur === SUB.RED && subTimerRef.current >= allRedDur) {
      const nextPh = (ph + 1) % PHASES.length;
      phaseRef.current = nextPh;
      subPhaseRef.current = SUB.GREEN;
      subTimerRef.current = 0;
      applyLights(nextPh, SUB.GREEN);
      setPhase(nextPh);
      if (nextPh === 0) setCycles(c => c + 1);
      addEvent(`Fase ${PHASES[nextPh].label}: verde`, 'green');
    }

    setSubPhase(subPhaseRef.current);
    moveCars(phaseRef.current, subPhaseRef.current);

    if (Math.random() < 0.15) {
      const dir = DIRS[Math.floor(Math.random() * DIRS.length)];
      spawnCar(dir);
    }
  }, [applyLights, addEvent, moveCars, spawnCar]);

  useEffect(() => {
    if (running) {
      applyLights(phaseRef.current, subPhaseRef.current);
      addEvent(`Fase ${PHASES[phaseRef.current].label}: verde`, 'green');
      tickRef.current = setInterval(tick, 1000);
    } else {
      clearInterval(tickRef.current);
    }
    return () => clearInterval(tickRef.current);
  }, [running]);

  useEffect(() => {
    localStorage.setItem('cycleDur', cycleDuration);
  }, [cycleDuration]);

  const start = () => { if (!running) setRunning(true); };
  const pause = () => setRunning(false);
  const reset = () => {
    setRunning(false);
    clearInterval(tickRef.current);
    elapsedRef.current = 0;
    phaseRef.current = 0;
    subPhaseRef.current = SUB.GREEN;
    subTimerRef.current = 0;
    setElapsed(0);
    setPhase(0);
    setSubPhase(SUB.GREEN);
    setCycles(0);
    setLights(initialLights());
    setCars({
      N: [{ id: 'n1', pos: 0 }, { id: 'n2', pos: 1 }, { id: 'n3', pos: 2 }],
      S: [{ id: 's1', pos: 0 }, { id: 's2', pos: 1 }, { id: 's3', pos: 2 }],
      E: [{ id: 'e1', pos: 0 }, { id: 'e2', pos: 1 }, { id: 'e3', pos: 2 }],
      O: [{ id: 'o1', pos: 0 }, { id: 'o2', pos: 1 }, { id: 'o3', pos: 2 }],
    });
    setEvents([{ time: '00:00:00', msg: 'Sistema reiniciado', type: 'system' }]);
  };

  const fmtElapsed = () => {
    const h = String(Math.floor(elapsed / 3600)).padStart(2, '0');
    const m = String(Math.floor((elapsed % 3600) / 60)).padStart(2, '0');
    const s = String(elapsed % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  return {
    lights, phase, subPhase, cycles, elapsed, fmtElapsed, running,
    cycleDuration, setCycleDuration,
    events, cars,
    start, pause, reset,
    currentPhaseLabel: PHASES[phase].label,
  };
}
