const WINE = '#9c3848', INK = '#4a4744', LINE = '#d9d2c7', SAND = '#c9a96e', SLATE = '#5f7d8c', MOSS = '#7a8c5c', GREYS = ['#9c3848','#5f7d8c','#c9a96e','#7a8c5c','#b8aea3','#e0d8cc'];
Chart.defaults.font.family = 'Inter, system-ui, sans-serif';
Chart.defaults.color = INK;
Chart.defaults.borderColor = LINE;

const CHARTS = {
  green: {
    title: 'Czech green export opportunities, 2024',
    note: 'One bubble per green product. Further right: closer to what the Czech Republic already exports well. Higher up: more complex, harder-to-copy product. Bubble size: 2024 export value. Hover for details; click a legend entry to show one group on its own.',
    config: d => { const vals = Object.values(d.groups).flatMap(g => g.data.map(p => p.v)); const lo = Math.sqrt(Math.min(...vals) + 1), hi = Math.sqrt(Math.max(...vals) + 1);
      const r = v => 3 + 22 * (Math.sqrt(v + 1) - lo) / (hi - lo);
      const sets = Object.entries(d.groups).map(([label, g]) => ({ label, base: g.color, data: g.data.map(p => ({ ...p, r: r(p.v) })), backgroundColor: g.color + 'B3', borderColor: g.color, borderWidth: 1, hoverBorderWidth: 2 }));
      return { type: 'bubble', data: { datasets: sets },
        options: { animation: { duration: 400 },
          scales: { x: { min: 0, max: 100, title: { display: true, text: 'Relatedness to current Czech exports (percentile)' } }, y: { min: 0, max: 100, title: { display: true, text: 'Product complexity (percentile)' } } },
          onHover: (e, els, ch) => { const on = els.length ? els[0].datasetIndex : -1; ch.data.datasets.forEach((ds, i) => { const a = on < 0 ? 'B3' : i === on ? 'FF' : '14'; ds.backgroundColor = ds.base + a; ds.borderColor = ds.base + (on < 0 || i === on ? 'FF' : '14'); }); ch.update('none'); },
          plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 8, font: { size: 11 } },
              onClick: (e, item, lg) => { const ch = lg.chart, i = item.datasetIndex; const solo = ch._solo === i; ch.data.datasets.forEach((ds, j) => ch.setDatasetVisibility(j, solo || j === i)); ch._solo = solo ? null : i; ch.update(); } },
            tooltip: { displayColors: false, callbacks: { title: c => c[0].raw.n, label: c => [` HS ${c.raw.hs} · ${c.dataset.label}`, ` Exports 2024: $${c.raw.v.toLocaleString()} M`, ` Relatedness ${c.raw.x}th pct · complexity ${c.raw.y}th pct`] } } } } } }
  },
  levy: {
    title: 'How homes are heated, by house type',
    note: 'Share of dwellings by main heating fuel. Average across the 331 local authorities of England and Wales, so a typical council rather than a national total.',
    config: d => { const types = Object.keys(d), fuels = Object.keys(d[types[0]]);
      return { type: 'bar',
        data: { labels: types, datasets: fuels.map((f, i) => ({ label: f, data: types.map(t => d[t][f]), backgroundColor: GREYS[i % GREYS.length] })) },
        options: { indexAxis: 'y', scales: { x: { stacked: true, max: 100, title: { display: true, text: '% of dwellings' } }, y: { stacked: true, grid: { display: false } } },
          plugins: { tooltip: { callbacks: { label: c => ` ${c.dataset.label}: ${c.parsed.x}%` } } } } } }
  },
  mcpr: {
    title: 'What each technology earns relative to the average electricity price',
    note: 'Below 1 means a technology mostly sells when prices are low, so it earns less than the average price. Median across 156 electricity market zones; bars show the middle half of zones. The ratio is the average price a technology receives per unit generated, divided by the time-averaged market price.',
    config: d => { const techs = Object.keys(d).sort((a, b) => d[a][1] - d[b][1]);
      return { type: 'bar',
        data: { labels: techs, datasets: [
          { type: 'bar', label: 'Interquartile range', data: techs.map(t => [d[t][0], d[t][2]]), backgroundColor: techs.map(t => d[t][1] < 1 ? WINE + '55' : SLATE + '55'), borderColor: techs.map(t => d[t][1] < 1 ? WINE : SLATE), borderWidth: 1, borderSkipped: false, barPercentage: .5 },
          { type: 'scatter', label: 'Median', data: techs.map(t => ({ x: t, y: d[t][1] })), backgroundColor: INK, pointRadius: 5 } ] },
        options: { scales: { y: { title: { display: true, text: 'capture price ÷ average price' }, min: .5, max: 1.5 }, x: { grid: { display: false } } },
          plugins: { tooltip: { callbacks: { label: c => c.dataset.type === 'scatter' ? ` median ${c.parsed.y}` : ` IQR ${c.raw[0]} – ${c.raw[1]}` } } } } } }
  }
};

let chart;
const dlg = document.getElementById('chart-dialog');
const IMAGES = {
  'img/work/epc-map.jpg': { title: 'Estimated energy use of the Czech building stock, by municipality', note: 'Average estimated energy use per square metre across all 3.9 million buildings, shown for 6,258 municipalities. Screenshot of the interactive map built for the Czech Ministry of Finance; the underlying data is theirs to publish.' }
};
function openImage(src) {
  const c = IMAGES[src]; if (!c) return;
  document.getElementById('chart-title').textContent = c.title;
  document.getElementById('chart-note').textContent = c.note;
  if (chart) { chart.destroy(); chart = null; }
  document.getElementById('chart').hidden = true;
  const im = document.getElementById('chart-img'); im.src = src; im.alt = c.title; im.hidden = false;
  dlg.showModal();
}
function openChart(key) {
  const c = CHARTS[key]; if (!c) return;
  document.getElementById('chart-img').hidden = true; document.getElementById('chart').hidden = false;
  document.getElementById('chart-title').textContent = c.title;
  document.getElementById('chart-note').textContent = c.note;
  if (chart) chart.destroy();
  chart = new Chart(document.getElementById('chart'), c.config(DATA[key]));
  dlg.showModal();
}
document.querySelectorAll('[data-chart], [data-img]').forEach(el => {
  const open = () => el.dataset.img ? openImage(el.dataset.img) : openChart(el.dataset.chart);
  el.addEventListener('click', e => { if (e.target.closest('a')) return; open(); });
  el.addEventListener('keydown', e => { if (e.key === 'Enter') open(); });
});
dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
