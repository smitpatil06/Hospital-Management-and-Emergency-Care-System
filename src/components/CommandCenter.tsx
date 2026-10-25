import React, { useEffect, useState } from 'react';
import { FitPolicy, needOf, safety } from '../utils/hospital';
import { BUF_CAP, PARTS, RES_NAMES, Sim, T, TOTAL, init, step } from '../utils/hospitalSim';

const box: React.CSSProperties = { border: '1px solid #d4d4d8', borderRadius: 8, padding: 14, background: 'rgba(255,255,255,0.6)' };
const mono: React.CSSProperties = { fontFamily: 'monospace', fontSize: 12 };
const level = (p: number) => (p === 1 ? ['CRITICAL', '#dc2626'] : p === 2 ? ['URGENT', '#ea580c'] : ['ROUTINE', '#64748b']);
const Tag: React.FC<{ t: T }> = ({ t }) => {
  const [l, c] = level(t.priority);
  return <span style={{ background: c, color: '#fff', borderRadius: 4, padding: '1px 6px', fontSize: 11, marginRight: 6 }}>{l}</span>;
};
const STATUS: Record<string, string> = {
  future: 'not arrived', 'producer-blocked': 'blocked at intake (buffer full)', buffered: 'in intake buffer', awaiting: 'awaiting admission',
  ready: 'admitted / ready', blocked: 'blocked (unsafe claim)', done: 'done',
};

export const CommandCenter: React.FC = () => {
  const [policy, setPolicy] = useState<FitPolicy>('best');
  const [s, setS] = useState<Sim>(() => init('best'));
  const [auto, setAuto] = useState(false);
  useEffect(() => {
    if (!auto) return;
    if (s.done) { setAuto(false); return; }
    const id = setInterval(() => setS(p => step(p)), 700);
    return () => clearInterval(id);
  }, [auto, s.done]);
  const reset = (p = policy) => { setAuto(false); setS(init(p)); };
  const runAll = () => { setAuto(false); setS(p => { let x = p; while (!x.done) x = step(x); return x; }); };

  const adm = s.tasks.filter(x => x.status === 'ready' || x.status === 'blocked');
  const need = needOf(adm.map(x => x.max), adm.map(x => x.alloc));
  const safe = adm.length ? safety(adm.map(x => x.alloc), need, s.avail, i => adm[i].id) : null;
  const running = s.gantt.length ? s.tasks.find(x => x.id === s.gantt[s.gantt.length - 1]) : undefined;
  const ready = s.tasks.filter(x => x.status === 'ready' && x.id !== running?.id).sort((a, b) => a.priority - b.priority || a.arrival - b.arrival);
  const buffered = s.buffer.map(id => s.tasks.find(x => x.id === id)!);
  const free = PARTS.filter((_, i) => s.owner[i] === null);
  const internal = s.owner.reduce((a, o, i) => { const t = s.tasks.find(x => x.id === o); return a + (t ? PARTS[i] - t.mem : 0); }, 0);
  const finished = s.tasks.filter(x => x.completion !== null);
  const avg = (xs: T[], f: (t: T) => number) => (xs.length ? (xs.reduce((a, t) => a + f(t), 0) / xs.length).toFixed(2) : '-');
  const wt = (t: T) => t.completion! - t.arrival - t.burst;
  const emg = finished.filter(x => x.priority === 1), routine = finished.filter(x => x.priority >= 3);

  return (
    <div style={{ maxWidth: 1100, margin: '70px auto 40px', padding: '0 20px' }}>
      <h2 style={{ marginBottom: 4 }}>Hospital Emergency Care: Integrated Resource Manager</h2>
      <p style={{ marginTop: 0 }}>
        Patient requests flow through all four OS mechanisms: <b>producers</b> (registration, lab, imaging, emergency desk) fill a bounded intake buffer →
        the admission controller (<b>consumer</b>) takes the most urgent request → it needs a <b>memory</b> partition and a <b>Banker's</b> safe-state approval
        for imaging machines, printers and DB connections → admitted tasks run under <b>preemptive priority scheduling</b>, so emergencies always win the CPU.
      </p>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
        <b>t = {s.time}</b>
        <button className="clean-button" onClick={() => setS(p => step(p))} disabled={s.done}>Step</button>
        <button className="clean-button" onClick={() => setAuto(!auto)} disabled={s.done}>{auto ? 'Pause' : 'Auto-play'}</button>
        <button className="clean-button" onClick={runAll} disabled={s.done}>Run to end</button>
        <button className="clean-button" onClick={() => reset()}>Reset</button>
        <label>Memory policy{' '}
          <select className="clean-select" value={policy} onChange={e => { const p = e.target.value as FitPolicy; setPolicy(p); reset(p); }}>
            <option value="first">First Fit</option><option value="best">Best Fit</option><option value="worst">Worst Fit</option></select></label>
        {s.done && <b style={{ color: '#16a34a' }}>All requests processed</b>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: 14 }}>
        <div style={box}>
          <b>1. Intake queue (Producer–Consumer, bounded buffer {BUF_CAP})</b>
          <div style={{ display: 'flex', gap: 8, margin: '10px 0' }}>
            {Array.from({ length: BUF_CAP }, (_, i) => buffered[i]).map((t, i) => (
              <div key={i} style={{ flex: 1, minHeight: 50, border: `2px solid ${t ? t.color : '#d4d4d8'}`, borderRadius: 6, padding: 4, fontSize: 12, textAlign: 'center' }}>
                {t ? <><Tag t={t} /><br />{t.name}</> : 'empty slot'}</div>
            ))}
          </div>
          <div style={mono}>empty = {BUF_CAP - s.buffer.length} · full = {s.buffer.length} · mutex = 1</div>
          {s.tasks.filter(x => x.status === 'producer-blocked').map(x => <div key={x.id} className="bad" style={{ color: '#dc2626', fontSize: 12 }}>Producer blocked: {x.name}</div>)}
        </div>

        <div style={box}>
          <b>2. Memory ({s.policy === 'first' ? 'First' : s.policy === 'best' ? 'Best' : 'Worst'} Fit, fixed partitions)</b>
          <div style={{ display: 'flex', border: '1px solid #a1a1aa', margin: '10px 0', minHeight: 46 }}>
            {PARTS.map((size, i) => {
              const t = s.tasks.find(x => x.id === s.owner[i]);
              return <div key={i} style={{ flex: size, background: t ? t.color : '#cbd5e1', color: t ? '#fff' : '#334155', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid #fff', textAlign: 'center' }}>
                {t ? `${t.id} ${t.mem}/${size}` : `free ${size}`}</div>;
            })}
          </div>
          <div style={mono}>internal fragmentation {internal} KB · free {free.reduce((a, b) => a + b, 0)} KB · largest free hole {Math.max(0, ...free)} KB</div>
          {s.tasks.filter(x => x.status === 'awaiting' && x.note.includes('memory')).map(x => <div key={x.id} style={{ color: '#dc2626', fontSize: 12 }}>{x.name} ({x.mem} KB) waits for memory</div>)}
        </div>

        <div style={box}>
          <b>3. Shared equipment (Banker's Algorithm)</b>
          <div style={{ ...mono, margin: '8px 0' }}>Available: {RES_NAMES.map((n, j) => `${n} ${s.avail[j]}/${TOTAL[j]}`).join(' · ')}</div>
          {adm.length > 0 && (
            <table className="minimal-table" style={{ fontSize: 12 }}><thead><tr><th>Task</th><th>Alloc</th><th>Max</th><th>Need</th></tr></thead>
              <tbody>{adm.map((x, i) => <tr key={x.id}><td>{x.id}</td><td>{x.alloc.join(' ')}</td><td>{x.max.join(' ')}</td><td>{need[i].join(' ')}</td></tr>)}</tbody></table>)}
          <div style={{ fontWeight: 600, color: !safe || safe.safe ? '#16a34a' : '#dc2626' }}>
            {safe ? (safe.safe ? `SAFE. Safe sequence: ${safe.sequence.map(i => adm[i].id).join(' → ')}` : 'UNSAFE state') : 'No admitted tasks'}</div>
          {s.tasks.filter(x => x.status === 'awaiting' && !x.note.includes('memory') && x.note).map(x => <div key={x.id} style={{ color: '#dc2626', fontSize: 12 }}>{x.name}: {x.note}</div>)}
        </div>

        <div style={box}>
          <b>4. CPU (preemptive priority scheduling)</b>
          <div style={{ margin: '8px 0' }}>Running: {running && s.tasks.find(x => x.id === running.id)?.status !== 'done' ? <><Tag t={running} />{running.name}</> : <i>{running ? `${running.name} just finished` : 'idle'}</i>}</div>
          <div style={{ fontSize: 12 }}>Ready queue: {ready.length ? ready.map(x => `${x.id}(p${x.priority})`).join(', ') : 'empty'}
            {adm.filter(x => x.status === 'blocked').length > 0 && ` · blocked: ${adm.filter(x => x.status === 'blocked').map(x => x.id).join(', ')}`}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', marginTop: 8 }}>
            {s.gantt.map((id, i) => <div key={i} title={`t=${i}`} style={{ width: 30, height: 26, background: id ? s.tasks.find(x => x.id === id)!.color : '#cbd5e1', color: '#fff', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid #fff' }}>{id ?? '–'}</div>)}
          </div>
        </div>
      </div>

      <div style={{ ...box, marginTop: 14 }}>
        <b>Patient requests</b>
        <table className="minimal-table" style={{ fontSize: 12 }}>
          <thead><tr><th>ID</th><th>Request</th><th>Class</th><th>Arrival</th><th>Burst</th><th>Memory KB</th><th>Status</th><th>Waiting</th><th>Turnaround</th></tr></thead>
          <tbody>{s.tasks.map(x => (
            <tr key={x.id}><td>{x.id}</td><td>{x.name}</td><td><Tag t={x} /></td><td>{x.arrival}</td><td>{x.burst}</td><td>{x.mem}</td>
              <td>{STATUS[x.status]}{x.status === 'awaiting' && x.note ? `: ${x.note}` : ''}</td>
              <td>{x.completion !== null ? wt(x) : '-'}</td><td>{x.completion !== null ? x.completion - x.arrival : '-'}</td></tr>))}</tbody>
        </table>
        {s.done && (
          <p><b>Results:</b> avg waiting {avg(finished, wt)} · avg turnaround {avg(finished, t => t.completion! - t.arrival)} ·
            emergency avg waiting <b>{avg(emg, wt)}</b> vs routine avg waiting <b>{avg(routine, wt)}</b>.</p>)}
      </div>
      <div style={{ ...box, marginTop: 14 }}>
        <b>Event log</b>
        <pre style={{ ...mono, maxHeight: 260, overflow: 'auto', whiteSpace: 'pre-wrap' }}>{s.log.join('\n')}</pre>
      </div>
    </div>
  );
};
