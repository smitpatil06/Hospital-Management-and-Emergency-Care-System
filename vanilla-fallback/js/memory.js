// Memory Management: fixed partitions with First / Best / Worst Fit
function memRun() {
  const parts = $('#parts').value.trim().split(/\s+/).map(Number);
  const algo = $('#memAlgo').value;
  const free = [...parts], owner = Array(parts.length).fill(null);
  const rows = [], waiting = [];
  procs().forEach(p => {
    const fits = free.map((s, i) => ({ s, i })).filter(x => owner[x.i] === null && x.s >= p.m);
    let pick = null;
    if (fits.length) {
      if (algo === 'first') pick = fits[0];
      else if (algo === 'best') pick = fits.reduce((a, b) => b.s < a.s ? b : a);
      else pick = fits.reduce((a, b) => b.s > a.s ? b : a);
    }
    if (pick) { owner[pick.i] = p; rows.push([p.id, p.n, p.m, `Partition ${pick.i + 1} (${pick.s} KB)`, pick.s - p.m]); }
    else { waiting.push(p); rows.push([p.id, p.n, p.m, '<span class="bad">Not allocated</span>', '-']); }
  });
  const total = parts.reduce((a, b) => a + b, 0);
  $('#memMap').innerHTML = parts.map((s, i) => {
    const o = owner[i], used = o ? o.m : 0;
    return `<div style="flex:${s};background:${o ? o.c : '#868e96'}" title="Partition ${i + 1}">` +
      `${o ? o.id + ' ' + used + '/' + s : 'free ' + s}</div>`;
  }).join('');
  const internal = owner.reduce((a, o, i) => a + (o ? parts[i] - o.m : 0), 0);
  const unusedParts = parts.filter((_, i) => !owner[i]);
  const externalFree = unusedParts.reduce((a, b) => a + b, 0);
  const waitSize = waiting.reduce((a, p) => a + p.m, 0);
  $('#memOut').innerHTML = table(['ID', 'Task', 'Size KB', 'Allocated to', 'Internal frag KB'], rows) +
    `<p>Total memory: <b>${total} KB</b> · Internal fragmentation: <b>${internal} KB</b> · Free (unused) partitions: <b>${externalFree} KB</b></p>` +
    (waiting.length ? `<p class="bad">${waiting.length} task(s) waiting (${waitSize} KB needed); ${externalFree} KB is free in total but no single free partition is large enough${externalFree >= Math.min(...waiting.map(p => p.m)) ? ' (external fragmentation)' : ''}.</p>` : '<p class="ok">All tasks allocated.</p>');
}
$('#memRun').onclick = memRun;
$('#memAlgo').onchange = memRun;

// Run every module once on the shared workload (also on first load)
function runAll() { memRun(); runCPU(); bkRun(); syReset(); }
$('#runAll').onclick = runAll;
runAll();
