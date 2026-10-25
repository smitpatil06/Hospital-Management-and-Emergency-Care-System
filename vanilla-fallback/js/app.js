// Shared context + tab handling
const $ = s => document.querySelector(s);
const COLORS = ['#c92a2a','#1c7ed6','#2b8a3e','#e67700','#7048e8','#0b7285'];

// Reads the shared hospital workload: name, arrival, burst, priority, memory KB
function procs() {
  return $('#procs').value.trim().split('\n').map((l, i) => {
    const [n, a, b, p, m] = l.split(',').map(x => x.trim());
    return { id: 'P' + (i + 1), n, a: +a, b: +b, p: +p, m: +m, c: COLORS[i % COLORS.length] };
  }).filter(x => x.n && !isNaN(x.b));
}
const table = (head, rows) =>
  '<table><tr>' + head.map(h => `<th>${h}</th>`).join('') + '</tr>' +
  rows.map(r => '<tr>' + r.map(c => `<td>${c}</td>`).join('') + '</tr>').join('') + '</table>';

document.querySelectorAll('nav button').forEach(b => b.onclick = () => {
  document.querySelectorAll('nav button').forEach(x => x.classList.toggle('on', x === b));
  document.querySelectorAll('.tab').forEach(s => s.hidden = s.id !== b.dataset.t);
});
