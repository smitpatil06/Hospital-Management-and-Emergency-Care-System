import React, { useEffect, useMemo, useState } from 'react';
import { Process } from '../types';
import { FitPolicy, allocate, needOf, request, safety } from '../utils/hospital';

type View = 'cpu' | 'sync' | 'bank' | 'mem';
const card: React.CSSProperties = { maxWidth: 960, margin: '70px auto 40px', padding: '0 20px' };
const mono: React.CSSProperties = { fontFamily: 'var(--font-mono, monospace)', fontSize: 13, width: '100%' };

export const TabBar: React.FC<{ view: View; setView: (v: View) => void }> = ({ view, setView }) => (
  <div style={{ position: 'fixed', top: 8, left: '50%', transform: 'translateX(-50%)', zIndex: 60, display: 'flex', gap: 4,
    background: 'var(--bg-color, #fff)', border: '1px solid #ccc', borderRadius: 8, padding: 4 }}>
    {([['cpu', 'CPU Scheduling'], ['sync', 'Producer–Consumer'], ['bank', "Banker's"], ['mem', 'Memory']] as [View, string][]).map(([v, l]) => (
      <button key={v} className="clean-button" onClick={() => setView(v)}
        style={{ fontWeight: view === v ? 700 : 400, textDecoration: view === v ? 'underline' : 'none' }}>{l}</button>
    ))}
  </div>
);

// ---------- Producer–Consumer (bounded buffer, empty/full semaphores + mutex) ----------
interface Item { id: number; who: string; emergency: boolean; }
interface Sync { buf: (Item | null)[]; inp: number; out: number; empty: number; full: number; mutex: number; n: number; log: string[]; }
const PRODUCERS = ['Registration', 'Lab', 'Imaging'], CONSUMERS = ['Doctor workstation', 'Pharmacy'];
const fresh = (N: number): Sync => ({ buf: Array(N).fill(null), inp: 0, out: 0, empty: N, full: 0, mutex: 1, n: 0, log: [] });
const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];

function step(s: Sync): Sync {
  const N = s.buf.length, log = (m: string) => [m, ...s.log].slice(0, 60);
  if (Math.random() < 0.55) {
    const who = pick(PRODUCERS);
    if (s.empty === 0) return { ...s, log: log(`${who}: wait(empty) -> BLOCKED, buffer full`) };
    const item = { id: s.n + 1, who, emergency: Math.random() < 0.25 };
    const buf = [...s.buf]; buf[s.inp] = item;
    return { ...s, buf, inp: (s.inp + 1) % N, empty: s.empty - 1, full: s.full + 1, n: s.n + 1,
      log: log(`${who} produced #${item.id}${item.emergency ? ' [EMERGENCY]' : ''}`) };
  }
  const who = pick(CONSUMERS);
  if (s.full === 0) return { ...s, log: log(`${who}: wait(full) -> BLOCKED, buffer empty`) };
  const item = s.buf[s.out]!, buf = [...s.buf]; buf[s.out] = null;
  return { ...s, buf, out: (s.out + 1) % N, empty: s.empty + 1, full: s.full - 1, log: log(`${who} consumed #${item.id} from ${item.who}`) };
}

export const ProducerConsumer: React.FC = () => {
  const [N, setN] = useState(4), [s, setS] = useState(() => fresh(4)), [auto, setAuto] = useState(false);
  useEffect(() => { if (!auto) return; const t = setInterval(() => setS(step), 600); return () => clearInterval(t); }, [auto]);
  const reset = (n = N) => { setAuto(false); setS(fresh(n)); };
  return (
    <div style={card}>
      <h2>Producer–Consumer: hospital data buffer</h2>
      <p>Producers (registration desk, lab, imaging) insert records into a bounded buffer; consumers (doctor workstation, pharmacy) remove them.
        Each operation is <code>wait(empty/full)</code> → <code>wait(mutex)</code> → critical section → <code>signal(mutex)</code> → <code>signal(full/empty)</code>.</p>
      <label>Buffer size <input className="clean-input" type="number" min={1} max={8} value={N}
        onChange={e => { const n = Math.max(1, Math.min(8, +e.target.value || 4)); setN(n); reset(n); }} /></label>{' '}
      <button className="clean-button" onClick={() => setS(step)}>Step</button>{' '}
      <button className="clean-button" onClick={() => setAuto(!auto)}>{auto ? 'Stop' : 'Auto'}</button>{' '}
      <button className="clean-button" onClick={() => reset()}>Reset</button>
      <div style={{ display: 'flex', gap: 8, margin: '16px 0' }}>
        {s.buf.map((it, i) => (
          <div key={i} style={{ flex: 1, minHeight: 64, border: `2px solid ${it ? (it.emergency ? '#dc2626' : '#16a34a') : '#ccc'}`,
            borderRadius: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>
            {it ? <>#{it.id}<br />{it.who}</> : 'empty'}
            <small>{i === s.inp ? 'in ' : ''}{i === s.out ? 'out' : ''}</small>
          </div>
        ))}
      </div>
      <p>empty = <b>{s.empty}</b> · full = <b>{s.full}</b> · mutex = <b>{s.mutex}</b></p>
      <pre style={{ ...mono, maxHeight: 220, overflow: 'auto' }}>{s.log.join('\n')}</pre>
    </div>
  );
};

// ---------- Banker's Algorithm ----------
const toMat = (t: string) => t.trim().split('\n').map(r => r.trim().split(/\s+/).map(Number));
export const BankersAlgorithm: React.FC<{ processes: Process[] }> = ({ processes }) => {
  const [allocT, setAllocT] = useState('0 1 0\n2 0 0\n3 0 2\n2 1 1\n0 0 2');
  const [maxT, setMaxT] = useState('7 5 3\n3 2 2\n9 0 2\n2 2 2\n4 3 3');
  const [availT, setAvailT] = useState('3 3 2');
  const [rp, setRp] = useState(2), [rv, setRv] = useState('1 0 2');
  const [reqMsg, setReqMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const label = (i: number) => `P${i + 1}`;
  const { alloc, max, avail, need, res } = useMemo(() => {
    const alloc = toMat(allocT), max = toMat(maxT), avail = toMat(availT)[0], need = needOf(max, alloc);
    return { alloc, max, avail, need, res: safety(alloc, need, avail, label) };
  }, [allocT, maxT, availT]);
  return (
    <div style={card}>
      <h2>Banker's Algorithm: safe allocation of shared hospital equipment</h2>
      <p>Resources: A = imaging machines, B = printers, C = database connections. Need = Max − Allocation.</p>
      <div style={{ display: 'flex', gap: 12 }}>
        {[['Allocation', allocT, setAllocT, 5], ['Maximum', maxT, setMaxT, 5], ['Available', availT, setAvailT, 1]].map(([t, v, f, r]: any) => (
          <label key={t} style={{ flex: 1 }}>{t}<textarea className="clean-input" style={mono} rows={r} value={v} onChange={e => f(e.target.value)} /></label>
        ))}
      </div>
      <table className="minimal-table"><thead><tr><th>Process</th><th>Allocation</th><th>Max</th><th>Need</th></tr></thead>
        <tbody>{alloc.map((a, i) => (
          <tr key={i}><td>{label(i)}{processes[i] ? ` (${processes[i].name})` : ''}</td><td>{a.join(' ')}</td><td>{max[i].join(' ')}</td><td>{need[i].join(' ')}</td></tr>
        ))}</tbody></table>
      <p style={{ color: res.safe ? '#16a34a' : '#dc2626', fontWeight: 600 }}>
        {res.safe ? `SAFE state. Safe sequence: ${res.sequence.map(label).join(' → ')}` : 'UNSAFE state: no safe sequence exists.'}</p>
      <pre style={{ ...mono, whiteSpace: 'pre-wrap' }}>{res.steps.join('\n')}</pre>
      <div>Request from process # <input className="clean-input" type="number" style={{ width: 60 }} min={1} value={rp} onChange={e => setRp(+e.target.value)} />{' '}
        vector <input className="clean-input" style={{ width: 100 }} value={rv} onChange={e => setRv(e.target.value)} />{' '}
        <button className="clean-button" onClick={() => {
          const r = request(alloc, max, avail, rp - 1, rv.trim().split(/\s+/).map(Number), label);
          setReqMsg({ ok: r.granted, text: `P${rp} [${rv}]: ${r.message}` });
        }}>Request resources</button></div>
      {reqMsg && <p style={{ color: reqMsg.ok ? '#16a34a' : '#dc2626', fontWeight: 600 }}>{reqMsg.text}</p>}
    </div>
  );
};

// ---------- Memory management ----------
export const MemoryManager: React.FC<{ processes: Process[] }> = ({ processes }) => {
  const [partsT, setPartsT] = useState('100 500 200 300 600');
  const [policy, setPolicy] = useState<FitPolicy>('best');
  const parts = partsT.trim().split(/\s+/).map(Number).filter(n => n > 0);
  const tasks = processes.map(p => ({ name: `${p.id} ${p.name}`, size: p.memoryKB ?? p.burstTime * 40 }));
  const r = useMemo(() => allocate(parts, tasks, policy), [partsT, policy, processes]);
  const total = parts.reduce((a, b) => a + b, 0), waiting = r.placements.filter(p => p.partition === null);
  return (
    <div style={card}>
      <h2>Memory Management: placing hospital tasks in partitions</h2>
      <label>Partitions (KB) <input className="clean-input" style={{ width: 240 }} value={partsT} onChange={e => setPartsT(e.target.value)} /></label>{' '}
      <select className="clean-select" value={policy} onChange={e => setPolicy(e.target.value as FitPolicy)}>
        <option value="first">First Fit</option><option value="best">Best Fit</option><option value="worst">Worst Fit</option></select>
      <div style={{ display: 'flex', border: '1px solid #ccc', margin: '16px 0', minHeight: 48 }}>
        {parts.map((size, i) => {
          const t = r.owner[i] === null ? null : r.placements[r.owner[i] as number];
          return <div key={i} style={{ flex: size, background: t ? processes[r.owner[i] as number]?.color : '#adb5bd', color: '#fff', fontSize: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid #fff', textAlign: 'center' }}>
            {t ? `${t.name.split(' ')[0]} ${t.size}/${size}` : `free ${size}`}</div>;
        })}
      </div>
      <table className="minimal-table"><thead><tr><th>Task</th><th>Size KB</th><th>Partition</th><th>Internal fragmentation KB</th></tr></thead>
        <tbody>{r.placements.map(p => (
          <tr key={p.name}><td>{p.name}</td><td>{p.size}</td>
            <td>{p.partition === null ? <b style={{ color: '#dc2626' }}>Not allocated</b> : `#${p.partition + 1} (${parts[p.partition]} KB)`}</td>
            <td>{p.partition === null ? '-' : parts[p.partition] - p.size}</td></tr>
        ))}</tbody></table>
      <p>Total memory {total} KB · internal fragmentation <b>{r.internal} KB</b> · free partitions <b>{r.freeTotal} KB</b> (largest {r.largestFree} KB)</p>
      {waiting.length > 0 && <p style={{ color: '#dc2626' }}>{waiting.length} task(s) waiting: no single free partition is large enough
        {r.freeTotal >= Math.min(...waiting.map(w => w.size)) ? ', although total free memory would suffice (external fragmentation).' : '.'}</p>}
    </div>
  );
};
