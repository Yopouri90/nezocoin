const NEZO = {
  name:          'NezoCoin',
  ticker:        'NZ',
  adminPassword: 'nezoenzo1',
  MINT_INTERVAL:  2 * 60 * 1000,
  DRIFT_INTERVAL: 3000,
  INITIAL_PRICE:  1,          // €1 par NZ → mcap 1 000 000 × 0.001 = 1 000€
  INITIAL_SUPPLY: 1000000,    // 1 million de tokens
  INITIAL_LIQ:    500,
  INITIAL_MCAP:   1000,       // démarre à €1 000
  START_BALANCE:  10,
};

function el(id)         { return document.getElementById(id); }
function setText(id, v) { const e = el(id); if (e) e.textContent = v; }

function fmt(n) {
  n = parseFloat(n) || 0;
  if (n >= 1e9) return (n/1e9).toFixed(2) + 'B';
  if (n >= 1e6) return (n/1e6).toFixed(2) + 'M';
  if (n >= 1e3) return (n/1e3).toFixed(2) + 'K';
  return n.toFixed(2);
}

function showToast(msg, ms) {
  ms = ms || 3000;
  const t = document.createElement('div');
  t.style.cssText = 'position:fixed;bottom:66px;left:50%;transform:translateX(-50%);background:#1a1a1a;border:1px solid #2a2a2a;border-radius:8px;color:#e8e8e8;padding:9px 18px;font-size:13px;z-index:9999;font-family:"Courier New",monospace;white-space:nowrap;animation:fadeUp .3s ease;pointer-events:none;';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), ms);
}