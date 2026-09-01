const WINE = '#9c3848', INK = '#4a4744', LINE = '#d9d2c7', SAND = '#c9a96e', SLATE = '#5f7d8c', MOSS = '#7a8c5c', GREYS = ['#9c3848','#5f7d8c','#c9a96e','#7a8c5c','#b8aea3','#e0d8cc'];
Chart.defaults.font.family = 'Inter, system-ui, sans-serif';
Chart.defaults.color = INK;
Chart.defaults.borderColor = LINE;

const CHARTS = {
  epc: {
    title: 'Estimated energy-efficiency class of the Czech building stock',
    note: 'Share of buildings per class (A best, G worst), summed from per-building probabilities. Family houses n = 1.82 M, apartment buildings n = 122 k.',
    config: d => ({ type: 'bar',
      data: { labels: d.classes, datasets: [
        { label: 'Family houses', data: d['Family houses'], backgroundColor: WINE },
        { label: 'Apartment buildings', data: d['Apartment buildings'], backgroundColor: SLATE } ] },
      options: { scales: { y: { title: { display: true, text: '% of buildings' }, beginAtZero: true }, x: { grid: { display: false } } },
        plugins: { tooltip: { callbacks: { label: c => ` ${c.dataset.label}: ${c.parsed.y}%` } } } } })
  },
  green: {
    title: 'Czech exports of green products by group, 2022',
    note: 'CZK billion. Products in the 2ET Navigator clean-tech taxonomy, from CEPII BACI world-trade data at the 6-digit product level.',
    config: d => ({ type: 'bar',
      data: { labels: Object.keys(d), datasets: [{ label: 'Exports 2022', data: Object.values(d), backgroundColor: WINE }] },
      options: { indexAxis: 'y', scales: { x: { title: { display: true, text: 'CZK bn' }, beginAtZero: true }, y: { grid: { display: false } } },
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => ` ${c.parsed.x} bn CZK` } } } } })
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
    note: 'Market capture price ratio: generation-weighted price ÷ time-weighted average price. Median across 156 market zones; bars show the interquartile range. Below 1 means a technology sells when prices are low.',
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
function openChart(key) {
  const c = CHARTS[key]; if (!c) return;
  document.getElementById('chart-title').textContent = c.title;
  document.getElementById('chart-note').textContent = c.note;
  if (chart) chart.destroy();
  chart = new Chart(document.getElementById('chart'), c.config(DATA[key]));
  dlg.showModal();
}
document.querySelectorAll('[data-chart]').forEach(el => {
  el.addEventListener('click', e => { if (e.target.closest('a')) return; openChart(el.dataset.chart); });
  el.addEventListener('keydown', e => { if (e.key === 'Enter') openChart(el.dataset.chart); });
});
dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
