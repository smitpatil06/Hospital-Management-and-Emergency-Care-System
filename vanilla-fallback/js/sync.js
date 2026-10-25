// Producer–Consumer with a bounded buffer using semaphores empty/full and a mutex.
// Producers: registration desk, lab, imaging. Consumers: doctor workstation, pharmacy.
const PROD = ['Registration', 'Lab', 'Imaging'], CONS = ['Doctor WS', 'Pharmacy'];
let S, timer = null;

function syReset() {
  clearInterval(timer); timer = null; $('#syAuto').textContent = 'Auto';
  const N = Math.max(1, Math.min(8, +$('#bufN').value || 4));
  S = { N, buf: Array(N).fill(null), inp: 0, out: 0, empty: N, full: 0, mutex: 1, n: 0, log: [] };
  syDraw();
}
function say(m) { S.log.unshift(m); S.log = S.log.slice(0, 60); }

function syStep() {
  const produce = Math.random() < 0.55;
  if (produce) {
    const who = PROD[Math.floor(Math.random() * PROD.length)];
    if (S.empty === 0) { say(`${who}: wait(empty) -> BLOCKED, buffer full`); return syDraw(); }
    const item = { id: ++S.n, who, emg: Math.random() < 0.25 };
    S.empty--; S.mutex--;                       // wait(empty); wait(mutex)
    S.buf[S.inp] = item; S.inp = (S.inp + 1) % S.N;
    S.mutex++; S.full++;                        // signal(mutex); signal(full)
    say(`${who} produced #${item.id}${item.emg ? ' [EMERGENCY]' : ''}`);
  } else {
    const who = CONS[Math.floor(Math.random() * CONS.length)];
    if (S.full === 0) { say(`${who}: wait(full) -> BLOCKED, buffer empty`); return syDraw(); }
    S.full--; S.mutex--;                        // wait(full); wait(mutex)
    const item = S.buf[S.out]; S.buf[S.out] = null; S.out = (S.out + 1) % S.N;
    S.mutex++; S.empty++;                       // signal(mutex); signal(empty)
    say(`${who} consumed #${item.id} from ${item.who}`);
  }
  syDraw();
}

function syDraw() {
  $('#slots').innerHTML = S.buf.map((it, i) => {
    const tag = (i === S.inp ? 'in ' : '') + (i === S.out ? 'out' : '');
    const txt = it ? `#${it.id}<br>${it.who}` : 'empty';
    const bd = it ? (it.emg ? 'var(--red)' : 'var(--ok)') : 'var(--bd)';
    return `<div style="border-color:${bd}">${txt}<br><small>${tag}</small></div>`;
  }).join('');
  $('#sems').innerHTML = `empty = <b>${S.empty}</b> · full = <b>${S.full}</b> · mutex = <b>${S.mutex}</b>`;
  $('#syLog').textContent = S.log.join('\n');
}

$('#syStep').onclick = syStep;
$('#syReset').onclick = syReset;
$('#bufN').onchange = syReset;
$('#syAuto').onclick = () => {
  if (timer) { clearInterval(timer); timer = null; $('#syAuto').textContent = 'Auto'; }
  else { timer = setInterval(syStep, 600); $('#syAuto').textContent = 'Stop'; }
};
syReset();
