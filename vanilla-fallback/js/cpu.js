// CPU Scheduling: FCFS, Priority (non-preemptive), Priority (preemptive)
// Unit-time simulation; WT = TAT - burst, TAT = completion - arrival
function runCPU() {
  const mode = $('#cpuAlgo').value;
  const P = procs().map(x => ({ ...x, r: x.b }));
  let t = 0, done = 0, cur = null;
  const units = [];
  while (done < P.length) {
    const ready = P.filter(x => x.a <= t && x.r > 0);
    if (!ready.length) { units.push(null); t++; continue; }
    if (mode === 'pri-pre' || !cur || cur.r === 0) {
      ready.sort(mode === 'fcfs' ? (x, y) => x.a - y.a : (x, y) => x.p - y.p || x.a - y.a);
      cur = ready[0];
    }
    units.push(cur); cur.r--; t++;
    if (cur.r === 0) { cur.ct = t; done++; }
  }
  // collapse unit slots into Gantt segments
  const seg = [];
  units.forEach(u => {
    const last = seg[seg.length - 1];
    if (last && last.p === u) last.len++; else seg.push({ p: u, len: 1 });
  });
  $('#gantt').innerHTML = seg.map(s =>
    `<div style="flex:${s.len};background:${s.p ? s.p.c : '#868e96'}">${s.p ? s.p.id : 'idle'}</div>`).join('');
  let tw = 0, tt = 0;
  const rows = P.map(x => {
    const tat = x.ct - x.a, wt = tat - x.b; tw += wt; tt += tat;
    return [x.id, x.n, x.a, x.b, x.p, x.ct, tat, wt];
  });
  $('#cpuOut').innerHTML = table(['ID','Task','Arrival','Burst','Priority','Completion','Turnaround','Waiting'], rows) +
    `<p>Average waiting time: <b>${(tw / P.length).toFixed(2)}</b> · Average turnaround time: <b>${(tt / P.length).toFixed(2)}</b></p>`;
}
$('#cpuRun').onclick = runCPU;
$('#cpuAlgo').onchange = runCPU;
