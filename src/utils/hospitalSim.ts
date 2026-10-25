// Integrated hospital simulation: one request flows through all four OS mechanisms.
//   producers -> bounded intake buffer (priority-aware consumer) -> admission controller
//   admission = memory fit + Banker's safety check -> CPU (preemptive priority) -> release memory/resources
import { FitPolicy, request } from './hospital';

export const RES_NAMES = ['Imaging machines', 'Printers', 'DB connections'];
export const TOTAL = [2, 2, 4];
export const PARTS = [100, 200, 250, 300, 500, 600];
export const BUF_CAP = 3;

export interface Req {
  id: string; name: string; kind: string; arrival: number; burst: number; priority: number;
  mem: number; base: number[]; max: number[]; color: string;
}
// base = resources requested at admission, max = declared maximum claim (rest requested after the first CPU unit)
export const REQS: Req[] = [
  { id: 'E1', name: 'Emergency Admission', kind: 'Emergency', arrival: 0, burst: 4, priority: 1, mem: 212, base: [0, 1, 1], max: [0, 1, 2], color: '#dc2626' },
  { id: 'R1', name: 'Patient Registration', kind: 'Registration', arrival: 0, burst: 3, priority: 3, mem: 112, base: [0, 0, 1], max: [0, 1, 1], color: '#2563eb' },
  { id: 'P1', name: 'Pharmacy Request', kind: 'Pharmacy', arrival: 0, burst: 2, priority: 4, mem: 95, base: [0, 0, 1], max: [0, 0, 2], color: '#d97706' },
  { id: 'L1', name: 'Laboratory Report', kind: 'Laboratory', arrival: 1, burst: 4, priority: 2, mem: 417, base: [0, 0, 1], max: [0, 1, 2], color: '#16a34a' },
  { id: 'M1', name: 'Medical Imaging (MRI)', kind: 'Imaging', arrival: 1, burst: 5, priority: 2, mem: 426, base: [1, 0, 1], max: [2, 1, 2], color: '#7c3aed' },
  { id: 'E2', name: 'Trauma CT Scan', kind: 'Emergency', arrival: 3, burst: 4, priority: 1, mem: 300, base: [1, 0, 1], max: [2, 0, 2], color: '#be123c' },
  { id: 'M2', name: 'Imaging Follow-up', kind: 'Imaging', arrival: 4, burst: 3, priority: 3, mem: 450, base: [1, 0, 0], max: [1, 1, 1], color: '#0891b2' },
];

export type Status = 'future' | 'producer-blocked' | 'buffered' | 'awaiting' | 'ready' | 'blocked' | 'done';
export interface T extends Req {
  status: Status; part: number | null; alloc: number[]; executed: number; extraDone: boolean;
  completion: number | null; note: string;
}
export interface Sim {
  time: number; tasks: T[]; buffer: string[]; avail: number[]; owner: (string | null)[];
  gantt: (string | null)[]; log: string[]; done: boolean; policy: FitPolicy;
}

export const init = (policy: FitPolicy): Sim => ({
  time: 0, buffer: [], avail: [...TOTAL], owner: PARTS.map(() => null), gantt: [], log: [], done: false, policy,
  tasks: REQS.map(r => ({ ...r, status: 'future', part: null, alloc: [0, 0, 0], executed: 0, extraDone: false, completion: null, note: '' })),
});

const live = (s: Sim) => s.tasks.filter(x => x.status === 'ready' || x.status === 'blocked');
const urgency = (a: T, b: T) => a.priority - b.priority || a.arrival - b.arrival;

export function step(prev: Sim): Sim {
  if (prev.done) return prev;
  const s: Sim = JSON.parse(JSON.stringify(prev));
  const t = s.time, log = (m: string) => s.log.unshift(`t=${t}: ${m}`);
  const byId = (id: string) => s.tasks.find(x => x.id === id)!;

  // 1. Producers push new requests into the bounded intake buffer (wait(empty) blocks when full)
  s.tasks.filter(x => (x.status === 'future' && x.arrival <= t) || x.status === 'producer-blocked').forEach(x => {
    if (s.buffer.length < BUF_CAP) { s.buffer.push(x.id); x.status = 'buffered'; log(`${x.name} produced into intake buffer (${s.buffer.length}/${BUF_CAP})`); }
    else if (x.status === 'future') { x.status = 'producer-blocked'; log(`${x.name}: wait(empty) BLOCKED, intake buffer full`); }
  });

  // 2. Consumer (admission controller) takes the most urgent buffered request: emergencies first
  if (s.buffer.length) {
    const next = s.buffer.map(byId).sort(urgency)[0];
    s.buffer = s.buffer.filter(id => id !== next.id); next.status = 'awaiting';
    log(`Admission controller consumed ${next.name} (priority ${next.priority})`);
  }

  // 3. Admission: memory partition (fit policy) + Banker's safe-state check, most urgent first
  s.tasks.filter(x => x.status === 'awaiting').sort(urgency).forEach(x => {
    const free = PARTS.map((size, i) => ({ i, size })).filter(p => s.owner[p.i] === null && p.size >= x.mem);
    const deny = (msg: string) => { if (x.note !== msg) { x.note = msg; log(`${x.name}: ${msg}`); } };
    if (!free.length) return deny('waiting for a large enough free memory partition');
    const pick = s.policy === 'first' ? free[0] : s.policy === 'best' ? free.reduce((a, b) => (b.size < a.size ? b : a)) : free.reduce((a, b) => (b.size > a.size ? b : a));
    const adm = live(s);
    const r = request([...adm.map(y => y.alloc), [0, 0, 0]], [...adm.map(y => y.max), x.max], s.avail, adm.length, x.base, i => adm[i]?.id ?? x.id);
    if (!r.granted) return deny(r.message.replace('Denied: ', 'resource request denied, '));
    s.owner[pick.i] = x.id; x.part = pick.i; x.alloc = [...x.base]; x.status = 'ready'; x.note = '';
    s.avail = s.avail.map((v, j) => v - x.base[j]);
    log(`ADMITTED ${x.name}: partition ${pick.i + 1} (${PARTS[pick.i]} KB), resources [${x.base}] granted, state SAFE`);
  });

  // 4. Running tasks later claim the rest of their maximum; unsafe claims block the task (no deadlock)
  s.tasks.filter(x => (x.status === 'ready' || x.status === 'blocked') && x.executed >= 1 && !x.extraDone).forEach(x => {
    const extra = x.max.map((m, j) => m - x.alloc[j]);
    if (extra.every(v => v === 0)) { x.extraDone = true; x.status = 'ready'; return; }
    const adm = live(s);
    const r = request(adm.map(y => y.alloc), adm.map(y => y.max), s.avail, adm.indexOf(x), extra, i => adm[i].id);
    if (r.granted) {
      x.alloc = [...x.max]; x.extraDone = true; x.status = 'ready'; x.note = '';
      s.avail = s.avail.map((v, j) => v - extra[j]); log(`${x.name}: additional claim [${extra}] GRANTED (safe)`);
    } else {
      if (x.status !== 'blocked') log(`${x.name}: additional claim [${extra}] refused, task waits (${r.message})`);
      x.status = 'blocked'; x.note = r.message;
    }
  });

  // 5. CPU: preemptive priority, one time unit
  const run = s.tasks.filter(x => x.status === 'ready').sort(urgency)[0];
  const last = prev.gantt[prev.gantt.length - 1];
  if (run && last && last !== run.id && byId(last).status === 'ready') log(`PREEMPT: ${run.name} preempts ${byId(last).name}`);
  s.gantt.push(run ? run.id : null);
  if (run && ++run.executed >= run.burst) {
    run.status = 'done'; run.completion = t + 1;
    s.avail = s.avail.map((v, j) => v + run.alloc[j]); run.alloc = [0, 0, 0]; s.owner[run.part!] = null;
    log(`COMPLETED ${run.name}: partition ${run.part! + 1} and resources released`);
  }
  s.time = t + 1;
  s.done = s.tasks.every(x => x.status === 'done') || s.time > 80;
  s.log = s.log.slice(0, 120);
  return s;
}
