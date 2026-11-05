var priceChart = null;
var chartRange = '1h';

function initChart() {
  var canvas = el('price-chart');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');

  priceChart = new Chart(ctx, {
    type: 'candlestick',
    data: { datasets: [{ label: 'NZ/€', data: [] }] },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function(c) {
  var d = c.raw;
  if (!d) return '';
  var s = getSupply();
  return [
    'O mcap : €' + fmt(d.o * s),
    'H mcap : €' + fmt(d.h * s),
    'L mcap : €' + fmt(d.l * s),
    'C mcap : €' + fmt(d.c * s)
  ];
}
          },
          backgroundColor: '#111',
          borderColor: '#222',
          borderWidth: 1,
          titleColor: '#666',
          bodyColor: '#e8e8e8'
        }
      },
      scales: {
        x: {
          type: 'time',
          time: { unit: 'minute', displayFormats: { minute: 'HH:mm' } },
          ticks: { color: '#444', maxTicksLimit: 6 },
          grid:  { color: '#111' }
        },
       y: {
  position: 'right',
  ticks: {
    color: '#444',
    callback: function(v) {
      var mcap = parseFloat(v) * getSupply();
      return '€' + fmt(mcap);
    }
  },
  grid: { color: '#111' }
}
      }
    }
  });

  /* Couleurs bougies */
  var fin = Chart.registry.controllers.get('candlestick');
  if (fin) {
    Chart.defaults.elements.candlestick = Chart.defaults.elements.candlestick || {};
    Chart.defaults.elements.candlestick.color = {
      up:   '#22c55e',
      down: '#ef4444',
      unchanged: '#888'
    };
  }

  document.querySelectorAll('.chart-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.chart-btn').forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      chartRange = btn.dataset.range;
      renderChart();
    });
  });

  renderChart();
}

/* Groupe les points bruts en bougies OHLC par intervalle */
function buildCandles(pts, intervalMs) {
  if (!pts.length) return [];
  var candles = [];
  var bucketStart = Math.floor(pts[0].t / intervalMs) * intervalMs;
  var o = pts[0].p, h = pts[0].p, l = pts[0].p, c = pts[0].p;

  for (var i = 0; i < pts.length; i++) {
    var pt = pts[i];
    var bucket = Math.floor(pt.t / intervalMs) * intervalMs;
    if (bucket !== bucketStart) {
      candles.push({ x: bucketStart, o: o, h: h, l: l, c: c });
      bucketStart = bucket;
      o = pt.p; h = pt.p; l = pt.p; c = pt.p;
    } else {
      if (pt.p > h) h = pt.p;
      if (pt.p < l) l = pt.p;
      c = pt.p;
    }
  }
  candles.push({ x: bucketStart, o: o, h: h, l: l, c: c });
  return candles;
}

function renderChart() {
  if (!priceChart) return;
  var hist   = getPriceHist();
  var now    = Date.now();
  var ranges = { '1h': 3600000, '6h': 21600000, '24h': 86400000, 'all': Infinity };
  var cutoff = now - (ranges[chartRange] || Infinity);
  var pts    = hist.filter(function(p) { return p.t >= cutoff; });
  if (!pts.length) return;

  /* Taille de la bougie selon le range */
  var candleMs = { '1h': 60000, '6h': 300000, '24h': 900000, 'all': 3600000 };
  var interval = candleMs[chartRange] || 60000;

  var candles = buildCandles(pts, interval);

  priceChart.data.datasets[0].data = candles;
  priceChart.data.datasets[0].color = {
    up:        '#22c55e',
    down:      '#ef4444',
    unchanged: '#888888'
  };

  priceChart.update('none');
}