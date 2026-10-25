// Banker's Algorithm: Need = Max - Allocation; safety check + resource-request check
const mat = id => $(id).value.trim().split('\n').map(r => r.trim().split(/\s+/).map(Number));
const vec = id => $(id).value.trim().split(/\s+/).map(Number);

function safety(alloc, need, avail) {
  const n = alloc.length, work = [...avail], fin = Array(n).fill(false), seq = [], steps = [];
  let progress = true;
  while (progress) {
    progress = false;
    for (let i = 0; i < n; i++) {
      if (!fin[i] && need[i].every((v, j) => v <= work[j])) {
        steps.push(`P${i + 1}: Need [${need[i]}] <= Work [${work}] -> runs, Work becomes [${work.map((w, j) => w + alloc[i][j])}]`);
        alloc[i].forEach((v, j) => work[j] += v);
        fin[i] = true; seq.push('P' + (i + 1)); progress = true;
      }
    }
  }
  return { safe: fin.every(Boolean), seq, steps };
}

function bkRun(extra = '') {
  const alloc = mat('#alloc'), max = mat('#max'), avail = vec('#avail');
  const need = max.map((r, i) => r.map((v, j) => v - alloc[i][j]));
  const names = procs();
  const res = safety(alloc, need, avail);
  $('#bkOut').innerHTML = extra +
    table(['Process', 'Allocation', 'Max', 'Need'], alloc.map((a, i) =>
      [`P${i + 1} ${names[i] ? '(' + names[i].n + ')' : ''}`, a.join(' '), max[i].join(' '), need[i].join(' ')])) +
    `<p class="${res.safe ? 'ok' : 'bad'}">${res.safe ? 'SAFE state. Safe sequence: ' + res.seq.join(' → ') : 'UNSAFE state: no safe sequence exists (deadlock possible)'}</p>` +
    `<pre class="log">${res.steps.join('\n')}</pre>`;
}

function bkReq() {
  const alloc = mat('#alloc'), max = mat('#max'), avail = vec('#avail');
  const i = +$('#rqP').value - 1, rq = vec('#rqV');
  const need = max.map((r, k) => r.map((v, j) => v - alloc[k][j]));
  let msg, ok = false;
  if (!alloc[i]) msg = 'Invalid process number.';
  else if (rq.some((v, j) => v > need[i][j])) msg = 'Denied: request exceeds the process\'s maximum claim (Need).';
  else if (rq.some((v, j) => v > avail[j])) msg = 'Denied: resources not available, process must wait.';
  else {
    const a2 = alloc.map(r => [...r]), n2 = need.map(r => [...r]), v2 = [...avail];
    rq.forEach((v, j) => { a2[i][j] += v; n2[i][j] -= v; v2[j] -= v; });
    const r = safety(a2, n2, v2);
    ok = r.safe;
    msg = ok ? `Granted: state stays safe. Sequence: ${r.seq.join(' → ')}` : 'Denied: granting would lead to an UNSAFE state.';
  }
  bkRun(`<p class="${ok ? 'ok' : 'bad'}">Request P${i + 1} [${rq}]: ${msg}</p>`);
}
$('#bkRun').onclick = () => bkRun();
$('#bkReq').onclick = bkReq;
