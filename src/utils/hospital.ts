// Pure logic for Banker's Algorithm and fixed-partition memory allocation.

export type Matrix = number[][];

export interface SafetyResult { safe: boolean; sequence: number[]; steps: string[]; }

// Safety algorithm: Work = Available; repeatedly finish any process with Need <= Work.
export function safety(alloc: Matrix, need: Matrix, avail: number[], label: (i: number) => string): SafetyResult {
  const work = [...avail], done = alloc.map(() => false), sequence: number[] = [], steps: string[] = [];
  let progress = true;
  while (progress) {
    progress = false;
    alloc.forEach((row, i) => {
      if (!done[i] && need[i].every((v, j) => v <= work[j])) {
        steps.push(`${label(i)}: Need [${need[i]}] <= Work [${work}] -> finishes, Work = [${work.map((w, j) => w + row[j])}]`);
        row.forEach((v, j) => (work[j] += v));
        done[i] = true; sequence.push(i); progress = true;
      }
    });
  }
  return { safe: done.every(Boolean), sequence, steps };
}

export const needOf = (max: Matrix, alloc: Matrix): Matrix =>
  max.map((r, i) => r.map((v, j) => v - alloc[i][j]));

// Resource-request algorithm: validate against Need and Available, then test safety after pretend allocation.
export function request(alloc: Matrix, max: Matrix, avail: number[], p: number, req: number[], label: (i: number) => string) {
  const need = needOf(max, alloc);
  if (!alloc[p]) return { granted: false, message: 'Invalid process.' };
  if (req.some((v, j) => v > need[p][j])) return { granted: false, message: 'Denied: request exceeds the maximum claim (Need).' };
  if (req.some((v, j) => v > avail[j])) return { granted: false, message: 'Denied: resources not available, the process must wait.' };
  const a2 = alloc.map(r => [...r]), v2 = [...avail];
  req.forEach((v, j) => { a2[p][j] += v; v2[j] -= v; });
  const r = safety(a2, needOf(max, a2), v2, label);
  return r.safe
    ? { granted: true, message: `Granted: state remains safe. Sequence: ${r.sequence.map(label).join(' → ')}` }
    : { granted: false, message: 'Denied: granting this request would lead to an UNSAFE state.' };
}

export type FitPolicy = 'first' | 'best' | 'worst';
export interface Placement { name: string; size: number; partition: number | null; }

// Fixed partitions: each partition holds at most one process. Unused leftover inside a partition = internal fragmentation.
export function allocate(parts: number[], tasks: { name: string; size: number }[], policy: FitPolicy) {
  const owner: (number | null)[] = parts.map(() => null);
  const placements: Placement[] = tasks.map((t, ti) => {
    const fits = parts.map((s, i) => ({ s, i })).filter(x => owner[x.i] === null && x.s >= t.size);
    if (!fits.length) return { ...t, partition: null };
    const pick = policy === 'first' ? fits[0]
      : policy === 'best' ? fits.reduce((a, b) => (b.s < a.s ? b : a))
      : fits.reduce((a, b) => (b.s > a.s ? b : a));
    owner[pick.i] = ti;
    return { ...t, partition: pick.i };
  });
  const internal = placements.reduce((a, p) => a + (p.partition === null ? 0 : parts[p.partition] - p.size), 0);
  const freeParts = parts.filter((_, i) => owner[i] === null);
  return { placements, owner, internal, freeTotal: freeParts.reduce((a, b) => a + b, 0), largestFree: Math.max(0, ...freeParts) };
}
